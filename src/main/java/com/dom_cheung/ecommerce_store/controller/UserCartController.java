package com.dom_cheung.ecommerce_store.controller;

import com.dom_cheung.ecommerce_store.model.CartItem;
import com.dom_cheung.ecommerce_store.model.User;
import com.dom_cheung.ecommerce_store.repository.UserRepository;
import com.dom_cheung.ecommerce_store.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserCartController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    // Get user's cart contents
    @GetMapping("/cart")
    public ResponseEntity<?> getUserCart(@RequestHeader("Authorization") String authHeader) {
        try {
            // Parse authentication header
            String token = authHeader.replace("Bearer ", "");
            Map<String, Object> claims = authService.validateToken(token);
            Long userId = Long.valueOf(claims.get("id").toString());

            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }

            User user = userOptional.get();
            return ResponseEntity.ok(user.getCartItems());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid token"));
        }
    }

    // Update user's cart contents
    @PostMapping("/cart")
    public ResponseEntity<?> updateUserCart(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, List<CartItem>> cartData) {

        try {
            // Parse authentication header
            String token = authHeader.replace("Bearer ", "");
            Map<String, Object> claims = authService.validateToken(token);
            Long userId = Long.valueOf(claims.get("id").toString());

            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }

            User user = userOptional.get();
            List<CartItem> items = cartData.get("items");

            if (items != null) {
                // Clear existing cart items and add new ones
                user.getCartItems().clear();
                user.getCartItems().addAll(items);
                userRepository.save(user);

                return ResponseEntity.ok(Map.of(
                        "message", "Cart updated successfully",
                        "items", user.getCartItems()
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid cart data"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid token"));
        }
    }
}