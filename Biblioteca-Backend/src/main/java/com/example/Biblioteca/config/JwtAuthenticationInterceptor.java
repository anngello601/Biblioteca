package com.example.Biblioteca.config;

import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.repository.UsuarioRepository;
import com.example.Biblioteca.service.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
public class JwtAuthenticationInterceptor implements HandlerInterceptor {

    public static final String AUTHENTICATED_USER_ATTRIBUTE = "authenticatedUser";

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationInterceptor(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        String path = request.getRequestURI();
        if (path.equals("/api/auth/login") || path.equals("/api/auth/registro")) {
            return true;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || authorization.isBlank()) {
            return true;
        }
        if (!authorization.startsWith("Bearer ") || authorization.length() <= 7) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token de autenticación inválido");
            return false;
        }

        try {
            Long userId = jwtService.getUserId(authorization.substring(7));
            Usuario usuario = usuarioRepository.findById(userId).orElse(null);
            if (usuario == null) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "La cuenta del token ya no existe");
                return false;
            }
            request.setAttribute(AUTHENTICATED_USER_ATTRIBUTE, usuario);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token de autenticación inválido o vencido");
            return false;
        }
    }
}
