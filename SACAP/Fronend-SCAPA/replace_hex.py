import os
import re

css_files = [
    r"features\auth\login\login.component.css",
    r"features\supervisor\compras-crear\compras-crear.component.css",
    r"features\supervisor\proveedores\proveedor-list.component.css",
    r"features\supervisor\proveedores\proveedor-form\proveedor-form.component.css",
    r"features\supervisor\centro-aprobaciones\centro-aprobaciones.component.css",
    r"features\bodega\auditoria-qr\auditoria-qr.component.css",
    r"features\inventario\estructura-fisica\estructura-fisica.component.css",
    r"features\bodega\supervisor-dashboard\supervisor-dashboard.component.css",
    r"features\inventario\pre-registro-lote\pre-registro-lote.component.css"
]

base_dir = r"c:\ejemplos\Proyecto ABD\SISTEMA_WEB_DE_GESTI-N_DE_LOTES_Y_CADUCIDAD_PARA_AGROQU-MICAS\SACAP\Fronend-SCAPA\src\app"

hex_map = {
    # Whites/Backgrounds
    "#ffffff": "var(--c-bone-bg)",
    "#fff": "var(--c-bone-bg)",
    "#f9fafb": "var(--c-bone-bg)",
    "#f3f4f6": "var(--c-bone-bg)",
    # Borders
    "#e5e7eb": "var(--c-sage-border)",
    "#d1d5db": "var(--c-sage-border)",
    # Texts / Darks
    "#111827": "var(--c-warm-black)",
    "#1f2937": "var(--c-warm-black)",
    "#374151": "var(--c-warm-black)",
    "#000": "var(--c-warm-black)",
    "#000000": "var(--c-warm-black)",
    "#12261d": "var(--c-dark-green)",
    "#12261D": "var(--c-dark-green)",
    # Grays/Muted
    "#6b7280": "var(--c-local-text-muted)",
    "#9ca3af": "var(--c-local-text-muted)",
    "#666": "var(--c-local-text-muted)",
    "#666666": "var(--c-local-text-muted)",
    # Greens
    "#15803d": "var(--c-dark-green)",
    "#166534": "var(--c-local-green-hover)",
    "#14532d": "var(--c-mid-green)",
    "#dcfce7": "var(--c-local-green-light)",
    "#def7ec": "var(--c-local-green-light)",
    "#03543f": "var(--c-dark-green)",
    # Reds
    "#dc2626": "var(--c-error)",
    "#b93e3e": "var(--c-error)",
    "#ef4444": "var(--c-error)",
    "#9b1c1c": "var(--c-error)",
    "#fef2f2": "var(--c-local-error-light)",
    "#fde8e8": "var(--c-local-error-light)",
    # Oranges/Cacao
    "#8c472a": "var(--c-cacao-accent)",
    "#c77f3d": "var(--c-cacao-accent)",
    "#73361f": "var(--c-local-cacao-hover)",
}

local_vars = {
    "var(--c-local-text-muted)": "/* No encaja en paleta global: texto secundario */\n  --c-local-text-muted: #6b7280;",
    "var(--c-local-green-hover)": "/* No encaja en paleta global: verde hover */\n  --c-local-green-hover: #166534;",
    "var(--c-local-green-light)": "/* No encaja en paleta global: fondo claro success */\n  --c-local-green-light: #dcfce7;",
    "var(--c-local-error-light)": "/* No encaja en paleta global: fondo claro error */\n  --c-local-error-light: #fef2f2;",
    "var(--c-local-cacao-hover)": "/* No encaja en paleta global: variante hover del acento cacao */\n  --c-local-cacao-hover: #73361F;"
}

hex_regex = re.compile(r'#[0-9a-fA-F]{3,6}')

for rel_path in css_files:
    path = os.path.join(base_dir, rel_path)
    if not os.path.exists(path):
        print(f"File not found: {path}")
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    found_hexes = set(m.group(0).lower() for m in hex_regex.finditer(content))
    if not found_hexes:
        continue
        
    needed_locals = set()
    
    def replacer(match):
        h = match.group(0).lower()
        if len(h) == 4:
            h = f"#{h[1]}{h[1]}{h[2]}{h[2]}{h[3]}{h[3]}" # Expand short hex
            
        if h in hex_map:
            rep = hex_map[h]
            if "local" in rep:
                needed_locals.add(rep)
            return rep
        else:
            # Fallback for unknown hex
            var_name = f"var(--c-local-custom-{h[1:]})"
            needed_locals.add(var_name)
            local_vars[var_name] = f"/* Color no estandarizado en paleta */\n  --c-local-custom-{h[1:]}: {h};"
            return var_name

    new_content = hex_regex.sub(replacer, content)
    
    # Also replace raw variable declarations if they include a default hex
    # var(--something, #hex) -> var(--something)
    # The prompt actually allowed removing the fallback since it will be in :host
    
    if needed_locals:
        vars_str = "\n".join(local_vars[v] for v in needed_locals)
        host_block = f":host {{\n{vars_str}\n}}\n\n"
        new_content = host_block + new_content
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"Updated {rel_path}")
