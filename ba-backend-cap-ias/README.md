# SAP CAP Backend mit SAP IAS - Dokumentation

## Überblick

Das Backend ist ein SAP Cloud Application Programming Model (CAP) mit SAP Identity Authentication Service (IAS) für die Bachelorarbeit. Der Fokus liegt auf der wissenschaftlichen Messung von Hypothesen zum Vergleich mit AWS Cognito + Spring Boot.

---

## Projektstruktur

```
ba-backend-cap-ias/
├── db/
│   └── data-model.cds              # Datenmodell mit zentraler Autorisierung
├── srv/
│   ├── service-definition.cds      # Service-Definitionen
│   └── src/main/java/
│       └── customer/ba_backend_cap_ias/
│           ├── handlers/
│           │   ├── AuthServiceHandler.java
│           │   └── OrderServiceHandler.java
│           ├── service/
│           │   └── MetricsService.java
│           └── controller/
│               └── MetricsController.java
├── package.json                    # CDS-Konfiguration
├── xs-security.json               # XSUAA/IAS Security Config
└── mta.yaml                       # Cloud Deployment Descriptor
```

---

## Kernkonzept: Deklarative Sicherheit

### Datenmodell (db/data-model.cds)

```cds
namespace sap.cap.orders;

using { cuid } from '@sap/cds/common';

entity Orders : cuid {
  customer: String not null;
  amount: Decimal not null;
  status: String default 'OPEN';
  createdBy: String;
  modifiedBy: String;
}

// Zentrale Autorisierungs-Definition (H1, H2)
annotate Orders with @(restrict: [
  { grant: 'READ', to: 'authenticated-user' },
  { grant: ['READ'], to: 'Manager', where: 'createdBy = $user' },
  { grant: ['*'], to: 'Admin' },
  { grant: 'READ', to: 'Observer' }  // H2: Neue Rolle = 1 Zeile!
]);
```

**Wichtig:** Die `@restrict` Annotation definiert **alle** Autorisierungsregeln zentral im Datenmodell. Das Framework setzt diese automatisch durch - **kein zusätzlicher Java-Code notwendig**.

---

## Service-Definition (srv/service-definition.cds)

```cds
using { sap.cap.orders } from '../db/data-model';

service OrderService {
  entity Orders as projection on orders.Orders;
}

service AuthService {
  action register(username: String, email: String, password: String) returns { success: Boolean; message: String; };
  action verifyEmail(email: String, verificationCode: String) returns { success: Boolean; };
  action forgotPassword(email: String) returns { success: Boolean; message: String; };
  action confirmPasswordReset(email: String, code: String, newPassword: String) returns { success: Boolean; };
}
```

---

## Handler-Implementierung

### OrderServiceHandler.java

```java
@Component
@ServiceName("OrderService")
public class OrderServiceHandler implements EventHandler {
    
    @Before(event = CqnService.EVENT_CREATE, entity = "Orders")
    public void onCreate(EventContext context) {
        UserInfo userInfo = context.getUserInfo();
    }
}
```

**Wichtig:** Handler enthalten **nur Business-Logik**. Autorisierung wird automatisch durch `@restrict` durchgesetzt.


### Lokale Entwicklung (Mock-Auth)

**package.json:**
```json
{
  "cds": {
    "requires": {
      "auth": {
        "kind": "mocked",
        "users": {
          "admin": { "roles": ["Admin"] },
          "manager": { "roles": ["Manager"] },
          "user": { "roles": ["authenticated-user"] },
          "observer": { "roles": ["Observer"] }
        }
      }
    }
  }
}
```

### Cloud-Deployment (SAP IAS)

**xs-security.json:**
```json
{
  "xsappname": "ba-backend-cap-ias",
  "tenant-mode": "dedicated",
  "scopes": [
    { "name": "$XSAPPNAME.Admin", "description": "Admin" },
    { "name": "$XSAPPNAME.Manager", "description": "Manager" },
    { "name": "$XSAPPNAME.User", "description": "User" },
    { "name": "$XSAPPNAME.Observer", "description": "Observer" }
  ],
  "role-templates": [
    { "name": "Admin", "scope-references": ["$XSAPPNAME.Admin"] },
    { "name": "Manager", "scope-references": ["$XSAPPNAME.Manager"] },
    { "name": "User", "scope-references": ["$XSAPPNAME.User"] },
    { "name": "Observer", "scope-references": ["$XSAPPNAME.Observer"] }
  ]
}
```

## Schnellstart

### Lokal 

```bash
# Dependencies installieren
npm install

# CDS Watch starten
cds watch

# Test-Zugriff
curl -u admin:admin http://localhost:4004/odata/v4/OrderService/Orders
```

---
### Service Binding (Automatisch)

Die `xs-security.json` wird automatisch gebunden:

```json
{
  "xsappname": "ba-backend-cap-ias",
  "tenant-mode": "dedicated",
  "scopes": [
    { "name": "$XSAPPNAME.Admin", "description": "Admin" },
    { "name": "$XSAPPNAME.Manager", "description": "Manager" },
    { "name": "$XSAPPNAME.User", "description": "User" },
    { "name": "$XSAPPNAME.Observer", "description": "Observer" }
  ],
  "role-templates": [
    { "name": "Admin", "scope-references": ["$XSAPPNAME.Admin"] },
    { "name": "Manager", "scope-references": ["$XSAPPNAME.Manager"] },
    { "name": "User", "scope-references": ["$XSAPPNAME.User"] },
    { "name": "Observer", "scope-references": ["$XSAPPNAME.Observer"] }
  ]
}
```

**Wichtig:** Service Binding übernimmt automatisch:
-  JWKS-URI Konfiguration
-  Issuer-URI Konfiguration
-  Token-Validierung
-  Rollen-Mapping

---