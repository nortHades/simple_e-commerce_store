package com.dom_cheung.ecommerce_store.service;

import com.dom_cheung.ecommerce_store.model.Order;
import com.dom_cheung.ecommerce_store.model.Product;
import com.dom_cheung.ecommerce_store.repository.OrderRepository;
import com.dom_cheung.ecommerce_store.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testCreateOrder_Success() {
        // Setup
        Long userId = 1L;
        String shippingAddress = "123 Test St";

        // Create mock products
        Product product1 = new Product();
        product1.setId(1L);
        product1.setName("Test Product 1");
        product1.setPrice(10.99);

        Product product2 = new Product();
        product2.setId(2L);
        product2.setName("Test Product 2");
        product2.setPrice(20.50);

        List<Product> mockProducts = List.of(product1, product2);

        // Mock repository responses
        when(productRepository.findAllById(anyList())).thenReturn(mockProducts);
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        // Create cart items
        List<Map<String, Object>> cartItems = new ArrayList<>();

        Map<String, Object> item1 = new HashMap<>();
        item1.put("id", 1L);
        item1.put("quantity", 2);

        Map<String, Object> item2 = new HashMap<>();
        item2.put("id", 2L);
        item2.put("quantity", 1);

        cartItems.add(item1);
        cartItems.add(item2);

        // Execute
        Order createdOrder = orderService.createOrder(userId, cartItems, shippingAddress);

        // Verify
        assertNotNull(createdOrder);
        assertEquals(userId, createdOrder.getUserId());
        assertEquals(shippingAddress, createdOrder.getShippingAddress());
        assertEquals(2, createdOrder.getItems().size());

        // Verify total calculation
        double expectedTotal = (10.99 * 2) + (20.50 * 1);
        assertEquals(expectedTotal, createdOrder.getTotalAmount(), 0.01);

        // Verify repository calls
        verify(productRepository).findAllById(anyList());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    public void testCreateOrder_EmptyCart() {
        // Execute & Verify
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            orderService.createOrder(1L, new ArrayList<>(), "Test Address");
        });

        assertTrue(exception.getMessage().contains("empty cart"));
        verify(orderRepository, never()).save(any(Order.class));
    }
}