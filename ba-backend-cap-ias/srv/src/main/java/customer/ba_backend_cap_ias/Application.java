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
 * Key Hypotheses (Framework-Integration):
 * - H1: SAP CAP requires significantly less security code (deklarativ vs. imperativ)
 * - H2: SAP CAP provides better maintainability through central security definition
 * - H3a: Token-Validierung LOC und zyklomatische Komplexität (automatisch = 0)
 * - H4: SAP CAP has less coupling to security libraries
 * - H5: SAP CAP provides automatic token validation (NO manual JWKS code)
 *
 * IdP-Hypothesen (in SAP IAS Admin-Konsole gemessen):
 * - H6-H9: Benutzerregistrierung, Recovery, Features, Löschung
 *
 * CRITICAL DIFFERENCE:
 * - AWS Cognito: IMPERATIVE security (code in every method)
 * - SAP CAP: DECLARATIVE security (CDS annotations in model)
 *
 * SECURITY:
 * - SAP CAP Framework übernimmt die Security-Konfiguration automatisch
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
		logger.info("Measuring Hypotheses (Framework-Integration):");
		logger.info("  H1: Security Code Lines (Autorisierungs-LOC)");
		logger.info("  H2: Maintainability (Central vs. Distributed)");
		logger.info("  H3a: Token-Validierung LOC (automatisch = 0)");
		logger.info("  H4: Security Coupling (Vendor-Abhängigkeit)");
		logger.info("  H5: Token Validation (AUTOMATIC vs. Manual)");
		logger.info("  H6-H9: IdP-Hypothesen (in SAP IAS Console gemessen)");
		logger.info("==========================================================");

		SpringApplication.run(Application.class, args);

	}
}

