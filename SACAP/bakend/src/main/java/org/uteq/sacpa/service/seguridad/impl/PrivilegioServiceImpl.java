package org.uteq.sacpa.service.seguridad.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.uteq.sacpa.dto.seguridad.EsquemaPrivilegiosDTO;
import org.uteq.sacpa.dto.seguridad.TablaPrivilegiosDTO;
import org.uteq.sacpa.entity.seguridad.Privilegio;
import org.uteq.sacpa.entity.seguridad.Rol;
import org.uteq.sacpa.entity.seguridad.RolPrivilegio;
import org.uteq.sacpa.entity.seguridad.TipoObjetoSeguridad;
import org.uteq.sacpa.repository.seguridad.IPrivilegioRepository;
import org.uteq.sacpa.repository.seguridad.IRolPrivilegioRepository;
import org.uteq.sacpa.repository.seguridad.IRolRepository;
import org.uteq.sacpa.repository.seguridad.ITipoObjetoSeguridadRepository;
import org.uteq.sacpa.service.seguridad.IPrivilegioService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrivilegioServiceImpl implements IPrivilegioService {

    private final IPrivilegioRepository privilegioRepository;
    private final ITipoObjetoSeguridadRepository tipoObjetoRepository;
    private final IRolPrivilegioRepository rolPrivilegioRepository;
    private final IRolRepository rolRepository;

    @Override
    public List<Privilegio> listarPrivilegios() {
        return privilegioRepository.findAll();
    }

    @Override
    public List<EsquemaPrivilegiosDTO> listarPrivilegiosAgrupados() {
        List<Privilegio> todos = privilegioRepository.findAll();
        Map<String, Map<String, List<Privilegio>>> map = todos.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getEsquema() != null && !p.getEsquema().trim().isEmpty() ? p.getEsquema() : "general",
                        Collectors.groupingBy(p -> p.getNombreTabla() != null && !p.getNombreTabla().trim().isEmpty() ? p.getNombreTabla() : "sistema")
                ));

        return map.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(esquemaEntry -> EsquemaPrivilegiosDTO.builder()
                        .esquema(esquemaEntry.getKey())
                        .tablas(esquemaEntry.getValue().entrySet().stream()
                                .sorted(Map.Entry.comparingByKey())
                                .map(tablaEntry -> TablaPrivilegiosDTO.builder()
                                        .nombreTabla(tablaEntry.getKey())
                                        .privilegios(tablaEntry.getValue())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Privilegio crearPrivilegio(Map<String, Object> datos) {
        String nombre = (String) datos.get("nombre");
        String accion = (String) datos.get("accion");
        Boolean activo = datos.get("activo") != null ? (Boolean) datos.get("activo") : true;
        Integer idTipoObjeto = datos.get("idTipoObjeto") != null ? ((Number) datos.get("idTipoObjeto")).intValue() : null;
        String esquema = datos.get("esquema") != null ? (String) datos.get("esquema") : (String) datos.get("nombre_esquema");
        String nombreTabla = datos.get("nombreTabla") != null ? (String) datos.get("nombreTabla") : (String) datos.get("nombre_tabla");

        TipoObjetoSeguridad tipoObjeto = null;
        if (idTipoObjeto != null) {
            tipoObjeto = tipoObjetoRepository.findById(idTipoObjeto).orElse(null);
        }

        Privilegio priv = Privilegio.builder()
                .nombre(nombre)
                .accion(accion)
                .activo(activo)
                .tipoObjeto(tipoObjeto)
                .esquema(esquema != null ? esquema : "general")
                .nombreTabla(nombreTabla != null ? nombreTabla : "sistema")
                .build();
        return privilegioRepository.save(priv);
    }

    @Override
    @Transactional
    public Privilegio actualizarPrivilegio(Integer id, Map<String, Object> datos) {
        Privilegio priv = privilegioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Privilegio no encontrado: " + id));
        if (datos.containsKey("nombre")) priv.setNombre((String) datos.get("nombre"));
        if (datos.containsKey("accion")) priv.setAccion((String) datos.get("accion"));
        if (datos.containsKey("activo")) priv.setActivo((Boolean) datos.get("activo"));
        if (datos.containsKey("esquema")) priv.setEsquema((String) datos.get("esquema"));
        if (datos.containsKey("nombreTabla")) priv.setNombreTabla((String) datos.get("nombreTabla"));
        if (datos.containsKey("nombre_tabla")) priv.setNombreTabla((String) datos.get("nombre_tabla"));
        if (datos.containsKey("idTipoObjeto")) {
            Integer idTipo = ((Number) datos.get("idTipoObjeto")).intValue();
            priv.setTipoObjeto(tipoObjetoRepository.findById(idTipo).orElse(null));
        }
        return privilegioRepository.save(priv);
    }

    @Override
    @Transactional
    public void desactivarPrivilegio(Integer id) {
        Privilegio priv = privilegioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Privilegio no encontrado: " + id));
        priv.setActivo(false);
        privilegioRepository.save(priv);
    }

    @Override
    public List<TipoObjetoSeguridad> listarTiposObjeto() {
        return tipoObjetoRepository.findAll();
    }

    @Override
    @Transactional
    public TipoObjetoSeguridad crearTipoObjeto(Map<String, Object> datos) {
        String nombre = (String) datos.get("nombre");
        String descripcion = (String) datos.get("descripcion");
        Boolean activo = datos.get("activo") != null ? (Boolean) datos.get("activo") : true;

        TipoObjetoSeguridad tipo = TipoObjetoSeguridad.builder()
                .nombre(nombre)
                .descripcion(descripcion)
                .activo(activo)
                .build();
        return tipoObjetoRepository.save(tipo);
    }

    @Override
    public List<RolPrivilegio> listarPrivilegiosPorRol(Integer idRol) {
        return rolPrivilegioRepository.findByRol_IdRol(idRol);
    }

    @Override
    @Transactional
    public void asignarPrivilegiosARol(Integer idRol, List<Integer> idPrivilegios) {
        Rol rol = rolRepository.findById(idRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + idRol));
        
        rolPrivilegioRepository.deleteByRol_IdRol(idRol);
        
        List<RolPrivilegio> nuevos = new ArrayList<>();
        for (Integer idPriv : idPrivilegios) {
            Privilegio priv = privilegioRepository.findById(idPriv).orElse(null);
            if (priv != null) {
                nuevos.add(RolPrivilegio.builder().rol(rol).privilegio(priv).build());
            }
        }
        rolPrivilegioRepository.saveAll(nuevos);
    }
}
