package customer.ba_backend_cap_ias.config;

import customer.ba_backend_cap_ias.security.MockJwtAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Security Configuration for SAP CAP Backend with Mock Users.
 *
 * WICHTIG für Vergleich mit AWS Cognito:
 * - H1: Weniger Security-Code durch deklarative Autorisierung in CDS
 * - H5: Lokale Mock-User für Entwicklung, SAP IAS für Produktion
 *
 * Diese Konfiguration ermöglicht:
 * - JSON-basierte Login-API (wie Spring Boot Backend)
 * - Mock-User für lokale Entwicklung
 * - CORS für Angular Frontend
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Profile("!cloud")
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    private final MockJwtAuthenticationFilter mockJwtAuthenticationFilter;

    public SecurityConfig(MockJwtAuthenticationFilter mockJwtAuthenticationFilter) {
        this.mockJwtAuthenticationFilter = mockJwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        logger.info("SAP_CAP_SECURITY_SETUP_START: timestamp={}", LocalDateTime.now());

        http
                // Disable CSRF for stateless API
                .csrf(AbstractHttpConfigurer::disable)

                // Enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Enable HTTP Basic Auth für OData-Endpoints (lokal)
                .httpBasic(basic -> basic.realmName("SAP CAP Backend"))

                // Disable Form Login
                .formLogin(AbstractHttpConfigurer::disable)

                // Configure authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints - no authentication required
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/metrics/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // OData-Endpoints erfordern Authentifizierung
                        .requestMatchers("/odata/v4/**").authenticated()

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )

                // Stateless session management
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Add JWT Authentication Filter (für Cloud mit SAP IAS)
                .addFilterBefore(mockJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // Allow H2 console frames
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        logger.info("SAP_CAP_SECURITY_SETUP_COMPLETE: timestamp={}", LocalDateTime.now());

        return http.build();
    }

    /**
     * Mock-User für lokale Entwicklung.
     * Entspricht den Benutzern in .cdsrc.json.
     *
     * Drei Rollen: Admin, Manager, User (analog zu AWS Cognito Gruppen)
     */
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        logger.info("Creating mock users for local development");

        UserDetails admin = User.builder()
                .username("admin@test.com")
                .password(passwordEncoder.encode("admin123"))
                .roles("Admin")
                .build();

        UserDetails manager = User.builder()
                .username("manager@test.com")
                .password(passwordEncoder.encode("manager123"))
                .roles("Manager")
                .build();

        UserDetails user = User.builder()
                .username("user@test.com")
                .password(passwordEncoder.encode("user123"))
                .roles("User")
                .build();

        logger.info("Mock users created: admin@test.com, manager@test.com, user@test.com");

        return new InMemoryUserDetailsManager(admin, manager, user);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS configuration for Angular frontend.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200", "http://localhost:4201"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}

