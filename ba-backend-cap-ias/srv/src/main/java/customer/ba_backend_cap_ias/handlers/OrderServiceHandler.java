package customer.ba_backend_cap_ias.handlers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import com.sap.cds.services.cds.CdsCreateEventContext;
import com.sap.cds.services.cds.CdsReadEventContext;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.Before;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import cds.gen.orderservice.OrderService_;
import cds.gen.orderservice.Orders;
import cds.gen.orderservice.Orders_;
import cds.gen.orderservice.CompleteOrderContext;
import cds.gen.orderservice.CancelOrderContext;
import com.sap.cds.ql.Update;
import com.sap.cds.services.persistence.PersistenceService;
import java.time.Instant;

/**
 * Handler für den OrderService.
 *
 * WICHTIG für Hypothesen H1, H2, H5:
 * - Autorisierung erfolgt AUTOMATISCH durch CDS @restrict Annotationen
 * - Keine manuellen @PreAuthorize Checks erforderlich
 * - Framework validiert JWT Tokens automatisch
 */
@Component
@ServiceName(OrderService_.CDS_NAME)
public class OrderServiceHandler implements EventHandler {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceHandler.class);

    private final PersistenceService db;

    public OrderServiceHandler(PersistenceService db) {
        this.db = db;
    }

    /**
     * Before-Handler für Order-Erstellung.
     * Setzt automatisch den createdBy Wert auf den aktuellen Benutzer.
     */
    @Before(event = "CREATE", entity = Orders_.CDS_NAME)
    public void beforeCreateOrder(CdsCreateEventContext context) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";

        logger.info("ORDER_CREATE: user={}, timestamp={}", username, Instant.now());
        logger.info("AUTHORIZATION_METHOD: AUTOMATIC_VIA_CDS_RESTRICT_ANNOTATION");

        context.getCqn().entries().forEach(entry -> {
            if (!entry.containsKey("createdBy")) {
                entry.put("createdBy", username);
            }
        });
    }

    /**
     * Before-Handler für Order-Lesen.
     * Logging für Metriken - Autorisierung erfolgt automatisch durch Framework.
     */
    @Before(event = "READ", entity = Orders_.CDS_NAME)
    public void beforeReadOrders(CdsReadEventContext context) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";

        logger.info("ORDER_READ: user={}, roles={}",
                username,
                auth != null ? auth.getAuthorities() : "none");
        logger.info("AUTHORIZATION_ENFORCEMENT: AUTOMATIC_BY_FRAMEWORK");
    }

    /**
     * Action-Handler für Order-Abschluss.
     * Nur Admin darf Orders abschließen (data-model.cds).
     */
    @On(event = CompleteOrderContext.CDS_NAME)
    public void onCompleteOrder(CompleteOrderContext context) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";
        String orderId = context.getOrderId();

        logger.info("ORDER_COMPLETE: user={}, orderId={}", username, orderId);
        logger.info("NO_MANUAL_AUTHORIZATION_CODE: Framework handled it automatically");

        var result = db.run(
            Update.entity(Orders_.class)
                .where(o -> o.ID().eq(orderId))
                .data(Orders.STATUS, "COMPLETED")
        );

        CompleteOrderContext.ReturnType returnType = CompleteOrderContext.ReturnType.create();
        if (result.rowCount() > 0) {
            returnType.setSuccess(true);
            returnType.setMessage("Order " + orderId + " wurde erfolgreich abgeschlossen");
        } else {
            returnType.setSuccess(false);
            returnType.setMessage("Order " + orderId + " wurde nicht gefunden");
        }
        context.setResult(returnType);
    }

    /**
     * Action-Handler für Order-Stornierung.
     * Admin oder Ersteller darf Order stornieren.
     */
    @On(event = CancelOrderContext.CDS_NAME)
    public void onCancelOrder(CancelOrderContext context) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";
        String orderId = context.getOrderId();

        logger.info("ORDER_CANCEL: user={}, orderId={}", username, orderId);

        var result = db.run(
            Update.entity(Orders_.class)
                .where(o -> o.ID().eq(orderId))
                .data(Orders.STATUS, "CANCELLED")
        );

        CancelOrderContext.ReturnType returnType = CancelOrderContext.ReturnType.create();
        if (result.rowCount() > 0) {
            returnType.setSuccess(true);
            returnType.setMessage("Order " + orderId + " wurde erfolgreich storniert");
        } else {
            returnType.setSuccess(false);
            returnType.setMessage("Order " + orderId + " wurde nicht gefunden");
        }
        context.setResult(returnType);
    }
}

