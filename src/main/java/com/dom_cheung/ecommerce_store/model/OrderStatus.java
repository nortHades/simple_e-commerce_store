package com.dom_cheung.ecommerce_store.model;

public enum OrderStatus {
    PENDING,     // Order has been placed but not processed
    PROCESSING,  // Order is being processed
    SHIPPED,     // Order has been shipped
    DELIVERED,   // Order has been delivered to the customer
    CANCELLED    // Order has been cancelled
}