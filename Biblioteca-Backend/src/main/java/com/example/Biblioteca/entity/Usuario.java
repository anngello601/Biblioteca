package com.example.Biblioteca.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(unique = true)
    private String email;
    private String password;
    private String avatarUrl = "https://i.ibb.co/nM8GvScD/pngwing-com.png";

    // Rol del usuario: "ADMIN" o "CLIENTE"
    @Column(nullable = false)
    private String rol = "CLIENTE";
}