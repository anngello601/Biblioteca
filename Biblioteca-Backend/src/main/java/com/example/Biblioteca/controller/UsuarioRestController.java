package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.security.JwtService;
import com.example.Biblioteca.service.UsuarioService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/auth")
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
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public UsuarioRestController(
            UsuarioService usuarioService,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.usuarioService = usuarioService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    private void asegurarAvatar(Usuario u) {
        if (u.getAvatarUrl() == null || u.getAvatarUrl().isBlank()) {
            u.setAvatarUrl(DEFAULT_AVATAR_URL);
        }
    }

    // ============ LOGIN ============
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            Usuario usuario = usuarioService.obtenerPorEmail(authentication.getName());
            asegurarAvatar(usuario);
            String token = jwtService.generateToken((UserDetails) authentication.getPrincipal());
            return ResponseEntity.ok(new LoginResponse(token, usuario));
        } catch (BadCredentialsException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales inválidas");
        }
    }

    // ============ REGISTRO ============
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Usuario usuario) {
        try {
            Usuario nuevo = usuarioService.registrar(usuario);
            asegurarAvatar(nuevo);
            return ResponseEntity.ok(nuevo);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }

    // ============ LOGOUT ============
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok().build();
    }

    // ============ USUARIO ACTUAL ============
    @GetMapping("/usuario")
    public ResponseEntity<Usuario> getUsuario(Authentication authentication) {
        Usuario usuario = usuarioService.obtenerPorEmail(authentication.getName());
        asegurarAvatar(usuario);
        return ResponseEntity.ok(usuario);
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
            Authentication authentication) {

        Usuario usuario = usuarioService.obtenerPorEmail(authentication.getName());

        if (nombre != null && !nombre.isBlank()) usuario.setNombre(nombre.trim());
        if (password != null && !password.isBlank()) {
            usuario.setPassword(passwordEncoder.encode(password));
        }

        try {
            if (avatar != null && !avatar.isEmpty()) {
                usuario.setAvatarUrl(subirASupabase(avatar));
            } else if (avatarUrl != null && !avatarUrl.isBlank()) {
                usuario.setAvatarUrl(avatarUrl.trim());
            }
        } catch (Exception e) {
            // CAMBIO AQUÍ: Reemplazamos e.printStackTrace() por un log robusto
            log.error("Error al subir la imagen a Supabase: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al subir la imagen: " + e.getMessage());
        }

        asegurarAvatar(usuario);
        usuarioService.actualizar(usuario);

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