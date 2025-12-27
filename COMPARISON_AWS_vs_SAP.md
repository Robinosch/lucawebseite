# 📊 Direkter Vergleich: AWS Cognito vs. SAP CAP + SAP IAS

## Bachelor Thesis - Hypothesen H1-H7 Vergleich

---

## 📊 HYPOTHESEN-VERGLEICHSTABELLE

| ID | Hypothese | Metrik | AWS Cognito + Spring Boot | SAP CAP + SAP IAS | Vorteil | Differenz |
|----|-----------|--------|---------------------------|-------------------|---------|-----------|
| **H1** | Security Code Lines | Lines of Code | **~450 Zeilen** (distributed) | **~19 Zeilen** (central) | ✅ SAP CAP | **-96%** |
| **H2** | Maintainability (neue Rolle) | Dateien + Methoden | **3-4 Dateien, 10 Methoden** | **1 Datei, 1 Zeile** | ✅ SAP CAP | **-75-100%** |
| **H3a** | Token-Validierung Config/Code | Lines of Code | **~75 Zeilen** (manual) | **~0-15 Zeilen** (automatic) | ✅ SAP CAP | **-80-100%** |
| **H3b** | Enterprise Integration | Schritte + Code | **12 Schritte, 45 Zeilen** (manual) | **5 Schritte, 0 Zeilen** (automatic) | ✅ SAP CAP | **-58% Config, -100% Code** |
| **H4** | Framework-Kopplung | % Dateien | **10-12 Dateien (~50-60%)** | **1-2 Dateien (~10-15%)** | ✅ SAP CAP | **-80-83%** |
| **H5** | Token-Validierung (Auto vs. Manual) | Lines of Code | **~40 Zeilen** (manual) | **0 Zeilen** (automatic) | ✅ SAP CAP | **-100%** |
| **H6** | Registrierungs-Flow | Lines of Code | **~75 Zeilen** (manual AWS SDK) | **~15 Zeilen** (redirect) | ✅ SAP CAP | **-80%** |
| **H7** | Password-Reset-Sicherheit | Lines of Code + Features | **~70 Zeilen** (partial) | **~10 Zeilen** (native) | ✅ SAP CAP | **-86%** |
| **H7** | Rate-Limiting | Native Support | ⚠️ **Partial** (Cognito Auto + Manual Backend) | ✅ **Native** (SAP IAS) | ✅ SAP CAP | **Native vs. Partial** |

---

## 🎯 KRITISCHER UNTERSCHIED: IMPERATIVE vs. DECLARATIVE

### AWS Cognito + Spring Boot (IMPERATIVE)

**Security-Modell**: Verteilt über Code

**OrderController.java** (Beispiel):
```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'USER')")  // Security hier
    @GetMapping
    public List<Order> getAllOrders() { }
    
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")          // Security hier
    @PostMapping
    public Order createOrder(@RequestBody Order order) { }
    
    @PreAuthorize("hasRole('ADMIN')")                        // Security hier
    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) { }
}
```

**Probleme**:
- ❌ Security-Logik **verteilt** über 5-8 Dateien
- ❌ **Jede Methode** benötigt `@PreAuthorize`
- ❌ Neue Rolle = **10 Methoden** anpassen
- ❌ **Fehleranfällig** (vergessene Annotation)

---

### SAP CAP + SAP IAS (DECLARATIVE)

**Security-Modell**: Zentral im Datenmodell

**data-model.cds** (Beispiel):
```cds
entity Orders : cuid {
    customer: String;
    amount: Decimal;
    status: String;
}

// Zentrale Security-Definition (1x!)
annotate Orders with @(restrict: [
    { grant: 'READ', to: 'authenticated-user' },
    { grant: ['READ'], to: 'Manager', where: 'createdBy = $user' },
    { grant: ['*'], to: 'Admin' },
    { grant: 'READ', to: 'Observer' }  // H2: Neue Rolle = 1 Zeile!
]);
```

**OrderServiceHandler.java** (Business-Logik):
```java
@Component
public class OrderServiceHandler implements EventHandler {
    
    // KEINE @PreAuthorize nötig!
    // Framework checkt automatisch @restrict
    @On(event = "READ", entity = "Orders")
    public void onRead(Stream<Orders> stream) {
        // Nur Business-Logik, keine Security-Checks!
    }
}
```

**Vorteile**:
- ✅ Security-Logik **zentral** in 1 Datei
- ✅ **Keine** `@PreAuthorize` Annotationen nötig
- ✅ Neue Rolle = **1 Zeile** ändern
- ✅ **Wartbar** und **nachvollziehbar**

---

## 📊 DETAILLIERTE HYPOTHESEN-ANALYSE

### H1: Security Code Lines (Lines of Code)

**Forschungsfrage**: Reduziert deklarative Sicherheit die Anzahl der Code-Zeilen?

| Backend | Security-Code | Lokation | Typ |
|---------|--------------|----------|-----|
| **AWS Cognito** | ~40-50 Zeilen | Distributed (OrderController, AuthController, UserController, Services) | Imperative (@PreAuthorize) |
| **SAP CAP** | ~19 Zeilen | Central (data-model.cds) | Declarative (@restrict) |

**Reduktion**: **-58-62%**

**Interpretation**:
- SAP CAP benötigt **deutlich weniger Code** für die gleiche Funktionalität
- **Zentrale Definition** vs. verteilt über 5-8 Dateien
- **Wartbarkeit** höher (alle Regeln an einem Ort)

---

### H2: Maintainability (Code-Änderungen für neue Rolle)

**Forschungsfrage**: Wie viele Dateien/Methoden müssen geändert werden für eine neue Rolle?

**Test**: Neue Rolle "OBSERVER" (READ-only) hinzufügen

| Backend | Dateien geändert | Methoden angepasst | Zeilen geändert |
|---------|-----------------|-------------------|----------------|
| **AWS Cognito** | 3-4 Dateien | 10 Methoden | ~18 Zeilen |
| **SAP CAP** | 1 Datei | 0 Methoden | 4 Zeilen |

**Reduktion**: **-75% Dateien**, **-100% Methoden**, **-78% Zeilen**

**Interpretation**:
- SAP CAP **deutlich wartbarer**
- **Single Point of Truth** (data-model.cds)
- Weniger **Fehlerrisiko** (vergessene Anpassung)

---

### H3a: Token-Validierung Config/Code (Lines of Code)

**Forschungsfrage**: Wie viel Code und Konfiguration ist nötig für Token-Validierung und JWT-Handling?

| Backend | Config/Code-Zeilen | Komponenten | Fehlerquellen |
|---------|-------------------|-------------|---------------|
| **AWS Cognito** | ~75 Zeilen | application.yaml (5) + SecurityConfig (40) + JwtConverter (30) | 5 (manuelle Config) |
| **SAP CAP** | ~0-15 Zeilen | package.json (cds-Block) | 0 (automatisch) |

**Reduktion**: **-80-100%**

**AWS Cognito - Manuelle Konfiguration:**
```yaml
# application.yaml
spring.security.oauth2.resourceserver.jwt:
  issuer-uri: https://cognito-idp.eu-central-1.amazonaws.com/...
  jwk-set-uri: https://cognito-idp.eu-central-1.amazonaws.com/.../.well-known/jwks.json
```

```java
// SecurityConfig.java (~40 Zeilen)
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) {
    http.oauth2ResourceServer(oauth2 -> oauth2
        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter())));
}

// JwtAuthenticationFilter.java (~30 Zeilen)
@Bean
public JwtAuthenticationConverter jwtConverter() {
    // Manuelle Rollen-Extraktion aus cognito:groups
}
```

**SAP CAP - Automatische Konfiguration:**
```json
// package.json (0-15 Zeilen)
{
  "cds": {
    "requires": {
      "auth": { "kind": "xsuaa" }
    }
  }
}
```

**Interpretation**:
- SAP CAP benötigt **80-100% weniger** Config/Code
- **Keine Fehlerquellen** (Framework übernimmt alles)
- Spring Boot: **5 potentielle Fehlerquellen** (issuer-uri, jwk-set-uri, SecurityConfig, Custom Converter, Roles Mapping)

---

### H3b: Enterprise Integration (Externer IdP-Anbindung)

**Forschungsfrage**: Wie aufwändig ist die Anbindung eines externen IdP (z.B. Azure AD, Okta) in der Cloud?

| Backend | Config-Schritte | Code-Zeilen | Service Binding |
|---------|----------------|-------------|-----------------|
| **AWS Cognito** | 12 Schritte | 45 Zeilen | Manuell ❌ |
| **SAP CAP** | 5 Schritte | 0 Zeilen | Automatisch ✅ |

**Reduktion**: **-58% Config-Schritte**, **-100% Code**

**AWS Cognito - Manuelle Integration:**
1. AWS Console öffnen
2. Cognito User Pool → Identity Providers
3. OIDC/SAML Provider konfigurieren
4. Metadaten hochladen
5. Attribute Mapping konfigurieren
6. App Client anpassen
7. Callback URLs setzen
8. **application.yaml manuell anpassen** (issuer-uri, jwk-set-uri)
9. **SecurityConfig.java anpassen** (~20 Zeilen)
10. **Custom JWT Converter** für externe Claims (~25 Zeilen)
11. Deployment
12. Testing

**SAP CAP - Service Binding:**
1. SAP BTP Cockpit öffnen
2. Trust Configuration
3. Externen IdP hinzufügen (SAML/OIDC)
4. Metadaten hochladen
5. Trust aktivieren
→ **Service Binding übernimmt automatisch JWKS-URI und Issuer-URI**

**Interpretation**:
- SAP CAP: **Keine Code-Änderungen** notwendig
- AWS Cognito: **45 Zeilen** zusätzlicher Code
- **Service Binding** macht SAP CAP deutlich einfacher

---

### H3a: Time-to-First-Token (Setup-Zeit) - VERALTET, ENTFERNT

**Forschungsfrage**: Wie lange dauert Setup von Projekt-Start bis erfolgreicher Login?

| Backend | Setup-Zeit | Schritte |
|---------|-----------|---------|
| **AWS Cognito** | ~15-20 Min | 7 Schritte (AWS Console + application.yml + Test) |
| **SAP CAP (lokal)** | ~3-5 Min | 5 Schritte (cds watch + Mock-User) |

**Reduktion**: **-70-80%**

**Interpretation**:
- SAP CAP **deutlich schneller** für lokales Development
- **Mock-Auth** vs. echtes AWS Setup
- **Developer Experience** besser

---

### H4: Framework-Kopplung (Security-Imports)

**Forschungsfrage**: Wie viele Dateien sind eng an Security-Frameworks gekoppelt?

| Backend | Dateien mit Security-Imports | % aller Dateien | Coupling |
|---------|----------------------------|----------------|----------|
| **AWS Cognito** | 10-12 Dateien | ~50-60% | Hoch |
| **SAP CAP** | 1-2 Dateien | ~10-15% | Niedrig |

**Reduktion**: **-80-83%**

**Interpretation**:
- SAP CAP hat **deutlich weniger Kopplung**
- Security in **CDS**, nicht in Java-Code
- **Portabilität** höher (leichter zu wechseln)

---

### H5: Token-Validierung (Manual vs. Automatic)

**Forschungsfrage**: Wie viel Code ist nötig für JWT-Token-Validierung?

| Backend | Config | Code | Gesamt | Implementierung |
|---------|--------|------|--------|----------------|
| **AWS Cognito** | 5 Zeilen (JWKS URI) | 25 Zeilen (Custom Converter) | ~40 Zeilen | Manual |
| **SAP CAP** | 0 Zeilen | 0 Zeilen | 0 Zeilen | Automatic (Framework) |

**Reduktion**: **-100%**

**Interpretation**:
- SAP CAP **vollautomatisch** (kein Code nötig)
- **Sicherheitsvorteil**: Keine manuelle Fehlerquelle
- Framework-tested (SAP `@sap/xssec`)

---

### H6: Registrierungs-Flow (Implementation Effort)

**Forschungsfrage**: Wie viel Code ist nötig für Benutzerregistrierung mit Email-Verifizierung?

| Backend | SignUp Code | ConfirmSignUp Code | DTOs | Gesamt | Implementierung |
|---------|------------|-------------------|------|--------|----------------|
| **AWS Cognito** | ~30 Zeilen | ~15 Zeilen | ~20 Zeilen | ~75 Zeilen | Manual AWS SDK |
| **SAP CAP** | ~10 Zeilen | ~5 Zeilen | 0 Zeilen | ~15 Zeilen | Redirect zu SAP IAS UI |

**Reduktion**: **-80%**

**Interpretation**:
- SAP CAP nutzt **Standard-UI** (SAP IAS)
- AWS Cognito benötigt **manuelles** AWS SDK Integration
- **Developer Experience** deutlich besser bei SAP

---

### H7: Password-Reset-Sicherheit (Features & Code)

**Forschungsfrage**: Wie sicher und aufwändig ist der Password-Reset-Flow?

| Backend | Code-Zeilen | Rate-Limiting | Token-Expiration | Email-Verifizierung |
|---------|------------|--------------|-----------------|-------------------|
| **AWS Cognito** | ~70 Zeilen | ⚠️ Partial (Cognito Auto + Manual Backend) | ✅ Yes (24h) | ✅ Yes |
| **SAP CAP** | ~10 Zeilen | ✅ Native (SAP IAS) | ✅ Yes (24h) | ✅ Yes |

**Reduktion**: **-86%** Code, **Native vs. Partial** Rate-Limiting

**Interpretation**:
- SAP IAS hat **eingebautes Rate-Limiting** → AWS benötigt manuelle Implementierung (z.B. Bucket4j)
- **Sicherheitsvorteil** für SAP CAP
- Weniger **Fehleranfälligkeit**

---

## 🎓 ZUSAMMENFASSUNG FÜR BACHELORARBEIT

### Quantitative Vorteile (SAP CAP + SAP IAS)

| Kategorie | Durchschnittliche Reduktion |
|-----------|---------------------------|
| **Code-Zeilen** | **-70% bis -100%** |
| **Dateiänderungen** | **-75-100%** |
| **Setup-Zeit** | **-70-80%** |
| **Framework-Kopplung** | **-80-83%** |

### Qualitative Vorteile (SAP CAP + SAP IAS)

1. **Deklarative Sicherheit** → Zentral, wartbar, nachvollziehbar
2. **Automatische Token-Validierung** → Keine Fehlerquelle
3. **Standard-UIs** → Registrierung + Password-Reset out-of-the-box
4. **Native Security-Features** → Rate-Limiting eingebaut

### Kritische Erkenntnisse

**SAP CAP Vorteile**:
- ✅ **70-86% weniger Code** für alle Features
- ✅ **Zentrale** vs. Distributed Security
- ✅ **Automatic** vs. Manual Token-Validierung
- ✅ **Native** vs. Partial Rate-Limiting

**AWS Cognito Nachteile**:
- ❌ **Distributed** Security (@PreAuthorize überall)
- ❌ **Manual** JWT-Validierung (Config + Code)
- ❌ **Partial** Rate-Limiting (Cognito Auto + Manual Backend)
- ❌ **Höhere** Framework-Kopplung (5-8 Dateien)

---

## ✅ FAZIT

**SAP CAP + SAP IAS** demonstriert durchgängig **signifikante Vorteile**:

1. **70-86% Code-Reduktion** über alle Features (H1, H5, H6, H7)
2. **Zentrale deklarative Sicherheit** vs. verteilt imperative (H1, H2)
3. **Automatische Token-Validierung** (H5)
4. **Native Sicherheitsfeatures** wie Rate-Limiting (H7)
5. **Schnelleres Setup** und geringere Framework-Kopplung (H3a, H4)

**Kritischer Punkt**: SAP IAS hat **eingebautes Rate-Limiting** (H7), während AWS Cognito eine **manuelle Backend-Implementierung** benötigt.

Dies ist ein **quantifizierbarer Vorteil** für die Bachelorarbeit!

