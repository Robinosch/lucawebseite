# Zusammenfassung der Änderungen

**Datum:** 25.12.2025  
**Kontext:** Anpassung der Vergleichsstudie AWS Cognito vs. SAP IAS nach Kitchenham-Methodik

---

## Übersicht

Diese Änderungen dokumentieren die Erkenntnis, dass SAP IAS ein **Cloud-only Identity Provider** ist und sich fundamental von AWS Cognito unterscheidet, insbesondere bei der Benutzerregistrierung.

### Kernerkenntnisse:

| Aspekt | AWS Cognito | SAP IAS |
|--------|-------------|---------|
| **Betriebsart** | Cloud-Service mit SDK-Zugriff | Cloud-only (kein lokales Setup) |
| **Lokale Entwicklung** | Echte Verbindung möglich | Mock-Modus erforderlich |
| **Benutzerregistrierung** | SDK-gesteuert ODER AWS Console | Admin-Konsole ODER Self-Service-Portal |
| **Programmatische Registrierung** | ✅ Ja (~150 LOC) | ❌ Nein (nur SCIM API) |

---

## 1. Änderungen an `grundlagen.tex`

### 1.1 Erweiterung des Architektur-Vergleichs

**Neue Punkte in der itemize-Liste:**

- **Cloud-only vs. Hybrid:** SAP IAS ist ausschließlich als Cloud-Service verfügbar. Lokale Entwicklung mit SAP CAP nutzt Mock-Modus. AWS Cognito kann auch lokal gegen den echten Cloud-Service verwendet werden.

- **Benutzerregistrierung:** AWS Cognito bietet zwei Wege (SDK-gesteuert ODER AWS Console). SAP IAS nutzt ausschließlich Admin-Konsole oder Self-Service-Portal.

### 1.2 Kitchenham-Konformität

**Neuer Paragraph hinzugefügt:**

Erklärt, dass:
- Lokale Messung mit Mock valide ist für Framework-inhärente Hypothesen (H1, H2, H3a, H4)
- Cloud-Messung erforderlich ist für IdP-Interaktions-Hypothesen (H5, H3b, H6, H7)

### 1.3 SAP IAS Abschnitt

**Erweitert um:**
- Explizite Erwähnung des Cloud-only Charakters
- Unterschied bei der Benutzerregistrierung (Admin-Konsole vs. SDK)

---

## 2. Änderungen an `implementierung.tex`

### 2.1 Hypothesen H5-H7 neu formuliert

Die Hypothesen wurden von langen Beschreibungen zu kurzen, testbaren Hypothesen umformuliert:

**H5 (NEU):**
> Die Anzahl der Code-Zeilen für die JWT-Token-Validierung ist bei SAP CAP geringer als bei Spring Boot mit AWS Cognito, da SAP CAP die Validierung automatisch durch das Framework durchführt.

**H6 (NEU):**
> Die programmatische Benutzerregistrierung über AWS Cognito erfordert mehr Backend-Code als die Konfiguration des Self-Service-Portals in SAP IAS, wobei beide Ansätze unterschiedliche Paradigmen (Code vs. Konfiguration) repräsentieren.

**H7 (NEU):**
> SAP IAS stellt mehr integrierte Sicherheitsmechanismen (Rate-Limiting, automatische Token-Expiration) für den Passwort-Reset-Flow bereit als die manuelle Implementierung bei AWS Cognito mit Spring Boot.

### 2.2 Messbarkeiten aktualisiert

- H5: Code-Zeilen für Token-Validierung vergleichen
- H6: Code-Zeilen (AWS) vs. Konfigurationsschritte (SAP)
- H7: Integrierte Sicherheitsmechanismen vergleichen

### 2.3 Neue Untersektion: Testumgebungen und Messkontext

**Erklärt:**
- Welche Hypothesen lokal gemessen werden können (H1, H2, H3a, H4)
- Welche Hypothesen Cloud-Deployment erfordern (H5, H3b, H6, H7)

---

## 3. Änderungen am SAP CAP Backend

### 3.1 `service-definition.cds`

**Entfernte Actions:**
- `register`, `login`, `verifyEmail`, `resendVerificationCode`

**Beibehaltene Actions:**
- `forgotPassword`, `confirmPasswordReset`, `me()`, `health()`

### 3.2 `.cdsrc.json` - Mock-User hinzugefügt

**Drei Mock-User für lokale Entwicklung:**

| Benutzer | Passwort | Rolle | Entspricht AWS Cognito |
|----------|----------|-------|------------------------|
| admin@test.com | admin123 | Admin | ADMIN Gruppe |
| manager@test.com | manager123 | Manager | MANAGER Gruppe |
| user@test.com | user123 | User | USER Gruppe |

### 3.3 `application.yaml`

- Mock-Modus aktiviert (`MOCK_SECURITY:true`)
- Verweis auf `.cdsrc.json` für User-Konfiguration

---

## 4. Änderungen am Angular Frontend

### 4.1 `register.html`

**Neue Logik:**
- Bei SAP IAS: Hinweis-Box anzeigen (Registrierung über Admin-Konsole)
- Bei AWS Cognito: Formular wie bisher anzeigen

### 4.2 `register.css`

**Neue Styles für SAP IAS Notice-Block**

---

## 5. Zusammenfassung der Testumgebungen

### Lokal messbar (Mock-Modus für SAP CAP):

| Hypothese | Beschreibung | Metrik |
|-----------|--------------|--------|
| H1 | Autorisierungslogik | @restrict vs. @PreAuthorize zählen |
| H2 | Wartbarkeit | Dateien für neue Rolle ändern |
| H3a | Token-Handling Code | Konfigurationszeilen zählen |
| H4 | Vendor-Kopplung | Framework-Imports zählen |

### Cloud-Deployment erforderlich:

| Hypothese | Beschreibung | Umgebung |
|-----------|--------------|----------|
| H5 | Token-Validierung | SAP BTP für echte IAS-Validierung |
| H3b | Unternehmensintegration | SAP BTP / AWS |
| H6 | Benutzer-Onboarding | SAP IAS Console / AWS Cognito |
| H7 | Passwort-Reset | SAP IAS / AWS Cognito |

---

## 6. Mock-User Vergleich

| Rolle | SAP CAP (Mock) | AWS Cognito |
|-------|----------------|-------------|
| Admin | admin@test.com / admin123 | Cognito User Pool Gruppe |
| Manager | manager@test.com / manager123 | Cognito User Pool Gruppe |
| User | user@test.com / user123 | Cognito User Pool Gruppe |

---

## 7. Betroffene Dateien

| Datei | Änderungstyp |
|-------|--------------|
| `grundlagen.tex` | Erweitert (Architektur-Vergleich, Kitchenham) |
| `implementierung.tex` | Erweitert (H5-H7 neu formuliert) |
| `ba-backend-cap-ias/.cdsrc.json` | Mock-User hinzugefügt |
| `ba-backend-cap-ias/srv/src/.../application.yaml` | Mock-Konfiguration |
| `ba-backend-cap-ias/srv/service-definition.cds` | Auth-Actions entfernt |
| `ba-backend-cap-ias/srv/src/.../AuthServiceHandler.java` | Handler aktualisiert |
| `ba-frontend-angular/src/.../register/register.html` | SAP IAS Notice |
| `ba-frontend-angular/src/.../register/register.css` | SAP IAS Styles |

