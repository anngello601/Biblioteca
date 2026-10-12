package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.service.CarritoService;
import com.example.Biblioteca.service.LibroService;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> verCarrito(
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario usuario) {
        if (usuario == null) return noAutorizado();
        return ResponseEntity.ok(construirRespuesta(usuario.getId()));
    }

    @PostMapping("/agregar/{id}")
    public ResponseEntity<?> agregar(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int cantidad,
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario usuario) {
        if (usuario == null) return noAutorizado();
        try {
            carritoService.agregar(usuario.getId(), id, cantidad);
            return ResponseEntity.ok(construirRespuesta(usuario.getId()));
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
    public ResponseEntity<?> eliminar(
            @PathVariable Long id,
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario usuario) {
        if (usuario == null) return noAutorizado();
        carritoService.eliminar(usuario.getId(), id);
        return ResponseEntity.ok(construirRespuesta(usuario.getId()));
    }

    @DeleteMapping("/vaciar")
    public ResponseEntity<?> vaciar(
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario usuario) {
        if (usuario == null) return noAutorizado();
        carritoService.vaciar(usuario.getId());
        return ResponseEntity.ok(construirRespuesta(usuario.getId()));
    }

    @GetMapping("/cantidad")
    public ResponseEntity<?> cantidad(
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario usuario) {
        if (usuario == null) return noAutorizado();
        return ResponseEntity.ok(carritoService.getCantidadTotal(usuario.getId()));
    }

    private Map<String, Object> construirRespuesta(Long usuarioId) {
        Map<Long, Integer> items = carritoService.getItems(usuarioId);
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
        response.put("cantidadTotal", carritoService.getCantidadTotal(usuarioId));
        return response;
    }

    private ResponseEntity<Map<String, String>> noAutorizado() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Debes iniciar sesión para usar el carrito"));
    }
}