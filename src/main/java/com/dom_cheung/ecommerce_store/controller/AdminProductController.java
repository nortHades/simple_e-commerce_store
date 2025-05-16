package com.dom_cheung.ecommerce_store.controller;

import com.dom_cheung.ecommerce_store.model.Product;
import com.dom_cheung.ecommerce_store.repository.ProductRepository;
import com.dom_cheung.ecommerce_store.service.CloudinaryService;
import com.dom_cheung.ecommerce_store.service.CloudinaryService.ImageType;
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

/**
 * Controller for handling admin-specific product operations
 * Includes endpoints for creating, updating, and deleting products
 * as well as controlling product visibility
 */
@RestController
@RequestMapping("/admin/products")
public class AdminProductController {

    private static final Logger LOGGER = Logger.getLogger(AdminProductController.class.getName());

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Get all products for admin panel (including inactive ones)
     * @return List of all products
     */
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return ResponseEntity.ok(products);
    }

    /**
     * Get a single product by ID for admin panel
     * @param id Product ID
     * @return Product if found, 404 otherwise
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable long id) {
        Optional<Product> product = productRepository.findById(id);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Update product visibility status
     * @param id Product ID
     * @param statusUpdate Map containing "active" boolean flag
     * @return Updated product or appropriate error status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Product> updateProductStatus(
            @PathVariable long id,
            @RequestBody Map<String, Boolean> statusUpdate) {

        // Find the existing product
        Optional<Product> existingProductOptional = productRepository.findById(id);
        if (existingProductOptional.isEmpty()) {
            LOGGER.warning("Product not found for status update with ID: " + id);
            return ResponseEntity.notFound().build();
        }

        try {
            Product existingProduct = existingProductOptional.get();

            // Get active status from request body
            Boolean active = statusUpdate.get("active");

            if (active != null) {
                existingProduct.setActive(active);

                // Save the updated product
                Product updatedProduct = productRepository.save(existingProduct);
                LOGGER.info("Product status updated successfully with ID: " + id + ", active: " + active);
                return ResponseEntity.ok(updatedProduct);
            } else {
                LOGGER.warning("Missing 'active' field in status update request for product ID: " + id);
                return ResponseEntity.badRequest().body(null);
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error updating product status for ID " + id + ": " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Create a new product
     * @param product Product object from JSON
     * @param imageFile Optional image file
     * @return Created product or appropriate error status
     */
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Product> createProduct(
            @RequestPart("product") Product product,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {
        try {
            product.setId(0); // Ensure ID is not set for creation

            // Handle image upload
            if (imageFile != null && !imageFile.isEmpty()) {
                // Use optimized image upload with DETAIL quality (800x800)
                Map<String, String> uploadResult = cloudinaryService.uploadFile(
                        imageFile,
                        "ecommerce_products",
                        ImageType.DETAIL
                );
                product.setImageUrl(uploadResult.get("secure_url"));
                product.setImagePublicId(uploadResult.get("public_id"));
            } else {
                // If no image file is provided, set image fields to null
                // The client can choose to send an explicit imageUrl in the 'product' JSON part
                if (product.getImageUrl() == null || product.getImageUrl().isBlank()){
                    product.setImageUrl(null);
                    product.setImagePublicId(null);
                }
                LOGGER.info("No new image file provided for product creation. Using imageUrl from JSON if present, otherwise null.");
            }

            // Active field is primitive boolean, will have default value

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

    /**
     * Update an existing product
     * @param id Product ID
     * @param productDetails Updated product details
     * @param imageFile Optional new image file
     * @return Updated product or appropriate error status
     */
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

            // Update basic fields
            existingProduct.setName(productDetails.getName());
            existingProduct.setDescription(productDetails.getDescription());
            existingProduct.setPrice(productDetails.getPrice());

            // Update active status
            existingProduct.setActive(productDetails.isActive());

            // Handle image update
            if (imageFile != null && !imageFile.isEmpty()) {
                // Delete old image if exists
                if (existingProduct.getImagePublicId() != null && !existingProduct.getImagePublicId().isBlank()) {
                    LOGGER.info("Deleting old image (public_id: " + existingProduct.getImagePublicId() + ") before uploading new one.");
                    cloudinaryService.deleteFile(existingProduct.getImagePublicId());
                }

                // Upload new image with optimization
                Map<String, String> uploadResult = cloudinaryService.uploadFile(
                        imageFile,
                        "ecommerce_products",
                        ImageType.DETAIL
                );
                existingProduct.setImageUrl(uploadResult.get("secure_url"));
                existingProduct.setImagePublicId(uploadResult.get("public_id"));
            } else if (productDetails.getImageUrl() != null) {
                // Handle if imageUrl is explicitly provided in JSON
                if (productDetails.getImageUrl().isBlank()) {
                    // User wants to remove the image
                    if (existingProduct.getImagePublicId() != null && !existingProduct.getImagePublicId().isBlank()) {
                        LOGGER.info("Deleting old image (public_id: " + existingProduct.getImagePublicId() + ") as imageUrl is being cleared.");
                        cloudinaryService.deleteFile(existingProduct.getImagePublicId());
                    }
                    existingProduct.setImageUrl(null);
                    existingProduct.setImagePublicId(null);
                } else if (!productDetails.getImageUrl().equals(existingProduct.getImageUrl())) {
                    // User changed the imageUrl manually to a new URL
                    if (existingProduct.getImagePublicId() != null && !existingProduct.getImagePublicId().isBlank()) {
                        LOGGER.info("Deleting old image (public_id: " + existingProduct.getImagePublicId() + ") as imageUrl is being manually changed.");
                        cloudinaryService.deleteFile(existingProduct.getImagePublicId());
                    }
                    existingProduct.setImageUrl(productDetails.getImageUrl());
                    existingProduct.setImagePublicId(null); // New URL is not from our upload, so no public_id known to us
                }
            }
            // If no new imageFile and productDetails.imageUrl is null or same as existing, image fields remain unchanged

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

    /**
     * Delete a product
     * @param id Product ID to delete
     * @return 204 No Content if successful, appropriate error status otherwise
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable long id) {
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isEmpty()) {
            LOGGER.warning("Product not found for deletion with ID: " + id);
            return ResponseEntity.notFound().build();
        }

        Product productToDelete = productOptional.get();

        // Delete image from Cloudinary if exists
        if (productToDelete.getImagePublicId() != null && !productToDelete.getImagePublicId().isBlank()) {
            LOGGER.info("Deleting image (public_id: " + productToDelete.getImagePublicId() + ") from Cloudinary.");
            cloudinaryService.deleteFile(productToDelete.getImagePublicId());
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