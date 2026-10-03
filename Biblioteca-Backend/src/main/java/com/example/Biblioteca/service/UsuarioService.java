package com.example.Biblioteca.service;

import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.repository.UsuarioRepository;

import java.util.List;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsPasswordService;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService implements UserDetailsService, UserDetailsPasswordService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario registrar(Usuario usuario) {
        if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria.");
        }
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new IllegalArgumentException("El correo ya está registrado.");
        }
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    // 👇 ESTA ES LA CORRECCIÓN: En lugar de lanzar error, guarda los cambios
    public void actualizar(Usuario usuario) {
        usuarioRepository.save(usuario);
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email);
        if (usuario == null) {
            throw new UsernameNotFoundException("Usuario no encontrado.");
        }
        return User.withUsername(usuario.getEmail())
                .password(usuario.getPassword())
                .authorities("ROLE_USER")
                .build();
    }

    @Override
    public UserDetails updatePassword(UserDetails user, String newPassword) {
        Usuario usuario = usuarioRepository.findByEmail(user.getUsername());
        if (usuario == null) {
            throw new UsernameNotFoundException("Usuario no encontrado.");
        }
        usuario.setPassword(newPassword);
        usuarioRepository.save(usuario);
        return User.withUserDetails(user).password(newPassword).build();
    }
}