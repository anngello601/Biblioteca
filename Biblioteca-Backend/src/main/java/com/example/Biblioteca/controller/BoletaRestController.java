package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Boleta;
import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.service.BoletaService;
import com.example.Biblioteca.service.CarritoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class BoletaRestController {

    private final BoletaService boletaService;
    private final CarritoService carritoService;

    public BoletaRestController(BoletaService boletaService, CarritoService carritoService) {
        this.boletaService = boletaService;
        this.carritoService = carritoService;
    }

    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarCompra(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Debes iniciar sesión");
        }
        if (carritoService.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("El carrito está vacío");
        }
        Boleta boleta = boletaService.generarBoleta(usuario, carritoService.getItems());
        carritoService.vaciar();
        return ResponseEntity.ok(boleta);
    }

    @GetMapping("/exito")
    public ResponseEntity<?> exito() {
        // Solo para confirmar que la compra fue exitosa
        return ResponseEntity.ok("Compra realizada con éxito");
    }
}