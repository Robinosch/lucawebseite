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
     * Before-Handler for CREATE Order.
     */
    @Before(event = "CREATE", entity = Orders_.CDS_NAME)
    public void beforeCreateOrder(CdsCreateEventContext context) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";

        logger.info("ORDER_CREATE: user={}, timestamp={}", username, Instant.now());

        context.getCqn().entries().forEach(entry -> {
            if (!entry.containsKey("createdBy")) {
                entry.put("createdBy", username);
            }
        });
    }

    /**
     * Before-Handler for READ Order.
     */
    @Before(event = "READ", entity = Orders_.CDS_NAME)
    public void beforeReadOrders(CdsReadEventContext context) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";

        logger.info("ORDER_READ: user={}, roles={}",
                username,
                auth != null ? auth.getAuthorities() : "none");
    }

    /**
     * Action-Handler für on complete Orders.
     */
    @On(event = CompleteOrderContext.CDS_NAME)
    public void onCompleteOrder(CompleteOrderContext context) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";
        String orderId = context.getOrderId();

        logger.info("ORDER_COMPLETE: user={}, orderId={}", username, orderId);

        var result = db.run(
            Update.entity(Orders_.class)
                .where(o -> o.ID().eq(orderId))
                .data(Orders.STATUS, "COMPLETED")
        );

        CompleteOrderContext.ReturnType returnType = CompleteOrderContext.ReturnType.create();
        if (result.rowCount() > 0) {
            returnType.setSuccess(true);
            returnType.setMessage("Order " + orderId + " successfully completed");
        } else {
            returnType.setSuccess(false);
            returnType.setMessage("Order " + orderId + " not found");
        }
        context.setResult(returnType);
    }

    /**
     * Action-Handler for cancel Order.
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
            returnType.setMessage("Order " + orderId + " canceled successfully");
        } else {
            returnType.setSuccess(false);
            returnType.setMessage("Order " + orderId + " not found");
        }
        context.setResult(returnType);
    }
}

