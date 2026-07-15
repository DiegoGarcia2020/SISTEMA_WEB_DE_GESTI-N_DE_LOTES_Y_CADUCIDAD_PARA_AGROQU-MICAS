package org.uteq.sacpa.service.entidades.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.uteq.sacpa.dto.entidades.ProveedorRequestDTO;
import org.uteq.sacpa.entity.entidades.Proveedor;
import org.uteq.sacpa.repository.entidades.IProveedorRepository;
import org.uteq.sacpa.service.entidades.IProveedorService;

import java.util.List;

@Service
public class ProveedorServiceImpl implements IProveedorService {

    @Autowired
    private IProveedorRepository proveedorRepository;

    @Override
    public void crearProveedor(ProveedorRequestDTO dto) {
        proveedorRepository.crearProveedor(
                dto.getCorreo(),
                dto.getContrasena(),
                dto.getIdEstado(),
                dto.getRuc(),
                dto.getNombreRepresentante(),
                dto.getDireccion(),
                dto.getTelefonoEmpresa(),
                dto.getIdEmpresa(),
                dto.getIdCiudad()
        );
    }

    @Override
    public List<Proveedor> listarTodos() {
        return proveedorRepository.findAll();
    }

    @Override
    public void eliminarProveedor(Integer idUsuario) {
        proveedorRepository.eliminarProveedor(idUsuario);
    }
}
