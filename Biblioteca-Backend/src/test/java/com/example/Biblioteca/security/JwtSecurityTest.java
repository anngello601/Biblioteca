package com.example.Biblioteca.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.*;

class JwtSecurityTest {

    private final LegacyAwarePasswordEncoder passwordEncoder = new LegacyAwarePasswordEncoder();

    @Test
    void encodesNewPasswordsAndRecognizesLegacyPasswordsForUpgrade() {
        String encoded = passwordEncoder.encode("new-password");

        assertNotEquals("new-password", encoded);
        assertTrue(passwordEncoder.matches("new-password", encoded));
        assertFalse(passwordEncoder.upgradeEncoding(encoded));
        assertTrue(passwordEncoder.matches("legacy-password", "legacy-password"));
        assertTrue(passwordEncoder.upgradeEncoding("legacy-password"));
    }

    @Test
    void validatesJwtSubjectAndSignature() {
        UserDetails user = User.withUsername("reader@example.com").password("unused").authorities("ROLE_USER").build();
        JwtService jwtService = new JwtService("a-private-signing-key-with-at-least-32-characters", 60_000);
        String token = jwtService.generateToken(user);

        assertEquals(user.getUsername(), jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, user));
        assertFalse(jwtService.isTokenValid(token, User.withUserDetails(user)
                .username("another@example.com").build()));
        assertFalse(new JwtService("a-different-private-signing-key-with-32-characters", 60_000)
                .isTokenValid(token, user));
    }

    @Test
    void rejectsSigningKeysShorterThan256Bits() {
        assertThrows(IllegalArgumentException.class, () -> new JwtService("too-short", 60_000));
    }
}
