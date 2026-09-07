package com.example.Biblioteca.repository;

import com.example.Biblioteca.entity.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LibroRepository extends JpaRepository<Libro, Long> {
    List<Libro> findByTipo(String tipo);
}