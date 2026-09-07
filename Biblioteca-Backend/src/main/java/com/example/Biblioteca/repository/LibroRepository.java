package com.example.Biblioteca.repository;

import com.example.Biblioteca.entity.Libro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LibroRepository extends JpaRepository<Libro, Long> {
    Page<Libro> findByTipo(String tipo, Pageable pageable);
}