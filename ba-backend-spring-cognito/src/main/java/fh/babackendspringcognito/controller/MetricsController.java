package fh.babackendspringcognito.controller;

import fh.babackendspringcognito.service.MetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Metrics Controller for hypothesis measurement endpoints.
 * Provides metrics data for the thesis case study.
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
@Slf4j
@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;

    /**
     * Get comprehensive metrics report for all hypotheses.
     *
     * @return Metrics report with all measured data
     */
    @GetMapping("/report")
    public ResponseEntity<MetricsService.MetricsReport> getMetricsReport() {
        log.info("METRICS_REPORT_REQUEST: Generating comprehensive metrics report");

        MetricsService.MetricsReport report = metricsService.generateReport();

        return ResponseEntity.ok(report);
    }

    /**
     * Get security lines of code metric (H1).
     *
     * @return Security LoC count
     */
    @GetMapping("/security-loc")
    public ResponseEntity<Integer> getSecurityLinesOfCode() {
        log.info("METRICS_REQUEST: Security Lines of Code (H1)");

        int loc = metricsService.countSecurityLinesOfCode();

        return ResponseEntity.ok(loc);
    }

    /**
     * Get token validation config metrics (H3a).
     *
     * @return Token validation config/code metrics
     */
    @GetMapping("/token-validation-config")
    public ResponseEntity<MetricsService.TokenValidationConfigMetrics> getTokenValidationConfigMetrics() {
        log.info("METRICS_REQUEST: Token Validation Config (H3a)");

        MetricsService.TokenValidationConfigMetrics metrics = metricsService.calculateTokenValidationConfigMetrics();

        return ResponseEntity.ok(metrics);
    }

    /**
     * Get enterprise integration metrics (H3b).
     *
     * @return Enterprise integration metrics
     */
    @GetMapping("/enterprise-integration")
    public ResponseEntity<MetricsService.EnterpriseIntegrationMetrics> getEnterpriseIntegrationMetrics() {
        log.info("METRICS_REQUEST: Enterprise Integration (H3b)");

        MetricsService.EnterpriseIntegrationMetrics metrics = metricsService.calculateEnterpriseIntegrationMetrics();

        return ResponseEntity.ok(metrics);
    }

    /**
     * Get coupling metrics (H4).
     *
     * @return Coupling metrics
     */
    @GetMapping("/coupling")
    public ResponseEntity<MetricsService.CouplingMetrics> getCouplingMetrics() {
        log.info("METRICS_REQUEST: Coupling Metrics (H4)");

        MetricsService.CouplingMetrics metrics = metricsService.calculateCouplingMetrics();

        return ResponseEntity.ok(metrics);
    }
}
