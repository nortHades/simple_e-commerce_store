package com.dom_cheung.ecommerce_store.controller;

import java.util.*;
import com.dom_cheung.ecommerce_store.model.Product;
import com.dom_cheung.ecommerce_store.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        // Only return active products to the frontend
        return productRepository.findByActiveTrue();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable long id) {
        Optional<Product> productOp = productRepository.findById(id);

        if (productOp.isPresent()) {
            Product product = productOp.get();
            // Only return the product if it's active
            if (product.isActive()) {
                return new ResponseEntity<>(product, HttpStatus.OK);
            } else {
                // Product exists but is inactive, return 404
                return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
            }
        } else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
}