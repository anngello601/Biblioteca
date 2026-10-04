package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.service.CarritoService;
import com.example.Biblioteca.service.LibroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
public class CarritoRestController {

    private final CarritoService carritoService;
    private final LibroService libroService;

    public CarritoRestController(CarritoService carritoService, LibroService libroService) {
        this.carritoService = carritoService;
        this.libroService = libroService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> verCarrito() {
        return ResponseEntity.ok(construirRespuesta());
    }

    @PostMapping("/agregar/{id}")
    public ResponseEntity<?> agregar(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int cantidad) {
        try {
            carritoService.agregar(id, cantidad);
            return ResponseEntity.ok(construirRespuesta());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Error interno: " + e.getClass().getSimpleName() + " - " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Long id) {
        carritoService.eliminar(id);
        return ResponseEntity.ok(construirRespuesta());
    }

    @DeleteMapping("/vaciar")
    public ResponseEntity<Map<String, Object>> vaciar() {
        carritoService.vaciar();
        return ResponseEntity.ok(construirRespuesta());
    }

    @GetMapping("/cantidad")
    public ResponseEntity<Integer> cantidad() {
        return ResponseEntity.ok(carritoService.getCantidadTotal());
    }

    private Map<String, Object> construirRespuesta() {
        Map<Long, Integer> items = carritoService.getItems();
        List<Map<String, Object>> detalles = new ArrayList<>();
        double total = 0;

        for (Map.Entry<Long, Integer> entry : items.entrySet()) {
            Libro libro = libroService.obtenerPorId(entry.getKey()).orElse(null);
            if (libro == null) continue;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("libroId", libro.getId());
            item.put("nombre", libro.getNombre());
            item.put("portada", libro.getPortada());
            item.put("precio", libro.getPrecio());
            item.put("cantidad", entry.getValue());
            item.put("subtotal", libro.getPrecio().doubleValue() * entry.getValue());
            detalles.add(item);

            total += libro.getPrecio().doubleValue() * entry.getValue();
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", detalles);
        response.put("total", total);
        response.put("cantidadTotal", carritoService.getCantidadTotal());
        return response;
    }
}