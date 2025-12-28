package customer.ba_backend_cap_ias.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security Configuration for SAP CAP with XSUAA/IAS.
 *
 * This configuration enables OAuth2 Resource Server mode, which:
 * - Validates JWT tokens from XSUAA/IAS automatically
 * - Extracts scopes/roles from the token
 * - Protects all endpoints by default
 *
 * H5 Measurement: This is MINIMAL configuration (~30 lines)
 * compared to manual JWT validation in Spring Boot (~100+ lines)
 *
 * NOTE: The actual JWT validation is handled by cds-feature-identity
 * which is auto-configured by SAP CAP.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Profile("cloud")
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/", "/index.html", "/actuator/health").permitAll()
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            // Use OAuth2 Resource Server with JWT - SAP CAP configures the JwtDecoder
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));

        return http.build();
    }
}
