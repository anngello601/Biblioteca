package com.example.Biblioteca.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_boletas")
@Data
@NoArgsConstructor
public class DetalleBoleta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "boleta_id")
    private Boleta boleta;

    @ManyToOne
    @JoinColumn(name = "libro_id")
    private Libro libro;

    private Integer cantidad;

    @Column(precision = 10, scale = 2)
    private BigDecimal precioUnitario;
}