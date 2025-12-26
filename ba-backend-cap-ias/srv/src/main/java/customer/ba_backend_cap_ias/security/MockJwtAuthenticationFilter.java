package customer.ba_backend_cap_ias.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * JWT Authentication Filter für SAP CAP Backend.
 *
 * Validiert Mock-Tokens für lokale Entwicklung.
 * In Produktion würde SAP IAS/XSUAA die Token-Validierung übernehmen.
 */
@Component
public class MockJwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(MockJwtAuthenticationFilter.class);

    // Shared Token Store - wird vom AuthController befüllt
    private static final Map<String, TokenData> tokenStore = new ConcurrentHashMap<>();

    /**
     * Registriert einen Token (wird vom AuthController aufgerufen).
     */
    public static void registerToken(String token, String username, List<String> roles) {
        tokenStore.put(token, new TokenData(username, roles));
        logger.debug("Token registered for user: {}", username);
    }

    /**
     * Entfernt einen Token (wird beim Logout aufgerufen).
     */
    public static void removeToken(String token) {
        tokenStore.remove(token);
    }

    /**
     * Holt Token-Daten (wird vom AuthController für /me verwendet).
     */
    public static TokenData getTokenData(String token) {
        return tokenStore.get(token);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            TokenData tokenData = tokenStore.get(token);

            if (tokenData != null) {
                // Token gefunden - Benutzer authentifizieren
                List<SimpleGrantedAuthority> authorities = tokenData.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                tokenData.getUsername(),
                                null,
                                authorities
                        );

                SecurityContextHolder.getContext().setAuthentication(authentication);

                logger.debug("Authenticated user: {} with roles: {}",
                        tokenData.getUsername(), tokenData.getRoles());
            } else {
                logger.debug("Invalid or expired token");
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Token-Daten Klasse.
     */
    public static class TokenData {
        private final String username;
        private final List<String> roles;

        public TokenData(String username, List<String> roles) {
            this.username = username;
            this.roles = roles;
        }

        public String getUsername() { return username; }
        public List<String> getRoles() { return roles; }
    }
}

