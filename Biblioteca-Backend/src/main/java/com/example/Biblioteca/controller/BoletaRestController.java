package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Boleta;
import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.service.BoletaService;
import com.example.Biblioteca.service.CarritoService;
import com.example.Biblioteca.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
public class BoletaRestController {

    private final BoletaService boletaService;
    private final CarritoService carritoService;
    private final UsuarioService usuarioService;

    public BoletaRestController(
            BoletaService boletaService,
            CarritoService carritoService,
            UsuarioService usuarioService) {
        this.boletaService = boletaService;
        this.carritoService = carritoService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarCompra(Authentication authentication) {
        Usuario usuario = usuarioService.obtenerPorEmail(authentication.getName());
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