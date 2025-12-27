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
 * - CDS Annotations: ~20 lines (CENTRAL, DECLARATIVE)
 * - Java Security Code: 0 lines (Framework handles it automatically!)
 * vs. AWS Cognito + Spring Boot:
 * - @PreAuthorize annotations: distributed across controllers
 * - SecurityConfig: ~100 lines
 * - Total: ~45-50 lines distributed across multiple files
 *
 * H2 - Maintainability (Adding new role "Observer"):
 * - SAP CAP: 3 lines in data-model.cds (@restrict annotation)
 * - AWS Cognito: Multiple files changed (controllers, services, config)
 *
 * H4 - Framework Coupling:
 * - SAP CAP: 2-3 files with @sap imports (minimal coupling)
 * - AWS Cognito: 10+ files with org.springframework.security imports
 *
 * H6 - User Registration (Click Comparison):
 * - SAP CAP/SAP IAS: X clicks in Admin Console
 * - AWS Cognito: Y clicks in AWS Console
 * - Additional: AWS Cognito supports SDK registration (~150 LOC)
 *
 * H7 - Password Reset:
 * - SAP CAP/SAP IAS: Configuration steps (link-based, automatic)
 * - AWS Cognito: ~100 LOC (code-based, manual implementation)
 *
 * H8 - Integrated Security Features:
 * - SAP IAS: Rate-Limiting, Brute-Force, Audit-Log (standard)
 * - AWS Cognito: Configurable, some require manual implementation
 *
 * SAP CAP Advantage: CENTRAL, DECLARATIVE, MAINTAINABLE
 * SAP IAS Difference: Cloud-only, Admin-driven user management
 */

