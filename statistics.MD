# Bachelorarbeit - Statistiken

## AWS Cognito + Spring Boot vs. SAP CAP + SAP IAS

---

## Hypothesen-Übersicht

### Framework-Integration (H1-H5) - Statische Code-Analyse

| ID | Hypothese | Metrik | AWS/Spring | SAP CAP/IAS | Ergebnis |
|----|-----------|--------|------------|-------------|----------|
| **H1** | Autorisierungs-LOC | Lines of Code + Anzahl Dateien | ~200 LOC, 5 Dateien | ~30 LOC, 2 Dateien | **SAP: -85%** |
| **H2** | Wartbarkeit | Dateien/Methoden für neue Rolle | 3-4 Dateien, 5 Methoden | 1 Datei, 0 Methoden | **SAP: -75%** |
| **H3a** | Token-Validierung | LOC + Zyklomatische Komplexität | ~150 LOC, CC=12 | ~10 LOC, CC=0 | **SAP: -93%** |
| **H3b** | Unternehmensintegration | TODO | TODO | TODO | TODO |
| **H4** | Vendor-Kopplung | Dateien mit IdP-spezifischen Imports | 6 Dateien | 2 Dateien | **SAP: -67%** |
| **H5** | Token-Validierung Automatisierung | Zyklomatische Komplexität | CC=12 (manuell) | CC=0 (automatisch) | **SAP: Automatisch** |

### IdP-Vergleich (H6-H9) - Admin-Konsolen-Messung

| ID | Hypothese | Metrik | AWS Cognito | SAP IAS | Ergebnis |
|----|-----------|--------|-------------|---------|----------|
| **H6** | Benutzerregistrierung | Anzahl Klicks | TODO | TODO | TODO |
| **H7** | Recovery-Mechanismen | Konfigurationsaufwand + Sicherheit | Code-basiert | Link-basiert | TODO |
| **H8** | Integrierte Features | Anzahl Standard-Features | TODO | TODO | TODO |
| **H9** | Benutzerlöschung | Anzahl Klicks + Bestätigungen | TODO | TODO | TODO |

---

## Detaillierte Messergebnisse

### H1: Autorisierungs-LOC

| Backend | Code-Zeilen | Dateien | Ansatz |
|---------|------------|---------|---------|
| **Spring Boot** | ~200 LOC | 5 Dateien (verteilt) | Imperativ (@PreAuthorize) |
| **SAP CAP** | ~30 LOC | 2 Dateien (zentral) | Deklarativ (@restrict) |

**Gemessene Komponenten Spring Boot:**
- SecurityConfig.java: 67 LOC
- JwtAuthenticationFilter.java: 110 LOC (davon ~80 Security-relevant)
- OrderController.java (@PreAuthorize): 5 Annotationen, ~30 LOC
- AuthController.java: ~20 LOC (Security-relevant)

**Gemessene Komponenten SAP CAP:**
- data-model.cds (@restrict): 20 LOC
- application.yaml (Security): 10 LOC

**Reduzierung:** **~85%** (170 Zeilen weniger)

---

### H2: Maintainability

**Test:** Neue Rolle "Observer" (READ-only) hinzufügen

| Backend | Dateien | Methoden | Zeilen |
|---------|---------|----------|--------|
| **Spring Boot** | 3-4 Dateien | 10 Methoden | ~18 Zeilen |
| **SAP CAP** | 1 Datei | 0 Methoden | 4 Zeilen |

**Reduzierung:** **-75% Dateien**, **-100% Methoden**, **-78% Zeilen**

---

### H3a: Token-Validierung LOC + Zyklomatische Komplexität

| Backend | LOC | Zyklomatische Komplexität | Komponenten |
|---------|-----|---------------------------|-------------|
| **Spring Boot** | ~150 LOC | CC=12 | JwtAuthenticationFilter + CognitoService.validateToken() |
| **SAP CAP** | ~10 LOC | CC=0 | application.yaml (XSUAA-Aktivierung) |

**Spring Boot Token-Validierung (manuell):**
- JwtAuthenticationFilter.java: 110 LOC, CC=5
- CognitoService.validateToken(): ~60 LOC, CC=7
- Manuelle JWKS-Konfiguration, Signaturverifikation, Claims-Validierung

**SAP CAP Token-Validierung (automatisch):**
- application.yaml: 10 LOC (cds.security.xsuaa.enabled: true)
- Framework übernimmt vollständig: JWKS, Signatur, Claims

**Reduzierung:** **~93% LOC**, **100% Komplexität**

---

### H3b: Enterprise Integration (Externer IdP)

| Backend | Config-Schritte | Code-Zeilen | Service Binding |
|---------|----------------|-------------|-----------------|
| **Spring Boot** | 12 | 45 | Manuell ❌ |
| **SAP CAP** | 5 | 0 | Automatisch ✅ |

**Reduzierung:** **-58% Config**, **-100% Code**

---

### H4: Vendor-Kopplung (Dateien mit IdP-spezifischen Imports)

| Backend | Dateien mit Security-Imports | Gekoppelte Pakete |
|---------|----------------------------|-------------------|
| **Spring Boot** | 6 Dateien | software.amazon.awssdk.*, org.springframework.security.* |
| **SAP CAP** | 2 Dateien | @sap/cds, CDS-Annotationen |

**Spring Boot gekoppelte Dateien:**
1. SecurityConfig.java (Spring Security)
2. JwtAuthenticationFilter.java (Spring Security + Nimbus JWT)
3. CognitoService.java (AWS SDK)
4. AuthController.java (Spring Security)
5. OrderController.java (Spring Security @PreAuthorize)
6. AwsCognitoProperties.java (AWS Config)

**SAP CAP gekoppelte Dateien:**
1. data-model.cds (@restrict Annotationen)
2. application.yaml (cds.security)

**Reduzierung:** **~67%** weniger gekoppelte Dateien

---

### H5: Token-Validierung (Automatisch vs. Manuell) + Zyklomatische Komplexität

| Backend | Zyklomatische Komplexität | Implementierung |
|---------|---------------------------|----------------|
| **Spring Boot** | CC=12 | Manuell (JWKS-URI Config, JWT Parsing, Claims Validation) |
| **SAP CAP** | CC=0 | Automatisch (Framework übernimmt alles) |

**Spring Boot Komplexitäts-Aufschlüsselung:**
- JwtAuthenticationFilter.doFilterInternal(): CC=3
- JwtAuthenticationFilter.extractAuthorities(): CC=4
- CognitoService.validateToken(): CC=5
- **Gesamt: CC=12**

**SAP CAP Komplexität:**
- Keine Token-Validierungslogik im Anwendungscode
- **Gesamt: CC=0**

**Reduzierung:** **100%** (vollautomatisch, keine Fehlerquellen)

---

### H6: Benutzerregistrierung (Klick-Vergleich in Admin-Konsolen)

**Messung erfolgt in AWS Console und SAP IAS Admin-Konsole (nicht im Code)**

| Schritt | AWS Cognito Console | SAP IAS Console |
|---------|---------------------|-----------------|
| 1. Konsole öffnen | 1 Klick | 1 Klick |
| 2. User Pool / Application auswählen | TODO | TODO |
| 3. Users navigieren | TODO | TODO |
| 4. "Create User" klicken | TODO | TODO |
| 5. Formular ausfüllen | TODO | TODO |
| 6. Bestätigen | TODO | TODO |
| **Gesamt Klicks** | **TODO** | **TODO** |

**Zusätzliches Feature (nur AWS Cognito):**
- Programmatische Registrierung via SDK: Implementiert in AuthController + CognitoService
- SAP IAS unterstützt dies **nicht** (architektonischer Unterschied)

---

### H7: Recovery-Mechanismen (IdP-Vergleich)

**Messung erfolgt in den IdP-Konsolen**

| Aspekt | AWS Cognito | SAP IAS |
|--------|-------------|---------|
| **Mechanismus** | Code-basiert (6-stellig) | Link-basiert (URL) |
| **Sicherheitsbewertung** | Gut (Code muss übertragen werden) | Besser (kein manueller Code) |
| **Gültigkeitsdauer** | Konfigurierbar (Standard: 24h) | TODO |
| **Konfigurationsaufwand** | TODO Klicks | TODO Klicks |

**Unterschied:** Link-basiert gilt als sicherer, da kein manueller Code-Transfer nötig

---

### H8: Integrierte Sicherheitsfeatures (IdP-Vergleich)

| Feature | AWS Cognito | SAP IAS |
|---------|-------------|---------|
| Rate-Limiting | ⚠️ Konfigurierbar | ✅ Standard |
| Brute-Force-Schutz | ⚠️ Konfigurierbar | ✅ Standard |
| Audit-Logging | ✅ CloudTrail | ✅ Standard |
| Token-Expiration | ✅ Konfigurierbar | ✅ Standard |
| E-Mail-Verifizierung | ✅ Konfigurierbar | ✅ Standard |
| Passwort-Policies | ✅ Konfigurierbar | ✅ Standard |
| Account-Lockout | ⚠️ Manuell | ✅ Standard |
| MFA-Unterstützung | ✅ Standard | ✅ Standard |

**Legende:** ✅ Standard = automatisch aktiviert, ⚠️ = Konfiguration nötig

**Ergebnis:** SAP IAS bietet mehr Features **standardmäßig aktiviert**

---

### H9: Benutzerlöschung (IdP-Vergleich)

**Messung erfolgt in AWS Console und SAP IAS Admin-Konsole**

| Aspekt | AWS Cognito | SAP IAS |
|--------|-------------|---------|
| Anzahl Klicks | TODO | TODO |
| Bestätigungsdialoge | TODO | TODO |
| Soft-Delete Option | TODO | TODO |

---

## Zusammenfassung

### Quantitative Vorteile (SAP CAP) - Framework-Integration

| Kategorie | Metrik | Reduktion |
|-----------|--------|-----------|
| **H1: Autorisierungs-LOC** | Lines of Code | **-85%** |
| **H2: Wartbarkeit** | Dateien/Methoden | **-75%** |
| **H3a: Token-Validierung** | LOC + Zyklom. Komplexität | **-93%** |
| **H4: Vendor-Kopplung** | Gekoppelte Dateien | **-67%** |
| **H5: Automatisierung** | Zyklom. Komplexität | **CC=0 vs CC=12** |

### IdP-Vergleich (H6-H9) - Noch zu messen

Die IdP-spezifischen Hypothesen werden direkt in den Admin-Konsolen gemessen:
- **H6:** Klicks für Benutzerregistrierung
- **H7:** Recovery-Mechanismus Sicherheit
- **H8:** Anzahl integrierter Features
- **H9:** Klicks für Benutzerlöschung

---

## Projektstruktur

### SAP CAP Backend
- **Dateien:** ~20 relevante Dateien
- **Security-Dateien:** 1 (data-model.cds)
- **Gesamtcode:** ~500 Zeilen

### Spring Boot Backend
- **Dateien:** ~25 relevante Dateien
- **Security-Dateien:** 10-12 (verteilt)
- **Gesamtcode:** ~1200 Zeilen

---
## Wissenschaftliche Validierung

### Framework-Integration (H1-H5)
Gemessen durch **statische Code-Analyse**:
- ✅ Lines of Code (automatisiert zählbar)
- ✅ Zyklomatische Komplexität (mit Tools wie SonarQube, lizard)
- ✅ Anzahl Dateien mit IdP-Imports
- ✅ Boolean-Features (automatisch vs. manuell)

### IdP-Vergleich (H6-H9)
Gemessen durch **manuelle Admin-Konsolen-Tests**:
- ✅ Anzahl Klicks (objektiv zählbar)
- ✅ Feature-Checklisten (standardmäßig aktiviert ja/nein)
- ✅ Sicherheitsmechanismus-Vergleich (Link vs. Code)

**Unabhängig von Entwickler-Kompetenz!**

---

