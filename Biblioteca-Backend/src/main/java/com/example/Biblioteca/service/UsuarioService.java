package com.example.Biblioteca.service;

import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.repository.BoletaRepository;
import com.example.Biblioteca.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BoletaRepository boletaRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          BoletaRepository boletaRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.boletaRepository = boletaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario registrar(Usuario usuario) {
    // El registro público no puede asignar privilegios administrativos.
    usuario.setRol("CLIENTE");

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

    public Usuario crearDesdeAdministracion(String nombre, String email, String password, String rol) {
        if (usuarioRepository.findByEmail(email) != null) {
            throw new RuntimeException("El email ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(password));
        usuario.setRol(rol);
        return usuarioRepository.save(usuario);
    }

    public Usuario actualizarDesdeAdministracion(
            Long id, String nombre, String email, String password, String rol) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Usuario usuarioConEmail = usuarioRepository.findByEmail(email);
        if (usuarioConEmail != null && !usuarioConEmail.getId().equals(id)) {
            throw new RuntimeException("El email ya está registrado");
        }

        usuario.setNombre(nombre);
        usuario.setEmail(email);
        usuario.setRol(rol);
        if (password != null && !password.isBlank()) {
            usuario.setPassword(passwordEncoder.encode(password));
        }
        return usuarioRepository.save(usuario);
    }

    public void eliminarDesdeAdministracion(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        if (boletaRepository.existsByUsuarioId(id)) {
            throw new RuntimeException("No se puede eliminar un usuario que tiene compras registradas");
        }
        usuarioRepository.deleteById(id);
    }
}