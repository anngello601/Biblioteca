package com.example.Biblioteca.service;

import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario registrar(Usuario usuario) {
    // Forzar rol válido
    String rol = usuario.getRol();
    if (!"ADMIN".equals(rol) && !"CLIENTE".equals(rol)) {
        usuario.setRol("CLIENTE");
    }

    // Verificar email duplicado
    if (usuarioRepository.findByEmail(usuario.getEmail()) != null) {
        throw new RuntimeException("El email ya está registrado");
    }

    // Hashear contraseña antes de guardar
    usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

    return usuarioRepository.save(usuario);
}

    public Usuario login(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email);
        if (usuario != null && passwordEncoder.matches(password, usuario.getPassword())) {
            return usuario;
        }
        return null;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public void actualizar(Usuario usuario) {
        usuarioRepository.save(usuario);
    }
}