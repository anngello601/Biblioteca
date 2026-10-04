package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.service.UsuarioService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UsuarioRestController {

    private static final String DEFAULT_AVATAR_URL = "https://i.ibb.co/nM8GvScD/pngwing-com.png";

    private final UsuarioService usuarioService;

    public UsuarioRestController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    private void asegurarAvatar(Usuario usuario) {
        if (usuario.getAvatarUrl() == null || usuario.getAvatarUrl().isEmpty()) {
            usuario.setAvatarUrl(DEFAULT_AVATAR_URL);
        }
    }

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

    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Usuario usuario) {
        Usuario nuevo = usuarioService.registrar(usuario);
        asegurarAvatar(nuevo);
        return ResponseEntity.ok(nuevo);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/usuario")
    public ResponseEntity<?> getUsuario(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario != null) {
            asegurarAvatar(usuario);
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping
    public List<Usuario> listarUsuarios() {
        List<Usuario> usuarios = usuarioService.listarTodos();
        for (Usuario u : usuarios) {
            asegurarAvatar(u);
        }
        return usuarios;
    }

    @PutMapping("/perfil")
    public ResponseEntity<?> actualizarPerfil(
            @RequestParam("nombre") String nombre,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "avatarUrl", required = false) String avatarUrl,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar,
            HttpSession session) {

        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        usuario.setNombre(nombre);

        if (password != null && !password.isEmpty()) {
            usuario.setPassword(password);
        }

        // 🎯 LÓGICA DE AVATAR CON PRIORIDAD:
        // 1) Si hay archivo → subir a ImgBB y usar esa URL.
        // 2) Si no hay archivo pero sí avatarUrl → usar esa URL directamente.
        // 3) Si no hay ninguno → mantener la actual (no tocar).
        if (avatar != null && !avatar.isEmpty()) {
            try {
                byte[] bytes = avatar.getBytes();
                String base64Image = Base64.getEncoder().encodeToString(bytes);

                String apiKey = "ebdfcf611aff24c4ecbf9b0afe1e4154";
                String url = "https://api.imgbb.com/1/upload?key=" + apiKey + "&album=8zxhD0";

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);

                MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
                body.add("image", base64Image);

                HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

                RestTemplate restTemplate = new RestTemplate();
                ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                    String imageUrl = (String) data.get("url");
                    usuario.setAvatarUrl(imageUrl);
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Error al subir imagen a ImgBB");
                }

            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al procesar la imagen");
            }
        } else if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
            // ✅ FIX: actualizar la URL directamente si viene por texto
            usuario.setAvatarUrl(avatarUrl.trim());
        }
        // Si ninguno viene, se mantiene el avatar actual.

        usuarioService.actualizar(usuario);
        session.setAttribute("usuario", usuario);

        return ResponseEntity.ok(usuario);
    }
}

// Clase auxiliar para recibir credenciales
class LoginRequest {
    private String email;
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}