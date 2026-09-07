package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.service.CarritoService;
import com.example.Biblioteca.service.LibroService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@Controller
@RequestMapping("/carrito")
public class CarritoController {
    private CarritoService carritoService;
    private LibroService libroService;

    public CarritoController(CarritoService carritoService, LibroService libroService) {
        this.carritoService = carritoService;
        this.libroService = libroService;
    }

    @GetMapping
    public String verCarrito(Model model) {
        Map<Long, Integer> items = carritoService.getItems();
        Map<Libro, Integer> detalle = new LinkedHashMap<>();
        double total = 0;
        for (Map.Entry<Long, Integer> entry : items.entrySet()) {
            Libro libro = libroService.obtenerPorId(entry.getKey()).orElse(null);
            if (libro != null) {
                detalle.put(libro, entry.getValue());
                total += libro.getPrecio().doubleValue() * entry.getValue();
            }
        }
        model.addAttribute("detalle", detalle);
        model.addAttribute("total", total);
        return "carrito/ver";
    }

    @PostMapping("/agregar/{id}")
    public String agregar(@PathVariable Long id, @RequestParam(defaultValue = "1") int cantidad) {
        carritoService.agregar(id, cantidad);
        return "redirect:/carrito";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id) {
        carritoService.eliminar(id);
        return "redirect:/carrito";
    }

    @GetMapping("/vaciar")
    public String vaciar() {
        carritoService.vaciar();
        return "redirect:/carrito";
    }
}