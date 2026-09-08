package com.example.Biblioteca.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "libros")
@Data
@NoArgsConstructor
public class Libro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String tipo;          // "DIGITAL" o "FISICO"
    private String editorial;
    private Integer anioPublicacion;
    private BigDecimal precio;
    private Integer stock;
    
    @Column(length = 500)
    private String portada;

    @Column(length = 255)
    private String autor;

    @Column(columnDefinition = "TEXT")  // 👈 NUEVO CAMPO
    private String descripcion;
}