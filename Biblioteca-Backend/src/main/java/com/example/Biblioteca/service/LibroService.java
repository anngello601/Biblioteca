package com.example.Biblioteca.service;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.repository.DetalleBoletaRepository;
import com.example.Biblioteca.repository.LibroRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LibroService {

    private final LibroRepository libroRepository;
    private final DetalleBoletaRepository detalleBoletaRepository;

    public LibroService(LibroRepository libroRepository,
                        DetalleBoletaRepository detalleBoletaRepository) {
        this.libroRepository = libroRepository;
        this.detalleBoletaRepository = detalleBoletaRepository;
    }

    // ---- CRUD existente ----

    public Page<Libro> listarTodos(Pageable pageable) {
        return libroRepository.findAll(pageable);
    }

    public Page<Libro> listarPorTipo(String tipo, Pageable pageable) {
        return libroRepository.findByTipo(tipo, pageable);
    }

    public Page<Libro> buscar(String search, Pageable pageable) {
        return libroRepository.findByNombreContainingIgnoreCaseOrAutorContainingIgnoreCase(
                search, search, pageable
        );
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

    // ---- MÁS VENDIDOS ----

    public List<Libro> obtenerMasVendidos(int limite) {
        return detalleBoletaRepository.findLibrosMasVendidos(limite);
    }
}