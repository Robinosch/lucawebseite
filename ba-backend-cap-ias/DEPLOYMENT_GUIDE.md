# SAP BTP Deployment & SAP IAS Integration Guide

## Übersicht

Diese Anleitung beschreibt das Deployment der SAP CAP Anwendung auf SAP BTP und die Integration mit SAP Identity Authentication Service (IAS).

## Voraussetzungen

1. **SAP BTP Trial Account** (oder produktiver Account)
2. **Cloud Foundry CLI** installiert
3. **MTA Build Tool** (`npm install -g mbt`)
4. **SAP IAS Tenant** (wird automatisch mit BTP Trial bereitgestellt)

## Architektur in der Cloud

```
┌─────────────────────────────────────────────────────────────────┐
│                         SAP BTP                                  │
│  ┌─────────────────┐    ┌──────────────────┐    ┌────────────┐ │
│  │   App Router    │───▶│  CAP Backend     │───▶│   XSUAA    │ │
│  │  (Angular UI)   │    │  (Java/Spring)   │    │  Service   │ │
│  └────────┬────────┘    └──────────────────┘    └──────┬─────┘ │
│           │                                            │       │
│           │              Trust Configuration           │       │
│           │                                            ▼       │
│  ┌────────▼─────────────────────────────────────────────────┐  │
│  │                    SAP IAS (Identity Provider)            │  │
│  │  - User Management (Admin Console)                        │  │
│  │  - OAuth2/OIDC Authentication                             │  │
│  │  - Role/Group Mapping                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Schritt 1: Cloud Foundry Login

```bash
# Login zu SAP BTP
cf login -a https://api.cf.eu10.hana.ondemand.com

# Org und Space auswählen (Trial: trial / dev)
cf target -o <your-org> -s <your-space>
```

## Schritt 2: MTA Build

```bash
# Im Projektverzeichnis ba-backend-cap-ias
cd ba-backend-cap-ias

# MTA Archive bauen
mbt build

# Das erzeugt: mta_archives/ba-backend-cap-ias_1.0.0.mtar
```

## Schritt 3: Deployment

```bash
# MTA Archive deployen
cf deploy mta_archives/ba-backend-cap-ias_1.0.0.mtar

# Oder mit dem BTP CLI:
# btp deploy mta mta_archives/ba-backend-cap-ias_1.0.0.mtar
```

## Schritt 4: SAP IAS Trust-Konfiguration

### 4.1 In SAP BTP Cockpit:

1. Navigiere zu: **Security** → **Trust Configuration**
2. Klicke auf **Establish Trust**
3. Wähle deinen **SAP IAS Tenant** aus der Liste
4. Bestätige die Trust-Konfiguration

### 4.2 In SAP IAS Admin Console:

1. Öffne: `https://<your-tenant>.accounts.ondemand.com/admin`
2. Navigiere zu: **Applications & Resources** → **Applications**
3. Finde deine Anwendung (automatisch erstellt durch XSUAA)
4. Konfiguriere:
   - **Subject Name Identifier**: Email
   - **Default Name ID Format**: Email

### 4.3 Benutzer und Gruppen in SAP IAS erstellen:

1. **Users** → **Add User**:
   - Email: `admin@yourcompany.com`
   - First Name: Admin
   - Last Name: User

2. **Groups** → **Create Group**:
   - Name: `Admin`
   - Assign users to group

3. **Applications** → **<Your App>** → **Groups**:
   - Map SAP IAS Group `Admin` to XSUAA Role `Admin`

## Schritt 5: Role Collections in SAP BTP

1. Navigiere zu: **Security** → **Role Collections**
2. Erstelle Role Collection:
   - Name: `BA_Admin`
   - Roles: Füge `Admin` Role von der Anwendung hinzu
3. **Users**: Weise Benutzer der Role Collection zu

## Schritt 6: Anwendung testen

```bash
# App Router URL abrufen
cf app ba-backend-cap-ias-approuter

# Die URL öffnen - SAP IAS Login wird automatisch angezeigt
```

## Wichtige Unterschiede: Lokal vs. Cloud

| Aspekt | Lokal | Cloud |
|--------|-------|-------|
| **Auth-Methode** | Basic Auth (Mock Users) | SAP IAS OAuth2/OIDC |
| **User Management** | `.cdsrc.json` Mock Users | SAP IAS Admin Console |
| **Token-Validierung** | Spring Security InMemory | XSUAA + SAP IAS JWT |
| **Rollen-Zuweisung** | Hardcoded in Config | SAP IAS Groups → XSUAA Roles |

## Troubleshooting

### Problem: 401 Unauthorized
- Prüfe Trust-Konfiguration zwischen BTP und IAS
- Prüfe Role Collections Zuweisung

### Problem: 403 Forbidden
- Benutzer hat nicht die richtige Rolle
- Prüfe Group-to-Role Mapping in SAP IAS

### Problem: Redirect Loop
- Prüfe xs-app.json Routes
- Prüfe XSUAA OAuth2 redirect-uris

## Metriken für Hypothesen (Cloud)

Nach dem Deployment kannst du folgende Metriken sammeln:

- **H5 (Token-Validierung)**: Automatisch durch XSUAA - 0 Zeilen Code
- **H6 (Registrierung)**: SAP IAS Admin Console - 0 Zeilen Code
- **H1 (Auth-Code)**: CDS @restrict Annotationen - deklarativ

## Nützliche Befehle

```bash
# Logs anzeigen
cf logs ba-backend-cap-ias-srv --recent

# Apps anzeigen
cf apps

# Services anzeigen
cf services

# App restarten
cf restart ba-backend-cap-ias-srv
```

