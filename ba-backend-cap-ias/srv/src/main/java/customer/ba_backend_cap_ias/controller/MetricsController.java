package customer.ba_backend_cap_ias.controller;

import customer.ba_backend_cap_ias.service.MetricsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Metrics Controller for Hypothesis Testing
 *
 * Provides endpoints to retrieve comparison metrics between:
 * - SAP CAP + SAP IAS (this implementation)
 * - AWS Cognito + Spring Boot
 *
 * This is for the Bachelor Thesis case study.
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
@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    @Autowired
    private MetricsService metricsService;

    /**
     * Get comprehensive comparison report
     *
     * Returns detailed metrics for all hypotheses (H1-H7)
     */
    @GetMapping("/report")
    public ResponseEntity<MetricsService.ComparisonReport> getComparisonReport() {
        MetricsService.ComparisonReport report = metricsService.generateComparisonReport();
        return ResponseEntity.ok(report);
    }

    /**
     * Get security code metrics (H1)
     */
    @GetMapping("/security-code")
    public ResponseEntity<MetricsService.SecurityCodeMetrics> getSecurityCodeMetrics() {
        MetricsService.SecurityCodeMetrics metrics = metricsService.countSecurityCode();
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get token validation config metrics (H3a)
     */
    @GetMapping("/token-validation-config")
    public ResponseEntity<MetricsService.TokenValidationConfigMetrics> getTokenValidationConfigMetrics() {
        MetricsService.TokenValidationConfigMetrics metrics = metricsService.getTokenValidationConfigMetrics();
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get enterprise integration metrics (H3b)
     */
    @GetMapping("/enterprise-integration")
    public ResponseEntity<MetricsService.EnterpriseIntegrationMetrics> getEnterpriseIntegrationMetrics() {
        MetricsService.EnterpriseIntegrationMetrics metrics = metricsService.getEnterpriseIntegrationMetrics();
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get coupling metrics (H4)
     */
    @GetMapping("/coupling")
    public ResponseEntity<MetricsService.CouplingMetrics> getCouplingMetrics() {
        MetricsService.CouplingMetrics metrics = metricsService.calculateCouplingMetrics();
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get token validation metrics (H5)
     */
    @GetMapping("/token-validation")
    public ResponseEntity<MetricsService.TokenValidationMetrics> getTokenValidationMetrics() {
        MetricsService.TokenValidationMetrics metrics = metricsService.getTokenValidationMetrics();
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get registration flow metrics (H6)
     */
    @GetMapping("/registration-flow")
    public ResponseEntity<MetricsService.RegistrationFlowMetrics> getRegistrationFlowMetrics() {
        MetricsService.RegistrationFlowMetrics metrics = metricsService.getRegistrationFlowMetrics();
        return ResponseEntity.ok(metrics);
    }

    /**
     * Get password reset security metrics (H7)
     */
    @GetMapping("/password-reset")
    public ResponseEntity<MetricsService.PasswordResetMetrics> getPasswordResetMetrics() {
        MetricsService.PasswordResetMetrics metrics = metricsService.getPasswordResetMetrics();
        return ResponseEntity.ok(metrics);
    }
}

