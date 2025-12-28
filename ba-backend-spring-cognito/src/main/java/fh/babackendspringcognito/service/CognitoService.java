package fh.babackendspringcognito.service;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import fh.babackendspringcognito.config.AwsCognitoProperties;
import fh.babackendspringcognito.dto.AuthResponse;
import fh.babackendspringcognito.dto.LoginRequest;
import fh.babackendspringcognito.dto.RegistrationRequest;
import fh.babackendspringcognito.exception.AuthenticationException;
import fh.babackendspringcognito.exception.InvalidTokenException;
import fh.babackendspringcognito.exception.RegistrationException;
import fh.babackendspringcognito.exception.TokenExpiredException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AWS Cognito Service for authentication and registration.
 * CRITICAL for hypothesis testing:
 * - H3a: Code & Configuration for Token Validation & JWT Handling (measured in MetricsService)
 * - H5: Manual JWT token validation
 * - H6: Registration flow complexity
 * - H7: Password reset flow
 *
 * Lines of Code for H5 Token Validation: ~150 lines (manual JWKS validation)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CognitoService {

    private final AwsCognitoProperties cognitoProperties;
    private CognitoIdentityProviderClient cognitoClient;
    private ConfigurableJWTProcessor<SecurityContext> jwtProcessor;

    /**
     * Register a new user in AWS Cognito.
     * Measures H6 - Registration Flow Complexity.
     * Steps counted: 1) Build request, 2) Calculate secret hash, 3) Call Cognito API, 4) Handle response.
     */
    public void registerUser(RegistrationRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("AWS_COGNITO_REGISTRATION_START: email={}, timestamp={}", request.getEmail(), LocalDateTime.now());

        try {
            CognitoIdentityProviderClient client = getCognitoClient();

           var secretHash = calculateSecretHash(request.getUsername());

            Map<String, String> userAttributes = new HashMap<>();
            userAttributes.put("email", request.getEmail());
            userAttributes.put("given_name", request.getGivenName());
            userAttributes.put("family_name", request.getFamilyName());

           SignUpRequest signUpRequest = SignUpRequest.builder()
                    .clientId(cognitoProperties.getCognito().getClientId())
                    .secretHash(secretHash)
                    .username(request.getUsername())
                    .password(request.getPassword())
                    .userAttributes(
                            userAttributes.entrySet().stream()
                                    .map(e -> AttributeType.builder()
                                            .name(e.getKey())
                                            .value(e.getValue())
                                            .build())
                                    .toList()
                    )
                    .build();

            SignUpResponse response = client.signUp(signUpRequest);

            long duration = System.currentTimeMillis() - startTime;
            log.info("AWS_COGNITO_REGISTRATION_SUCCESS: userSub={}, confirmed={}, duration={}ms",
                    response.userSub(), response.userConfirmed(), duration);

        } catch (UsernameExistsException e) {
            log.error("AWS_COGNITO_REGISTRATION_ERROR: User already exists - {}", e.getMessage());
            throw new RegistrationException("User with this email already exists");
        } catch (InvalidPasswordException e) {
            log.error("AWS_COGNITO_REGISTRATION_ERROR: Invalid password - {}", e.getMessage());
            throw new RegistrationException("Password does not meet requirements: " + e.getMessage());
        } catch (Exception e) {
            log.error("AWS_COGNITO_REGISTRATION_ERROR: Unexpected error - {}", e.getMessage(), e);
            throw new RegistrationException("Registration failed: " + e.getMessage(), e);
        }
    }

    /**
     * Authenticate user and retrieve JWT tokens.
     */
    public AuthResponse login(LoginRequest request) {
        log.info("AWS_COGNITO_LOGIN_START: username={}, timestamp={}", request.getUsername(), LocalDateTime.now());

        try {
            CognitoIdentityProviderClient client = getCognitoClient();

            String secretHash = calculateSecretHash(request.getUsername());

            Map<String, String> authParams = new HashMap<>();
            authParams.put("USERNAME", request.getUsername());
            authParams.put("PASSWORD", request.getPassword());
            authParams.put("SECRET_HASH", secretHash);

            InitiateAuthRequest authRequest = InitiateAuthRequest.builder()
                    .authFlow(AuthFlowType.USER_PASSWORD_AUTH)
                    .clientId(cognitoProperties.getCognito().getClientId())
                    .authParameters(authParams)
                    .build();

            InitiateAuthResponse authResponse = client.initiateAuth(authRequest);

            log.info("AWS_COGNITO_LOGIN_SUCCESS: username={}, timestamp={}",
                    request.getUsername(), LocalDateTime.now());

            AuthenticationResultType result = authResponse.authenticationResult();
            log.info("result={}", result);
            if (result == null)
                throw new AuthenticationException("Authentication failed: No tokens received");

            String[] roles = new String[0];
            String email = request.getUsername();
            String username = request.getUsername();
            try {
                JWTClaimsSet claims = validateToken(result.idToken());
                List<String> cognitoGroups = claims.getStringListClaim("cognito:groups");
                if (cognitoGroups != null) {
                    roles = cognitoGroups.toArray(new String[0]);
                }
                if (claims.getClaim("email") != null) {
                    email = claims.getStringClaim("email");
                }
                if (claims.getClaim("cognito:username") != null) {
                    username = claims.getStringClaim("cognito:username");
                }
            } catch (Exception e) {
                log.warn("Could not parse ID token for user info: {}", e.getMessage());
            }

            return AuthResponse.builder()
                    .success(true)
                    .accessToken(result.accessToken())
                    .idToken(result.idToken())
                    .refreshToken(result.refreshToken())
                    .expiresIn(result.expiresIn())
                    .tokenType(result.tokenType())
                    .username(request.getUsername())
                    .user(AuthResponse.UserInfo.builder()
                            .username(username)
                            .email(email)
                            .roles(roles)
                            .build())
                    .build();

        } catch (NotAuthorizedException e) {
            log.error("AWS_COGNITO_LOGIN_ERROR: Invalid credentials - {}", e.getMessage());
            throw new AuthenticationException("Invalid username or password");
        } catch (UserNotConfirmedException e) {
            log.error("AWS_COGNITO_LOGIN_ERROR: User not confirmed - {}", e.getMessage());
            throw new AuthenticationException("User account not confirmed. Please verify your email.");
        } catch (Exception e) {
            log.error("AWS_COGNITO_LOGIN_ERROR: Unexpected error - {}", e.getMessage(), e);
            throw new AuthenticationException("Login failed: " + e.getMessage(), e);
        }
    }

    /**
     * Validation steps:
     * 1. Fetch JWKS from Cognito endpoint
     * 2. Parse and verify JWT signature (RS256)
     * 3. Validate claims: iss, exp (and optionally aud for ID tokens)
     * 4. Extract user information and roles
     *
     * Access Tokens (for API calls) do NOT contain 'aud' claim!
     * Only ID Tokens contain 'aud' (audience) claim with Client ID.
     *
     * Lines of Code for this method: ~60 lines
     */
    public JWTClaimsSet validateToken(String token) {
        long startTime = System.currentTimeMillis();
        log.debug("JWT_VALIDATION_START: Validating token against JWKS");

        try {
            ConfigurableJWTProcessor<SecurityContext> processor = getJwtProcessor();
            JWTClaimsSet claims = processor.process(token, null);

            log.debug("JWT_CLAIMS_PARSED: Successfully parsed token claims");
            log.debug("JWT_CLAIMS_ISSUER: {}", claims.getIssuer());
            log.debug("JWT_CLAIMS_AUDIENCE: {}", claims.getAudience());
            log.debug("JWT_CLAIMS_SUBJECT: {}", claims.getSubject());
            log.debug("JWT_CLAIMS_EXPIRATION: {}", claims.getExpirationTime());
            log.debug("JWT_CLAIMS_TOKEN_USE: {}", claims.getStringClaim("token_use"));

            String issuer = claims.getIssuer();
            String expectedIssuer = cognitoProperties.getCognito().getIssuerUri();
            if (!expectedIssuer.equals(issuer)) {
                log.error("JWT_VALIDATION_ERROR: Invalid issuer. Expected: {}, Got: {}", expectedIssuer, issuer);
                throw new InvalidTokenException("Invalid token issuer");
            }

            Instant expirationTime = claims.getExpirationTime().toInstant();
            if (expirationTime.isBefore(Instant.now())) {
                log.error("JWT_VALIDATION_ERROR: Token expired at {}", expirationTime);
                throw new TokenExpiredException("Token has expired");
            }

            String tokenUse = claims.getStringClaim("token_use");
            if (tokenUse != null) {
                log.debug("JWT_TOKEN_USE: {}", tokenUse);

                if ("id".equals(tokenUse)) {
                    if (claims.getAudience() == null || claims.getAudience().isEmpty()) {
                        log.error("JWT_VALIDATION_ERROR: ID Token missing audience claim");
                        throw new InvalidTokenException("ID Token must contain audience claim");
                    }
                    String audience = claims.getAudience().get(0);
                    String expectedAudience = cognitoProperties.getCognito().getClientId();
                    if (!expectedAudience.equals(audience)) {
                        log.error("JWT_VALIDATION_ERROR: Invalid audience. Expected: {}, Got: {}", expectedAudience, audience);
                        throw new InvalidTokenException("Invalid token audience");
                    }
                    log.debug("JWT_VALIDATION: ID Token audience validated: {}", audience);
                }

                if ("access".equals(tokenUse)) {
                    log.debug("JWT_VALIDATION: Access Token detected, audience validation skipped (not required for Access Tokens)");
                }
            } else {
                log.debug("JWT_VALIDATION: token_use claim not found, skipping audience validation");
            }

            long duration = System.currentTimeMillis() - startTime;
            log.info("JWT_VALIDATION_SUCCESS: Token validated successfully in {}ms, token_use={}", duration, tokenUse);

            return claims;

        } catch (TokenExpiredException | InvalidTokenException e) {
            throw e;
        } catch (com.nimbusds.jose.proc.BadJOSEException e) {
            log.error("JWT_VALIDATION_ERROR: Bad JOSE signature - {}", e.getMessage(), e);
            throw new InvalidTokenException("Invalid token signature: " + e.getMessage(), e);
        } catch (java.text.ParseException e) {
            log.error("JWT_VALIDATION_ERROR: Token parsing failed - {}", e.getMessage(), e);
            throw new InvalidTokenException("Token parsing failed: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("JWT_VALIDATION_ERROR: Token validation failed - {}", e.getMessage(), e);
            log.error("JWT_VALIDATION_ERROR_TYPE: {}", e.getClass().getName());
            throw new InvalidTokenException("Token validation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Calculate Secret Hash for Cognito client with secret.
     * Required for authentication when client secret is configured.
     *
     * Formula: Base64(HMAC_SHA256(clientSecret, username + clientId))
     */
    private String calculateSecretHash(String username) {
        try {
            String clientId = cognitoProperties.getCognito().getClientId();
            String clientSecret = cognitoProperties.getCognito().getClientSecret();

            String message = username + clientId;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    clientSecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            mac.init(secretKeySpec);

            byte[] rawHmac = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(rawHmac);

        } catch (Exception e) {
            log.error("SECRET_HASH_ERROR: Failed to calculate secret hash - {}", e.getMessage(), e);
            throw new RuntimeException("Failed to calculate secret hash", e);
        }
    }

    /**
     * Initialize AWS Cognito client (lazy initialization).
     */
    private CognitoIdentityProviderClient getCognitoClient() {
        if (cognitoClient == null) {
            cognitoClient = CognitoIdentityProviderClient.builder()
                    .region(Region.of(cognitoProperties.getRegion()))
                    .credentialsProvider(DefaultCredentialsProvider.create())
                    .build();
        }
        return cognitoClient;
    }

    /**
     * Initialize JWT processor with JWKS endpoint (lazy initialization).
     * This fetches public keys from AWS Cognito JWKS endpoint.
     */
    private ConfigurableJWTProcessor<SecurityContext> getJwtProcessor() {
        if (jwtProcessor == null) {
            try {
                String jwksUrl = cognitoProperties.getCognito().getJwksUri();
                log.info("JWKS_FETCH: Fetching public keys from {}", jwksUrl);

                JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(new URL(jwksUrl));

                ConfigurableJWTProcessor<SecurityContext> processor = new DefaultJWTProcessor<>();
                processor.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource));

                jwtProcessor = processor;

                log.info("JWKS_INITIALIZED: JWT processor initialized successfully with JWKS from {}", jwksUrl);

            } catch (Exception e) {
                log.error("JWKS_ERROR: Failed to initialize JWT processor - {}", e.getMessage(), e);
                throw new RuntimeException("Failed to initialize JWT processor: " + e.getMessage(), e);
            }
        }
        return jwtProcessor;
    }

    /**
     * Verify user email with confirmation code.
     * H6 CRITICAL: Email verification endpoint for registration flow.
     *
     * @param username Username to verify
     * @param code 6-digit verification code sent to user's email
     */
    public void verifyEmail(String mail, String username, String code) {
        long startTime = System.currentTimeMillis();
        log.info("EMAIL_VERIFICATION_START: email={}, timestamp={}", username, LocalDateTime.now());

        try {
            CognitoIdentityProviderClient client = getCognitoClient();

            String secretHash = calculateSecretHash(username);

            ConfirmSignUpRequest confirmRequest = ConfirmSignUpRequest.builder()
                    .clientId(cognitoProperties.getCognito().getClientId())
                    .secretHash(secretHash)
                    .username(username)
                    .confirmationCode(code)
                    .build();

            ConfirmSignUpResponse response = client.confirmSignUp(confirmRequest);

            long duration = System.currentTimeMillis() - startTime;
            log.info("EMAIL_VERIFICATION_SUCCESS: username={}, duration={}ms, timestamp={}",
                    username, duration, LocalDateTime.now());
        } catch (CodeMismatchException e) {
            log.error("EMAIL_VERIFICATION_ERROR: Invalid verification code for username={} - {}", username, e.getMessage());
            throw new AuthenticationException("Invalid verification code. Please check and try again.");
        } catch (ExpiredCodeException e) {
            log.error("EMAIL_VERIFICATION_ERROR: Expired verification code for username={} - {}", username, e.getMessage());
            throw new AuthenticationException("Verification code has expired. Please request a new code.");
        } catch (NotAuthorizedException e) {
            log.error("EMAIL_VERIFICATION_ERROR: User already confirmed or not authorized for username={} - {}", username, e.getMessage());
            throw new AuthenticationException("Email already verified or user not found.");
        } catch (Exception e) {
            log.error("EMAIL_VERIFICATION_ERROR: Unexpected error for username={} - {}", username, e.getMessage(), e);
            throw new AuthenticationException("Email verification failed: " + e.getMessage(), e);
        }
    }

    /**
     * Resend verification code to user's email.
     * H6: Improves UX for registration flow.
     *
     * @param email Email address to resend code to
     */
    public void resendVerificationCode(String email, String username) {
        long startTime = System.currentTimeMillis();
        log.info("RESEND_CODE_START: email={}, timestamp={}", email, LocalDateTime.now());

        try {
            CognitoIdentityProviderClient client = getCognitoClient();

            String secretHash = calculateSecretHash(username);

            ResendConfirmationCodeRequest resendRequest = ResendConfirmationCodeRequest.builder()
                    .clientId(cognitoProperties.getCognito().getClientId())
                    .secretHash(secretHash)
                    .username(email)
                    .build();

            ResendConfirmationCodeResponse response = client.resendConfirmationCode(resendRequest);

            long duration = System.currentTimeMillis() - startTime;
            log.info("RESEND_CODE_SUCCESS: email={}, duration={}ms, codeDelivery={}, timestamp={}",
                    email, duration, response.codeDeliveryDetails().deliveryMedium(), LocalDateTime.now());
        } catch (LimitExceededException e) {
            log.error("RESEND_CODE_ERROR: Rate limit exceeded for email={} - {}", email, e.getMessage());
            throw new AuthenticationException("Too many requests. Please try again later.");
        } catch (InvalidParameterException e) {
            log.error("RESEND_CODE_ERROR: User already confirmed for email={} - {}", email, e.getMessage());
            throw new AuthenticationException("Email already verified.");
        } catch (Exception e) {
            log.error("RESEND_CODE_ERROR: Unexpected error for email={} - {}", email, e.getMessage(), e);
            throw new AuthenticationException("Failed to resend verification code: " + e.getMessage(), e);
        }
    }

    /**
     * Request password reset - sends verification code to user's email.
     * AWS Cognito: Sends a 6-digit code via email.
     *
     * @param email User's email address (username in Cognito)
     */
    public void forgotPassword(String email) {
        long startTime = System.currentTimeMillis();
        log.info("FORGOT_PASSWORD_START: email={}, timestamp={}", email, LocalDateTime.now());

        try {
            CognitoIdentityProviderClient client = getCognitoClient();

            String secretHash = calculateSecretHash(email);

            ForgotPasswordRequest forgotPasswordRequest = ForgotPasswordRequest.builder()
                    .clientId(cognitoProperties.getCognito().getClientId())
                    .secretHash(secretHash)
                    .username(email)
                    .build();

            ForgotPasswordResponse response = client.forgotPassword(forgotPasswordRequest);

            long duration = System.currentTimeMillis() - startTime;
            log.info("FORGOT_PASSWORD_SUCCESS: email={}, duration={}ms, codeDelivery={}, timestamp={}",
                    email, duration, response.codeDeliveryDetails().deliveryMedium(), LocalDateTime.now());
        } catch (UserNotFoundException e) {
            log.error("FORGOT_PASSWORD_ERROR: User not found for email={} - {}", email, e.getMessage());
            log.info("FORGOT_PASSWORD_USER_NOT_FOUND: email={}, but returning success for security", email);
        } catch (LimitExceededException e) {
            log.error("FORGOT_PASSWORD_ERROR: Rate limit exceeded for email={} - {}", email, e.getMessage());
            throw new AuthenticationException("Too many password reset requests. Please try again later.");
        } catch (Exception e) {
            log.error("FORGOT_PASSWORD_ERROR: Unexpected error for email={} - {}", email, e.getMessage(), e);
            throw new AuthenticationException("Failed to send password reset code: " + e.getMessage(), e);
        }
    }

    /**
     * Confirm password reset with verification code and new password.
     * AWS Cognito specific: requires the code sent via email.
     *
     * @param email User's email address
     * @param code Verification code from email
     * @param newPassword New password
     */
    public void confirmPasswordReset(String email, String code, String newPassword) {
        long startTime = System.currentTimeMillis();
        log.info("CONFIRM_PASSWORD_RESET_START: email={}, timestamp={}", email, LocalDateTime.now());

        try {
            CognitoIdentityProviderClient client = getCognitoClient();

            String secretHash = calculateSecretHash(email);

            ConfirmForgotPasswordRequest confirmRequest = ConfirmForgotPasswordRequest.builder()
                    .clientId(cognitoProperties.getCognito().getClientId())
                    .secretHash(secretHash)
                    .username(email)
                    .confirmationCode(code)
                    .password(newPassword)
                    .build();

            ConfirmForgotPasswordResponse response = client.confirmForgotPassword(confirmRequest);

            long duration = System.currentTimeMillis() - startTime;
            log.info("CONFIRM_PASSWORD_RESET_SUCCESS: email={}, duration={}ms, timestamp={}",
                    email, duration, LocalDateTime.now());
        } catch (CodeMismatchException e) {
            log.error("CONFIRM_PASSWORD_RESET_ERROR: Invalid code for email={} - {}", email, e.getMessage());
            throw new AuthenticationException("Invalid verification code. Please check and try again.");
        } catch (ExpiredCodeException e) {
            log.error("CONFIRM_PASSWORD_RESET_ERROR: Expired code for email={} - {}", email, e.getMessage());
            throw new AuthenticationException("Verification code has expired. Please request a new code.");
        } catch (InvalidPasswordException e) {
            log.error("CONFIRM_PASSWORD_RESET_ERROR: Invalid password for email={} - {}", email, e.getMessage());
            throw new AuthenticationException("Password does not meet requirements: " + e.getMessage());
        } catch (Exception e) {
            log.error("CONFIRM_PASSWORD_RESET_ERROR: Unexpected error for email={} - {}", email, e.getMessage(), e);
            throw new AuthenticationException("Failed to reset password: " + e.getMessage(), e);
        }
    }
}

