package com.example.Biblioteca.service;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.repository.LibroRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class LibroService {
    private LibroRepository libroRepository;

    public LibroService(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    public Page<Libro> listarTodos(Pageable pageable) {
        return libroRepository.findAll(pageable);
    }

    public Page<Libro> listarPorTipo(String tipo, Pageable pageable) {
        return libroRepository.findByTipo(tipo, pageable);
    }

    public Optional<Libro> obtenerPorId(Long id) {
        return libroRepository.findById(id);
    }

    public Libro guardar(Libro libro) {
        return libroRepository.save(libro);
    }

    public void eliminar(Long id) {
        libroRepository.deleteById(id);
    }
}