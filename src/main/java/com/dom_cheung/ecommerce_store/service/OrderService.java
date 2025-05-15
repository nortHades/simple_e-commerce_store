package com.dom_cheung.ecommerce_store.service;

import com.dom_cheung.ecommerce_store.model.*;
import com.dom_cheung.ecommerce_store.repository.OrderRepository;
import com.dom_cheung.ecommerce_store.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger LOGGER = Logger.getLogger(OrderService.class.getName());

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Create a new order from cart items
     *
     * @param userId User ID who is placing the order
     * @param cartItems List of cart items to be ordered
     * @param shippingAddress Shipping address for the order
     * @return The created order
     * @throws IllegalArgumentException if cart is empty or contains invalid products
     */
    @Transactional
    public Order createOrder(Long userId, List<Map<String, Object>> cartItems, String shippingAddress) {
        // Validate cart items
        if (cartItems == null || cartItems.isEmpty()) {
            LOGGER.warning("Attempt to create order with empty cart for user ID: " + userId);
            throw new IllegalArgumentException("Cannot create order with empty cart");
        }

        LOGGER.info("Creating order for user ID: " + userId + " with " + cartItems.size() + " items");

        // Extract product IDs from cart items
        List<Long> productIds = cartItems.stream()
                .map(item -> Long.valueOf(item.get("id").toString()))
                .collect(Collectors.toList());

        // Get the latest product information (to ensure current pricing)
        List<Product> products = productRepository.findAllById(productIds);

        // Validate all products exist
        if (products.size() != productIds.size()) {
            LOGGER.warning("Some products in the cart were not found in the database");
            throw new IllegalArgumentException("One or more products in your cart are no longer available");
        }

        // Create a map of product ID to product for easy lookup
        Map<Long, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, product -> product));

        // Create the order
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderNumber(Order.generateOrderNumber());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setShippingAddress(shippingAddress);

        double totalAmount = 0.0;

        // Create order items from cart items
        for (Map<String, Object> cartItem : cartItems) {
            Long productId = Long.valueOf(cartItem.get("id").toString());
            Product product = productMap.get(productId);

            // Skip if product doesn't exist (should not happen after validation above)
            if (product == null) {
                continue;
            }

            int quantity;
            try {
                quantity = Integer.parseInt(cartItem.get("quantity").toString());
            } catch (NumberFormatException e) {
                LOGGER.warning("Invalid quantity format for product ID: " + productId);
                throw new IllegalArgumentException("Invalid quantity for product: " + product.getName());
            }

            // Validate quantity
            if (quantity <= 0) {
                LOGGER.warning("Invalid quantity (" + quantity + ") for product ID: " + productId);
                throw new IllegalArgumentException("Quantity must be greater than zero for product: " + product.getName());
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setProductPrice(product.getPrice());
            orderItem.setProductImageUrl(product.getImageUrl());
            orderItem.setQuantity(quantity);
            orderItem.setSubtotal(product.getPrice() * quantity);

            order.getItems().add(orderItem);
            totalAmount += orderItem.getSubtotal();
        }

        order.setTotalAmount(totalAmount);

        // Save the order
        Order savedOrder = orderRepository.save(order);
        LOGGER.info("Order created successfully with number: " + savedOrder.getOrderNumber());

        return savedOrder;
    }

    /**
     * Get all orders for a specific user
     *
     * @param userId User ID to get orders for
     * @return List of orders for the user
     */
    public List<Order> getUserOrders(Long userId) {
        LOGGER.info("Retrieving orders for user ID: " + userId);
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        LOGGER.info("Found " + orders.size() + " orders for user ID: " + userId);
        return orders;
    }

    /**
     * Get an order by its order number
     *
     * @param orderNumber Order number to look up
     * @return Optional containing the order if found
     */
    public Optional<Order> getOrderByNumber(String orderNumber) {
        LOGGER.info("Retrieving order with order number: " + orderNumber);
        Optional<Order> order = orderRepository.findByOrderNumber(orderNumber);
        if (order.isPresent()) {
            LOGGER.info("Order found: " + orderNumber);
        } else {
            LOGGER.info("Order not found: " + orderNumber);
        }
        return order;
    }

    /**
     * Update the status of an order
     *
     * @param orderNumber Order number to update
     * @param newStatus New status to set
     * @return Updated order
     */
    @Transactional
    public Order updateOrderStatus(String orderNumber, OrderStatus newStatus) {
        // Implementation will be added in a future iteration
        throw new UnsupportedOperationException("Method not implemented yet");
    }
}