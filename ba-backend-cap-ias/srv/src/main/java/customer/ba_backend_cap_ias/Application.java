package customer.ba_backend_cap_ias;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.LocalDateTime;

/**
 * Main Application Class for SAP CAP + SAP IAS Backend
 *
 * Bachelor Thesis: Comparing SAP CAP + SAP IAS vs. AWS Cognito + Spring Boot
 *
 * Key Hypotheses:
 * - H1: SAP CAP requires significantly less security code (70% reduction expected)
 * - H2: SAP CAP provides better maintainability through central security definition
 * - H3a: Setup time and Time-to-First-Token comparison
 * - H4: SAP CAP has less coupling to security libraries (70% reduction expected)
 * - H5: SAP CAP provides automatic token validation (NO manual JWKS code)
 * - H6: SAP CAP simplifies registration flow (configuration vs. code)
 * - H7: SAP CAP provides native password reset with rate-limiting
 *
 * CRITICAL DIFFERENCE:
 * - AWS Cognito: IMPERATIVE security (code in every method)
 * - SAP CAP: DECLARATIVE security (CDS annotations in model)
 *
 * SECURITY:
 * - SAP CAP Framework übernimmt die Security-Konfiguration automatisch
 * - Lokal: Mock-User aus .cdsrc.json
 * - Cloud: XSUAA/SAP IAS über Service Binding
 */
@SpringBootApplication
public class Application {

	private static final Logger logger = LoggerFactory.getLogger(Application.class);

	public static void main(String[] args) {
		logger.info("==========================================================");
		logger.info("SAP CAP + SAP IAS BACKEND - BACHELOR THESIS CASE STUDY");
		logger.info("==========================================================");
		logger.info("SAP_CAP_SETUP_START: {}", LocalDateTime.now());
		logger.info("Framework: SAP Cloud Application Programming Model");
		logger.info("Identity Provider: SAP Identity Authentication Service (IAS)");
		logger.info("Security Model: DECLARATIVE (CDS Annotations)");
		logger.info("");
		logger.info("Measuring Hypotheses:");
		logger.info("  H1: Security Code Lines (Expected: 70% less than AWS)");
		logger.info("  H2: Maintainability (Central vs. Distributed)");
		logger.info("  H3a: Setup Time & Time-to-First-Token");
		logger.info("  H4: Security Coupling (Expected: 70% less than AWS)");
		logger.info("  H5: Token Validation (AUTOMATIC vs. Manual)");
		logger.info("  H6: Registration Flow (Configuration vs. Code)");
		logger.info("  H7: Password Reset Security (Native Rate-Limiting)");
		logger.info("==========================================================");

		SpringApplication.run(Application.class, args);

		logger.info("==========================================================");
		logger.info("SAP CAP + SAP IAS BACKEND STARTED SUCCESSFULLY");
		logger.info("Server running on port: 8080");
		logger.info("OData V4 Endpoint: http://localhost:8080/odata/v4/OrderService");
		logger.info("Metrics Endpoint: http://localhost:8080/api/metrics/report");
		logger.info("");
		logger.info("Key Differences vs. AWS Cognito:");
		logger.info("  - NO manual JWT validation code (AUTOMATIC)");
		logger.info("  - NO @PreAuthorize annotations (CDS @restrict)");
		logger.info("  - NO distributed security checks (CENTRAL in CDS)");
		logger.info("  - NO service-binding manual configuration (AUTOMATIC)");
		logger.info("  - NO manual rate-limiting code (SAP IAS native)");
		logger.info("==========================================================");
	}
}

