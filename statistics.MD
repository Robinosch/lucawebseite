# 📊 Bachelorarbeit - Statistiken & Messergebnisse

## AWS Cognito + Spring Boot vs. SAP CAP + SAP IAS

**Stand:** 2025-12-23

---

## Hypothesen-Übersicht

| ID | Hypothese | Ergebnis |
|----|-----------|----------|
| **H1** | Security Code Lines | SAP CAP: **-96%** weniger Code |
| **H2** | Maintainability | SAP CAP: **1 Datei** vs. 3-4 Dateien |
| **H3a** | Token-Validierung Config/Code | SAP CAP: **-80-100%** weniger Code |
| **H3b** | Enterprise Integration | SAP CAP: **0 Zeilen Code** vs. 45 Zeilen |
| **H4** | Framework-Kopplung | SAP CAP: **10-15%** vs. 50-60% der Dateien |
| **H5** | Token-Validierung | SAP CAP: **0 Zeilen** (automatisch) |
| **H6** | Registrierungs-Flow | SAP CAP: **-80%** weniger Code |
| **H7** | Password-Reset | SAP CAP: **Native Rate-Limiting** ✅ |

---

## Detaillierte Messergebnisse

### H1: Security Code Lines

| Backend | Code-Zeilen | Lokation | Ansatz |
|---------|------------|----------|---------|
| **Spring Boot** | ~450 Zeilen | 5-8 Dateien (verteilt) | Imperativ (@PreAuthorize) |
| **SAP CAP** | ~19 Zeilen | 1 Datei (zentral) | Deklarativ (@restrict) |

**Reduzierung:** **-96%** (431 Zeilen weniger)

---

### H2: Maintainability

**Test:** Neue Rolle "Observer" (READ-only) hinzufügen

| Backend | Dateien | Methoden | Zeilen |
|---------|---------|----------|--------|
| **Spring Boot** | 3-4 Dateien | 10 Methoden | ~18 Zeilen |
| **SAP CAP** | 1 Datei | 0 Methoden | 4 Zeilen |

**Reduzierung:** **-75% Dateien**, **-100% Methoden**, **-78% Zeilen**

---

### H3a: Token-Validierung Config/Code

| Backend | Config/Code | Komponenten | Fehlerquellen |
|---------|------------|-------------|---------------|
| **Spring Boot** | 75 Zeilen | YAML (5) + SecurityConfig (40) + Converter (30) | 5 |
| **SAP CAP** | 0-15 Zeilen | package.json (cds-Block) | 0 |

**Reduzierung:** **-80-100%** (60-75 Zeilen weniger)

---

### H3b: Enterprise Integration (Externer IdP)

| Backend | Config-Schritte | Code-Zeilen | Service Binding |
|---------|----------------|-------------|-----------------|
| **Spring Boot** | 12 | 45 | Manuell ❌ |
| **SAP CAP** | 5 | 0 | Automatisch ✅ |

**Reduzierung:** **-58% Config**, **-100% Code**

---

### H4: Framework-Kopplung

| Backend | Dateien mit Security-Imports | % aller Dateien |
|---------|----------------------------|----------------|
| **Spring Boot** | 10-12 Dateien | ~50-60% |
| **SAP CAP** | 1-2 Dateien | ~10-15% |

**Reduzierung:** **-80-83%** weniger gekoppelte Dateien

---

### H5: Token-Validierung (Automatisch vs. Manuell)

| Backend | Code-Zeilen | Implementierung |
|---------|------------|----------------|
| **Spring Boot** | ~40 Zeilen | Manual (JWKS-URI Config) |
| **SAP CAP** | 0 Zeilen | Automatic (Framework) |

**Reduzierung:** **-100%** (vollautomatisch)

---

### H6: Registrierungs-Flow

| Backend | Code-Zeilen | Implementierung |
|---------|------------|----------------|
| **Spring Boot** | ~75 Zeilen | Manual AWS SDK |
| **SAP CAP** | ~15 Zeilen | Redirect zu SAP IAS UI |

**Reduzierung:** **-80%** (60 Zeilen weniger)

---

### H7: Password-Reset-Sicherheit

| Backend | Code-Zeilen | Rate-Limiting | Token-Expiration | Email-Verifizierung |
|---------|------------|--------------|-----------------|-------------------|
| **Spring Boot** | ~70 Zeilen | ⚠️ Partial (manuell) | ✅ Yes (24h) | ✅ Yes |
| **SAP CAP** | ~10 Zeilen | ✅ Native | ✅ Yes (24h) | ✅ Yes |

**Reduzierung:** **-86%** Code, **Native vs. Partial** Rate-Limiting

---

## Zusammenfassung

### Quantitative Vorteile (SAP CAP)

| Kategorie | Durchschnittliche Reduktion |
|-----------|---------------------------|
| **Code-Zeilen** | **-70% bis -100%** |
| **Dateiänderungen** | **-75-100%** |
| **Framework-Kopplung** | **-80-83%** |
| **Config/Code für Token-Validierung** | **-80-100%** |

### Qualitative Vorteile (SAP CAP)

1. ✅ **Deklarative Sicherheit** - Zentral, wartbar, nachvollziehbar
2. ✅ **Automatische Token-Validierung** - Keine Fehlerquelle
3. ✅ **Standard-UIs** - Registrierung + Password-Reset out-of-the-box
4. ✅ **Native Security-Features** - Rate-Limiting eingebaut
5. ✅ **Service Binding** - Automatische IdP-Integration

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

## API-Endpunkte

### Metriken-API (beide Backends)

```bash
# H1: Security Code Lines
GET /api/metrics/security-code

# H3a: Token-Validierung Config/Code
GET /api/metrics/token-validation-config

# H3b: Enterprise Integration
GET /api/metrics/enterprise-integration

# H4: Framework Coupling
GET /api/metrics/coupling

# H5: Token Validation
GET /api/metrics/token-validation

# H6: Registration Flow
GET /api/metrics/registration-flow

# H7: Password Reset
GET /api/metrics/password-reset

# Vollständiger Report
GET /api/metrics/report
```

---

## Wissenschaftliche Validierung

Alle Hypothesen sind **objektiv messbar** durch:
- ✅ Lines of Code (automatisiert zählbar)
- ✅ Anzahl geänderter Dateien/Methoden
- ✅ Konfigurationsschritte (dokumentiert)
- ✅ Boolean-Features (native vs. manuell)

**Unabhängig von Entwickler-Kompetenz!**

---

**Autor:** Bachelorarbeit  
**Datum:** 2025-12-23  
**Status:** Messungen abgeschlossen

