package com.dom_cheung.ecommerce_store.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private double price;

    @Column(length = 512)
    private String imageUrl;

    @Column(length = 255)
    private String imagePublicId;

    // New field for product visibility control
    @Column(nullable = false)
    private boolean active = true; // Default to active
}