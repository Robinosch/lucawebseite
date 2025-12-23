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
import java.time.Instant;

@Component
public class OrderServiceHandler implements EventHandler {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceHandler.class);

    @Before(entity = "OrderService.Orders")
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

    @Before(event = "READ", entity = "OrderService.Orders")
    public void beforeReadOrders(CdsReadEventContext context) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";

        logger.info("ORDER_READ: user={}, roles={}",
                username,
                auth != null ? auth.getAuthorities() : "none");
        logger.info("AUTHORIZATION_ENFORCEMENT: AUTOMATIC_BY_FRAMEWORK");
    }

    public void onCompleteOrder() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";

        logger.info("ORDER_COMPLETE: user={}", username);
        logger.info("NO_MANUAL_AUTHORIZATION_CODE: Framework handled it automatically");
    }

    public void onCancelOrder() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "anonymous";

        logger.info("ORDER_CANCEL: user={}", username);
    }
}

