package com.dom_cheung.ecommerce_store.service;

import com.dom_cheung.ecommerce_store.model.Order;
import com.dom_cheung.ecommerce_store.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class OrderQueryServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetUserOrders_Success() {
        // Setup
        Long userId = 1L;

        Order order1 = new Order();
        order1.setId(1L);
        order1.setOrderNumber("ORD-123");

        Order order2 = new Order();
        order2.setId(2L);
        order2.setOrderNumber("ORD-456");

        List<Order> mockOrders = Arrays.asList(order1, order2);

        // Mock repository response
        when(orderRepository.findByUserIdOrderByOrderDateDesc(userId)).thenReturn(mockOrders);

        // Execute
        List<Order> result = orderService.getUserOrders(userId);

        // Verify
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("ORD-123", result.get(0).getOrderNumber());
        assertEquals("ORD-456", result.get(1).getOrderNumber());

        // Verify repository was called
        verify(orderRepository).findByUserIdOrderByOrderDateDesc(userId);
    }

    @Test
    public void testGetOrderByNumber_Success() {
        // Setup
        String orderNumber = "ORD-123";
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setOrderNumber(orderNumber);

        // Mock repository response
        when(orderRepository.findByOrderNumber(orderNumber)).thenReturn(Optional.of(mockOrder));

        // Execute
        Optional<Order> result = orderService.getOrderByNumber(orderNumber);

        // Verify
        assertTrue(result.isPresent());
        assertEquals(orderNumber, result.get().getOrderNumber());

        // Verify repository was called
        verify(orderRepository).findByOrderNumber(orderNumber);
    }

    @Test
    public void testGetOrderByNumber_NotFound() {
        // Setup
        String orderNumber = "ORD-NONEXISTENT";

        // Mock repository response
        when(orderRepository.findByOrderNumber(orderNumber)).thenReturn(Optional.empty());

        // Execute
        Optional<Order> result = orderService.getOrderByNumber(orderNumber);

        // Verify
        assertFalse(result.isPresent());

        // Verify repository was called
        verify(orderRepository).findByOrderNumber(orderNumber);
    }
}