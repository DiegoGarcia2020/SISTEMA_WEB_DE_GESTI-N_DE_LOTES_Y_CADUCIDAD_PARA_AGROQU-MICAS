package org.uteq.sacpa.repository.inventario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.entity.inventario.Categoria;

public interface ICategoriaRepository extends JpaRepository<Categoria, Integer> {
    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_crear_categoria(:nombre)", nativeQuery = true)
    void crearCategoria(@Param("nombre") String nombre);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_actualizar_categoria(:idCategoria, :nuevoNombre)", nativeQuery = true)
    void actualizarCategoria(@Param("idCategoria") Integer idCategoria, @Param("nuevoNombre") String nuevoNombre);

    @Modifying @Transactional
    @Query(value = "SELECT inventario.fn_desactivar_categoria(:idCategoria)", nativeQuery = true)
    void desactivarCategoria(@Param("idCategoria") Integer idCategoria);
}
