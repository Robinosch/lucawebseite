package customer.ba_backend_cap_ias.handlers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.handler.annotations.On;
import cds.gen.authservice.AuthService_;
import cds.gen.authservice.ForgotPasswordContext;
import cds.gen.authservice.ConfirmPasswordResetContext;

import java.time.Instant;
import java.util.stream.Collectors;

@Component
@ServiceName(AuthService_.CDS_NAME)
public class AuthServiceHandler implements EventHandler {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceHandler.class);

    /**
     * Handle password reset request.
     * SAP IAS: Sends email with reset link automatically.
     */
    @On(event = "forgotPassword", service = AuthService_.CDS_NAME)
    public void onForgotPassword(ForgotPasswordContext context) {
        long startTime = System.currentTimeMillis();

        String email = context.getEmail();
        String username = context.getUsername();

        logger.info("FORGOT_PASSWORD_REQUEST: email={}, username={}, timestamp={}",
                    email, username, Instant.now());

        try {
            // SAP IAS Integration Point:
            // In real implementation, this would call SAP IAS User Management API
            // For now, we simulate the call

            logger.info("SAP_IAS_INTEGRATION: Sending password reset email via SAP IAS");

            // Simulate SAP IAS password reset email trigger
            // SAP IAS sends a link-based reset (not code-based like Cognito)
            simulateSapIasPasswordResetEmail(email);

            long duration = System.currentTimeMillis() - startTime;
            logger.info("FORGOT_PASSWORD_SUCCESS: email={}, duration={}ms, method=SAP_IAS_LINK",
                        email, duration);

            // Return success response - Create proper return type
            ForgotPasswordContext.ReturnType result = ForgotPasswordContext.ReturnType.create();
            result.setSuccess(true);
            result.setMessage("Password reset email sent via SAP IAS");

            context.setResult(result);
            context.setCompleted();

        } catch (Exception e) {
            logger.error("FORGOT_PASSWORD_ERROR: email={}, error={}", email, e.getMessage(), e);

            ForgotPasswordContext.ReturnType errorResult = ForgotPasswordContext.ReturnType.create();
            errorResult.setSuccess(false);
            errorResult.setMessage("Failed to send password reset email: " + e.getMessage());

            context.setResult(errorResult);
            context.setCompleted();
        }
    }

    /**
     * Handle password reset confirmation.
     * SAP IAS: Typically link-based, but this supports code-based for consistency.
     */
    @On(event = "confirmPasswordReset", service = AuthService_.CDS_NAME)
    public void onConfirmPasswordReset(ConfirmPasswordResetContext context) {
        long startTime = System.currentTimeMillis();

        String email = context.getEmail();
        String code = context.getVerificationCode();
        String newPassword = context.getNewPassword();

        logger.info("CONFIRM_PASSWORD_RESET_REQUEST: email={}, timestamp={}",
                    email, Instant.now());

        try {
            // SAP IAS Integration Point:
            // In real implementation, this would validate the code/link and update password

            logger.info("SAP_IAS_INTEGRATION: Confirming password reset via SAP IAS");

            // Simulate SAP IAS password update
            simulateSapIasPasswordUpdate(email, code, newPassword);

            long duration = System.currentTimeMillis() - startTime;
            logger.info("CONFIRM_PASSWORD_RESET_SUCCESS: email={}, duration={}ms",
                        email, duration);

            // Return success response - Create proper return type
            ConfirmPasswordResetContext.ReturnType result = ConfirmPasswordResetContext.ReturnType.create();
            result.setSuccess(true);
            result.setMessage("Password successfully reset");

            context.setResult(result);
            context.setCompleted();

        } catch (Exception e) {
            logger.error("CONFIRM_PASSWORD_RESET_ERROR: email={}, error={}", email, e.getMessage(), e);

            ConfirmPasswordResetContext.ReturnType errorResult = ConfirmPasswordResetContext.ReturnType.create();
            errorResult.setSuccess(false);
            errorResult.setMessage("Failed to reset password: " + e.getMessage());

            context.setResult(errorResult);
            context.setCompleted();
        }
    }

    public void onHealth() {
        logger.info("HEALTH_CHECK: SAP CAP + SAP IAS Backend, timestamp={}", Instant.now());
    }

    public void onMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            logger.warn("UNAUTHORIZED_ACCESS: No valid authentication found");
            return;
        }

        String username = auth.getName();
        String roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(", "));

        logger.info("USER_INFO_REQUEST: username={}, roles={}", username, roles);
        logger.info("TOKEN_VALIDATION_METHOD: AUTOMATIC_BY_SAP_CAP_FRAMEWORK");
    }

    /**
     * Simulate SAP IAS password reset email.
     * In production, this would be replaced with actual SAP IAS SDK call.
     */
    private void simulateSapIasPasswordResetEmail(String email) {
        logger.info("SAP_IAS_SIMULATION: Sending reset link to {}", email);
        logger.info("SAP_IAS_FLOW: Link-based reset (not code-based like AWS Cognito)");

        // SAP IAS automatically handles:
        // 1. Email template
        // 2. Secure reset link generation
        // 3. Link expiration
        // 4. Email delivery

        // This is DECLARATIVE - no custom Lambda/trigger code needed!
    }

    /**
     * Simulate SAP IAS password update.
     * In production, this would be replaced with actual SAP IAS SDK call.
     */
    private void simulateSapIasPasswordUpdate(String email, String code, String newPassword) {
        logger.info("SAP_IAS_SIMULATION: Updating password for {}", email);

        // SAP IAS would validate:
        // 1. Code/link validity
        // 2. Password policy compliance
        // 3. Update user password

        // This is handled by SAP IAS service - minimal backend code!
    }
}

