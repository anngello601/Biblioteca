package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.service.CarritoService;
import com.example.Biblioteca.service.LibroService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.UUID;

@RestController
@RequestMapping("/api/checkout")
public class BoletaRestController {

    private static final String METODO_PAGO_DEMO = "TARJETA_VISA_BCP_DEMO";
    private final CarritoService carritoService;
    private final LibroService libroService;

    public BoletaRestController(CarritoService carritoService, LibroService libroService) {
        this.carritoService = carritoService;
        this.libroService = libroService;
    }

    @PostMapping("/simular")
    public ResponseEntity<?> simularPago(
            @RequestParam String metodoPago,
            @RequestAttribute(name = "authenticatedUser", required = false) Usuario usuario) {
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Debes iniciar sesión"));
        }
        if (!METODO_PAGO_DEMO.equals(metodoPago)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Método de pago de demostración no válido"));
        }

        Map<Long, Integer> itemsCarrito = carritoService.getItems(usuario.getId());
        if (itemsCarrito.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El carrito está vacío"));
        }

        BigDecimal total = BigDecimal.ZERO;
        List<Map<String, Object>> detalles = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : itemsCarrito.entrySet()) {
            Libro libro = libroService.obtenerPorId(entry.getKey())
                    .orElseThrow(() -> new IllegalArgumentException("Libro no encontrado"));
            int cantidad = entry.getValue();
            int stock = libro.getStock() == null ? 0 : libro.getStock();
            if (cantidad <= 0 || stock < cantidad) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Stock insuficiente para: " + libro.getNombre()));
            }
            BigDecimal subtotal = libro.getPrecio().multiply(BigDecimal.valueOf(cantidad));
            total = total.add(subtotal);

            Map<String, Object> detalle = new LinkedHashMap<>();
            detalle.put("nombre", libro.getNombre());
            detalle.put("autor", libro.getAutor());
            detalle.put("cantidad", cantidad);
            detalle.put("precioUnitario", libro.getPrecio());
            detalle.put("subtotal", subtotal);
            detalles.add(detalle);
        }

        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", "DEMO-" + UUID.randomUUID());
        dto.put("fecha", OffsetDateTime.now(ZoneId.of("America/Lima")));
        dto.put("total", total);
        dto.put("metodoPago", "Tarjeta Visa BCP (demostración)");
        dto.put("estadoPago", "DEMO_NO_REAL");
        dto.put("empresa", Map.of(
                "nombre", "NovaBook",
                "rucDemo", "DEMO-" + ThreadLocalRandom.current()
                        .nextLong(10_000_000_000L, 100_000_000_000L)
        ));
        dto.put("comprador", Map.of(
                "nombre", usuario.getNombre(),
                "email", usuario.getEmail()
        ));
        dto.put("detalles", detalles);
        return ResponseEntity.ok(dto);
    }
}