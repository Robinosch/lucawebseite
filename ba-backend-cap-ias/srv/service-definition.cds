/**
 * Service Definition for Bachelor Thesis - SAP CAP + SAP IAS
 *
 * CRITICAL: This demonstrates automatic authorization enforcement (H1, H5)
 * - Service exposes entities with AUTO-ENFORCED security
 * - NO manual authorization checks in Java code
 * - Framework validates JWT tokens AUTOMATICALLY
 *
 * Hypothesis H5: Token validation is AUTOMATIC, not manual like AWS Cognito
 */
using { sap.cap.orders } from '../db/data-model';

/**
 * Order Service with Automatic Authorization
 *
 * The @restrict annotations from data-model.cds are AUTOMATICALLY enforced!
 * No additional Java code needed!
 */
service OrderService @(path: '/api/orders') {

    /**
     * Orders entity exposed via OData V4
     *
     * Authorization is AUTOMATICALLY enforced by the framework:
     * - JWT token validation (H5): AUTOMATIC via @sap/xssec library
     * - Role checks (H1, H2): AUTOMATIC based on @restrict annotations
     * - No manual code needed!
     */
    entity Orders as projection on orders.Orders;

    /**
     * Custom action: Complete an order
     *
     * Authorization: Only Admin role (defined in data-model.cds)
     */
    action completeOrder(orderId: UUID) returns {
        success: Boolean;
        message: String;
    };

    /**
     * Custom action: Cancel an order
     *
     * Authorization: Admin or the user who created it
     */
    action cancelOrder(orderId: UUID) returns {
        success: Boolean;
        message: String;
    };
}

/**
 * Authentication Service
 *
 * SAP IAS Integration Notes:
 * - SAP IAS is a CLOUD-ONLY Identity Provider
 * - User registration is NOT done via Backend API (unlike AWS Cognito)
 * - Users are created via SAP IAS Admin Console or Self-Service Portal
 * - Login is handled via OIDC redirect to SAP IAS login page
 * - Password reset uses link-based flow (automatic via SAP IAS)
 *
 * This service provides:
 * - Password reset initiation (triggers SAP IAS email)
 * - User info retrieval (from validated JWT token)
 *
 * H6 Comparison Point:
 * - AWS Cognito: SDK-driven registration in backend code (~150 LOC)
 * - SAP IAS: Admin configuration (0 LOC, configuration-based)
 */
service AuthService @(path: '/api/auth') {

    /**
     * Request password reset - triggers SAP IAS email with reset link
     * SAP IAS handles: Email template, secure link, expiration, delivery
     *
     * H7: Link-based reset (SAP IAS) vs. Code-based reset (AWS Cognito)
     */
    action forgotPassword(
        email: String,
        username: String
    ) returns {
        success: Boolean;
        message: String;
    };

    /**
     * Confirm password reset
     * Note: SAP IAS typically uses link-based reset handled entirely by SAP IAS UI
     * This endpoint exists for API consistency with AWS Cognito implementation
     */
    action confirmPasswordReset(
        email: String,
        verificationCode: String,
        newPassword: String
    ) returns {
        success: Boolean;
        message: String;
    };

    /**
     * Get current user info (from validated JWT token)
     *
     * H5: Token validation happens AUTOMATICALLY before this is called
     * No manual JWT validation code required!
     */
    function me() returns {
        username: String;
        roles: array of String;
        email: String;
    };

    /**
     * Health check endpoint
     */
    function health() returns {
        status: String;
        service: String;
        timestamp: String;
    };
}

/**
 * METRICS for Hypothesis Testing (H1-H7)
 *
 * Service Definition Complexity:
 * - CDS Service Definition: ~60 lines
 * - Java Handler Implementation: ~100 lines (AuthServiceHandler)
 * - Security Code: 0 lines (all declarative in data-model.cds)
 *
 * vs. AWS Cognito + Spring Boot:
 * - AuthController: ~170 lines
 * - CognitoService: ~536 lines
 * - Security Configuration: ~100 lines
 * - JwtAuthenticationFilter: ~110 lines
 * - Total: ~916 lines
 *
 * H1: SAP CAP ~80% LESS CODE for authorization (declarative @restrict)
 * H2: SAP CAP requires 1 file edit (data-model.cds) vs. multiple files for new role
 * H3a: SAP CAP minimal config vs. manual JWKS/JWT setup in Spring Boot
 * H4: SAP CAP 2 files with @sap imports vs. 10+ files with Spring Security imports
 * H5: SAP CAP 0 lines for token validation (automatic) vs. ~60 lines manual
 * H6: SAP CAP 0 LOC for registration (admin config) vs. ~150 LOC SDK-driven
 * H7: SAP CAP ~30 lines for password reset vs. ~100 lines for AWS Cognito
 *
 * Key Architectural Difference:
 * - SAP IAS: Cloud-only IdP, admin/self-service user management
 * - AWS Cognito: SDK-driven, programmatic user management from backend
 */

