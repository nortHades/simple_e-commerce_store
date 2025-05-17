package com.dom_cheung.ecommerce_store.service;

import com.dom_cheung.ecommerce_store.model.Order;
import com.dom_cheung.ecommerce_store.model.OrderStatus;
import com.dom_cheung.ecommerce_store.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class OrderStatusServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testUpdateOrderStatus_ValidTransition() {
        // Setup
        String orderNumber = "ORD-123";
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setOrderNumber(orderNumber);
        mockOrder.setStatus(OrderStatus.PENDING);

        // Mock repository responses
        when(orderRepository.findByOrderNumber(orderNumber)).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        // Execute
        Order updatedOrder = orderService.updateOrderStatus(orderNumber, OrderStatus.PROCESSING);

        // Verify
        assertNotNull(updatedOrder);
        assertEquals(OrderStatus.PROCESSING, updatedOrder.getStatus());

        // Verify repository calls
        verify(orderRepository).findByOrderNumber(orderNumber);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    public void testUpdateOrderStatus_InvalidTransition() {
        // Setup
        String orderNumber = "ORD-123";
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setOrderNumber(orderNumber);
        mockOrder.setStatus(OrderStatus.DELIVERED); // Delivered is a terminal state

        // Mock repository response
        when(orderRepository.findByOrderNumber(orderNumber)).thenReturn(Optional.of(mockOrder));

        // Execute & Verify
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            orderService.updateOrderStatus(orderNumber, OrderStatus.PROCESSING);
        });

        // Verify message
        assertTrue(exception.getMessage().contains("Cannot change order status"));

        // Verify repository was not called for save
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    public void testUpdateOrderStatus_OrderNotFound() {
        // Setup
        String orderNumber = "ORD-NONEXISTENT";

        // Mock repository response
        when(orderRepository.findByOrderNumber(orderNumber)).thenReturn(Optional.empty());

        // Execute & Verify
        Exception exception = assertThrows(RuntimeException.class, () -> {
            orderService.updateOrderStatus(orderNumber, OrderStatus.CANCELLED);
        });

        // Verify message
        assertEquals("Order not found", exception.getMessage());

        // Verify repository was not called for save
        verify(orderRepository, never()).save(any(Order.class));
    }
}