package fh.babackendspringcognito.security;

import com.nimbusds.jwt.JWTClaimsSet;
import fh.babackendspringcognito.service.CognitoService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * JWT Authentication Filter for validating AWS Cognito tokens
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final CognitoService cognitoService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = extractJwtFromRequest(request);

            if (jwt != null) {
                JWTClaimsSet claims = cognitoService.validateToken(jwt);
                String username = claims.getSubject();
                List<GrantedAuthority> authorities = extractAuthorities(claims);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("JWT_AUTH_SUCCESS: username={}, authorities={}", username, authorities);
            }

        } catch (Exception e) {
            log.error("JWT_AUTH_ERROR: Could not set user authentication - {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }

    private List<GrantedAuthority> extractAuthorities(JWTClaimsSet claims) {
        List<GrantedAuthority> authorities = new ArrayList<>();

        try {
            Object groupsClaim = claims.getClaim("cognito:groups");

            if (groupsClaim instanceof List<?>) {
                @SuppressWarnings("unchecked")
                List<String> groups = (List<String>) groupsClaim;

                for (String group : groups) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + group.toUpperCase()));
                }
            }

            String customRole = claims.getStringClaim("custom:role");
            if (customRole != null) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + customRole.toUpperCase()));
            }

            if (authorities.isEmpty()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            }

            log.debug("CLAIMS_MAPPING: Extracted authorities: {}", authorities);

        } catch (Exception e) {
            log.error("CLAIMS_MAPPING_ERROR: Failed to extract authorities - {}", e.getMessage());
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }

        return authorities;
    }
}

