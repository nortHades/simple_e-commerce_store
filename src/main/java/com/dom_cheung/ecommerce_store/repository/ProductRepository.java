package com.dom_cheung.ecommerce_store.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dom_cheung.ecommerce_store.model.Product;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Method to find only active products
    List<Product> findByActiveTrue();
}