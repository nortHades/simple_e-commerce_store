package com.dom_cheung.ecommerce_store.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component // Make it a Spring bean
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private RequestCache requestCache = new HttpSessionRequestCache();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        // Check if there was a request a user was trying to access before being sent to login page
        SavedRequest savedRequest = requestCache.getRequest(request, response);
        if (savedRequest != null) {
            // If there was a saved request, redirect to it (Spring Security's default behavior)
            // You might want to clear it after redirecting
            String targetUrl = savedRequest.getRedirectUrl();
            requestCache.removeRequest(request, response);
            response.sendRedirect(targetUrl);
            return;
        }

        // If no saved request, redirect based on role
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        boolean isAdmin = authorities.stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            response.sendRedirect("/admin/dashboard.html"); // Redirect admin to admin dashboard
        } else {
            response.sendRedirect("/index.html"); // Redirect regular user to home page
        }
    }
}