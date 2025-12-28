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
 * Measured Hypotheses (Framework-Integration):
 * - H1: Security implementation complexity (Lines of Code) - IMPERATIVE approach
 * - H2: Role-based authorization maintainability (distributed @PreAuthorize)
 * - H3a: Token-Validierung LOC und zyklomatische Komplexität
 * - H4: Security coupling (dependency analysis across files)
 * - H5: Token validation complexity (manual JWKS configuration)
 *
 * IdP-Hypothesen (in Admin-Konsole gemessen):
 * - H6-H9: Benutzerregistrierung, Recovery, Features, Löschung (in AWS Console)
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
        log.info("Measuring Hypotheses (Framework-Integration):");
        log.info("  H1: Security Code Lines (Autorisierungs-LOC)");
        log.info("  H2: Maintainability (Distributed @PreAuthorize)");
        log.info("  H3a: Token-Validierung LOC + zyklomatische Komplexität");
        log.info("  H4: Security Coupling (Vendor-Abhängigkeit)");
        log.info("  H5: Token Validation (Manual JWKS Configuration)");
        log.info("  H6-H9: IdP-Hypothesen (in AWS Console gemessen)");
        log.info("==========================================================");
        
        SpringApplication.run(BaBackendSpringCognitoApplication.class, args);
    }
}


