package com.dom_cheung.ecommerce_store.repository;

import com.dom_cheung.ecommerce_store.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Find all orders for a specific user, sorted by order date (newest first)
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Find an order by its order number
    Optional<Order> findByOrderNumber(String orderNumber);
}