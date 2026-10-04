package com.example.Biblioteca.repository;

import com.example.Biblioteca.entity.DetalleBoleta;
import com.example.Biblioteca.entity.Libro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DetalleBoletaRepository extends JpaRepository<DetalleBoleta, Long> {

    @Query(value = """
        SELECT l.* FROM libros l
        INNER JOIN detalle_boletas d ON d.libro_id = l.id
        GROUP BY l.id
        ORDER BY SUM(d.cantidad) DESC
        LIMIT :limite
        """, nativeQuery = true)
    List<Libro> findLibrosMasVendidos(@Param("limite") int limite);
}