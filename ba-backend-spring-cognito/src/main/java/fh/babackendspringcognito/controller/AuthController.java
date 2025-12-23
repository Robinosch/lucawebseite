package fh.babackendspringcognito.controller;

import fh.babackendspringcognito.dto.AuthResponse;
import fh.babackendspringcognito.dto.LoginRequest;
import fh.babackendspringcognito.dto.RegistrationRequest;
import fh.babackendspringcognito.dto.ResendCodeRequest;
import fh.babackendspringcognito.dto.VerifyEmailRequest;
import fh.babackendspringcognito.service.CognitoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Authentication Controller for AWS Cognito integration.
 * Implements:
 * - H6: User registration endpoint
 * - H3a: Login/authentication endpoint (Time-to-First-Token)
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CognitoService cognitoService;

    /**
     * Register a new user.
     * H6: Registration flow endpoint.
     *
     * @param request Registration request with user details
     * @return Success message
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegistrationRequest request) {
        log.info("REGISTRATION_REQUEST: email={}, timestamp={}", request.getEmail(), LocalDateTime.now());

        cognitoService.registerUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "User registered successfully. Please check your email for verification.",
                "email", request.getEmail()
        ));
    }

    /**
     * Login user and retrieve JWT tokens.
     * H3a: Time-to-First-Token measurement endpoint.
     *
     * @param request Login credentials
     * @return Authentication response with JWT tokens
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("LOGIN_REQUEST: username={}, timestamp={}", request.getUsername(), LocalDateTime.now());

        AuthResponse response = cognitoService.login(request);

        return ResponseEntity.ok(response);
    }

    /**
     * Verify user email with confirmation code.
     * H6 CRITICAL: Email verification endpoint for registration flow.
     *
     * @param request Email and 6-digit verification code
     * @return Success message
     */
    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        log.info("VERIFY_EMAIL_REQUEST: email={}, timestamp={}", request.getEmail(), LocalDateTime.now());

        cognitoService.verifyEmail(request.getEmail(), request.getUsername(), request.getVerificationCode());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email erfolgreich verifiziert",
                "email", request.getEmail(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    /**
     * Resend verification code to user's email.
     * H6: Improves UX for registration flow.
     *
     * @param request Email address to resend code to
     * @return Success message
     */
    @PostMapping("/resend-verification-code")
    public ResponseEntity<Map<String, Object>> resendVerificationCode(@Valid @RequestBody ResendCodeRequest request) {
        log.info("RESEND_CODE_REQUEST: email={}, timestamp={}", request.getEmail(), LocalDateTime.now());

        cognitoService.resendVerificationCode(request.getEmail(), request.getUsername());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Neuer Code wurde gesendet",
                "email", request.getEmail(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    /**
     * Request password reset - sends verification code to email.
     * AWS Cognito: Sends 6-digit code via email.
     *
     * @param request Map containing email (and optional username)
     * @return Success message
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        log.info("FORGOT_PASSWORD_REQUEST: email={}, timestamp={}", email, LocalDateTime.now());

        cognitoService.forgotPassword(email);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Verifizierungscode wurde an Ihre E-Mail gesendet",
                "email", email,
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    /**
     * Confirm password reset with verification code and new password.
     * AWS Cognito specific: requires code from email.
     *
     * @param request Map with email, verificationCode, and newPassword
     * @return Success message
     */
    @PostMapping("/confirm-password-reset")
    public ResponseEntity<Map<String, Object>> confirmPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("verificationCode");
        String newPassword = request.get("newPassword");

        log.info("CONFIRM_PASSWORD_RESET_REQUEST: email={}, timestamp={}", email, LocalDateTime.now());

        cognitoService.confirmPasswordReset(email, code, newPassword);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Passwort erfolgreich zurückgesetzt",
                "email", email,
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    /**
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "AWS Cognito Authentication",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}

