package com.example.Biblioteca.service;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.repository.LibroRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class CarritoService {

    private final Map<Long, Map<Long, Integer>> carritosPorUsuario = new HashMap<>();
    private final LibroRepository libroRepository;

    public CarritoService(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    public synchronized void agregar(Long usuarioId, Long libroId, int cantidad) {
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }

        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new IllegalArgumentException("Libro no encontrado con id: " + libroId));

        // Validación defensiva contra nulls en BD
        Integer stockActual = libro.getStock();
        if (stockActual == null) {
            stockActual = 0;
        }

        Map<Long, Integer> items = carritosPorUsuario.computeIfAbsent(usuarioId, ignored -> new LinkedHashMap<>());
        int cantidadActual = items.getOrDefault(libroId, 0);
        int nuevaCantidad = cantidadActual + cantidad;

        if (stockActual < nuevaCantidad) {
            throw new IllegalStateException(
                "Stock insuficiente para '" + libro.getNombre() + "'. Disponible: " + stockActual
            );
        }

        items.put(libroId, nuevaCantidad);
    }

    public synchronized void eliminar(Long usuarioId, Long libroId) {
        Map<Long, Integer> items = carritosPorUsuario.get(usuarioId);
        if (items != null) {
            items.remove(libroId);
            if (items.isEmpty()) {
                carritosPorUsuario.remove(usuarioId);
            }
        }
    }

    public synchronized void vaciar(Long usuarioId) {
        carritosPorUsuario.remove(usuarioId);
    }

    public synchronized Map<Long, Integer> getItems(Long usuarioId) {
        Map<Long, Integer> items = carritosPorUsuario.get(usuarioId);
        return items == null ? new LinkedHashMap<>() : new LinkedHashMap<>(items);
    }

    public synchronized int getCantidadTotal(Long usuarioId) {
        Map<Long, Integer> items = carritosPorUsuario.get(usuarioId);
        return items == null ? 0 : items.values().stream().mapToInt(Integer::intValue).sum();
    }

    public synchronized boolean estaVacio(Long usuarioId) {
        Map<Long, Integer> items = carritosPorUsuario.get(usuarioId);
        return items == null || items.isEmpty();
    }
}