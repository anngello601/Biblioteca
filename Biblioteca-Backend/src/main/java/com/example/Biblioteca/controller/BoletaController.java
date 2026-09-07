package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.service.BoletaService;
import com.example.Biblioteca.service.CarritoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/checkout")
public class BoletaController {
    private final BoletaService boletaService;
    private final CarritoService carritoService;

    public BoletaController(BoletaService boletaService, CarritoService carritoService) {
        this.boletaService = boletaService;
        this.carritoService = carritoService;
    }

    @GetMapping
    public String mostrarCheckout() {
        return "boleta/confirmacion";
    }

    @PostMapping("/confirmar")
    public String confirmarCompra(HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null) {
            return "redirect:/usuario/login";
        }
        if (carritoService.getItems().isEmpty()) {
            return "redirect:/carrito";
        }
        boletaService.generarBoleta(usuario, carritoService.getItems());
        carritoService.vaciar();
        return "redirect:/boleta/exito";
    }

    @GetMapping("/exito")
    public String exito() {
        return "boleta/exito";
    }
}