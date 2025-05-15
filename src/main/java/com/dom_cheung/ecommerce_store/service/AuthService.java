package com.dom_cheung.ecommerce_store.service;

import com.dom_cheung.ecommerce_store.model.User;
import com.dom_cheung.ecommerce_store.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Generate a key for signing JWT
    private final Key jwtSecretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // User authentication method
    public Map<String, Object> authenticateUser(String username, String password) {
        // Find the user
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty() || !passwordEncoder.matches(password, userOptional.get().getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        User user = userOptional.get();

        // Generate JWT token
        String token = generateJwtToken(user);

        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", user.getId());
        response.put("username", user.getUsername());

        return response;
    }

    // Generate JWT token
    private String generateJwtToken(User user) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date expiration = new Date(nowMillis + 86400000); // 24 hours expiration

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("id", user.getId())
                .claim("roles", user.getRoles())
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(jwtSecretKey)
                .compact();
    }

    // Parse and validate JWT token
    public Map<String, Object> validateToken(String token) {
        try {
            System.out.println("Validating token: " + token.substring(0, Math.min(10, token.length())) + "...");

            Map<String, Object> claims = Jwts.parserBuilder()
                    .setSigningKey(jwtSecretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            System.out.println("Token validation successful, claims: " + claims);
            return claims;
        } catch (Exception e) {
            System.err.println("Token validation failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Invalid JWT token: " + e.getMessage());
        }
    }
}