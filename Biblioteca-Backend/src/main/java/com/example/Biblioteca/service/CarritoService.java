package com.example.Biblioteca.service;

import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@SessionScope
public class CarritoService {
    private Map<Long, Integer> items = new LinkedHashMap<>();

    public void agregar(Long libroId, int cantidad) {
        items.put(libroId, items.getOrDefault(libroId, 0) + cantidad);
    }

    public void eliminar(Long libroId) {
        items.remove(libroId);
    }

    public void vaciar() {
        items.clear();
    }

    public Map<Long, Integer> getItems() {
        return items;
    }

    public int getCantidadTotal() {
        int total = 0;
        for (Integer cantidad : items.values()) {
            total += cantidad;
        }
        return total;
    }
}