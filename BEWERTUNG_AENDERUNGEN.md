# Bewertung der Änderungen und Vergleichbarkeit

**Letzte Aktualisierung:** 27.12.2025

## 1. Zusammenfassung der Änderungen

### Backend SAP CAP
- **Gelöscht:** `SecurityConfig.java`, `AuthController.java`, `MockJwtAuthenticationFilter.java`
- **Hinzugefügt:** `UserInfoController.java` (für Cloud-Benutzerinfo)
- **Hinzugefügt:** `cds-feature-identity` Dependency (SAP CAP übernimmt Security)
- **Geändert:** `application.yaml` - SAP CAP Mock-Security lokal, XSUAA in Cloud

### Frontend Angular
- **Geändert:** Login-Komponente zeigt Hinweis für SAP IAS Registrierung
- **Geändert:** `api.service.ts` - Cloud-Auth-Check und `fetchUserInfo()`
- **Geändert:** Dashboard lädt Benutzerinfo aus Cloud

### MTA Deployment
- **Korrigiert:** `xs-app.json` für App Router
- **Korrigiert:** `mta.yaml` mit korrektem Buildpack und Pfaden

### Dokumentation (implementierung.tex)
- **Aktualisiert:** Hypothesen H6, H7, H8 mit neuen Messbarkeiten
- **Hinzugefügt:** Vollständige SAP CAP Backend Dokumentation
- **Hinzugefügt:** Code-Beispiele für CDS-Modell, Service-Definition, application.yaml

### Neue Datei: evaluation.tex
- **Neues Kapitel:** Evaluation der Hypothesen
- **Enthält:** Alle Tabellen für H1-H8 Messergebnisse
- **TODOs:** Messwerte müssen nach vollständiger Analyse eingetragen werden

### Aktualisiert: statistics.MD
- **Datum:** 2025-12-27
- **H6:** Klick-basierte Messung hinzugefügt
- **H8:** Neue Feature-Checkliste hinzugefügt
- **Status:** TODOs markiert für noch ausstehende Messungen

---

## 2. Bewertung: Ziele und Vorgehen (expose-theses.tex)

### ✅ Was gut passt:
| Ziel | Status |
|------|--------|
| Ziel 1 (Grundlagen) | ✅ Erfüllt - OAuth2, OIDC, SAML dokumentiert |
| Ziel 2 (Hypothesen) | ✅ Erfüllt - Messbare Kriterien definiert |
| Ziel 3.1 (AWS Cognito Prototyp) | ✅ Erfüllt - Vollständig implementiert |
| Ziel 3.3 (Evaluation) | ✅ Erfüllt - Kriterien ausgearbeitet |

### ⚠️ Was angepasst werden musste:
| Ziel | Problem | Lösung |
|------|---------|--------|
| Ziel 3.2 (SAP CAP Prototyp) | Keine programmatische Registrierung | Dokumentiert als architektonischer Unterschied |
| H6 (Registrierung) | Nicht direkt vergleichbar | Klick-basierte Metrik statt Code-Zeilen |

---

## 3. Vergleichbarkeit der IdPs

### Direkt vergleichbar (objektiv messbar):

| Metrik | AWS Cognito | SAP CAP/IAS | Vergleichbar? |
|--------|-------------|-------------|---------------|
| **H1: Autorisierungs-LOC** | @PreAuthorize Annotationen | @restrict CDS Annotationen | ✅ Ja |
| **H2: Wartbarkeit** | Änderungen in Controllern | Änderungen in CDS-Modell | ✅ Ja |
| **H3a: Token-Config LOC** | application.yaml + SecurityConfig | application.yaml + CDS | ✅ Ja |
| **H4: Vendor-Kopplung** | Spring Security Imports | @sap Imports | ✅ Ja |
| **H5: Token-Validierung** | Manuell (JWT Filter) | Automatisch (Framework) | ✅ Ja |

### Unterschiedliche Paradigmen (qualitativ vergleichbar):

| Metrik | AWS Cognito | SAP CAP/IAS | Vergleichsansatz |
|--------|-------------|-------------|------------------|
| **H6: Registrierung** | Klicks in AWS Console | Klicks in SAP IAS Console | Anzahl Klicks (direkt vergleichbar) |
| **H6 Zusatz: Programmatische Reg.** | SDK-Code (~150 LOC) | Nicht unterstützt | Architektonischer Unterschied |
| **H7: Password-Reset** | Code-Zeilen + API-Aufrufe | Konfigurationsschritte | Implementierungsaufwand |
| **H8: Integrierte Features** | Feature-Checkliste | Feature-Checkliste | Anzahl integrierter Features |

---

## 4. Empfehlungen für H6, H7, H8

### H6 – Benutzerregistrierung (Klick-Vergleich):

**AWS Cognito Console:**
```
1. AWS Console öffnen
2. Cognito auswählen
3. User Pool auswählen
4. "Users" Tab klicken
5. "Create user" klicken
6. Formular ausfüllen (Username, E-Mail, Passwort)
7. "Create user" bestätigen
= X Klicks
```

**SAP IAS Admin-Konsole:**
```
1. SAP IAS Console öffnen
2. Applications & Resources auswählen
3. Users auswählen
4. "Add" klicken
5. Formular ausfüllen (E-Mail, Name)
6. Speichern
= Y Klicks
```

**Zusätzlich dokumentiert (nicht als Vergleichspunkt):**
- AWS Cognito: Programmatische Registrierung via SDK (~150 LOC)
- SAP IAS: Nicht unterstützt (nur Admin-Console oder SCIM API)

### H8 – Integrierte Sicherheitsfeatures:

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

**Legende:** ✅ Standardmäßig aktiviert, ⚠️ Konfiguration erforderlich, ❌ Manuell

---

## 5. Kitchenham-Konformität

Die Case Study folgt Kitchenham durch:

1. **Kontrollierte Bedingungen:** Gleiches Frontend, unterschiedliche Backends
2. **Messbare Variablen:** LOC, Anzahl Dateien, Konfigurationsschritte, Klicks
3. **Isolierung von Störfaktoren:** Keine Entwicklerzeit-Messung (Kompetenz-unabhängig)
4. **Reproduzierbarkeit:** Code und Konfiguration sind dokumentiert

### Wichtige Anpassungen für Fairness:

| Aspekt | Problem | Lösung |
|--------|---------|--------|
| Lokale vs. Cloud | SAP IAS nur in Cloud | Mock lokal, echte Messung in Cloud für H5, H6, H7 |
| Code vs. UI | Nicht direkt vergleichbar | Separate Metriken (LOC vs. Klicks) |
| Registrierung | Fundamental unterschiedlich | Als architektonischen Unterschied dokumentieren |

---

## 6. Fazit

### Die Änderungen sind **wissenschaftlich vertretbar**, weil:

1. **Architektonische Unterschiede werden dokumentiert** - nicht versteckt
2. **Messbare Metriken sind definiert** - LOC, Klicks, Konfigurationsschritte
3. **Entwicklerkompetenz ist ausgeschlossen** - keine Zeitmessungen
4. **Beide Paradigmen werden fair bewertet** - Code vs. Konfiguration

### Empfehlungen:

1. ✅ **H6 mit Klicks vergleichen** - beide Admin-Konsolen werden verglichen
2. ✅ **Programmatische Registrierung als Zusatz** - nicht als Vergleichspunkt, sondern Feature
3. ✅ **H8 für integrierte Features** - neue Hypothese hinzugefügt
4. ⚠️ **In grundlagen.tex erwähnen**, dass SAP IAS Cloud-only ist
5. ⚠️ **In der Auswertung** beide Paradigmen gleichwertig bewerten (keins ist "besser")

---

## 7. Offene Punkte / TODOs

### Für evaluation.tex (Messwerte eintragen):

#### H1 - Autorisierungs-LOC:
- [ ] Spring Boot: Gesamt-LOC für Autorisierung zählen
- [ ] SAP CAP: ~60 LOC (20 CDS + 10 YAML + 30 UserInfoController)

#### H2 - Wartbarkeit:
- [ ] Spring Boot: Dateien/Methoden für Observer-Rolle zählen
- [x] SAP CAP: 1 Datei, 0 Methoden, 3 Zeilen

#### H3a - Token-Validierung:
- [ ] Spring Boot: JwtAuthenticationFilter LOC zählen
- [x] SAP CAP: ~10 LOC (application.yaml)

#### H3b - Unternehmensintegration:
- [ ] AWS: Konfigurationsschritte für Federation zählen
- [ ] SAP BTP: Konfigurationsschritte für Service-Binding zählen

#### H4 - Vendor-Kopplung:
- [x] Spring Boot: 4 Dateien, 17 Import-Statements
- [x] SAP CAP: 3 Dateien, 9 Import-Statements

#### H5 - Token-Validierung:
- [ ] Spring Boot: LOC für Validierung zählen
- [x] SAP CAP: 0 LOC (automatisch)

#### H6 - Benutzerregistrierung:
- [ ] **AWS Cognito Console: Klicks zählen**
- [ ] **SAP IAS Console: Klicks zählen**
- [ ] Screenshot der Schritte dokumentieren

#### H7 - Passwort-Reset:
- [ ] Spring Boot: LOC für Reset-Flow zählen
- [ ] SAP IAS: Konfigurationsschritte dokumentieren

#### H8 - Integrierte Features:
- [ ] Feature-Checkliste in beiden Konsolen prüfen
- [ ] Dokumentation der Feature-Verfügbarkeit

### Für Screenshots:
- [ ] SAP BTP Role Collections (für Abbildung in implementierung.tex)
- [ ] AWS Cognito User Pool (optional)
- [ ] SAP IAS Admin Console (optional)

### Für grundlagen.tex:
- [x] SAP IAS Cloud-only erwähnen
- [x] Unterschied SDK vs. Admin-Registrierung für H6

### Für Abschluss:
- [ ] Tabelle \ref{tab:hypothesen_uebersicht} ausfüllen
- [ ] Interpretation in jeder Sektion vervollständigen
- [ ] Limitationen ergänzen
- [ ] Praktische Empfehlungen formulieren

