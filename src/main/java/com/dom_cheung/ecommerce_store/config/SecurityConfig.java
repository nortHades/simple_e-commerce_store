package com.dom_cheung.ecommerce_store.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

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
                .csrf(csrf -> csrf.disable()) // disabled csrf service
                .authorizeHttpRequests(authz -> authz
                        // for scanning products
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                        // client API
                        .requestMatchers("/api/users/**").permitAll() // for client register
                        // admin API
                        .requestMatchers(HttpMethod.POST, "/admin/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/admin/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/admin/products/**").hasRole("ADMIN")
                        // any other request for authentication
                        .anyRequest().authenticated()
                )
                .httpBasic(withDefaults()) // test using http
                .formLogin(withDefaults()); // form login

        return http.build();
    }
}