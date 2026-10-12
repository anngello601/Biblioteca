package com.example.Biblioteca.service;

import com.example.Biblioteca.entity.Usuario;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.SecureRandom;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JwtServiceTest {

    @Test
    void createdTokenContainsTheUserId() {
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);

        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", Base64.getEncoder().encodeToString(key));

        Usuario usuario = new Usuario();
        usuario.setId(42L);
        usuario.setRol("CLIENTE");

        String token = jwtService.createToken(usuario);

        assertEquals(42L, jwtService.getUserId(token));
    }
}
