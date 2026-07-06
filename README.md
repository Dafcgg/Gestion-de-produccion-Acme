# Gestión de Producción - ACME

---

# 🔑 Credenciales de acceso

Para ingresar al sistema utilice las siguientes credenciales de prueba:

| Campo | Valor |
|---|---|
| Número de identificación | 1 |
| Contraseña | 1234 |

> Nota: Estas credenciales fueron creadas para facilitar el acceso y la evaluación del proyecto.

---

# Autor

**Nombre:** Dilan Andres Fonseca Tellez

**Proyecto:** Gestión de Producción ACME

**Tecnologías:** HTML, CSS, JavaScript, Web Components y Firebase.

---
## Descripción del Proyecto

La empresa **ACME**, ubicada en la ciudad de **Macondo**, requiere automatizar el proceso de producción de su planta con el objetivo de mejorar el control de usuarios, el manejo del inventario y la fabricación de productos terminados.

La aplicación desarrollada permite administrar el proceso productivo mediante un sistema web construido con **HTML, CSS y JavaScript**, utilizando **Web Components** para la reutilización de interfaz y **Firebase Realtime Database** como base de datos.

---

#  Objetivo General

Desarrollar una aplicación web que permita gestionar de forma eficiente el proceso de producción de la empresa ACME, garantizando el control de usuarios, inventario y producción mediante una interfaz moderna, intuitiva y responsive.

---

# 🎯 Objetivos Específicos

- Implementar un sistema seguro de autenticación mediante Login.
- Gestionar usuarios del sistema mediante operaciones CRUD.
- Administrar el inventario de materias primas y productos terminados.
- Registrar fórmulas de producción (recetas) para cada producto terminado.
- Registrar procesos de producción disminuyendo automáticamente las materias primas utilizadas.
- Actualizar automáticamente el inventario de productos fabricados.
- Aplicar buenas prácticas de programación utilizando JavaScript.
- Favorecer la reutilización de interfaz mediante Web Components.

---

# Tecnologías Utilizadas

- HTML5
- CSS3
- JavaScript (ES6)
- Web Components (Custom Elements)
- Firebase Realtime Database
- Git
- GitHub

---

# 📂 Estructura del Proyecto

```

│
├── index.html                 (redirige a pages/login.html)
│
├── css/
│   └── styles.css
│
├── js/
│   ├── api.js                 (URL base de Firebase y cliente HTTP compartido)
│   ├── auth-usuarios.js       (login y CRUD de usuarios)
│   ├── inventario.js
│   ├── produccion.js
│   └── receta.js
│
├── web-components/
│   ├── app-navbar.js          (<app-navbar> - barra de navegación y logout)
│   └── app-search-box.js      (<app-search-box> - buscador/filtro reutilizable)
│
├── pages/
│   ├── login.html
│   ├── usuarios.html
│   ├── inventario.html
│   ├── produccion.html
│   └── receta.html
│
├── README.md

```

---

# 🧩 Web Components

Para favorecer la reutilización de código y evitar duplicar la barra de navegación y los buscadores en cada página, se desarrollaron los siguientes Custom Elements:

### `<app-navbar>`

Barra de navegación reutilizable, presente en todos los módulos excepto Login.

**Atributos:**
- `brand`: título del módulo (ej. `"Gestión de Inventario"`).
- `active`: página activa (`usuarios` | `inventario` | `receta` | `produccion`), para no mostrar el enlace hacia sí misma.

**Uso:**
```html
<app-navbar brand="Gestión de Inventario" active="inventario"></app-navbar>
```

Incluye el botón "Cerrar Sesión", que solicita confirmación y redirige a `login.html`.

### `<app-search-box>`

Campo de búsqueda/filtro reutilizable, usado en los módulos de Inventario y Producción.

**Atributos:**
- `placeholder`: texto de ayuda del input.
- `target`: id del `<tbody>` sobre el que se filtran las filas.

**Uso:**
```html
<app-search-box placeholder="Buscar producto..." target="productsTableBody"></app-search-box>
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
- Confirmación de contraseña (doble validación para prevenir errores de digitación).
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
- Buscar productos mediante filtro (`<app-search-box>`).
- Aumentar el stock de un producto ingresando su **código** y la **cantidad** a incrementar.
- Visualizar stock disponible.

### Datos del producto

- Código
- Nombre
- **Tipo** (Materia Prima / Producto Terminado)
- Proveedor
- Cantidad disponible
- Precio

> El campo **Tipo** permite que, en el módulo de Recetas, el selector de "Producto Terminado" solo muestre productos marcados como tal, y el selector de "Materia Prima" solo muestre productos marcados como materia prima. Esto evita mezclar ambos conceptos y que un producto termine siendo su propia materia prima.

---

# 🧾 Módulo Recetas (Fórmulas de Producción)

Permite definir la fórmula de fabricación de cada producto terminado.

### Funcionalidades

- Seleccionar el producto terminado.
- Agregar una o varias materias primas con su cantidad requerida.
- Editar o eliminar materias primas antes de guardar.
- Registrar, editar y eliminar recetas completas.
- Consultar el listado de recetas registradas.

Ejemplo:

| Producto | Materia Prima | Cantidad |
|----------|---------------|----------|
| Galleta  | Harina        | 100 g    |
| Galleta  | Mantequilla   | 100 g    |
| Galleta  | Huevo         | 1 Unidad |

---

# 🏭 Módulo Producción

Permite registrar procesos de fabricación.

### Funcionalidades

- Seleccionar producto a fabricar.
- Visualizar automáticamente la fórmula (receta) del producto seleccionado.
- Registrar cantidad a fabricar.
- Validar que exista suficiente materia prima antes de fabricar.
- Descontar automáticamente las materias primas del inventario.
- Incrementar automáticamente el inventario del producto terminado.
- Generar un código consecutivo automático para cada producción (inicia en 1 e incrementa con cada registro).
- Mostrar un resumen por producto con la cantidad fabricada y las materias primas utilizadas.
- Consultar y buscar el historial de producción (`<app-search-box>`).
- Eliminar registros del historial.

---

# Base de Datos

Se utilizó **Firebase Realtime Database** para almacenar la información.

Se manejan las siguientes colecciones:

```
usuarios
productos
recetas
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

✔ Aumentar stock por código

✔ Mostrar stock

---

## Recetas

✔ Registrar fórmula por producto

✔ Editar fórmula

✔ Eliminar fórmula

✔ Consultar recetas registradas

---

## Producción

✔ Registrar producción

✔ Visualizar fórmula del producto

✔ Actualizar inventario

✔ Descontar materias primas

✔ Mostrar resumen de producción

✔ Buscar en el historial

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

- Código modular, organizado en `css/`, `js/`, `web-components/` y `pages/`.
- Web Components (Custom Elements) para reutilizar la barra de navegación y los buscadores.
- Cliente HTTP y configuración de Firebase centralizados en `js/api.js` (sin duplicación entre módulos).
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

3. Configurar la URL de Firebase en el archivo `js/api.js` (constante `URL_BASE`).

4. Ejecutar el archivo:

```
index.html
```

El `index.html` redirige automáticamente a `pages/login.html`.

---

# 📖 Manual de Uso

1. Iniciar sesión con un usuario registrado.
2. Acceder al módulo de usuarios para registrar o modificar usuarios.
3. Registrar la materia prima y los productos en el módulo de Inventario.
4. Definir la fórmula (receta) de cada producto terminado en el módulo de Recetas.
5. Registrar procesos de producción en el módulo de Producción.
6. Consultar el inventario actualizado y el historial de producción.

---

# Licencia

Proyecto desarrollado con fines académicos para demostrar la aplicación de conceptos de programación web, manipulación del DOM, Web Components, consumo de Firebase y desarrollo Front-End utilizando JavaScript.
