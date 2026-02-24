# JF3 Service API - Documentación

## Autenticación

### Login de Administrador

```http
POST /admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}
```

**Respuesta:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@test.com",
    "role": "ADMIN"
  }
}
```

### Registro de Administrador

```http
POST /admin/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@test.com",
  "password": "Admin123!"
}
```

**Respuesta:**

```json
{
  "message": "OK"
}
```

**Validaciones:**

- Username: 3-20 caracteres, solo letras, números y guiones bajos
- Email: formato válido
- Contraseña: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial
- Solo 1 admin permitido en el sistema

---

## Dashboard

### Obtener Estadísticas

```http
GET /admin/dashboard
Authorization: Bearer <token_jwt>
```

**Respuesta:**

```json
{
  "storesCount": 0,
  "productsCount": 0
}
```

---

## Categorías de Tiendas (StoresCategories)

### Crear Categoría

```http
POST /stores-categories
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "name": "Restaurantes"
}
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Restaurantes",
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:00:00.000Z"
}
```

### Obtener Todas las Categorías

```http
GET /stores-categories
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Restaurantes",
    "createdAt": "2026-02-22T12:00:00.000Z",
    "updatedAt": "2026-02-22T12:00:00.000Z",
    "stores": []
  }
]
```

### Obtener Categoría por ID

```http
GET /stores-categories/:id
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Restaurantes",
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:00:00.000Z",
  "stores": []
}
```

**Error (404):**

```json
{
  "statusCode": 404,
  "message": "Categoría no encontrada",
  "timestamp": "2026-02-22T12:00:00.000Z"
}
```

### Actualizar Categoría

```http
PUT /stores-categories/:id
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "name": "Restaurantes y Cafeterías"
}
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Restaurantes y Cafeterías",
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:30:00.000Z"
}
```

### Eliminar Categoría

```http
DELETE /stores-categories/:id
Authorization: Bearer <token_jwt>
```

**Respuesta:**

```json
{
  "message": "Categoría eliminada correctamente"
}
```

---

## Tiendas (Stores)

### Crear Tienda

```http
POST /stores
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "name": "Mi Restaurante",
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "coverImage": "data:image/png;base64,iVBORw0KGgo...",
  "categoryId": 1
}
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Mi Restaurante",
  "image": "https://cloudinary.com/image.jpg",
  "coverImage": "https://cloudinary.com/cover.jpg",
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Restaurantes"
  },
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:00:00.000Z"
}
```

**Validaciones:**

- name: 2-100 caracteres
- image: obligatoria, formato base64
- coverImage: obligatoria, formato base64
- categoryId: debe existir en StoresCategories

### Obtener Todas las Tiendas

```http
GET /stores
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Mi Restaurante",
    "image": "https://cloudinary.com/image.jpg",
    "coverImage": "https://cloudinary.com/cover.jpg",
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Restaurantes"
    },
    "createdAt": "2026-02-22T12:00:00.000Z",
    "updatedAt": "2026-02-22T12:00:00.000Z"
  }
]
```

### Obtener Tienda por ID

```http
GET /stores/:id
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Mi Restaurante",
  "image": "https://cloudinary.com/image.jpg",
  "coverImage": "https://cloudinary.com/cover.jpg",
  "categoryId": 1,
  "category": {
    "id": 1,
    "name": "Restaurantes"
  },
  "products": [],
  "deliveryOptions": [],
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:00:00.000Z"
}
```

**Error (404):**

```json
{
  "statusCode": 404,
  "message": "Tienda no encontrada",
  "timestamp": "2026-02-22T12:00:00.000Z"
}
```

### Actualizar Tienda

```http
PUT /stores/:id
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "name": "Nuevo Nombre",
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "coverImage": "data:image/png;base64,iVBORw0KGgo...",
  "categoryId": 2
}
```

**Notas:**

- Solo los campos proporcionados serán actualizados
- Si se envía nueva image, la anterior será eliminada de Cloudinary
- Si se envía nuevo coverImage, el anterior será eliminado de Cloudinary
  **Respuesta:**

```json
{
  "id": 1,
  "name": "Nuevo Nombre",
  "image": "https://cloudinary.com/new_image.jpg",
  "coverImage": "https://cloudinary.com/new_cover.jpg",
  "categoryId": 2,
  "category": {
    "id": 2,
    "name": "Tiendas"
  },
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:30:00.000Z"
}
```

### Eliminar Tienda

```http
DELETE /stores/:id
Authorization: Bearer <token_jwt>
```

**Notas:**

- Eliminará la tienda y sus imágenes (image y coverImage) de Cloudinary
  **Respuesta:**

```json
{
  "message": "Tienda eliminada correctamente"
}
```

---

## Códigos de Error

| Código | Descripción                                          |
| ------ | ---------------------------------------------------- |
| 400    | Bad Request - Datos inválidos                        |
| 401    | Unauthorized - Token inválido o no proporcionado     |
| 403    | Forbidden - No tienes permisos de administrador      |
| 404    | Not Found - Recurso no encontrado                    |
| 409    | Conflict - Conflicto de datos (ej: nombre duplicado) |
| 500    | Internal Server Error - Error del servidor           |

---

## Headers Requeridos

Para endpoints protegidos:

```http
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

---

## Notas

- Todos los timestamps están en formato ISO 8601
- Los endpoints marcados como "SOLO ADMIN" requieren token JWT con role "ADMIN"
- Los IDs en las URLs son numéricos (ej: `/stores-categories/1`)
