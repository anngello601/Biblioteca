package com.example.Biblioteca.service;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.repository.LibroRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@SessionScope
public class CarritoService {

    private final Map<Long, Integer> items = new LinkedHashMap<>();
    private final LibroRepository libroRepository;

    public CarritoService(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    public void agregar(Long libroId, int cantidad) {
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

        int cantidadActual = items.getOrDefault(libroId, 0);
        int nuevaCantidad = cantidadActual + cantidad;

        if (stockActual < nuevaCantidad) {
            throw new IllegalStateException(
                "Stock insuficiente para '" + libro.getNombre() + "'. Disponible: " + stockActual
            );
        }

        items.put(libroId, nuevaCantidad);
    }

    public void eliminar(Long libroId) {
        items.remove(libroId);
    }

    public void vaciar() {
        items.clear();
    }

    public Map<Long, Integer> getItems() {
        return new LinkedHashMap<>(items);
    }

    public int getCantidadTotal() {
        return items.values().stream().mapToInt(Integer::intValue).sum();
    }

    public boolean estaVacio() {
        return items.isEmpty();
    }
}