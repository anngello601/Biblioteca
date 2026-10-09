package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Libro;
import com.example.Biblioteca.entity.Usuario;
import com.example.Biblioteca.service.LibroService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/libros")
public class LibroRestController {

    private final LibroService libroService;

    public LibroRestController(LibroService libroService) {
        this.libroService = libroService;
    }

    @GetMapping
    public Page<Libro> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "nombre"));

        if (search != null && !search.isEmpty()) {
            return libroService.buscar(search, pageable);
        }
        if (tipo != null && !tipo.isEmpty()) {
            return libroService.listarPorTipo(tipo, pageable);
        }
        return libroService.listarTodos(pageable);
    }

    @GetMapping("/mas-vendidos")
    public ResponseEntity<List<Libro>> masVendidos(
            @RequestParam(defaultValue = "8") int limite) {
        return ResponseEntity.ok(libroService.obtenerMasVendidos(limite));
    }

    @GetMapping("/{id}")
    public Libro obtener(@PathVariable Long id) {
        return libroService.obtenerPorId(id)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));
    }

    // Solo ADMIN
    @PostMapping
    public ResponseEntity<?> guardar(@Valid @RequestBody Libro libro, HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null || !"ADMIN".equals(usuario.getRol())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Solo administradores pueden crear libros"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(libroService.guardar(libro));
    }

    // Solo ADMIN
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id,
                                        @Valid @RequestBody Libro libro,
                                        HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null || !"ADMIN".equals(usuario.getRol())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Solo administradores pueden editar libros"));
        }
        libro.setId(id);
        return ResponseEntity.ok(libroService.guardar(libro));
    }

    // Solo ADMIN
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id, HttpSession session) {
        Usuario usuario = (Usuario) session.getAttribute("usuario");
        if (usuario == null || !"ADMIN".equals(usuario.getRol())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Solo administradores pueden eliminar libros"));
        }
        libroService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}