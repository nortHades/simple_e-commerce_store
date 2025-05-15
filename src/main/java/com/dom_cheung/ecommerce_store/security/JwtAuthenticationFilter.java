package com.dom_cheung.ecommerce_store.security;

import com.dom_cheung.ecommerce_store.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private AuthService authService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 添加日志记录请求信息
        System.out.println("JwtAuthenticationFilter processing request: " + request.getMethod() + " " + request.getRequestURI());

        // 获取Authorization头
        String authHeader = request.getHeader("Authorization");

        // 打印Authorization头信息（不要在生产环境中这样做）
        System.out.println("Authorization header: " +
                (authHeader != null ? (authHeader.startsWith("Bearer ") ? "Bearer token present" : authHeader) : "null"));

        // 如果不存在或不是Bearer令牌，直接继续过滤器链
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No Bearer token, continuing filter chain");
            filterChain.doFilter(request, response);
            return;
        }

        // 提取令牌
        String token = authHeader.substring(7);

        try {
            // 验证令牌
            Map<String, Object> claims = authService.validateToken(token);

            // 获取用户名和角色
            String username = claims.get("sub").toString();
            List<String> roles = (List<String>) claims.get("roles");

            System.out.println("Token validated for user: " + username + " with roles: " + roles);

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
        }

        // 继续过滤器链
        filterChain.doFilter(request, response);
    }
}