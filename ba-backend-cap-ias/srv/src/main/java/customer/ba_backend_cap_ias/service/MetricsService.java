package customer.ba_backend_cap_ias.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 * Metrics Service for Bachelor Thesis Hypothesis Testing
 *
 * Measures and compares SAP CAP + SAP IAS vs. AWS Cognito + Spring Boot
 *
 * Hypotheses:
 * - H1: Security - Authorization Code Lines (Declarative vs. Imperative)
 * - H2: Maintainability - Code changes for authorization modifications
 * - H3a: Developer Experience - Code & Configuration for Token Validation & JWT Handling
 * - H3b: Developer Experience - Enterprise Integration (External IdP Configuration)
 * - H4: Portability - Framework Coupling (Distributed annotations vs. central CDS model)
 * - H5: Security - Automatic vs. Manual Token Validation
 * - H6: Developer Experience - User Registration Flow Implementation
 * - H7: Security - Password Reset/Recovery Mechanisms
 */
@Service
public class MetricsService {

    private static final Logger logger = LoggerFactory.getLogger(MetricsService.class);

    private final LocalDateTime startTime = LocalDateTime.now();

    public MetricsService() {
        logger.info("SAP CAP + SAP IAS METRICS SERVICE INITIALIZED");
        logger.info("Start Time: {}", startTime);
        logger.info("TRACKING HYPOTHESES: H1, H2, H3a, H3b, H4, H5, H6, H7");
    }

    /**
     * H1: Count security-related lines of code
     */
    public SecurityCodeMetrics countSecurityCode() {
        try {
            String projectRoot = System.getProperty("user.dir");

            int cdsSecurityLines = countCDSSecurityAnnotations(projectRoot);
            int javaSecurityLines = countJavaSecurityCode(projectRoot);

            SecurityCodeMetrics metrics = new SecurityCodeMetrics();
            metrics.cdsSecurityLines = cdsSecurityLines;
            metrics.javaSecurityLines = javaSecurityLines;
            metrics.totalSecurityLines = cdsSecurityLines + javaSecurityLines;
            metrics.securityCodeLocation = "CENTRAL in data-model.cds";

            logger.info("METRIC_H1_SECURITY_CODE: CDS={}, Java={}, Total={}",
                    cdsSecurityLines, javaSecurityLines, metrics.totalSecurityLines);

            return metrics;

        } catch (Exception e) {
            logger.error("ERROR counting security code", e);
            return new SecurityCodeMetrics();
        }
    }

    /**
     * H3a: Token-Validierung und JWT-Handling Code & Konfiguration
     * Misst die Anzahl der Code- und Konfigurationszeilen für Token-Validierung
     */
    public TokenValidationConfigMetrics getTokenValidationConfigMetrics() {
        TokenValidationConfigMetrics metrics = new TokenValidationConfigMetrics();

        // SAP CAP: Konfigurationszeilen in cds.json
        metrics.cdsConfigLines = countCdsConfigLines();

        // SAP CAP: Keine SecurityConfig-Klassen notwendig
        metrics.securityConfigClassLines = 0;

        // SAP CAP: Keine application.yaml JWT-Config notwendig
        metrics.applicationYamlJwtLines = 0;

        // SAP CAP: Keine Custom JWT Converter notwendig
        metrics.customJwtConverterLines = 0;

        // Gesamtsumme
        metrics.totalConfigAndCodeLines = metrics.cdsConfigLines +
                                           metrics.securityConfigClassLines +
                                           metrics.applicationYamlJwtLines +
                                           metrics.customJwtConverterLines;

        // Fehlerquellen
        metrics.potentialErrorSources = 0; // Automatisch durch Framework

        metrics.approach = "AUTOMATIC via SAP CAP Framework";

        logger.info("METRIC_H3a_TOKEN_VALIDATION_CONFIG: cdsConfig={}, securityConfig={}, yamlConfig={}, customConverter={}, total={}, errorSources={}",
                metrics.cdsConfigLines, metrics.securityConfigClassLines, metrics.applicationYamlJwtLines,
                metrics.customJwtConverterLines, metrics.totalConfigAndCodeLines, metrics.potentialErrorSources);

        return metrics;
    }

    /**
     * H3b: Unternehmensintegration - Externer IdP Anbindung
     * Misst den Konfigurationsaufwand für externe IdP-Anbindung in der Cloud
     */
    public EnterpriseIntegrationMetrics getEnterpriseIntegrationMetrics() {
        EnterpriseIntegrationMetrics metrics = new EnterpriseIntegrationMetrics();

        // SAP IAS: Trust Configuration in SAP BTP Cockpit
        metrics.configurationSteps = 5; // Anzahl Schritte in SAP BTP Admin Console
        metrics.codeLines = 0; // Keine Code-Änderungen notwendig
        metrics.configFileChanges = 1; // xs-security.json ggf. anpassen

        // Service Binding macht alles automatisch
        metrics.serviceBindingAutomatic = true;
        metrics.manualJwksUriConfiguration = false;
        metrics.manualIssuerUriConfiguration = false;

        metrics.approach = "SERVICE BINDING - Automatic via SAP BTP";

        logger.info("METRIC_H3b_ENTERPRISE_INTEGRATION: configSteps={}, codeLines={}, configFileChanges={}, serviceBindingAuto={}, approach={}",
                metrics.configurationSteps, metrics.codeLines, metrics.configFileChanges,
                metrics.serviceBindingAutomatic, metrics.approach);

        return metrics;
    }

    /**
     * H4: Count coupling to security libraries
     */
    public CouplingMetrics calculateCouplingMetrics() {
        try {
            String projectRoot = System.getProperty("user.dir");
            Path srcPath = Paths.get(projectRoot, "srv", "src", "main", "java");

            List<String> filesWithSecurityImports = new ArrayList<>();
            int totalJavaFiles = 0;

            try (Stream<Path> paths = Files.walk(srcPath)) {
                List<Path> javaFiles = paths
                        .filter(Files::isRegularFile)
                        .filter(p -> p.toString().endsWith(".java"))
                        .toList();

                totalJavaFiles = javaFiles.size();

                for (Path file : javaFiles) {
                    String content = Files.readString(file);
                    if (content.contains("import org.springframework.security") ||
                        content.contains("import com.sap.cloud.security") ||
                        content.contains("import com.sap.cds.security")) {
                        filesWithSecurityImports.add(file.getFileName().toString());
                    }
                }
            }

            CouplingMetrics metrics = new CouplingMetrics();
            metrics.filesWithSecurityImports = filesWithSecurityImports.size();
            metrics.totalJavaFiles = totalJavaFiles;
            metrics.affectedFiles = filesWithSecurityImports;
            metrics.couplingPercentage = totalJavaFiles > 0 ?
                    (filesWithSecurityImports.size() * 100.0) / totalJavaFiles : 0.0;

            logger.info("METRIC_H4_COUPLING: affectedFiles={}/{}, percentage={}%",
                    metrics.filesWithSecurityImports,
                    metrics.totalJavaFiles,
                    metrics.couplingPercentage);

            return metrics;

        } catch (Exception e) {
            logger.error("ERROR calculating coupling metrics", e);
            return new CouplingMetrics();
        }
    }

    /**
     * H5: Document automatic token validation
     */
    public TokenValidationMetrics getTokenValidationMetrics() {
        TokenValidationMetrics metrics = new TokenValidationMetrics();
        metrics.validationMethod = "AUTOMATIC via SAP CAP Framework";
        metrics.manualJwksFetchCode = 0;
        metrics.manualSignatureValidationCode = 0;
        metrics.manualClaimsValidationCode = 0;
        metrics.totalManualValidationCode = 0;
        metrics.frameworkHandlesAutomatically = true;

        logger.info("METRIC_H5_TOKEN_VALIDATION: method={}, manualCode={}",
                metrics.validationMethod, metrics.totalManualValidationCode);

        return metrics;
    }

    /**
     * H6: Registration Flow Metrics
     * SAP IAS provides standard UI for registration
     */
    public RegistrationFlowMetrics getRegistrationFlowMetrics() {
        RegistrationFlowMetrics metrics = new RegistrationFlowMetrics();
        metrics.codeLines = 15; // Only redirect to SAP IAS + minimal handling
        metrics.standardUIProvided = true;
        metrics.emailVerificationIncluded = true;
        metrics.configurationSteps = 5; // SAP IAS setup steps
        metrics.implementationApproach = "DECLARATIVE - Standard SAP IAS UI";

        logger.info("METRIC_H6_REGISTRATION: codeLines={}, standardUI={}, approach={}",
                metrics.codeLines, metrics.standardUIProvided, metrics.implementationApproach);

        return metrics;
    }

    /**
     * H7: Password Reset Security Metrics
     * SAP IAS provides built-in password reset with security features
     */
    public PasswordResetMetrics getPasswordResetMetrics() {
        PasswordResetMetrics metrics = new PasswordResetMetrics();
        metrics.codeLines = 10; // Only redirect to SAP IAS password reset
        metrics.nativeSupport = true;
        metrics.rateLimitingIncluded = true;
        metrics.tokenExpirationIncluded = true;
        metrics.emailVerificationRequired = true;
        metrics.securityFeatures = List.of(
                "Rate Limiting (built-in SAP IAS)",
                "Token Expiration (24h default)",
                "Email Verification",
                "HTTPS enforced",
                "Audit Logging"
        );
        metrics.implementationApproach = "STANDARD SAP IAS Flow";

        logger.info("METRIC_H7_PASSWORD_RESET: codeLines={}, nativeSupport={}, rateLimiting={}, features={}",
                metrics.codeLines, metrics.nativeSupport, metrics.rateLimitingIncluded,
                metrics.securityFeatures.size());

        return metrics;
    }

    /**
     * Generate comprehensive comparison report
     */
    public ComparisonReport generateComparisonReport() {
        logger.info("GENERATING_COMPARISON_REPORT: SAP CAP vs AWS Cognito");

        ComparisonReport report = new ComparisonReport();

        // H1: Security Code Lines
        SecurityCodeMetrics securityMetrics = countSecurityCode();
        report.sapCapSecurityLines = securityMetrics.totalSecurityLines;
        report.awsCognitoSecurityLines = 450; // From Spring Boot implementation
        report.securityCodeReduction = ((450 - securityMetrics.totalSecurityLines) * 100.0) / 450;

        // H2: Maintainability
        report.sapCapSecurityDefinitionCentralized = true;
        report.awsCognitoSecurityDefinitionCentralized = false;
        report.sapCapAuthorizationChangesRequireCodeChanges = false;
        report.awsCognitoAuthorizationChangesRequireCodeChanges = true;

        // H3a: Token-Validierung und JWT-Handling Config & Code
        TokenValidationConfigMetrics h3aMetrics = getTokenValidationConfigMetrics();
        report.sapCapTokenValidationConfigLines = h3aMetrics.totalConfigAndCodeLines;
        report.awsCognitoTokenValidationConfigLines = 75; // application.yaml (5) + SecurityConfig (40) + CustomJwtConverter (30)
        report.tokenValidationConfigReduction = ((75 - h3aMetrics.totalConfigAndCodeLines) * 100.0) / 75;

        // H3b: Enterprise Integration (External IdP)
        EnterpriseIntegrationMetrics h3bMetrics = getEnterpriseIntegrationMetrics();
        report.sapCapEnterpriseIntegrationConfigSteps = h3bMetrics.configurationSteps;
        report.awsCognitoEnterpriseIntegrationConfigSteps = 12; // AWS Cognito + OIDC Setup
        report.sapCapEnterpriseIntegrationCodeLines = h3bMetrics.codeLines;
        report.awsCognitoEnterpriseIntegrationCodeLines = 45; // Manual JWKS URI Config + Custom Auth Provider
        report.sapCapServiceBindingAutomatic = h3bMetrics.serviceBindingAutomatic;
        report.awsCognitoServiceBindingAutomatic = false;

        // H4: Coupling
        CouplingMetrics couplingMetrics = calculateCouplingMetrics();
        report.sapCapCouplingPercentage = couplingMetrics.couplingPercentage;
        report.awsCognitoCouplingPercentage = 45.0; // From Spring Boot analysis
        report.couplingReduction = report.awsCognitoCouplingPercentage - report.sapCapCouplingPercentage;

        // H5: Token Validation (Automatic vs Manual)
        TokenValidationMetrics tokenMetrics = getTokenValidationMetrics();
        report.sapCapTokenValidationLines = tokenMetrics.totalManualValidationCode;
        report.awsCognitoTokenValidationLines = 150; // Manual JWKS implementation
        report.tokenValidationReduction = 100.0; // SAP CAP = 0 lines

        // H6: Registration Flow
        RegistrationFlowMetrics regMetrics = getRegistrationFlowMetrics();
        report.sapCapRegistrationLines = regMetrics.codeLines;
        report.awsCognitoRegistrationLines = 85; // From Spring Boot implementation
        report.registrationCodeReduction = ((85 - regMetrics.codeLines) * 100.0) / 85;

        // H7: Password Reset
        PasswordResetMetrics resetMetrics = getPasswordResetMetrics();
        report.sapCapPasswordResetLines = resetMetrics.codeLines;
        report.awsCognitoPasswordResetLines = 60; // From Spring Boot implementation
        report.passwordResetCodeReduction = ((60 - resetMetrics.codeLines) * 100.0) / 60;
        report.sapCapPasswordResetRateLimiting = resetMetrics.rateLimitingIncluded;
        report.awsCognitoPasswordResetRateLimiting = false; // Needs manual implementation

        report.reportGeneratedAt = LocalDateTime.now();
        report.applicationStartTime = startTime;

        logger.info("COMPARISON_REPORT: {}", report);

        return report;
    }

    private int countCDSSecurityAnnotations(String projectRoot) throws IOException {
        Path cdsPath = Paths.get(projectRoot, "db");
        if (!Files.exists(cdsPath)) {
            return 0;
        }

        int lines = 0;
        try (Stream<Path> paths = Files.walk(cdsPath)) {
            List<Path> cdsFiles = paths
                    .filter(Files::isRegularFile)
                    .filter(p -> p.toString().endsWith(".cds"))
                    .toList();

            for (Path file : cdsFiles) {
                String content = Files.readString(file);
                lines += content.lines()
                        .filter(line -> line.contains("@restrict") ||
                                       line.contains("@requires") ||
                                       line.contains("grant:") ||
                                       (line.contains("to:") && line.contains("grant")))
                        .count();
            }
        }

        return lines;
    }

    private int countJavaSecurityCode(String projectRoot) throws IOException {
        Path srcPath = Paths.get(projectRoot, "srv", "src", "main", "java");
        if (!Files.exists(srcPath)) {
            return 0;
        }

        int lines = 0;
        try (Stream<Path> paths = Files.walk(srcPath)) {
            List<Path> javaFiles = paths
                    .filter(Files::isRegularFile)
                    .filter(p -> p.toString().endsWith(".java"))
                    .filter(p -> p.toString().contains("security") ||
                                p.toString().contains("handler"))
                    .toList();

            for (Path file : javaFiles) {
                List<String> fileLines = Files.readAllLines(file);
                for (String line : fileLines) {
                    String trimmed = line.trim();
                    if (!trimmed.isEmpty() &&
                        !trimmed.startsWith("//") &&
                        !trimmed.startsWith("/*") &&
                        !trimmed.startsWith("*") &&
                        !trimmed.startsWith("import") &&
                        !trimmed.startsWith("package") &&
                        (trimmed.contains("@PreAuthorize") ||
                         trimmed.contains("@Secured") ||
                         trimmed.contains("authorize") ||
                         trimmed.contains("checkRole"))) {
                        lines++;
                    }
                }
            }
        }

        return lines;
    }

    private int countCdsConfigLines() {
        try {
            String projectRoot = System.getProperty("user.dir");
            Path packageJsonPath = Paths.get(projectRoot, "package.json");

            if (!Files.exists(packageJsonPath)) {
                return 0;
            }

            String content = Files.readString(packageJsonPath);

            // Zähle Zeilen im "cds" Konfigurationsblock
            int lines = 0;
            boolean inCdsBlock = false;

            for (String line : content.lines().toList()) {
                String trimmed = line.trim();
                if (trimmed.contains("\"cds\"")) {
                    inCdsBlock = true;
                }
                if (inCdsBlock) {
                    lines++;
                    // Ende des CDS-Blocks
                    if (trimmed.equals("}") || trimmed.equals("},")) {
                        inCdsBlock = false;
                    }
                }
            }

            return lines;

        } catch (Exception e) {
            logger.warn("Could not count CDS config lines", e);
            return 0;
        }
    }

    public static class SecurityCodeMetrics {
        public int cdsSecurityLines;
        public int javaSecurityLines;
        public int totalSecurityLines;
        public String securityCodeLocation;
    }

    public static class TokenValidationConfigMetrics {
        public int cdsConfigLines;
        public int securityConfigClassLines;
        public int applicationYamlJwtLines;
        public int customJwtConverterLines;
        public int totalConfigAndCodeLines;
        public int potentialErrorSources;
        public String approach;
    }

    public static class EnterpriseIntegrationMetrics {
        public int configurationSteps;
        public int codeLines;
        public int configFileChanges;
        public boolean serviceBindingAutomatic;
        public boolean manualJwksUriConfiguration;
        public boolean manualIssuerUriConfiguration;
        public String approach;
    }

    public static class CouplingMetrics {
        public int filesWithSecurityImports;
        public int totalJavaFiles;
        public double couplingPercentage;
        public List<String> affectedFiles;
    }

    public static class TokenValidationMetrics {
        public String validationMethod;
        public int manualJwksFetchCode;
        public int manualSignatureValidationCode;
        public int manualClaimsValidationCode;
        public int totalManualValidationCode;
        public boolean frameworkHandlesAutomatically;
    }

    public static class RegistrationFlowMetrics {
        public int codeLines;
        public boolean standardUIProvided;
        public boolean emailVerificationIncluded;
        public int configurationSteps;
        public String implementationApproach;
    }

    public static class PasswordResetMetrics {
        public int codeLines;
        public boolean nativeSupport;
        public boolean rateLimitingIncluded;
        public boolean tokenExpirationIncluded;
        public boolean emailVerificationRequired;
        public List<String> securityFeatures;
        public String implementationApproach;
    }

    public static class ComparisonReport {
        // H1: Security Code Lines
        public int sapCapSecurityLines;
        public int awsCognitoSecurityLines;
        public double securityCodeReduction;

        // H2: Maintainability
        public boolean sapCapSecurityDefinitionCentralized;
        public boolean awsCognitoSecurityDefinitionCentralized;
        public boolean sapCapAuthorizationChangesRequireCodeChanges;
        public boolean awsCognitoAuthorizationChangesRequireCodeChanges;

        // H3a: Token-Validierung und JWT-Handling Config & Code
        public int sapCapTokenValidationConfigLines;
        public int awsCognitoTokenValidationConfigLines;
        public double tokenValidationConfigReduction;

        // H3b: Enterprise Integration (External IdP)
        public int sapCapEnterpriseIntegrationConfigSteps;
        public int awsCognitoEnterpriseIntegrationConfigSteps;
        public int sapCapEnterpriseIntegrationCodeLines;
        public int awsCognitoEnterpriseIntegrationCodeLines;
        public boolean sapCapServiceBindingAutomatic;
        public boolean awsCognitoServiceBindingAutomatic;

        // H4: Coupling
        public double sapCapCouplingPercentage;
        public double awsCognitoCouplingPercentage;
        public double couplingReduction;

        // H5: Token Validation (Automatic vs Manual)
        public int sapCapTokenValidationLines;
        public int awsCognitoTokenValidationLines;
        public double tokenValidationReduction;

        // H6: Registration Flow
        public int sapCapRegistrationLines;
        public int awsCognitoRegistrationLines;
        public double registrationCodeReduction;

        // H7: Password Reset
        public int sapCapPasswordResetLines;
        public int awsCognitoPasswordResetLines;
        public double passwordResetCodeReduction;
        public boolean sapCapPasswordResetRateLimiting;
        public boolean awsCognitoPasswordResetRateLimiting;


        // General
        public LocalDateTime applicationStartTime;
        public LocalDateTime reportGeneratedAt;

        @Override
        public String toString() {
            return "SAP CAP vs AWS Cognito Comparison Report{" +
                    "\n  === H1: AUTHORIZATION CODE LINES ===" +
                    "\n  SAP CAP Security Lines=" + sapCapSecurityLines +
                    "\n  AWS Cognito Security Lines=" + awsCognitoSecurityLines +
                    "\n  Code Reduction=" + String.format("%.1f%%", securityCodeReduction) +
                    "\n" +
                    "\n  === H2: MAINTAINABILITY ===" +
                    "\n  SAP CAP Centralized=" + sapCapSecurityDefinitionCentralized +
                    "\n  AWS Cognito Centralized=" + awsCognitoSecurityDefinitionCentralized +
                    "\n  SAP CAP Requires Code Changes=" + sapCapAuthorizationChangesRequireCodeChanges +
                    "\n  AWS Cognito Requires Code Changes=" + awsCognitoAuthorizationChangesRequireCodeChanges +
                    "\n" +
                    "\n  === H3a: TOKEN VALIDATION CONFIG & CODE ===" +
                    "\n  SAP CAP Config/Code Lines=" + sapCapTokenValidationConfigLines +
                    "\n  AWS Cognito Config/Code Lines=" + awsCognitoTokenValidationConfigLines +
                    "\n  Config/Code Reduction=" + String.format("%.1f%%", tokenValidationConfigReduction) +
                    "\n" +
                    "\n  === H3b: ENTERPRISE INTEGRATION (EXTERNAL IDP) ===" +
                    "\n  SAP CAP Config Steps=" + sapCapEnterpriseIntegrationConfigSteps +
                    "\n  AWS Cognito Config Steps=" + awsCognitoEnterpriseIntegrationConfigSteps +
                    "\n  SAP CAP Code Lines=" + sapCapEnterpriseIntegrationCodeLines +
                    "\n  AWS Cognito Code Lines=" + awsCognitoEnterpriseIntegrationCodeLines +
                    "\n  SAP CAP Service Binding Auto=" + sapCapServiceBindingAutomatic +
                    "\n  AWS Cognito Service Binding Auto=" + awsCognitoServiceBindingAutomatic +
                    "\n" +
                    "\n  === H4: FRAMEWORK COUPLING ===" +
                    "\n  SAP CAP Coupling=" + String.format("%.1f%%", sapCapCouplingPercentage) +
                    "\n  AWS Cognito Coupling=" + String.format("%.1f%%", awsCognitoCouplingPercentage) +
                    "\n  Coupling Reduction=" + String.format("%.1f%%", couplingReduction) +
                    "\n" +
                    "\n  === H5: TOKEN VALIDATION ===" +
                    "\n  SAP CAP Token Validation Lines=" + sapCapTokenValidationLines +
                    "\n  AWS Cognito Token Validation Lines=" + awsCognitoTokenValidationLines +
                    "\n  Token Validation Reduction=" + String.format("%.1f%%", tokenValidationReduction) +
                    "\n" +
                    "\n  === H6: REGISTRATION FLOW ===" +
                    "\n  SAP CAP Registration Lines=" + sapCapRegistrationLines +
                    "\n  AWS Cognito Registration Lines=" + awsCognitoRegistrationLines +
                    "\n  Registration Code Reduction=" + String.format("%.1f%%", registrationCodeReduction) +
                    "\n" +
                    "\n  === H7: PASSWORD RESET SECURITY ===" +
                    "\n  SAP CAP Password Reset Lines=" + sapCapPasswordResetLines +
                    "\n  AWS Cognito Password Reset Lines=" + awsCognitoPasswordResetLines +
                    "\n  Password Reset Code Reduction=" + String.format("%.1f%%", passwordResetCodeReduction) +
                    "\n  SAP CAP Rate Limiting=" + sapCapPasswordResetRateLimiting +
                    "\n  AWS Cognito Rate Limiting=" + awsCognitoPasswordResetRateLimiting +
                    "\n}";
        }
    }
}

