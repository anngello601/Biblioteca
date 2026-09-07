package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.service.LibroService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/libros")
public class LibroController {
    private final LibroService libroService;

    public LibroController(LibroService libroService) {
        this.libroService = libroService;
    }

    @GetMapping
    public String listar(@RequestParam(required = false) String tipo, Model model) {
        if (tipo != null && !tipo.isEmpty()) {
            model.addAttribute("libros", libroService.listarPorTipo(tipo));
        } else {
            model.addAttribute("libros", libroService.listarTodos());
        }
        model.addAttribute("tipos", new String[]{"DIGITAL", "FISICO"});
        return "libros/listar";
    }

    @GetMapping("/nuevo")
    public String mostrarFormularioNuevo(Model model) {
        model.addAttribute("libro", new Libro());
        return "libros/formulario";
    }

    @PostMapping("/guardar")
    public String guardar(@ModelAttribute Libro libro) {
        libroService.guardar(libro);
        return "redirect:/libros";
    }

    @GetMapping("/editar/{id}")
    public String mostrarFormularioEditar(@PathVariable Long id, Model model) {
        model.addAttribute("libro", libroService.obtenerPorId(id).orElseThrow());
        return "libros/formulario";
    }

    @GetMapping("/eliminar/{id}")
    public String eliminar(@PathVariable Long id) {
        libroService.eliminar(id);
        return "redirect:/libros";
    }

    @GetMapping("/detalle/{id}")
    public String detalle(@PathVariable Long id, Model model) {
        model.addAttribute("libro", libroService.obtenerPorId(id).orElseThrow());
        return "libros/detalle";
    }
}