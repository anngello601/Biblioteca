package com.example.Biblioteca.service;

import com.example.Biblioteca.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private static final long TOKEN_LIFETIME_MILLIS = 1000L * 60 * 60 * 2;

    @Value("${app.jwt.secret:}")
    private String secret;

    public String createToken(Usuario usuario) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(usuario.getId().toString())
                .claim("role", usuario.getRol())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(TOKEN_LIFETIME_MILLIS)))
                .signWith(signingKey())
                .compact();
    }

    public Long getUserId(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return Long.valueOf(claims.getSubject());
    }

    private SecretKey signingKey() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Configura JWT_SECRET en las variables de entorno del backend.");
        }

        try {
            byte[] keyBytes = Decoders.BASE64.decode(secret);
            if (keyBytes.length < 32) {
                throw new IllegalStateException("JWT_SECRET debe codificar al menos 32 bytes aleatorios en Base64.");
            }
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (io.jsonwebtoken.io.DecodingException e) {
            throw new IllegalStateException("JWT_SECRET debe ser una clave aleatoria codificada en Base64.", e);
        }
    }
}
