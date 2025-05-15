package com.dom_cheung.ecommerce_store.security;

import com.dom_cheung.ecommerce_store.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final AuthService authService;

    @Autowired
    public JwtAuthenticationFilter(@Lazy AuthService authService) {
        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // 特别记录购物车API请求
        if (path.contains("/api/users/cart")) {
            System.out.println("\n=== CART API REQUEST RECEIVED ===");
            System.out.println("Method: " + method);
            System.out.println("URI: " + path);

            // 记录所有请求头，查看Authorization是否正确传递
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                System.out.println(headerName + ": " + request.getHeader(headerName));
            }
        }

        // Get Authorization header
        String authHeader = request.getHeader("Authorization");

        // 打印Authorization头信息（不要在生产环境中这样做）
        System.out.println("Authorization header: " +
                (authHeader != null ? (authHeader.startsWith("Bearer ") ? "Bearer token present" : authHeader) : "null"));

        // 如果不存在或不是Bearer令牌，直接继续过滤器链
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No Bearer token, continuing filter chain without authentication for path: " + path);
            filterChain.doFilter(request, response);
            return;
        }

        // 提取令牌
        String token = authHeader.substring(7);
        System.out.println("Token extracted, first 20 chars: " + (token.length() > 20 ? token.substring(0, 20) + "..." : token));

        try {
            // 验证令牌
            System.out.println("Attempting to validate token...");
            Map<String, Object> claims = authService.validateToken(token);
            System.out.println("Token validation successful!");

            // 获取用户名和角色
            String username = claims.get("sub").toString();
            List<String> roles = (List<String>) claims.get("roles");

            System.out.println("Token validated for user: " + username + " with roles: " + roles);

            // 检查认证上下文
            Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("Existing authentication: " + (existingAuth != null ?
                    existingAuth.getName() + ", authorities: " + existingAuth.getAuthorities() : "null"));

            // 创建认证对象
            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(username, null, authorities);

            // 设置认证上下文
            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("Authentication set in SecurityContextHolder");

        } catch (Exception e) {
            System.err.println("JWT validation failed: " + e.getMessage());
            e.printStackTrace();

            // 清除认证上下文，确保失败时没有残留的认证
            SecurityContextHolder.clearContext();
            System.out.println("Authentication context cleared due to validation failure");
        }

        // 检查过滤器处理后的认证状态
        Authentication finalAuth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Final authentication state: " + (finalAuth != null ?
                "Authenticated as " + finalAuth.getName() : "Not authenticated"));

        // 继续过滤器链
        filterChain.doFilter(request, response);
    }
}