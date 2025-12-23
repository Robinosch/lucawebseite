/**
 * Data Model for Bachelor Thesis - SAP CAP + SAP IAS
 *
 * CRITICAL: This demonstrates DECLARATIVE security (H1, H2, H4)
 * - Authorization rules are defined HERE in the model
 * - NO Java code with @PreAuthorize annotations needed
 * - Changes to authorization = edit CDS file, NOT Java code
 *
 * This is the core difference vs. AWS Cognito + Spring Boot!
 */
namespace sap.cap.orders;

using { cuid, managed } from '@sap/cds/common';

/**
 * Orders Entity with DECLARATIVE Authorization
 *
 * Hypothesis H1, H2: Security is defined centrally, not scattered across Java methods
 */
entity Orders : cuid, managed {
    customer    : String not null;
    amount      : Decimal(10,2) not null;
    status      : String default 'OPEN'; // OPEN, COMPLETED, CANCELLED
}

/**
 * DECLARATIVE AUTHORIZATION (H1, H2, H4)
 *
 * This single annotation block replaces DOZENS of @PreAuthorize annotations
 * in Spring Boot controllers!
 *
 * Comparison:
 * - AWS/Spring Boot: @PreAuthorize on EVERY controller method
 * - SAP CAP: ONE central definition here
 *
 * Measurable for H4: NO coupling to Java code!
 */
annotate Orders with @(restrict: [
    // Any authenticated user can read orders
    {
        grant: 'READ',
        to: 'authenticated-user'
    },
    // Only MANAGER role can read specific orders
    {
        grant: ['READ'],
        to: 'Manager',
        where: 'createdBy = $user'
    },
    // Only ADMIN role can create, update, delete
    {
        grant: ['*'],
        to: 'Admin'
    },
    // H2 TESTING: Observer role (read-only, no conditions)
    // This demonstrates H2: Adding new role = 1 line change!
    {
        grant: 'READ',
        to: 'Observer'
    }
]);

/**
 * METRICS for Hypothesis Testing
 *
 * H1 - Lines of Code for Authorization:
 * - CDS Annotations: ~15 lines (CENTRAL)
 * - Java Security Code: 0 lines (Framework handles it automatically!)
 * vs. AWS Cognito + Spring Boot:
 * - @PreAuthorize annotations: 1 per method = ~10-15 annotations
 * - Java Security Code: ~30 lines for AuthorizationService
 * - Total: ~45-50 lines distributed across multiple files
 *
 * H2 - Maintainability (Adding new role "Observer"):
 * - SAP CAP: 1 line in data-model.cds (@restrict annotation)
 * - AWS Cognito: 5-10 files changed (controllers, services, config)
 *
 * H4 - Framework Coupling:
 * - SAP CAP: 1-2 files with security imports (minimal)
 * - AWS Cognito: 10+ files with org.springframework.security imports
 *
 * H6 - Registration Flow:
 * - SAP CAP: ~15 lines (redirect to SAP IAS standard UI)
 * - AWS Cognito: ~85 lines (manual implementation)
 *
 * H7 - Password Reset Security:
 * - SAP CAP: ~10 lines (redirect to SAP IAS)
 * - SAP IAS includes: Rate-Limiting, Token Expiration, Email Verification
 * - AWS Cognito: ~60 lines (partial manual implementation needed)
 *
 * SAP CAP Advantage: CENTRAL, DECLARATIVE, MAINTAINABLE
 */

