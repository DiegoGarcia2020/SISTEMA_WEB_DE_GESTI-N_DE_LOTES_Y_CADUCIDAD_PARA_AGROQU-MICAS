const fs = require('fs');
const path = require('path');

const cssFiles = [
    "features/auth/login/login.component.css",
    "features/supervisor/compras-crear/compras-crear.component.css",
    "features/supervisor/proveedores/proveedor-list.component.css",
    "features/supervisor/proveedores/proveedor-form/proveedor-form.component.css",
    "features/supervisor/centro-aprobaciones/centro-aprobaciones.component.css",
    "features/bodega/auditoria-qr/auditoria-qr.component.css",
    "features/inventario/estructura-fisica/estructura-fisica.component.css",
    "features/bodega/supervisor-dashboard/supervisor-dashboard.component.css",
    "features/inventario/pre-registro-lote/pre-registro-lote.component.css"
];

const baseDir = path.join(__dirname, "src", "app");

const hexMap = {
    // Whites/Backgrounds
    "#ffffff": "var(--c-bone-bg)",
    "#fff": "var(--c-bone-bg)",
    "#f9fafb": "var(--c-bone-bg)",
    "#f3f4f6": "var(--c-bone-bg)",
    // Borders
    "#e5e7eb": "var(--c-sage-border)",
    "#d1d5db": "var(--c-sage-border)",
    // Texts / Darks
    "#111827": "var(--c-warm-black)",
    "#1f2937": "var(--c-warm-black)",
    "#374151": "var(--c-warm-black)",
    "#000": "var(--c-warm-black)",
    "#000000": "var(--c-warm-black)",
    "#12261d": "var(--c-dark-green)",
    // Grays/Muted
    "#6b7280": "var(--c-local-text-muted)",
    "#9ca3af": "var(--c-local-text-muted)",
    "#666": "var(--c-local-text-muted)",
    "#666666": "var(--c-local-text-muted)",
    // Greens
    "#15803d": "var(--c-dark-green)",
    "#166534": "var(--c-local-green-hover)",
    "#14532d": "var(--c-mid-green)",
    "#dcfce7": "var(--c-local-green-light)",
    "#def7ec": "var(--c-local-green-light)",
    "#03543f": "var(--c-dark-green)",
    // Reds
    "#dc2626": "var(--c-error)",
    "#b93e3e": "var(--c-error)",
    "#ef4444": "var(--c-error)",
    "#9b1c1c": "var(--c-error)",
    "#fef2f2": "var(--c-local-error-light)",
    "#fde8e8": "var(--c-local-error-light)",
    // Oranges/Cacao
    "#8c472a": "var(--c-cacao-accent)",
    "#c77f3d": "var(--c-cacao-accent)",
    "#73361f": "var(--c-local-cacao-hover)",
};

const localVars = {
    "var(--c-local-text-muted)": "/* No encaja en paleta global: texto secundario */\n  --c-local-text-muted: #6b7280;",
    "var(--c-local-green-hover)": "/* No encaja en paleta global: verde hover */\n  --c-local-green-hover: #166534;",
    "var(--c-local-green-light)": "/* No encaja en paleta global: fondo claro success */\n  --c-local-green-light: #dcfce7;",
    "var(--c-local-error-light)": "/* No encaja en paleta global: fondo claro error */\n  --c-local-error-light: #fef2f2;",
    "var(--c-local-cacao-hover)": "/* No encaja en paleta global: variante hover del acento cacao */\n  --c-local-cacao-hover: #73361F;"
};

const hexRegex = /#[0-9a-fA-F]{3,6}/g;

cssFiles.forEach(relPath => {
    const fullPath = path.join(baseDir, relPath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fallback variable syntax like var(--c-something, #123456)
    // Replaced entirely to var(--c-something) since we move variables to :host
    content = content.replace(/var\((--[a-zA-Z0-9-]+),\s*#[0-9a-fA-F]{3,6}\)/g, "var($1)");

    let neededLocals = new Set();
    
    content = content.replace(hexRegex, (match) => {
        let h = match.toLowerCase();
        if (h.length === 4) {
            h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
        }
        
        if (hexMap[h]) {
            let rep = hexMap[h];
            if (rep.includes("local")) {
                neededLocals.add(rep);
            }
            return rep;
        } else {
            let varName = `var(--c-local-custom-${h.slice(1)})`;
            neededLocals.add(varName);
            localVars[varName] = `/* Color no estandarizado en paleta */\n  --c-local-custom-${h.slice(1)}: ${h};`;
            return varName;
        }
    });

    if (neededLocals.size > 0) {
        let varsStr = Array.from(neededLocals).map(v => localVars[v]).join('\n');
        let hostBlock = `:host {\n${varsStr}\n}\n\n`;
        content = hostBlock + content;
    }

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${relPath}`);
});
