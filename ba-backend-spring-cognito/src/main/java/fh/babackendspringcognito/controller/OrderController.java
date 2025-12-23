package fh.babackendspringcognito.controller;

import fh.babackendspringcognito.dto.OrderDto;
import fh.babackendspringcognito.model.Order;
import fh.babackendspringcognito.service.MetricsService;
import fh.babackendspringcognito.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Order Controller with role-based authorization.
 * CRITICAL for hypothesis testing:
 * - H1: Security implementation (imperative @PreAuthorize)
 * - H2: Role-based access control granularity
 * - H4: Security coupling (Spring Security dependency)
 *
 * Authorization rules:
 * - GET /api/orders - Authenticated users only
 * - GET /api/orders/{id} - MANAGER role required
 * - POST /api/orders - ADMIN role required
 * - DELETE /api/orders/{id} - ADMIN role required
 *
 * Security Lines of Code: ~30 lines (annotations + authorization logic)
 */
@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final MetricsService metricsService;

    /**
     * Get all orders.
     * Authorization: Any authenticated user.
     * H1, H2: Demonstrates basic authentication check.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Order>> getAllOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        log.info("AUTHORIZATION_CHECK: endpoint=/api/orders, method=GET, user={}, authorities={}",
                username, auth.getAuthorities());

        metricsService.recordAuthorizationCheck("/api/orders", "AUTHENTICATED", username);

        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Get order by ID.
     * Authorization: MANAGER role required.
     * H1, H2: Demonstrates role-based access control.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        log.info("AUTHORIZATION_CHECK: endpoint=/api/orders/{id}, method=GET, user={}, authorities={}",
                username, auth.getAuthorities());

        metricsService.recordAuthorizationCheck("/api/orders/{id}", "MANAGER", username);

        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    /**
     * Create new order.
     * Authorization: ADMIN role required.
     * H1, H2: Demonstrates admin-level authorization.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderDto orderDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        log.info("AUTHORIZATION_CHECK: endpoint=/api/orders, method=POST, user={}, authorities={}",
                username, auth.getAuthorities());

        metricsService.recordAuthorizationCheck("/api/orders", "ADMIN", username);

        Order order = orderService.createOrder(orderDto, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * Delete order.
     * Authorization: ADMIN role required.
     * H1, H2: Demonstrates admin-level authorization.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        log.info("AUTHORIZATION_CHECK: endpoint=/api/orders/{id}, method=DELETE, user={}, authorities={}",
                username, auth.getAuthorities());

        metricsService.recordAuthorizationCheck("/api/orders/{id}", "ADMIN", username);

        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get orders by customer ID.
     * Authorization: Any authenticated user.
     */
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Order>> getOrdersByCustomer(@PathVariable String customerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        log.info("AUTHORIZATION_CHECK: endpoint=/api/orders/customer/{customerId}, method=GET, user={}, authorities={}",
                username, auth.getAuthorities());

        metricsService.recordAuthorizationCheck("/api/orders/customer/{customerId}", "AUTHENTICATED", username);

        List<Order> orders = orderService.getOrdersByCustomer(customerId);
        return ResponseEntity.ok(orders);
    }
}

