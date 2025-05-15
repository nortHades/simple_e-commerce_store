package com.dom_cheung.ecommerce_store.controller;

import com.dom_cheung.ecommerce_store.model.Order;
import com.dom_cheung.ecommerce_store.model.User;
import com.dom_cheung.ecommerce_store.repository.UserRepository;
import com.dom_cheung.ecommerce_store.service.OrderService;
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
import java.util.logging.Level;
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
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            LOGGER.info("Create order request received from user: " + username);

            // Validate user exists
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                LOGGER.warning("Unauthorized access attempt for username: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        Map.of("message", "Unauthorized access")
                );
            }

            User user = userOpt.get();

            // Validate required fields
            if (!orderRequest.containsKey("items")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        Map.of("message", "Items are required")
                );
            }

            String shippingAddress = orderRequest.containsKey("shippingAddress") ?
                    (String) orderRequest.get("shippingAddress") : "";

            // Get cart items from request
            List<Map<String, Object>> cartItems = (List<Map<String, Object>>) orderRequest.get("items");

            // Create the order
            Order createdOrder = orderService.createOrder(user.getId(), cartItems, shippingAddress);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("orderNumber", createdOrder.getOrderNumber());
            response.put("orderDate", createdOrder.getOrderDate());
            response.put("totalAmount", createdOrder.getTotalAmount());
            response.put("status", createdOrder.getStatus());

            LOGGER.info("Order created successfully: " + createdOrder.getOrderNumber());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            // Handle validation errors
            LOGGER.warning("Validation error creating order: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", e.getMessage())
            );
        } catch (Exception e) {
            // Handle unexpected errors
            LOGGER.log(Level.SEVERE, "Error creating order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("message", "An error occurred while creating your order. Please try again later.")
            );
        }
    }

    /**
     * Get all orders for the current user
     *
     * @return List of user's orders
     */
    @GetMapping
    public ResponseEntity<?> getUserOrders() {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            LOGGER.info("Get orders request received from user: " + username);

            // Validate user exists
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                LOGGER.warning("Unauthorized access attempt for username: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        Map.of("message", "Unauthorized access")
                );
            }

            User user = userOpt.get();

            // Get the user's orders
            List<Order> orders = orderService.getUserOrders(user.getId());

            LOGGER.info("Successfully retrieved " + orders.size() + " orders for user: " + username);
            return ResponseEntity.ok(orders);

        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error retrieving user orders", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("message", "An error occurred while retrieving your orders. Please try again later.")
            );
        }
    }

    /**
     * Get details of a specific order
     *
     * @param orderNumber Order number to get details for
     * @return Order details
     */
    @GetMapping("/{orderNumber}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderNumber) {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            LOGGER.info("Get order details request received from user: " + username + " for order: " + orderNumber);

            // Validate user exists
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                LOGGER.warning("Unauthorized access attempt for username: " + username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                        Map.of("message", "Unauthorized access")
                );
            }

            User user = userOpt.get();

            // Get the order
            Optional<Order> orderOpt = orderService.getOrderByNumber(orderNumber);
            if (orderOpt.isEmpty()) {
                LOGGER.warning("Order not found: " + orderNumber);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        Map.of("message", "Order not found")
                );
            }

            Order order = orderOpt.get();

            // Security check: ensure users can only view their own orders
            if (!order.getUserId().equals(user.getId())) {
                LOGGER.warning("User " + username + " attempted to access order " + orderNumber + " which belongs to another user");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        Map.of("message", "You don't have permission to view this order")
                );
            }

            LOGGER.info("Successfully retrieved order details for order: " + orderNumber);
            return ResponseEntity.ok(order);

        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error retrieving order details for order: " + orderNumber, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("message", "An error occurred while retrieving order details. Please try again later.")
            );
        }
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