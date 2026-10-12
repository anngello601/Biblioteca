package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.service.SupabaseStorageService;
import com.example.Biblioteca.service.JwtService;
import com.example.Biblioteca.service.UsuarioService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class UsuarioRestController {

    private static final String DEFAULT_AVATAR_URL = "/avatar-placeholder.svg";

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final SupabaseStorageService supabaseStorageService;
    private final JwtService jwtService;

    public UsuarioRestController(UsuarioService usuarioService,
                                 PasswordEncoder passwordEncoder,
                                 SupabaseStorageService supabaseStorageService,
                                 JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.supabaseStorageService = supabaseStorageService;
        this.jwtService = jwtService;
    }

    private void asegurarAvatar(Usuario usuario) {
        if (usuario.getAvatarUrl() == null || usuario.getAvatarUrl().isEmpty()) {
            usuario.setAvatarUrl(DEFAULT_AVATAR_URL);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Usuario usuario = usuarioService.login(request.getEmail(), request.getPassword());
        if (usuario != null) {
            asegurarAvatar(usuario);
            return ResponseEntity.ok(new LoginResponse(jwtService.createToken(usuario), usuario));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
    }

    @PostMapping("/registro")

    public ResponseEntity<?> registro(@Valid @RequestBody Usuario usuario) {
    Usuario nuevo = usuarioService.registrar(usuario);
    asegurarAvatar(nuevo);
    return ResponseEntity.ok(nuevo);
    }
 

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/usuario")
    public ResponseEntity<?> getUsuario(
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario usuario) {
        if (usuario != null) {
            asegurarAvatar(usuario);
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping
    public ResponseEntity<?> listarUsuarios(
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario usuario) {
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!"ADMIN".equals(usuario.getRol())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<Usuario> usuarios = usuarioService.listarTodos();
        for (Usuario u : usuarios) {
            asegurarAvatar(u);
        }
        return ResponseEntity.ok(usuarios);
    }

    @PutMapping("/perfil")
    public ResponseEntity<?> actualizarPerfil(
            @RequestParam("nombre") String nombre,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "avatarUrl", required = false) String avatarUrl,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar,
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario usuario) {

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        usuario.setNombre(nombre);

        //Hashear nueva contraseña si viene
        if (password != null && !password.isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(password));
        }

        // Lógica de avatar: archivo > URL > mantener actual
        if (avatar != null && !avatar.isEmpty()) {
            try {
                usuario.setAvatarUrl(supabaseStorageService.uploadAvatar(avatar));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(e.getMessage());
            } catch (IllegalStateException e) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
            } catch (IOException | org.springframework.web.client.RestClientException e) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("No se pudo subir la imagen a Supabase Storage");
            }
        } else if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
            usuario.setAvatarUrl(avatarUrl.trim());
        }
        usuarioService.actualizar(usuario);

        return ResponseEntity.ok(usuario);
    }
}

record LoginResponse(String token, Usuario usuario) {}

// Clase auxiliar para recibir credenciales
class LoginRequest {
    private String email;
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}