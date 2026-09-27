package com.example.Biblioteca.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Usuario {

    public static final String AVATAR_DEFAULT =
            "https://www.nicepng.com/png/detail/115-1150821_default-avatar-comments-sign-in-icon-png.png";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // ✅ snake_case — coincide con la columna en Postgres
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @PrePersist
    public void prePersist() {
        if (this.avatarUrl == null || this.avatarUrl.isBlank()) {
            this.avatarUrl = AVATAR_DEFAULT;
        }
    }

    @PreUpdate
    public void preUpdate() {
        if (this.avatarUrl == null || this.avatarUrl.isBlank()) {
            this.avatarUrl = AVATAR_DEFAULT;
        }
    }
}