package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class UsuarioRestController {

    private static final String DEFAULT_AVATAR_URL =
            "https://www.nicepng.com/png/full/115-1150821_default-avatar-comments-sign-in-icon-png.png";

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String supabaseServiceKey;

    @Value("${supabase.bucket}")
    private String supabaseBucket;

    private final UsuarioService usuarioService;

    public UsuarioRestController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    private void asegurarAvatar(Usuario u) {
        if (u.getAvatarUrl() == null || u.getAvatarUrl().isBlank()) {
            u.setAvatarUrl(DEFAULT_AVATAR_URL);
        }
    }

    // ============ LOGIN ============
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpSession session) {
        Usuario usuario = usuarioService.login(request.getEmail(), request.getPassword());
        if (usuario != null) {
            asegurarAvatar(usuario);
            session.setAttribute("usuario", usuario);
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
    }

    // ============ REGISTRO ============
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Usuario usuario) {
        Usuario nuevo = usuarioService.registrar(usuario);
        asegurarAvatar(nuevo);
        return ResponseEntity.ok(nuevo);
    }

    // ============ LOGOUT ============
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }

    // ============ USUARIO ACTUAL ============
    @GetMapping("/usuario")
    public ResponseEntity<?> getUsuario(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario != null) {
            asegurarAvatar(usuario);
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // ============ LISTAR ============
    @GetMapping
    public List<Usuario> listarUsuarios() {
        List<Usuario> usuarios = usuarioService.listarTodos();
        usuarios.forEach(this::asegurarAvatar);
        return usuarios;
    }

    // ============ PERFIL ============
    @PutMapping(value = "/perfil", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> actualizarPerfil(
            @RequestParam("nombre") String nombre,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "avatarUrl", required = false) String avatarUrl,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            HttpSession session) {

        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autenticado");
        }

        if (nombre != null && !nombre.isBlank()) usuario.setNombre(nombre.trim());
        if (password != null && !password.isBlank()) usuario.setPassword(password);

        try {
            if (avatar != null && !avatar.isEmpty()) {
                usuario.setAvatarUrl(subirASupabase(avatar));
            } else if (avatarUrl != null && !avatarUrl.isBlank()) {
                usuario.setAvatarUrl(avatarUrl.trim());
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al subir la imagen: " + e.getMessage());
        }

        asegurarAvatar(usuario);
        usuarioService.actualizar(usuario);
        session.setAttribute("usuario", usuario);

        return ResponseEntity.ok(usuario);
    }

    // ============ SUBIR A SUPABASE ============
    private String subirASupabase(MultipartFile avatar) throws Exception {
        String extension = "";
        String original = avatar.getOriginalFilename();
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf(".")).toLowerCase();
        }
        String filename = UUID.randomUUID() + extension;

        String uploadUrl = supabaseUrl + "/storage/v1/object/" + supabaseBucket + "/" + filename;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseServiceKey);
        headers.setContentType(MediaType.parseMediaType(
                avatar.getContentType() != null ? avatar.getContentType() : "image/jpeg"));

        HttpEntity<byte[]> request = new HttpEntity<>(avatar.getBytes(), headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl, HttpMethod.POST, request, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Supabase Storage: " + response.getStatusCode()
                    + " - " + response.getBody());
        }

        return supabaseUrl + "/storage/v1/object/public/" + supabaseBucket + "/" + filename;
    }
}

// ============ DTO LOGIN ============
class LoginRequest {
    private String email;
    private String password;
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}