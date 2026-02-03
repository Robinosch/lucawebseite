package fh.babackendspringcognito.controller;

import fh.babackendspringcognito.dto.OrderDto;
import fh.babackendspringcognito.model.Order;
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
 * Order Controller with role-based authorization
 *
 * Authorization rules:
 * - GET /api/orders - Authenticated users only
 * - GET /api/orders/{id} - MANAGER role required
 * - POST /api/orders - ADMIN role required
 * - DELETE /api/orders/{id} - ADMIN role required
 *
 */
@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * Get all orders
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'OBSERVER')")
    public ResponseEntity<List<Order>> getAllOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        log.info("AUTHORIZATION_CHECK: endpoint=/api/orders, method=GET, user={}, authorities={}",
                username, auth.getAuthorities());

        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Get order by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OBSERVER')")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        log.info("AUTHORIZATION_CHECK: endpoint=/api/orders/{id}, method=GET, user={}, authorities={}",
                username, auth.getAuthorities());

        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    /**
     * Create new order
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderDto orderDto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        log.info("AUTHORIZATION_CHECK: endpoint=/api/orders, method=POST, user={}, authorities={}",
                username, auth.getAuthorities());

        Order order = orderService.createOrder(orderDto, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * Delete order
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        log.info("AUTHORIZATION_CHECK: endpoint=/api/orders/{id}, method=DELETE, user={}, authorities={}",
                username, auth.getAuthorities());

        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}

