package com.dom_cheung.ecommerce_store.controller;

import com.dom_cheung.ecommerce_store.model.Order;
import com.dom_cheung.ecommerce_store.service.OrderService;
import com.dom_cheung.ecommerce_store.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger LOGGER = Logger.getLogger(OrderController.class.getName());

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new order
     *
     * @param orderRequest Order data from request body
     * @return Order confirmation with order number
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderRequest) {
        // Implementation will be added in the next iteration
        LOGGER.info("Create order endpoint called, but not yet implemented");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                Map.of("message", "Order creation not implemented yet")
        );
    }

    /**
     * Get all orders for the current user
     *
     * @return List of user's orders
     */
    @GetMapping
    public ResponseEntity<?> getUserOrders() {
        // Implementation will be added in a future iteration
        LOGGER.info("Get user orders endpoint called, but not yet implemented");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                Map.of("message", "Get user orders not implemented yet")
        );
    }

    /**
     * Get details of a specific order
     *
     * @param orderNumber Order number to get details for
     * @return Order details
     */
    @GetMapping("/{orderNumber}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderNumber) {
        // Implementation will be added in a future iteration
        LOGGER.info("Get order details endpoint called for order " + orderNumber + ", but not yet implemented");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                Map.of("message", "Get order details not implemented yet")
        );
    }

    /**
     * Cancel an order
     *
     * @param orderNumber Order number to cancel
     * @return Confirmation of cancellation
     */
    @PostMapping("/{orderNumber}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderNumber) {
        // Implementation will be added in a future iteration
        LOGGER.info("Cancel order endpoint called for order " + orderNumber + ", but not yet implemented");
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                Map.of("message", "Order cancellation not implemented yet")
        );
    }
}