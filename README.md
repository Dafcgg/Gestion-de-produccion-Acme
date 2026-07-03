# Gestión de Producción - ACME

---

# Autor

**Nombre:** Dilan Fonseca

**Proyecto:** Gestión de Producción ACME

**Tecnologías:** HTML, CSS, JavaScript y Firebase.

---
## Descripción del Proyecto

La empresa **ACME**, ubicada en la ciudad de **Macondo**, requiere automatizar el proceso de producción de su planta con el objetivo de mejorar el control de usuarios, el manejo del inventario y la fabricación de productos terminados.

La aplicación desarrollada permite administrar el proceso productivo mediante un sistema web construido con **HTML, CSS y JavaScript**, utilizando **Firebase Realtime Database** como base de datos.

---

#  Objetivo General

Desarrollar una aplicación web que permita gestionar de forma eficiente el proceso de producción de la empresa ACME, garantizando el control de usuarios, inventario y producción mediante una interfaz moderna, intuitiva y responsive.

---

# 🎯 Objetivos Específicos

- Implementar un sistema seguro de autenticación mediante Login.
- Gestionar usuarios del sistema mediante operaciones CRUD.
- Administrar el inventario de materias primas y productos terminados.
- Registrar procesos de producción disminuyendo automáticamente las materias primas utilizadas.
- Actualizar automáticamente el inventario de productos fabricados.
- Aplicar buenas prácticas de programación utilizando JavaScript.

---

# Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript (ES6)
- Firebase Realtime Database
- Git
- GitHub

---

# 📂 Estructura del Proyecto

```

│
├── login.html
├── usuarios.html
├── inventario.html
├── produccion.html
│
├── css/
│   styles.css
│
├── auth-usuarios.js
├── inventario.js
│
├── README.md

```

---

# 🔐 Módulo Login

Permite el acceso al sistema mediante autenticación.

### Funcionalidades

- Inicio de sesión mediante:
  - Número de identificación
  - Contraseña
- Validación de credenciales almacenadas en Firebase.
- Mensajes de error cuando las credenciales son incorrectas.
- Redirección al sistema una vez autenticado.

---

# 👥 Módulo Usuarios

Permite administrar los usuarios registrados.

### Funcionalidades

- Registrar usuarios.
- Editar usuarios.
- Eliminar usuarios.
- Consultar usuarios registrados.

### Datos registrados

- Número de identificación
- Nombre completo
- Cargo
- Contraseña

### Validaciones

- Todos los campos son obligatorios.
- Confirmación de contraseña.
- No permite números de identificación repetidos.
- No permite nombres duplicados.
- Permite editar el mismo usuario sin generar conflictos.

---

# 📦 Módulo Inventario

Permite controlar el inventario de materias primas y productos terminados.

### Funcionalidades

- Registrar productos.
- Editar productos.
- Eliminar productos.
- Consultar inventario.
- Buscar productos mediante filtro.
- Incrementar existencias.
- Visualizar stock disponible.

### Datos del producto

- Código
- Nombre
- Proveedor
- Cantidad disponible

---

# 🏭 Módulo Producción

Permite registrar procesos de fabricación.

### Funcionalidades

- Seleccionar producto a fabricar.
- Registrar cantidad producida.
- Descontar automáticamente las materias primas.
- Incrementar automáticamente el inventario del producto terminado.
- Generar consecutivos automáticos para cada producción.
- Mostrar resumen del proceso realizado.

---

# 🧾 Fórmulas de Producción

Cada producto terminado posee una fórmula de fabricación donde se especifica:

- Materia prima utilizada.
- Cantidad necesaria de cada materia prima.

Ejemplo:

| Producto | Materia Prima | Cantidad |
|----------|---------------|----------|
| Galleta  | Harina        | 100 g    |
| Galleta  | Mantequilla   | 100 g    |
| Galleta  | Huevo         | 1 Unidad |

---

# Base de Datos

Se utilizó **Firebase Realtime Database** para almacenar la información.

Se manejan las siguientes colecciones:

```
usuarios
productos
inventario
produccion
```

---

# 💻 Funcionalidades Implementadas

## Login

✔ Inicio de sesión

✔ Validación de credenciales

✔ Cierre de sesión

---

## Usuarios

✔ Registrar

✔ Editar

✔ Eliminar

✔ Consultar

✔ Validaciones

---

## Inventario

✔ Registrar productos

✔ Buscar productos

✔ Actualizar existencias

✔ Mostrar stock

---

## Producción

✔ Registrar producción

✔ Actualizar inventario

✔ Descontar materias primas

✔ Mostrar resumen de producción

---

# Diseño Responsive

El sistema fue desarrollado bajo el enfoque **Responsive Design**, permitiendo su correcta visualización en:

- Computadores
- Tablets
- Dispositivos móviles

---

#  Diseño UX/UI

La interfaz fue diseñada siguiendo principios de experiencia de usuario:

- Diseño limpio.
- Colores empresariales.
- Navegación intuitiva.
- Animaciones suaves.
- Formularios claros.
- Interfaz moderna.

---

#  Buenas Prácticas Aplicadas

- Código modular.
- Funciones reutilizables.
- Separación de HTML, CSS y JavaScript.
- Uso de Fetch API.
- Consumo de Firebase.
- Validación de formularios.
- Código comentado.
- Diseño responsive.

---

# Instalación

1. Clonar el repositorio.

```
git clone https://github.com/Dafcgg/Gestion-de-produccion-Acme.git
```

2. Abrir la carpeta del proyecto.

3. Configurar la URL de Firebase en el archivo `main.js`.

4. Ejecutar el archivo:

```
login.html
```

---

# 📖 Manual de Uso

1. Iniciar sesión con un usuario registrado.
2. Acceder al módulo de usuarios.
3. Registrar o modificar usuarios.
4. Gestionar el inventario.
5. Registrar procesos de producción.
6. Consultar los productos disponibles.

---

# Licencia

Proyecto desarrollado con fines académicos para demostrar la aplicación de conceptos de programación web, manipulación del DOM, consumo de Firebase y desarrollo Front-End utilizando JavaScript.