# FinanzApp — El Poder del Dinero v2.0

## Instalación

```bash
npm install
npm run dev
```

## Selector de Temas

Esta versión incluye 13 temas estilo VS Code:

**Oscuros:** Dark Modern, One Dark Pro, Dracula, Night Owl, Tokyo Night, Monokai, Solarized Dark, Gruvbox Dark  
**Claros:** Light Modern, GitHub Light, Solarized Light  
**Alto Contraste:** HC Oscuro, HC Claro

El selector aparece:
- **Desktop:** esquina inferior del sidebar (ícono 🎨)
- **Móvil:** dentro del menú "Más"

El tema se guarda automáticamente en `localStorage`.

## Archivos modificados vs originales

| Archivo | Estado |
|---|---|
| `src/App.jsx` | ✏️ Modificado — usa ThemeProvider |
| `src/index.css` | ✏️ Modificado — CSS variables para temas |
| `src/components/Layout.jsx` | ✏️ Modificado — sidebar temático, ThemePicker integrado |
| `src/context/ThemeContext.jsx` | 🆕 Nuevo — 13 temas, contexto React |
| `src/components/ThemePicker.jsx` | 🆕 Nuevo — selector estilo VS Code |
| Resto de componentes | ✅ Sin cambios |
