package customer.ba_backend_cap_ias.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * UserInfo Controller für SAP CAP Backend.
 *
 * Liefert Benutzerinformationen aus dem XSUAA/SAP IAS Token.
 * Wird vom Frontend nach erfolgreicher Authentifizierung aufgerufen.
 */
@RestController
@RequestMapping("/api/user")
public class UserInfoController {

    private static final Logger logger = LoggerFactory.getLogger(UserInfoController.class);

    /**
     * Gibt Benutzerinformationen aus dem aktuellen Token zurück.
     *
     * Der App Router hat den Benutzer bereits authentifiziert.
     * Die Benutzerinfo wird aus dem SecurityContext extrahiert.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            logger.warn("Kein authentifizierter Benutzer gefunden");
            return ResponseEntity.status(401).body(Map.of(
                "error", "Nicht authentifiziert",
                "authenticated", false
            ));
        }

        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", "").replace("SCOPE_", ""))
                .collect(Collectors.toList());

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("authenticated", true);
        userInfo.put("username", auth.getName());
        userInfo.put("email", auth.getName());
        userInfo.put("roles", roles);

        logger.info("UserInfo abgerufen für: {}, Rollen: {}", auth.getName(), roles);

        return ResponseEntity.ok(userInfo);
    }

    /**
     * Logout-Endpoint - invalidiert die Session im App Router.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        // In SAP BTP wird der Logout vom App Router gehandhabt
        // Der Frontend-Aufruf hier ist nur zur Bestätigung
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Logout erfolgreich. Bitte Browser-Session beenden."
        ));
    }
}

