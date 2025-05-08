package com.dom_cheung.ecommerce_store.controller;

import java.util.*;
import com.dom_cheung.ecommerce_store.model.Product;
import com.dom_cheung.ecommerce_store.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;//get web
import org.springframework.http.*;


@RestController //default rest datatype is JSON
@RequestMapping("/api/products")//all the headers format

public class ProductController {
    @Autowired // generate entities of productRepository
    private ProductRepository productRepository;

    @GetMapping //deal with HTTP getting
    public List<Product> getAllProducts() {
        return productRepository.findAll();//return all the products in the productRepo
    }

    @PostMapping("/create") //<<< Annotation for handling HTTP POST requests to /api/products
    public ResponseEntity<Product> createProduct(@RequestBody Product product){
        //@RequestBody tells Spring to take the JSON sent in the request body
        // and automatically convert it into a Product object.
        System.out.println("====== METHOD CALLED: createProduct (ORIGINAL VERSION) ======");
        try
        {
            // The save() method returns the saved entity (possibly with generated ID)
            //insert into table products
            Product savedProduct = productRepository.save(product);
            //return the new response entity with saved product
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        }
        catch(Exception e)
        {
            System.err.println(e.getMessage());//error with creating products
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}") // <<< Annotation for handling GET requests to /api/products/{id}
    public ResponseEntity<Product> getProductById(@PathVariable long id) {
        // @PathVariable Long id take the data of Id
        System.out.println("====== METHOD CALLED: getProductById, ID: " + id + " ======");
        // Use the repository's findById() method. This returns an Optional<Product>.
        // Using Optional because the product might not exist.
        Optional<Product> productOp = productRepository.findById(id);

        //check the productOp
        if (productOp.isPresent()) {
            return new ResponseEntity<>(productOp.get(), HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}") // <<< Annotation for handling HTTP PUT requests to /api/products/{id}
    public ResponseEntity<Product> updateProduct(@PathVariable long id, @RequestBody Product product) {
        //The same with the get,check if the id exist
        Optional<Product> productOp = productRepository.findById(id);

        if (productOp.isPresent()) {
            Product existingProduct = productOp.get();//set the product to the return product from repo
            existingProduct.setName(product.getName());
            existingProduct.setDescription(product.getDescription());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setImageUrl(product.getImageUrl());
            //save the existingProduct to repo
            Product updatedProduct = productRepository.save(existingProduct);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}") // <<< Annotation for handling HTTP DELETE requests to /api/products/{id}
    public ResponseEntity<Product> deleteProduct(@PathVariable long id) {
        //get id from the request

        //get Optional obj of product by find
        Optional<Product> productOp = productRepository.findById(id);
        //check the existing of product with specific id
        if (productOp.isPresent()) {
            Product productDeleted = productOp.get();
            productRepository.delete(productOp.get());
            return new ResponseEntity<>(productDeleted, HttpStatus.OK);
        }
        else {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
}
