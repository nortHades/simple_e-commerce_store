package com.dom_cheung.ecommerce_store.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    @Value("${CLOUDINARY_URL}") // read from railway
    private String cloudinaryUrl;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
            // if not configure the cloudinaryUrl throw an exception
            throw new IllegalStateException("CLOUDINARY_URL is not configured. " +
                    "Please ensure it is set in your .env file (for local development) " +
                    "or as an environment variable in your deployment environment (e.g., Railway).");
        }
        System.out.println("Initializing Cloudinary with URL: " + cloudinaryUrl); // Make sure the configuration
        return new Cloudinary(cloudinaryUrl);
    }
}