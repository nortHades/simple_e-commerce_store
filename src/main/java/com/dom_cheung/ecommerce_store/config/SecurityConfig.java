package com.dom_cheung.ecommerce_store.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler; // Inject custom success handler

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for simplicity in this project
                .authorizeHttpRequests(authz -> authz
                        // --- Publicly accessible resources ---
                        .requestMatchers(
                                "/", // Root path
                                "/index.html", // Main page
                                "/cart.html", // Cart page (viewing might be public)
                                "/product.html", // Product detail page (viewing might be public)
                                "/css/**", // All CSS files
                                "/js/**", // All JavaScript files
                                "/images/**", // All images in the images folder
                                "/favicon.ico" // Favicon
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll() // Public product APIs
                        .requestMatchers("/api/auth/me").permitAll() // Endpoint to get current auth status (if you implement it)


                        // --- Admin-only resources ---
                        // Secure all paths under /admin/, including HTML pages and APIs.
                        .requestMatchers("/admin/**").hasRole("ADMIN")


                        // --- All other requests must be authenticated ---
                        .anyRequest().authenticated()
                )
                // --- Form Login Configuration ---
                .formLogin(formLogin ->
                        formLogin
                                .loginPage("/login") // Specifies the URL of the login page (Spring provides a default if no custom page)
                                .successHandler(customAuthenticationSuccessHandler) // Use custom handler for redirection after login
                                .permitAll() // Allow everyone to access the login page itself
                )
                // --- Logout Configuration ---
                .logout(logout ->
                        logout
                                .logoutUrl("/logout") // The URL to trigger logout
                                .logoutSuccessUrl("/login?logout") // Redirect to login page with a "logout" query parameter after successful logout
                                .invalidateHttpSession(true) // Invalidate the HTTP session
                                .deleteCookies("JSESSIONID") // Delete JSESSIONID cookie (optional, but good practice)
                                .permitAll() // Allow everyone to trigger logout
                );

        return http.build();
    }
}