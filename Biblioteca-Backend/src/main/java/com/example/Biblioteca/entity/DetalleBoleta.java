package com.example.Biblioteca.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_boletas")
@Getter
@Setter
@NoArgsConstructor
public class DetalleBoleta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boleta_id")
    private Boleta boleta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "libro_id")
    private Libro libro;

    private Integer cantidad;

    @Column(precision = 10, scale = 2)
    private BigDecimal precioUnitario;
}