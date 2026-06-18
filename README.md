
# FinanzApp 💰 — El Poder del Dinero

Aplicación web de gestión de finanzas personales enfocada en ayudar a los usuarios a comprender, controlar y mejorar su comportamiento financiero a través de visualización de datos, automatización y experiencia de usuario intuitiva.

---

## 🚀 Propósito

FinanzApp nace con la idea de resolver un problema real:

> “No necesitas ganar más. Necesitas ver más.”

El sistema permite a los usuarios comprender cómo manejan su dinero, detectar problemas financieros y tomar decisiones informadas a través de indicadores claros y visuales.

---

## 🧩 Funcionalidades principales

- Gestión de ingresos y gastos
- Control de deudas con cuotas
- Dashboard financiero con métricas en tiempo real
- Visualización con gráficos interactivos
- Sistema de alertas (déficit y sobreendeudamiento)
- Gestión multi-perfil (hogar, negocio, pareja, etc.)
- Registro rápido de gastos (FAB “gasto hormiga”)
- Sistema de recordatorios con acciones ✓/✗
- Calculadora financiera (créditos y básica)
- Libreta de notas financieras

---

## 📤 Exportación e importación de datos

FinanzApp permite gestionar la información de forma portable y segura mediante:

- Exportación a Excel (.xlsx)
- Exportación a CSV
- Exportación a JSON (backup completo)
- Importación desde Excel
- Restauración de backups JSON

Esto permite al usuario respaldar, migrar y recuperar su información fácilmente.

---

## 🧠 Lógica de negocio

El sistema implementa reglas financieras reactivas basadas en el comportamiento del usuario:

- < 50% de ingresos comprometidos → estado positivo
- 50–79% → estado controlado
- ≥ 80% o déficit → alerta financiera

Estas reglas afectan el dashboard y la interacción visual del sistema.

---

## 🎭 Experiencia de usuario diferencial

### Mascotas dinámicas (Finn & Finna)

El sistema incorpora asistentes visuales que representan el estado financiero:

- `happy`
- `worried`
- `excited`
- `thinking`

Reaccionan en tiempo real según el estado financiero del usuario.

Esto convierte la información financiera en una experiencia más comprensible e intuitiva.

---

## 🎨 Diseño e identidad

- Sistema de temas dinámicos (13 temas)
- Variables CSS para personalización
- Diseño minimalista y enfocado en claridad
- Uso de iconografía en lugar de texto
- Feedback visual mediante estados y alertas sutiles

---

## 🛠️ Tecnologías utilizadas

### Frontend
- React
- Vite
- Tailwind CSS

### Backend / Servicios
- Firebase Authentication
- Firebase Firestore

### Otros
- PWA (Progressive Web App)
- Cloudflare Pages (deploy)

---

## 🏗️ Arquitectura del proyecto


src/
├── components/   → UI modular
├── context/      → estado global (Auth, Theme, Profile)
├── services/     → conexión con Firestore
├── utils/        → lógica financiera, exportación, notificaciones
├── hooks/        → persistencia local


### Principios aplicados

- Separación de responsabilidades
- Arquitectura basada en componentes reutilizables
- Lógica desacoplada
- Persistencia híbrida (Firestore + localStorage)


---

## 📸 Demo

### 🔐 Inicio de sesión
![Login](images/login.png)

### 👤 Selección de perfil
![Perfil](images/perfil.png)

### 📊 Dashboard financiero
![Dashboard](images/dashboard.png)

### 📥 Exportación e importación de datos
![Exportar](images/export.png)

---

## 📦 Instalación

```bash
npm install
npm run dev




