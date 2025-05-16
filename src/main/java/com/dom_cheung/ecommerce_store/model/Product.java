package com.dom_cheung.ecommerce_store.model;

import jakarta.persistence.*; // using jakarta.persistence for Spring Boot 3+
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "products")
@Data // This automatically generates getters, setters, toString, equals, and hashCode methods
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment for the ID
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT") // Use TEXT for potentially longer descriptions
    private String description;

    @Column(nullable = false)
    private double price;

    @Column(length = 512)
    private String imageUrl;

    @Column(length = 255)
    private String imagePublicId;
}