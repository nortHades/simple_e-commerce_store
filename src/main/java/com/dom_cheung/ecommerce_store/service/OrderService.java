package com.dom_cheung.ecommerce_store.service;

import com.dom_cheung.ecommerce_store.model.Order;
import com.dom_cheung.ecommerce_store.model.OrderStatus;
import com.dom_cheung.ecommerce_store.repository.OrderRepository;
import com.dom_cheung.ecommerce_store.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OrderService {

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
     */
    @Transactional
    public Order createOrder(Long userId, List<Map<String, Object>> cartItems, String shippingAddress) {
        // Implementation will be added in the next iteration
        throw new UnsupportedOperationException("Method not implemented yet");
    }

    /**
     * Get all orders for a specific user
     *
     * @param userId User ID to get orders for
     * @return List of orders for the user
     */
    public List<Order> getUserOrders(Long userId) {
        // Implementation will be added in a future iteration
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    /**
     * Get an order by its order number
     *
     * @param orderNumber Order number to look up
     * @return Optional containing the order if found
     */
    public Optional<Order> getOrderByNumber(String orderNumber) {
        // Implementation will be added in a future iteration
        return orderRepository.findByOrderNumber(orderNumber);
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