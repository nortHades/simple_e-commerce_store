package com.dom_cheung.ecommerce_store.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;
import static org.springframework.security.config.Customizer.withDefaults;


// SecurityConfig.java - Step 1
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // --- Publicly accessible resources ---
                        .requestMatchers( // Allow static resources and public pages
                                "/",
                                "/index.html",
                                "/cart.html",
                                "/product.html", // Assuming product detail page is public
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/favicon.ico",
                                "/login" // Explicitly permit login page, though formLogin().permitAll() should also do this
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll() // Public product viewing APIs
                        // .requestMatchers("/api/auth/me").permitAll() // If you have this for auth status

                        // --- For now, all other requests need authentication ---
                        .anyRequest().authenticated()
                )
                .formLogin(formLogin ->
                        formLogin
                                .loginPage("/login") // Specify our login page URL
                                // No success handler yet, use default Spring behavior
                                .permitAll() // Ensure login page itself is permitted
                )
                .logout(logout -> // Add basic logout
                        logout
                                .logoutSuccessUrl("/login?logout")
                                .permitAll()
                );
        return http.build();
    }
}