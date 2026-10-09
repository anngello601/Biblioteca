package com.example.Biblioteca.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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

    @NotBlank(message = "El nombre del libro es obligatorio")
    @Size(max = 200, message = "El nombre no puede superar 200 caracteres")
    private String nombre;

    @NotBlank(message = "El tipo es obligatorio")
    @Pattern(regexp = "FISICO|DIGITAL", message = "El tipo debe ser FISICO o DIGITAL")
    private String tipo;

    @Size(max = 100, message = "La editorial no puede superar 100 caracteres")
    private String editorial;

    @Min(value = 0, message = "El año no puede ser negativo")
    @Max(value = 2100, message = "El año no es válido")
    private Integer anioPublicacion;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a 0")
    @Column(precision = 10, scale = 2)
    private BigDecimal precio;

    @NotNull(message = "El stock es obligatorio")
    @PositiveOrZero(message = "El stock no puede ser negativo")
    private Integer stock;

    @Size(max = 500, message = "La URL de portada no puede superar 500 caracteres")
    private String portada;

    @Size(max = 150, message = "El autor no puede superar 150 caracteres")
    private String autor;

    @Size(max = 2000, message = "La descripción no puede superar 2000 caracteres")
    @Column(length = 2000)
    private String descripcion;
}