package customer.ba_backend_cap_ias.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.sap.cds.ql.Insert;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.Update;
import com.sap.cds.ql.Delete;
import com.sap.cds.services.persistence.PersistenceService;
import cds.gen.orderservice.Orders;
import cds.gen.orderservice.Orders_;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Lokaler Order Service für CRUD-Operationen.
 *
 * Analog zum Spring Boot Backend (OrderService.java):
 * - Speichert Orders in H2-Datenbank
 * - Stellt Business-Logic-Methoden bereit
 *
 * WICHTIG für Hypothesen:
 * - Keine @PreAuthorize Annotationen nötig
 * - Autorisierung erfolgt durch CDS @restrict Annotationen
 */
@Service
public class OrderServiceLocal {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceLocal.class);

    private final PersistenceService db;

    public OrderServiceLocal(PersistenceService db) {
        this.db = db;
    }

    /**
     * Holt alle Orders.
     */
    public List<Orders> getAllOrders() {
        logger.debug("Fetching all orders");
        return db.run(Select.from(Orders_.class)).listOf(Orders.class);
    }

    /**
     * Holt eine Order nach ID.
     */
    public Optional<Orders> getOrderById(String id) {
        logger.debug("Fetching order by id: {}", id);
        return db.run(Select.from(Orders_.class).where(o -> o.ID().eq(id)))
                .first(Orders.class);
    }

    /**
     * Erstellt eine neue Order.
     */
    public Orders createOrder(String customer, BigDecimal amount, String status, String createdBy) {
        logger.info("Creating order for customer: {}, createdBy: {}", customer, createdBy);

        Orders order = Orders.create();
        order.setId(UUID.randomUUID().toString());
        order.setCustomer(customer);
        order.setAmount(amount);
        order.setStatus(status != null ? status : "OPEN");
        order.setCreatedBy(createdBy);

        db.run(Insert.into(Orders_.class).entry(order));
        return order;
    }

    /**
     * Aktualisiert den Status einer Order.
     */
    public boolean updateOrderStatus(String id, String status) {
        logger.info("Updating order {} status to: {}", id, status);

        var result = db.run(
            Update.entity(Orders_.class)
                .where(o -> o.ID().eq(id))
                .data(Orders.STATUS, status)
        );

        return result.rowCount() > 0;
    }

    /**
     * Löscht eine Order.
     */
    public boolean deleteOrder(String id) {
        logger.info("Deleting order with id: {}", id);

        var result = db.run(
            Delete.from(Orders_.class).where(o -> o.ID().eq(id))
        );

        return result.rowCount() > 0;
    }

    /**
     * Holt Orders nach Customer.
     */
    public List<Orders> getOrdersByCustomer(String customer) {
        logger.debug("Fetching orders for customer: {}", customer);
        return db.run(
            Select.from(Orders_.class).where(o -> o.get("customer").eq(customer))
        ).listOf(Orders.class);
    }

    /**
     * Holt Orders nach createdBy (Benutzer).
     */
    public List<Orders> getOrdersByCreatedBy(String createdBy) {
        logger.debug("Fetching orders created by: {}", createdBy);
        return db.run(
            Select.from(Orders_.class).where(o -> o.get("createdBy").eq(createdBy))
        ).listOf(Orders.class);
    }
}

