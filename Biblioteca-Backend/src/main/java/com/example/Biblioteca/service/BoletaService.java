package com.example.Biblioteca.service;

import com.example.Biblioteca.entity.*;
import com.example.Biblioteca.repository.BoletaRepository;
import com.example.Biblioteca.repository.DetalleBoletaRepository;
import com.example.Biblioteca.repository.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class BoletaService {
    @Autowired
    private BoletaRepository boletaRepository;
    @Autowired
    private DetalleBoletaRepository detalleBoletaRepository;
    @Autowired
    private LibroRepository libroRepository;

    @Transactional
    public Boleta generarBoleta(Usuario usuario, Map<Long, Integer> items) {
        Boleta boleta = new Boleta();
        boleta.setUsuario(usuario);
        boleta.setFecha(LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;
        List<DetalleBoleta> detalles = new ArrayList<>();

        for (Map.Entry<Long, Integer> entry : items.entrySet()) {
            Long libroId = entry.getKey();
            int cantidad = entry.getValue();
            Libro libro = libroRepository.findById(libroId)
                    .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

            // validar stock simple
            if (libro.getStock() < cantidad) {
                throw new RuntimeException("Stock insuficiente para: " + libro.getNombre());
            }

            // descontar stock
            libro.setStock(libro.getStock() - cantidad);
            libroRepository.save(libro);

            DetalleBoleta detalle = new DetalleBoleta();
            detalle.setLibro(libro);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(libro.getPrecio());
            detalle.setBoleta(boleta);

            BigDecimal subtotal = libro.getPrecio().multiply(BigDecimal.valueOf(cantidad));
            total = total.add(subtotal);
            detalles.add(detalle);
        }

        boleta.setTotal(total);
        boleta.setDetalles(detalles);

        return boletaRepository.save(boleta);
    }
}