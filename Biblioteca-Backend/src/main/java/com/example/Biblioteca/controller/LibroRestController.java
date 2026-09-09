package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.service.LibroService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class LibroRestController {

    private final LibroService libroService;

    public LibroRestController(LibroService libroService) {
        this.libroService = libroService;
    }

    // ✅ ÚNICO MÉTODO GET (Con el parámetro 'search' incluido)
    @GetMapping
    public Page<Libro> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String search) {

        System.out.println("🔍 Filtro tipo: " + tipo + " | Búsqueda: " + search);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "nombre"));

        // 1. Lógica de búsqueda por nombre o autor
        if (search != null && !search.isEmpty()) {
            return libroService.buscar(search, pageable);
        }
        // 2. Lógica de filtro por tipo
        if (tipo != null && !tipo.isEmpty()) {
            return libroService.listarPorTipo(tipo, pageable);
        }
        // 3. Listado normal
        return libroService.listarTodos(pageable);
    }

    @GetMapping("/{id}")
    public Libro obtener(@PathVariable Long id) {
        return libroService.obtenerPorId(id)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Libro guardar(@RequestBody Libro libro) {
        return libroService.guardar(libro);
    }

    @PutMapping("/{id}")
    public Libro actualizar(@PathVariable Long id, @RequestBody Libro libro) {
        libro.setId(id);
        return libroService.guardar(libro);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        libroService.eliminar(id);
    }
}