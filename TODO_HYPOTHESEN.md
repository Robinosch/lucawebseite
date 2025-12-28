# TODO-Liste: Hypothesen-Messungen

**Stand:** 2025-12-28

---

## ✅ Erledigte Hypothesen (Framework-Integration)

Diese Hypothesen wurden durch statische Code-Analyse gemessen:

| Hypothese | Status | Ergebnis |
|-----------|--------|----------|
| **H1** | ✅ Erledigt | ~200 LOC vs ~30 LOC (-85%) |
| **H2** | ✅ Erledigt | 3-4 Dateien vs 1 Datei (-75%) |
| **H3a** | ✅ Erledigt | 150 LOC, CC=12 vs 10 LOC, CC=0 (-93%) |
| **H4** | ✅ Erledigt | 6 Dateien vs 2 Dateien (-67%) |
| **H5** | ✅ Erledigt | CC=12 (manuell) vs CC=0 (automatisch) |

---

## ⏳ Offene Hypothesen (IdP-Vergleich)

Diese Hypothesen erfordern manuelle Messung in den Admin-Konsolen:

### H3b: Unternehmensintegration
- [ ] **AWS Cognito:** Anzahl Konfigurationsschritte für User Pool Federation dokumentieren
- [ ] **SAP IAS:** Anzahl Konfigurationsschritte für Trust-Configuration dokumentieren
- [ ] Ergebnisse in `evaluation.tex` Tabelle `\ref{tab:h3b_ergebnisse}` eintragen

### H6: Benutzerregistrierung (Klicks in Admin-Konsolen)
- [ ] **AWS Cognito Console:** Klicks zählen für Benutzer-Erstellung
  - Cognito Console öffnen → User Pool auswählen → Users → Create User → Formular → Bestätigen
- [ ] **SAP IAS Console:** Klicks zählen für Benutzer-Erstellung
  - SAP IAS Console öffnen → Users & Authorizations → User Management → Add → Formular → Bestätigen
- [ ] Ergebnisse in `evaluation.tex` Tabelle `\ref{tab:h6_ergebnisse}` eintragen

### H7: Recovery-Mechanismen
- [ ] **AWS Cognito:** 
  - [ ] Gültigkeitsdauer des Reset-Codes dokumentieren (Standard: 24h?)
  - [ ] Konfigurationsaufwand (Klicks) für Aktivierung des Forgot-Password-Flows
- [ ] **SAP IAS:**
  - [ ] Gültigkeitsdauer des Reset-Links dokumentieren
  - [ ] Konfigurationsaufwand (Klicks) für Aktivierung des Password-Reset
- [ ] Ergebnisse in `evaluation.tex` Tabelle `\ref{tab:h7_ergebnisse}` eintragen

### H8: Integrierte Sicherheitsfeatures
- [ ] Feature-Checkliste für beide IdPs vervollständigen:

| Feature | AWS Cognito | SAP IAS |
|---------|-------------|---------|
| Rate-Limiting | ⚠️ Konfigurierbar? | ✅ Standard? |
| Brute-Force-Schutz | ⚠️ Konfigurierbar? | ✅ Standard? |
| Audit-Logging | ✅ CloudTrail | ✅ Standard? |
| Token-Expiration | ✅ Konfigurierbar | ✅ Standard |
| E-Mail-Verifizierung | ✅ Konfigurierbar | ✅ Standard? |
| Passwort-Policies | ✅ Konfigurierbar | ✅ Standard? |
| Account-Lockout | ⚠️ Manuell? | ✅ Standard? |
| MFA-Unterstützung | ✅ Standard | ✅ Standard |

- [ ] Dokumentation/Screenshots der Feature-Einstellungen sammeln
- [ ] Ergebnisse in `evaluation.tex` Tabelle `\ref{tab:h8_ergebnisse}` eintragen

### H9: Benutzerlöschung (Klicks in Admin-Konsolen)
- [ ] **AWS Cognito Console:** Klicks zählen für Benutzer-Löschung
  - Cognito Console → User Pool → Users → Benutzer auswählen → Delete → Bestätigungsdialog
- [ ] **SAP IAS Console:** Klicks zählen für Benutzer-Löschung
  - SAP IAS Console → Users & Authorizations → User Management → Benutzer auswählen → Delete → Bestätigungsdialog
- [ ] Anzahl Bestätigungsdialoge dokumentieren
- [ ] Ergebnisse in `evaluation.tex` Tabelle `\ref{tab:h9_ergebnisse}` eintragen

---

## 📷 Screenshots für LaTeX-Dokumentation

### Bereits vorhanden (überprüfen):
- [ ] AWS Cognito User Pool Erstellung (Abbildung `\ref{fig:cognito_user_pool}`)

### Noch zu erstellen:
- [ ] SAP BTP Role Collections Konfiguration (Abbildung `\ref{fig:btp_role_collections}`)
- [ ] Optional: AWS Cognito Benutzer-Erstellung (für H6)
- [ ] Optional: SAP IAS Benutzer-Erstellung (für H6)
- [ ] Optional: AWS Cognito Feature-Konfiguration (für H8)
- [ ] Optional: SAP IAS Feature-Konfiguration (für H8)

---

## 📝 Dokumentation aktualisieren

Nach Abschluss der Messungen:
- [ ] `evaluation.tex`: Alle TODO-Werte in Tabellen einfüllen
- [ ] `evaluation.tex`: Interpretationen vervollständigen
- [ ] `statistics.MD`: TODOs mit gemessenen Werten ersetzen
- [ ] Screenshots in LaTeX einfügen

---

## Hinweise zur Messung

### Klick-Zählung
- Zähle jeden Mausklick (Links, Buttons, Checkboxen)
- Formularfelder: Zähle als 1 "Schritt" pro Feld
- Bestätigungsdialoge separat zählen

### Dokumentation
- Screenshots während der Messung erstellen
- Exakte Klick-Reihenfolge notieren
- Datum der Messung dokumentieren (UI kann sich ändern)

---

**Nächste Schritte:**
1. H6 (Benutzerregistrierung) messen - am einfachsten
2. H9 (Benutzerlöschung) messen - ähnlich wie H6
3. H7 (Recovery) messen - Konfiguration prüfen
4. H8 (Features) messen - Feature-Checkliste vervollständigen
5. H3b (Enterprise Integration) - falls relevant

