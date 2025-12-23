package fh.babackendspringcognito.repository;

import fh.babackendspringcognito.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Order entity.
 * Used for testing role-based access control (H1, H2, H4).
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByCustomerId(String customerId);

    List<Order> findByCreatedBy(String createdBy);
}

