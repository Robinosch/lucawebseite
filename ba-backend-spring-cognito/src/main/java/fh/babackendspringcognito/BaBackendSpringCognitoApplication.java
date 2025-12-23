package fh.babackendspringcognito;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import java.time.LocalDateTime;

/**
 * Main Application Class for AWS Cognito Backend.
 * 
 * This application demonstrates AWS Cognito integration for a Bachelor Thesis
 * comparing AWS Cognito vs. SAP IAS.
 * 
 * Measured Hypotheses:
 * - H1: Security implementation complexity (Lines of Code) - IMPERATIVE approach
 * - H2: Role-based authorization maintainability (distributed @PreAuthorize)
 * - H3a: Time-to-First-Token (Setup + Configuration)
 * - H4: Security coupling (dependency analysis across files)
 * - H5: Token validation complexity (manual JWKS configuration)
 * - H6: Registration flow implementation effort (manual AWS SDK integration)
 * - H7: Password reset security (AWS Cognito features + manual implementation)
 * 
 * CRITICAL DIFFERENCE vs. SAP CAP:
 * - AWS Cognito: IMPERATIVE security (@PreAuthorize on every method)
 * - SAP CAP: DECLARATIVE security (CDS @restrict annotations)
 */
@Slf4j
@SpringBootApplication
@EnableConfigurationProperties
public class BaBackendSpringCognitoApplication {

    public static void main(String[] args) {
        log.info("==========================================================");
        log.info("AWS COGNITO BACKEND - BACHELOR THESIS CASE STUDY");
        log.info("==========================================================");
        log.info("AWS_COGNITO_SETUP_START: {}", LocalDateTime.now());
        log.info("Framework: Spring Boot + Spring Security");
        log.info("Identity Provider: AWS Cognito User Pool");
        log.info("Security Model: IMPERATIVE (@PreAuthorize Annotations)");
        log.info("");
        log.info("Measuring Hypotheses:");
        log.info("  H1: Security Code Lines (Expected: 30-50 lines distributed)");
        log.info("  H2: Maintainability (Distributed @PreAuthorize)");
        log.info("  H3a: Setup Time & Time-to-First-Token");
        log.info("  H4: Security Coupling (Expected: 5-8 files with AWS imports)");
        log.info("  H5: Token Validation (Manual JWKS Configuration)");
        log.info("  H6: Registration Flow (Manual AWS SDK Implementation)");
        log.info("  H7: Password Reset Security (AWS Cognito Features)");
        log.info("==========================================================");
        
        SpringApplication.run(BaBackendSpringCognitoApplication.class, args);
        
        log.info("==========================================================");
        log.info("AWS COGNITO BACKEND STARTED SUCCESSFULLY");
        log.info("Server running on port: 8081");
        log.info("H2 Console: http://localhost:8081/h2-console");
        log.info("Metrics Endpoint: http://localhost:8081/api/metrics/report");
        log.info("");
        log.info("Key Differences vs. SAP CAP:");
        log.info("  - IMPERATIVE security (@PreAuthorize on every method)");
        log.info("  - MANUAL JWT validation configuration (JWKS URI)");
        log.info("  - DISTRIBUTED security checks (across 5-8 files)");
        log.info("  - MANUAL AWS SDK integration (SignUp, ForgotPassword, etc.)");
        log.info("  - PARTIAL rate-limiting (needs manual implementation)");
        log.info("==========================================================");
    }
}


