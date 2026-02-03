# Spring Boot Backend mit AWS Cognito - Dokumentation

## Überblick

Das Backend ist eine Spring Boot REST-API mit AWS Cognito für die Bachelorarbeit. Der Fokus liegt auf der wissenschaftlichen Messung von Hypothesen zum Vergleich mit SAP CAP + SAP IAS.

---

## Projektstruktur

```
ba-backend-spring-cognito/
├── src/main/java/fh/babackendspringcognito/
│   ├── config/
│   │   ├── SecurityConfig.java         # Spring Security Konfiguration
│   │   └── AwsCognitoProperties.java   # AWS Config
│   ├── controller/
│   │   ├── AuthController.java         # Login, Register, Password-Reset
│   │   ├── OrderController.java        # Business-Logik mit @PreAuthorize
│   ├── service/
│   │   ├── CognitoService.java         # AWS SDK Integration
│   ├── security/
│   │   └── JwtAuthenticationFilter.java # Custom JWT Validierung
│   └── model/
│       └── Order.java                   # JPA Entity
├── src/main/resources/
│   └── application.properties          # Spring Boot Config
└── build.gradle                         # Dependencies
```

---

## Kernkonzept: Imperative Sicherheit

### OrderController.java (mit @PreAuthorize)

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    // Jede Methode benötigt @PreAuthorize
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")
    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.findAll();
    }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public Order createOrder(@RequestBody OrderDto dto) {
        return orderService.create(dto);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderService.delete(id);
    }
}
```

**Wichtig:** Security-Logik ist **verteilt** über alle Controller/Services. Jede Methode benötigt explizite `@PreAuthorize` Annotation.

---

## AWS Cognito Integration

### CognitoService.java

```java
@Service
public class CognitoService {
    
    private final CognitoIdentityProviderClient cognitoClient;
    
    /**
     * Login mit AWS Cognito
     */
    public AuthResponse login(LoginRequest request) {
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
        
        InitiateAuthResponse authResponse = cognitoClient.initiateAuth(authRequest);
        return buildAuthResponse(authResponse);
    }
    
    /**
     * Registrierung mit AWS Cognito
     */
    public void register(RegistrationRequest request) {
        SignUpRequest signUpRequest = SignUpRequest.builder()
            .clientId(cognitoProperties.getCognito().getClientId())
            .username(request.getUsername())
            .password(request.getPassword())
            .secretHash(calculateSecretHash(request.getUsername()))
            .userAttributes(
                AttributeType.builder().name("email").value(request.getEmail()).build(),
                AttributeType.builder().name("family_name").value(request.getFamilyName()).build()
            )
            .build();
        
        cognitoClient.signUp(signUpRequest);
    }
    
    /**
     * Password-Reset
     */
    public void forgotPassword(String email) {
        ForgotPasswordRequest request = ForgotPasswordRequest.builder()
            .clientId(cognitoProperties.getCognito().getClientId())
            .username(email)
            .secretHash(calculateSecretHash(email))
            .build();
        
        cognitoClient.forgotPassword(request);
    }
}
```

---

## API-Endpunkte

### Authentifizierung

```bash
# Login
POST /api/auth/login
Body: { "username": "user", "password": "pass" }

# Registrierung
POST /api/auth/register
Body: { "username": "user", "email": "user@example.com", "password": "pass" }

# Email-Verifizierung
POST /api/auth/verify-email
Body: { "username": "user", "verificationCode": "123456" }

# Password-Reset anfordern
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }

# Password-Reset bestätigen
POST /api/auth/confirm-forgot-password
Body: { "email": "user@example.com", "code": "123456", "newPassword": "newpass" }
```

### Business-Logik (mit @PreAuthorize)

```bash
# Orders (alle Rollen)
GET /api/orders
Header: Authorization: Bearer <jwt-token>

# Order erstellen (ADMIN, MANAGER)
POST /api/orders
Header: Authorization: Bearer <jwt-token>
Body: { "customer": "Max", "amount": 100 }

# Order löschen (nur ADMIN)
DELETE /api/orders/123
Header: Authorization: Bearer <jwt-token>
```

## Konfiguration

### application.properties

```properties
# AWS Cognito
aws.cognito.region=eu-central-1
aws.cognito.userPoolId=eu-central-1_XXXXXXXXX
aws.cognito.clientId=your-client-id
aws.cognito.clientSecret=your-client-secret

# Spring Security OAuth2 Resource Server
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://cognito-idp.${aws.cognito.region}.amazonaws.com/${aws.cognito.userPoolId}
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://cognito-idp.${aws.cognito.region}.amazonaws.com/${aws.cognito.userPoolId}/.well-known/jwks.json

# H2 Database (Dev)
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
```

---

### Lokal

```bash
# Dependencies installieren
./gradlew build

# Application starten
./gradlew bootRun

# Test-Zugriff
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123!"}'
```

---

## AWS Cognito Setup

### 1. User Pool erstellen

### 2. App Client mit Secret erstellen

### 3. application.properties aktualisieren

---
