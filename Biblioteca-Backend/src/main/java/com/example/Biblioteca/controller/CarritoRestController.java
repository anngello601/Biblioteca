package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.service.CarritoService;
import com.example.Biblioteca.service.LibroService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class CarritoRestController {

    private final CarritoService carritoService;
    private final LibroService libroService;

    public CarritoRestController(CarritoService carritoService, LibroService libroService) {
        this.carritoService = carritoService;
        this.libroService = libroService;
    }

    @GetMapping
    public Map<String, Object> verCarrito() {
        Map<String, Object> response = new HashMap<>();
        Map<Long, Integer> items = carritoService.getItems();
        Map<Libro, Integer> detalle = new HashMap<>();
        double total = 0;
        for (Map.Entry<Long, Integer> entry : items.entrySet()) {
            Libro libro = libroService.obtenerPorId(entry.getKey()).orElse(null);
            if (libro != null) {
                detalle.put(libro, entry.getValue());
                total += libro.getPrecio().doubleValue() * entry.getValue();
            }
        }
        response.put("items", detalle);
        response.put("total", total);
        response.put("cantidadTotal", carritoService.getCantidadTotal());
        return response;
    }

    @PostMapping("/agregar/{id}")
    public void agregar(@PathVariable Long id, @RequestParam(defaultValue = "1") int cantidad) {
        carritoService.agregar(id, cantidad);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        carritoService.eliminar(id);
    }

    @DeleteMapping("/vaciar")
    public void vaciar() {
        carritoService.vaciar();
    }
}