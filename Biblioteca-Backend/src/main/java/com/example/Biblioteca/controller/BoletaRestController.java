package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Boleta;
import com.example.Biblioteca.entity.DetalleBoleta;
import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.service.BoletaService;
import com.example.Biblioteca.service.CarritoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
public class BoletaRestController {

    private final BoletaService boletaService;
    private final CarritoService carritoService;

    public BoletaRestController(BoletaService boletaService, CarritoService carritoService) {
        this.boletaService = boletaService;
        this.carritoService = carritoService;
    }

    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarCompra(HttpSession session) {
        try {
            Usuario usuario = (Usuario) session.getAttribute("usuario");
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Debes iniciar sesión"));
            }
            if (carritoService.getItems().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El carrito está vacío"));
            }

            Boleta boleta = boletaService.generarBoleta(usuario, carritoService.getItems());
            carritoService.vaciar();

            // Devolver DTO simple en vez de la entidad (evita LazyInitializationException)
            return ResponseEntity.ok(construirBoletaDTO(boleta));

        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }

    @GetMapping("/exito")
    public ResponseEntity<?> exito() {
        return ResponseEntity.ok(Map.of("mensaje", "Compra realizada con éxito"));
    }

    // ---- Helper: convertir Boleta a DTO ----
    private Map<String, Object> construirBoletaDTO(Boleta boleta) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", boleta.getId());
        dto.put("fecha", boleta.getFecha());
        dto.put("total", boleta.getTotal());

        if (boleta.getUsuario() != null) {
            Map<String, Object> usuarioDTO = new LinkedHashMap<>();
            usuarioDTO.put("id", boleta.getUsuario().getId());
            usuarioDTO.put("nombre", boleta.getUsuario().getNombre());
            usuarioDTO.put("email", boleta.getUsuario().getEmail());
            dto.put("usuario", usuarioDTO);
        }

        if (boleta.getDetalles() != null) {
            List<Map<String, Object>> detallesDTO = new ArrayList<>();
            for (DetalleBoleta d : boleta.getDetalles()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", d.getId());
                item.put("cantidad", d.getCantidad());
                item.put("precioUnitario", d.getPrecioUnitario());
                if (d.getLibro() != null) {
                    item.put("libroId", d.getLibro().getId());
                    item.put("libroNombre", d.getLibro().getNombre());
                    item.put("libroPortada", d.getLibro().getPortada());
                }
                detallesDTO.add(item);
            }
            dto.put("detalles", detallesDTO);
        }

        return dto;
    }
}