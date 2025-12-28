# SAP BTP Deployment Guide mit SAP IAS

## Übersicht

Dieses Dokument beschreibt das Deployment des SAP CAP Backends mit **SAP Identity Authentication Service (IAS)** als Identity Provider.

**WICHTIG: Architektur-Verständnis**

SAP BTP verwendet eine zweistufige Architektur für Authentifizierung:

| Service | Funktion |
|---------|----------|
| **XSUAA** | Authorization Server - OAuth2 Token Management, Scopes, Rollen |
| **SAP IAS** | Identity Provider - User Authentication, Login-Seite, Self-Service |

**Beide Services sind erforderlich!** Der App-Router benötigt XSUAA (`authenticationType: "xsuaa"`), und XSUAA leitet den Benutzer automatisch zur SAP IAS Login-Seite weiter, wenn IAS als Trust-Provider konfiguriert ist.

## Architektur

```
┌───────────────────────────────────────────────────────────────────────────┐
│                              SAP BTP                                       │
│                                                                           │
│  ┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐   │
│  │   App Router    │───▶│  CAP Backend     │───▶│     XSUAA          │   │
│  │  (Angular UI)   │    │  (Java/Spring)   │    │  (Authorization)   │   │
│  └────────┬────────┘    └──────────────────┘    └──────────┬─────────┘   │
│           │                                                 │             │
│           │              Trust Configuration               │             │
│           │                    ┌──────────────────────────┘             │
│           ▼                    ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    SAP IAS Tenant                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │ User Mgmt   │  │ Login Page  │  │ Self-Service Features   │  │   │
│  │  │ & Groups    │  │ (OAuth2)    │  │ (Register, Reset PWD)   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │   │
│  └───────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
```

## Wichtig: Service-Bindings

Beide Apps (Server + App-Router) müssen an **BEIDE** Services gebunden sein:

```bash
# Prüfen der Bindings
cf services

# Erwartete Ausgabe:
# ba-backend-cap-ias-xsuaa      xsuaa     application   ba-backend-cap-ias-srv, ba-backend-cap-ias-approuter
# ba-backend-cap-ias-identity   identity  application   ba-backend-cap-ias-srv, ba-backend-cap-ias-approuter
```

## Voraussetzungen

- SAP BTP Account mit SAP IAS Tenant
- Cloud Foundry CLI installiert
- MTA Build Tool (mbt) installiert
- Node.js und Maven installiert

## Schritt 1: SAP IAS Tenant Konfiguration

### 1.1 Zugang zur SAP IAS Admin Console

1. Öffne die SAP IAS Admin Console: `https://<dein-tenant>.accounts.ondemand.com/admin`
2. Melde dich mit deinem Admin-Account an

### 1.2 Bestehende Application nutzen (Trial Account)

**WICHTIG für Trial Accounts:**

In einem Trial Account mit aktiviertem Cloud Identity Services Booster siehst du bereits vorkonfigurierte Applications:

| Application | Typ | Verwendung |
|-------------|-----|------------|
| **SAP BTP subaccount trial** | SAP BTP solution (Bundled) | ✅ **Diese verwenden!** |
| SAP Build Apps (trial) | Bundled Application | Für SAP Build Apps |
| SAP Build Work Zone | Bundled Application | Für Work Zone |

**Du musst KEINE neue Application erstellen!** 

Die Application "SAP BTP subaccount trial" ist bereits mit deinem Subaccount verbunden und kann direkt verwendet werden.

### 1.3 Application konfigurieren

1. Klicke auf **SAP BTP subaccount trial**
2. Unter **Trust** → **Subject Name Identifier**:
   - Wähle **User ID** oder **Email** als Identifier
3. Unter **Attributes** → **Assertion Attributes** (optional):
   - Füge `email`, `first_name`, `last_name` hinzu falls benötigt

### 1.4 User Groups erstellen

1. Navigiere zu **User Management** → **User Groups**
2. Klicke auf **+ Create**
3. Erstelle folgende Gruppen:
   - `Admin` - Display Name: "Administrator Group"
   - `Manager` - Display Name: "Manager Group"  
   - `User` - Display Name: "User Group"
   - `Observer` - Display Name: "Observer Group" (für H2 Testing)

### 1.5 Benutzer erstellen und Gruppen zuweisen

1. Navigiere zu **User Management** → **Users**
2. Klicke auf **+ Add User** oder nutze bestehende Benutzer
3. Öffne einen Benutzer → **User Groups** Tab
4. Klicke auf **Assign Groups** und wähle die entsprechende Gruppe

## Schritt 2: SAP BTP Trust Configuration

### 2.1 Trust zu SAP IAS prüfen (Trial Account)

**In Trial Accounts ist Trust bereits konfiguriert!**

1. Öffne SAP BTP Cockpit: `https://cockpit.hanatrial.ondemand.com`
2. Navigiere zu deinem Subaccount
3. Gehe zu **Security** → **Trust Configuration**
4. Du solltest deinen SAP IAS Tenant bereits sehen (z.B. `<tenant>.accounts.ondemand.com`)

Falls nicht vorhanden:
1. Klicke auf **Establish Trust**
2. Wähle **SAP Cloud Identity Services - Identity Authentication**
3. Wähle deinen Tenant aus

### 2.2 Role Collections erstellen

1. Navigiere zu **Security** → **Role Collections**
2. Klicke auf **+ Create**
3. Erstelle:
   - Name: `BA_Admin`, Description: "Bachelor Thesis - Admin"
   - Name: `BA_Manager`, Description: "Bachelor Thesis - Manager"
   - Name: `BA_User`, Description: "Bachelor Thesis - User"
   - Name: `BA_Observer`, Description: "Bachelor Thesis - Observer"

### 2.3 Role Templates zu Role Collections hinzufügen

Nach dem Deployment werden automatisch Role Templates erstellt. Diese müssen dann den Role Collections zugewiesen werden:

1. Öffne eine Role Collection (z.B. `BA_Admin`)
2. Klicke auf **Edit**
3. Unter **Roles** klicke auf **Add**
4. Wähle die entsprechende Rolle aus deiner App

### 2.4 User Group Mappings (SAP IAS → Role Collections)

1. Öffne eine Role Collection
2. Klicke auf **Edit**
3. Unter **User Groups** klicke auf **Add**
4. Wähle:
   - **Identity Provider**: Dein SAP IAS Tenant
   - **User Group**: Die entsprechende Gruppe (z.B. `Admin`)
5. Speichern

Beispiel-Mappings:
| Role Collection | SAP IAS User Group |
|-----------------|-------------------|
| BA_Admin | Admin |
| BA_Manager | Manager |
| BA_User | User |
| BA_Observer | Observer |

## Schritt 3: Cloud Foundry Login

```bash
# Login zu SAP BTP
cf login -a https://api.cf.eu10.hana.ondemand.com

# Alternativ für US Region
cf login -a https://api.cf.us10-001.hana.ondemand.com

# Org und Space auswählen
cf target -o <deine-org> -s <dein-space>
```

## Schritt 4: MTA Build

```bash
# Im Projektverzeichnis ba-backend-cap-ias
cd ba-backend-cap-ias

# NPM Dependencies installieren
npm install

# MTA Archive bauen
mbt build

# Das erzeugt: mta_archives/ba-backend-cap-ias_1.0.0.mtar
```

## Schritt 5: Deployment

```bash
# MTA Archive deployen
cf deploy mta_archives/ba-backend-cap-ias_1.0.0.mtar

# Alternativ mit Logging
cf deploy mta_archives/ba-backend-cap-ias_1.0.0.mtar --debug
```

### Erwartete Services nach Deployment

```bash
# Services anzeigen
cf services

# Erwartete Ausgabe:
# NAME                            SERVICE      PLAN          
# ba-backend-cap-ias-identity     identity     application   ← SAP IAS Service
# ba-backend-cap-ias-destination  destination  lite
```

## Schritt 6: Anwendung testen

```bash
# App Router URL abrufen
cf app ba-backend-cap-ias-approuter

# Die URL öffnen - SAP IAS Login wird angezeigt
```

### Login-Flow

1. Öffne die Approuter-URL
2. Du wirst automatisch zur SAP IAS Login-Seite weitergeleitet
3. Melde dich mit einem Benutzer aus deinem SAP IAS Tenant an
4. Nach erfolgreichem Login wirst du zur Angular-App zurückgeleitet

## Unterschiede: Lokal vs. Cloud

| Aspekt | Lokal (cds watch) | Cloud (SAP BTP) |
|--------|-------------------|-----------------|
| **Auth-Methode** | Basic Auth (Mock Users) | SAP IAS OAuth2/OIDC |
| **User Management** | .cdsrc.json Mock Users | SAP IAS User Management |
| **Token-Validierung** | Mock (automatisch) | SAP IAS JWT (automatisch) |
| **Rollen-Zuweisung** | Hardcoded in Config | SAP IAS Groups → Role Collections |
| **Login-UI** | Browser Basic Auth Dialog | SAP IAS Login Seite |
| **Self-Service** | Nicht verfügbar | Registrierung, Password-Reset |

## Konfigurationsdateien

### mta.yaml - Identity Service

```yaml
resources:
  - name: ba-backend-cap-ias-identity
    type: org.cloudfoundry.managed-service
    parameters:
      service: identity
      service-plan: application
      config:
        display-name: BA-CAP-IAS-Bachelor-Thesis
        oauth2-configuration:
          redirect-uris:
            - https://*.cfapps.eu10.hana.ondemand.com/**
```

### package.json - Auth Kind

```json
{
  "cds": {
    "requires": {
      "auth": {
        "[development]": { "kind": "mocked" },
        "[production]": { "kind": "ias" }
      }
    }
  }
}
```

### xs-app.json - Authentication Type

```json
{
  "routes": [
    {
      "source": "^/odata/v4/(.*)$",
      "destination": "srv-api",
      "authenticationType": "ias"
    }
  ]
}
```

## Troubleshooting

### Problem: 500 Error "Failed to extract tenant from tenant host pattern"
**Ursache**: Multi-Tenancy ist aktiviert, aber Trial Accounts unterstützen das nicht.
**Lösung**: 
1. Prüfe, dass `TENANT_HOST_PATTERN: ''` in mta.yaml gesetzt ist:
```yaml
# In mta.yaml unter approuter properties:
properties:
  TENANT_HOST_PATTERN: ''
```
2. Re-deploy die Anwendung:
```bash
mbt build
cf deploy mta_archives/ba-backend-cap-ias_1.0.0.mtar
```

### Problem: 401 Unauthorized bei API-Calls
**Ursache**: Token wird nicht korrekt weitergeleitet.
**Lösung**: Prüfe `forwardAuthToken: true` in mta.yaml Destination-Konfiguration.

### Problem: 403 Forbidden bei geschützten Endpunkten
**Ursache**: Benutzer hat nicht die richtige Rolle.
**Lösung**: 
1. Prüfe SAP IAS User Groups
2. Prüfe Role Collection Mappings in SAP BTP
3. Prüfe @restrict Annotationen im CDS-Modell

### Problem: Login-Schleife
**Ursache**: Redirect-URIs nicht korrekt konfiguriert.
**Lösung**: Prüfe oauth2-configuration in SAP IAS und mta.yaml.

### Problem: Identity Service kann nicht erstellt werden
**Ursache**: Service-Plan nicht verfügbar oder Quota erreicht.
**Lösung**: 
```bash
# Verfügbare Service-Pläne prüfen
cf marketplace -e identity
```

## Metriken für Hypothesen (H1-H7)

### Vollständig testbar mit SAP IAS:

| Hypothese | Beschreibung | Status |
|-----------|--------------|--------|
| **H1** | Autorisierungs-Code-Zeilen (@restrict vs @PreAuthorize) | ✅ Testbar |
| **H2** | Wartbarkeit - Neue Rolle hinzufügen | ✅ Testbar |
| **H3a** | Token-Validierung LOC (SAP IAS: automatisch!) | ✅ Testbar |
| **H3b** | Unternehmensintegration (SAP IAS Trust) | ✅ Testbar |
| **H4** | Vendor-Kopplung (Dateien mit Imports) | ✅ Testbar |
| **H5** | Token-Validierung (automatisch vs manuell) | ✅ Testbar |
| **H6** | Benutzerregistrierung (SAP IAS Self-Service) | ✅ Testbar |
| **H7** | Password-Reset (SAP IAS Standard-Feature) | ✅ Testbar |

### H6 - Benutzerregistrierung mit SAP IAS

SAP IAS bietet **Self-Service Registration** out-of-the-box:
1. Aktiviere Self-Service in SAP IAS Admin Console
2. Benutzer können sich selbst registrieren
3. Email-Verifizierung wird automatisch durchgeführt
4. **Code im Backend: 0 Zeilen!**

### H7 - Password-Reset mit SAP IAS

SAP IAS bietet **Password-Reset** out-of-the-box:
1. "Forgot Password" Link auf Login-Seite
2. Email mit Reset-Link wird automatisch gesendet
3. Rate-Limiting und Token-Expiration sind eingebaut
4. **Code im Backend: 0 Zeilen!**

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

# Service-Bindings anzeigen
cf env ba-backend-cap-ias-srv

# Service-Keys erstellen (für lokales Testing mit Cloud IAS)
cf create-service-key ba-backend-cap-ias-identity ba-ias-key
cf service-key ba-backend-cap-ias-identity ba-ias-key
```

## Vorteile von SAP IAS vs. Trial (sap.default)

| Feature | sap.default (Trial) | Eigener SAP IAS Tenant |
|---------|---------------------|------------------------|
| Self-Service Registration | ❌ | ✅ |
| Password-Reset UI | ❌ | ✅ |
| Custom User Management | ❌ | ✅ |
| User Groups | ❌ (nur Role Collections) | ✅ |
| Branding/Customization | ❌ | ✅ |
| External IdP Integration | ❌ | ✅ |
| Multi-Factor Authentication | Eingeschränkt | ✅ |

## Fazit für die Bachelorarbeit

Mit einem eigenen SAP IAS Tenant können **alle Hypothesen (H1-H7) vollständig getestet** werden:

- **H1-H2**: Deklarative @restrict Annotationen zentral im CDS-Modell
- **H3a**: Automatische Token-Validierung durch Framework (0 Code-Zeilen)
- **H3b**: Trust-Konfiguration zwischen SAP BTP und SAP IAS
- **H4**: Minimale Vendor-Kopplung (nur CDS-Annotationen)
- **H5**: Vollautomatische JWT-Validierung
- **H6**: SAP IAS Self-Service Registration
- **H7**: SAP IAS Password-Reset mit allen Sicherheitsfeatures

Der direkte Vergleich mit AWS Cognito + Spring Boot zeigt die Unterschiede zwischen:
- **Deklarativem Ansatz** (SAP CAP + IAS): Konfiguration statt Code
- **Imperativem Ansatz** (Spring Boot + Cognito): Code für jeden Security-Check

