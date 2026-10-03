package com.example.Biblioteca.controller;

import com.example.Biblioteca.entity.Usuario;

public record LoginResponse(String token, Usuario usuario) {
}
