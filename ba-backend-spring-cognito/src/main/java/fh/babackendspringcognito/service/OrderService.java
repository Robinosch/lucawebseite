package fh.babackendspringcognito.service;

import fh.babackendspringcognito.dto.OrderDto;
import fh.babackendspringcognito.model.Order;
import fh.babackendspringcognito.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Order Service for business logic.
 * Used for testing role-based authorization (H1, H2).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        log.debug("Fetching all orders");
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Order getOrderById(String id) {
        log.debug("Fetching order by id: {}", id);
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    @Transactional
    public Order createOrder(OrderDto orderDto, String createdBy) {
        log.info("Creating order for customer: {}, createdBy: {}", orderDto.getCustomer(), createdBy);

        Order order = Order.builder()
                .customerId(orderDto.getCustomer())
                .amount(orderDto.getAmount())
                .status(orderDto.getStatus())
                .createdBy(createdBy)
                .build();

        return orderRepository.save(order);
    }

    @Transactional
    public void deleteOrder(String id) {
        log.info("Deleting order with id: {}", id);

        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Order not found with id: " + id);
        }

        orderRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByCustomer(String customerId) {
        log.debug("Fetching orders for customer: {}", customerId);
        return orderRepository.findByCustomerId(customerId);
    }
}

