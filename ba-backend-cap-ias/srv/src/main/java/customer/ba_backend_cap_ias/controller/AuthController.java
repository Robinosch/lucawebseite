package customer.ba_backend_cap_ias.controller;

import customer.ba_backend_cap_ias.security.MockJwtAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Authentication Controller for SAP CAP Backend.
 *
 * WICHTIG für Hypothesenvergleich:
 * - SAP IAS ist ein Cloud-only IdP
 * - Benutzerregistrierung erfolgt über SAP IAS Admin Console
 * - Dieser Controller bietet JSON-basierte Login-API für lokale Entwicklung
 *
 * H6: Keine Registrierungs-Endpoints (SAP IAS = Admin-basiert)
 * H7: Password-Reset wird von SAP IAS gehandhabt (Link-basiert)
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Login-Endpoint für JSON-basierte Authentifizierung.
     * Generiert einen Mock-Token für lokale Entwicklung.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        long startTime = System.currentTimeMillis();
        logger.info("LOGIN_REQUEST: username={}, timestamp={}", request.getUsername(), LocalDateTime.now());

        try {
            // Benutzer laden
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

            if (!passwordEncoder.matches(request.getPassword(), userDetails.getPassword())) {
                logger.warn("LOGIN_FAILED: Invalid password for user={}", request.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials", "success", false));
            }

            String accessToken = generateMockToken(userDetails);
            String refreshToken = UUID.randomUUID().toString();

            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .map(role -> role.startsWith("ROLE_") ? role.substring(5) : role)
                    .collect(Collectors.toList());

            MockJwtAuthenticationFilter.registerToken(accessToken, userDetails.getUsername(), roles);

            long duration = System.currentTimeMillis() - startTime;
            logger.info("LOGIN_SUCCESS: user={}, roles={}, duration={}ms",
                    userDetails.getUsername(),
                    roles,
                    duration);
            logger.info("TIME_TO_FIRST_TOKEN: {}ms (Mock authentication)", duration);

            Map<String, Object> userObject = new HashMap<>();
            userObject.put("username", userDetails.getUsername());
            userObject.put("email", userDetails.getUsername());
            userObject.put("roles", roles);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("tokenType", "Bearer");
            response.put("expiresIn", 3600);
            response.put("user", userObject);
            response.put("message", "Login erfolgreich");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("LOGIN_ERROR: username={}, error={}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication failed: " + e.getMessage(), "success", false));
        }
    }

    /**
     * Get current user info.
     * Entspricht dem /me Endpoint im AuthService.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        logger.info("ME_REQUEST: timestamp={}", LocalDateTime.now());

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "No valid token provided", "success", false));
        }

        String token = authHeader.substring(7);
        MockJwtAuthenticationFilter.TokenData tokenData = MockJwtAuthenticationFilter.getTokenData(token);

        if (tokenData == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token", "success", false));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("username", tokenData.getUsername());
        response.put("email", tokenData.getUsername());
        response.put("roles", tokenData.getRoles());

        return ResponseEntity.ok(response);
    }

    /**
     * Logout endpoint.
     * Invalidiert den Token.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        logger.info("LOGOUT_REQUEST: timestamp={}", LocalDateTime.now());

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            MockJwtAuthenticationFilter.removeToken(token);
            logger.info("LOGOUT_SUCCESS: Token invalidated");
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "Logout erfolgreich"));
    }

    /**
     * Registration info endpoint.
     * SAP IAS ist ein Cloud-only IdP - Registrierung erfolgt über Admin Console.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        logger.info("REGISTER_REQUEST: SAP IAS requires admin-based registration");

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "success", false,
                        "message", "Benutzerregistrierung erfolgt über die SAP IAS Admin Console",
                        "info", "SAP Identity Authentication Service ist ein Cloud-only IdP. " +
                                "Benutzer werden administrativ oder über das Self-Service Portal erstellt.",
                        "documentation", "https://help.sap.com/docs/identity-authentication"
                ));
    }

    /**
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "SAP CAP Backend",
                "timestamp", LocalDateTime.now().toString(),
                "authMode", "Mock (Local Development)"
        ));
    }

    /**
     * Generiert einen Mock-Token (Base64-encoded).
     */
    private String generateMockToken(UserDetails userDetails) {
        String tokenData = userDetails.getUsername() + ":" +
                System.currentTimeMillis() + ":" +
                UUID.randomUUID().toString();
        return Base64.getEncoder().encodeToString(tokenData.getBytes());
    }

    // Inner classes for request/response
    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class UserSession {
        private final String username;
        private final List<String> roles;

        public UserSession(String username, List<String> roles) {
            this.username = username;
            this.roles = roles;
        }

        public String getUsername() { return username; }
        public List<String> getRoles() { return roles; }
    }
}

