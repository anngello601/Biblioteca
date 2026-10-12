package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.service.UsuarioService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/usuarios")
public class AdminUsuarioRestController {

    private final UsuarioService usuarioService;

    public AdminUsuarioRestController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<?> listar(
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario administrador) {
        if (!esAdministrador(administrador)) {
            return respuestaNoAutorizada(administrador);
        }
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<?> crear(
            @Valid @RequestBody CrearUsuarioRequest request,
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario administrador) {
        if (!esAdministrador(administrador)) {
            return respuestaNoAutorizada(administrador);
        }
        Usuario creado = usuarioService.crearDesdeAdministracion(
                request.nombre(), request.email(), request.password(), request.rol());
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarUsuarioRequest request,
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario administrador) {
        if (!esAdministrador(administrador)) {
            return respuestaNoAutorizada(administrador);
        }
        return ResponseEntity.ok(usuarioService.actualizarDesdeAdministracion(
                id, request.nombre(), request.email(), request.password(), request.rol()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(
            @PathVariable Long id,
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario administrador) {
        if (!esAdministrador(administrador)) {
            return respuestaNoAutorizada(administrador);
        }
        if (administrador.getId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes eliminar tu propia cuenta"));
        }
        usuarioService.eliminarDesdeAdministracion(id);
        return ResponseEntity.noContent().build();
    }

    private boolean esAdministrador(Usuario usuario) {
        return usuario != null && "ADMIN".equals(usuario.getRol());
    }

    private ResponseEntity<Map<String, String>> respuestaNoAutorizada(Usuario usuario) {
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Debes iniciar sesión"));
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Solo administradores pueden gestionar usuarios"));
    }

    public record CrearUsuarioRequest(
            @NotBlank @Size(min = 2, max = 100) String nombre,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 100) String password,
            @NotBlank @Pattern(regexp = "ADMIN|CLIENTE") String rol) {}

    public record ActualizarUsuarioRequest(
            @NotBlank @Size(min = 2, max = 100) String nombre,
            @NotBlank @Email String email,
            @Size(min = 6, max = 100) String password,
            @NotBlank @Pattern(regexp = "ADMIN|CLIENTE") String rol) {}
}
