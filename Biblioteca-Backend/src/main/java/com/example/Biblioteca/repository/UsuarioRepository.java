package com.example.Biblioteca.repository;

import com.example.Biblioteca.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Usuario findByEmail(String email);

    @Modifying
    @Query("update Usuario u set u.password = :password where u.id = :id")
    int actualizarPassword(@Param("id") Long id, @Param("password") String password);
}