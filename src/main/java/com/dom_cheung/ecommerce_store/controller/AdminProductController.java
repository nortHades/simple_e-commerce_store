package com.dom_cheung.ecommerce_store.controller;

import com.dom_cheung.ecommerce_store.model.Product;
import com.dom_cheung.ecommerce_store.repository.ProductRepository;
import com.dom_cheung.ecommerce_store.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/admin/products")
public class AdminProductController {

    private static final Logger LOGGER = Logger.getLogger(AdminProductController.class.getName());

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    // Get all products (for admin panel)
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return ResponseEntity.ok(products);
    }

    // Get a single product by ID (for admin panel)
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable long id) {
        Optional<Product> product = productRepository.findById(id);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new product
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Product> createProduct(
            @RequestPart("product") Product product,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        try {
            product.setId(0); // Ensure ID is not set for creation

            if (imageFile != null && !imageFile.isEmpty()) {
                Map<String, String> uploadResult = cloudinaryService.uploadFile(imageFile, "ecommerce_products");
                product.setImageUrl(uploadResult.get("secure_url"));
                product.setImagePublicId(uploadResult.get("public_id"));
            } else {
                // If no image file is provided, set image fields to null.
                // The client can choose to send an explicit imageUrl in the 'product' JSON part if they want.
                // If product.getImageUrl() is also null/blank here, it means no image.
                if (product.getImageUrl() == null || product.getImageUrl().isBlank()){
                    product.setImageUrl(null);
                    product.setImagePublicId(null);
                }
                LOGGER.info("No new image file provided for product creation. Using imageUrl from JSON if present, otherwise null.");
            }

            Product savedProduct = productRepository.save(product);
            LOGGER.info("Product created successfully with ID: " + savedProduct.getId());
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE, "File upload error during product creation: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } catch (IllegalArgumentException e) {
            LOGGER.log(Level.WARNING, "Invalid argument during product creation: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error creating product: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Update an existing product
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Product> updateProduct(
            @PathVariable long id,
            @RequestPart("product") Product productDetails,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        Optional<Product> existingProductOptional = productRepository.findById(id);
        if (existingProductOptional.isEmpty()) {
            LOGGER.warning("Product not found for update with ID: " + id);
            return ResponseEntity.notFound().build();
        }

        try {
            Product existingProduct = existingProductOptional.get();

            existingProduct.setName(productDetails.getName());
            existingProduct.setDescription(productDetails.getDescription());
            existingProduct.setPrice(productDetails.getPrice());
            // Add any other fields that can be updated

            if (imageFile != null && !imageFile.isEmpty()) {
                if (existingProduct.getImagePublicId() != null && !existingProduct.getImagePublicId().isBlank()) {
                    LOGGER.info("Placeholder: Old image (public_id: " + existingProduct.getImagePublicId() +
                            ") would be deleted here before uploading new one.");
                    // cloudinaryService.deleteFile(existingProduct.getImagePublicId()); // Temporarily commented out
                }

                Map<String, String> uploadResult = cloudinaryService.uploadFile(imageFile, "ecommerce_products");
                existingProduct.setImageUrl(uploadResult.get("secure_url"));
                existingProduct.setImagePublicId(uploadResult.get("public_id"));
            } else if (productDetails.getImageUrl() != null) {
                // Handle if imageUrl is explicitly provided in the JSON (e.g., to clear it or change to another existing URL)
                if (productDetails.getImageUrl().isBlank()) { // User wants to remove the image
                    if (existingProduct.getImagePublicId() != null && !existingProduct.getImagePublicId().isBlank()) {
                        LOGGER.info("Placeholder: Old image (public_id: " + existingProduct.getImagePublicId() +
                                ") would be deleted here as imageUrl is being cleared.");
                        // cloudinaryService.deleteFile(existingProduct.getImagePublicId()); // Temporarily commented out
                    }
                    existingProduct.setImageUrl(null);
                    existingProduct.setImagePublicId(null);
                } else if (!productDetails.getImageUrl().equals(existingProduct.getImageUrl())) {
                    // User changed the imageUrl manually to a new URL.
                    // The old image (if managed by us) should ideally be deleted.
                    if (existingProduct.getImagePublicId() != null && !existingProduct.getImagePublicId().isBlank()) {
                        LOGGER.info("Placeholder: Old image (public_id: " + existingProduct.getImagePublicId() +
                                ") would be deleted here as imageUrl is being manually changed.");
                        // cloudinaryService.deleteFile(existingProduct.getImagePublicId()); // Temporarily commented out
                    }
                    existingProduct.setImageUrl(productDetails.getImageUrl());
                    existingProduct.setImagePublicId(null); // New URL is not from our upload, so no public_id known to us
                }
            }
            // If no new imageFile and productDetails.imageUrl is null or same as existing, image fields remain unchanged.


            Product updatedProduct = productRepository.save(existingProduct);
            LOGGER.info("Product updated successfully with ID: " + updatedProduct.getId());
            return ResponseEntity.ok(updatedProduct);
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE, "File upload error during product update for ID " + id + ": " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } catch (IllegalArgumentException e) {
            LOGGER.log(Level.WARNING, "Invalid argument during product update for ID " + id + ": " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error updating product for ID " + id + ": " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Delete a product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable long id) {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isEmpty()) {
            LOGGER.warning("Product not found for deletion with ID: " + id);
            return ResponseEntity.notFound().build();
        }

        Product productToDelete = productOptional.get();

        // Placeholder for deleting image from Cloudinary.
        // Actual deletion logic is currently commented out for simplification.
        if (productToDelete.getImagePublicId() != null && !productToDelete.getImagePublicId().isBlank()) {
            LOGGER.info("Placeholder: Image (public_id: " + productToDelete.getImagePublicId() +
                    ") would be deleted from Cloudinary here.");
            // cloudinaryService.deleteFile(productToDelete.getImagePublicId()); // Temporarily commented out
        }

        try {
            productRepository.deleteById(id);
            LOGGER.info("Product deleted successfully from database with ID: " + id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error deleting product from database with ID " + id + ": " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}