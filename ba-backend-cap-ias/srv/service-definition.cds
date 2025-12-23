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
 * Handles registration, login, email verification, and password reset.
 * SAP IAS integration for user management.
 */
service AuthService @(path: '/api/auth') {

    /**
     * User registration
     * Creates new user in SAP IAS
     */
    action register(
        username: String,
        email: String,
        password: String,
        givenName: String,
        familyName: String
    ) returns {
        success: Boolean;
        message: String;
        email: String;
    };

    /**
     * User login
     * Returns JWT tokens from SAP IAS
     */
    action login(
        username: String,
        password: String
    ) returns {
        accessToken: String;
        idToken: String;
        refreshToken: String;
        expiresIn: Integer;
        username: String;
    };

    /**
     * Email verification with code
     */
    action verifyEmail(
        email: String,
        username: String,
        verificationCode: String
    ) returns {
        success: Boolean;
        message: String;
        email: String;
    };

    /**
     * Resend verification code
     */
    action resendVerificationCode(
        email: String
    ) returns {
        success: Boolean;
        message: String;
    };

    /**
     * Request password reset - sends email with link/code
     * SAP IAS: Sends email with reset link
     */
    action forgotPassword(
        email: String,
        username: String
    ) returns {
        success: Boolean;
        message: String;
    };

    /**
     * Confirm password reset (only needed for certain flows)
     * SAP IAS typically uses link-based reset, not code-based
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
     */
    function me() returns {
        username: String;
        roles: array of String;
        email: String;
    };
}

/**
 * METRICS for Hypothesis Testing (H1-H7)
 *
 * Service Definition Complexity:
 * - CDS Service Definition: ~50 lines
 * - Java Service Implementation: ~30 lines (only business logic!)
 * - Security Code: 0 lines (all in data-model.cds)
 *
 * vs. AWS Cognito + Spring Boot:
 * - Controller: ~80 lines
 * - Service: ~60 lines
 * - Security Configuration: ~100 lines
 * - Manual JWT validation: ~150 lines
 * - Total: ~390 lines
 *
 * H1: SAP CAP ~80% LESS CODE for authorization
 * H2: SAP CAP requires 1 file edit vs. 5-10 files for new role
 * H3a: SAP CAP ~2-3 min setup vs. ~5 min for Spring Boot
 * H4: SAP CAP 1-2 files with security imports vs. 10+ files
 * H5: SAP CAP 0 lines for token validation vs. 150 lines manual
 * H6: SAP CAP ~15 lines for registration vs. ~85 lines manual
 * H7: SAP CAP ~10 lines for password reset (with rate-limiting) vs. ~60 lines (partial features)
 */

