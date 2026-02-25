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

## Categorías de Productos (ProductsCategories)

### Crear Categoría de Producto

```http
POST /products-categories
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "name": "Hamburguesas",
  "storeId": 1
}
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Hamburguesas",
  "storeId": 1,
  "store": {
    "id": 1,
    "name": "Mi Restaurante"
  },
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:00:00.000Z"
}
```

### Obtener Todas las Categorías de Productos

```http
GET /products-categories
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Hamburguesas",
    "storeId": 1,
    "store": {
      "id": 1,
      "name": "Mi Restaurante"
    },
    "products": [],
    "createdAt": "2026-02-22T12:00:00.000Z",
    "updatedAt": "2026-02-22T12:00:00.000Z"
  }
]
```

### Obtener Categorías por Tienda

```http
GET /products-categories/store/:storeId
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Hamburguesas",
    "storeId": 1,
    "products": [],
    "createdAt": "2026-02-22T12:00:00.000Z",
    "updatedAt": "2026-02-22T12:00:00.000Z"
  }
]
```

### Obtener Categoría por ID

```http
GET /products-categories/:id
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Hamburguesas",
  "storeId": 1,
  "store": {
    "id": 1,
    "name": "Mi Restaurante"
  },
  "products": [],
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:00:00.000Z"
}
```

**Error (404):**

```json
{
  "statusCode": 404,
  "message": "Categoría de producto no encontrada",
  "timestamp": "2026-02-22T12:00:00.000Z"
}
```

### Actualizar Categoría de Producto

```http
PUT /products-categories/:id
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "name": "Hamburguesas Gourmet"
}
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Hamburguesas Gourmet",
  "storeId": 1,
  "store": {
    "id": 1,
    "name": "Mi Restaurante"
  },
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:30:00.000Z"
}
```

### Eliminar Categoría de Producto

```http
DELETE /products-categories/:id
Authorization: Bearer <token_jwt>
```

**Respuesta:**

```json
{
  "message": "Categoría de producto eliminada correctamente"
}
```

---

## Opciones de Delivery (DeliveryOptions)

### Crear Opción de Delivery

```http
POST /delivery-options
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "name": "Delivery Normal",
  "fee": 5.00,
  "storeId": 1
}
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Delivery Normal",
  "fee": 5.0,
  "storeId": 1,
  "store": {
    "id": 1,
    "name": "Mi Restaurante"
  },
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:00:00.000Z"
}
```

### Obtener Todas las Opciones de Delivery

```http
GET /delivery-options
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Delivery Normal",
    "fee": 5.0,
    "storeId": 1,
    "store": {
      "id": 1,
      "name": "Mi Restaurante"
    },
    "createdAt": "2026-02-22T12:00:00.000Z",
    "updatedAt": "2026-02-22T12:00:00.000Z"
  }
]
```

### Obtener Opciones de Delivery por Tienda

```http
GET /delivery-options/store/:storeId
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Delivery Normal",
    "fee": 5.0,
    "storeId": 1,
    "createdAt": "2026-02-22T12:00:00.000Z",
    "updatedAt": "2026-02-22T12:00:00.000Z"
  }
]
```

### Obtener Opción de Delivery por ID

```http
GET /delivery-options/:id
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Delivery Normal",
  "fee": 5.0,
  "storeId": 1,
  "store": {
    "id": 1,
    "name": "Mi Restaurante"
  },
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:00:00.000Z"
}
```

**Error (404):**

```json
{
  "statusCode": 404,
  "message": "Opción de delivery no encontrada",
  "timestamp": "2026-02-22T12:00:00.000Z"
}
```

### Actualizar Opción de Delivery

```http
PUT /delivery-options/:id
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "name": "Delivery Express",
  "fee": 10.00
}
```

**Respuesta:**

```json
{
  "id": 1,
  "name": "Delivery Express",
  "fee": 10.0,
  "storeId": 1,
  "store": {
    "id": 1,
    "name": "Mi Restaurante"
  },
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:30:00.000Z"
}
```

### Eliminar Opción de Delivery

```http
DELETE /delivery-options/:id
Authorization: Bearer <token_jwt>
```

**Respuesta:**

```json
{
  "message": "Opción de delivery eliminada correctamente"
}
```

---

## Productos (Products)

### Crear Producto

```http
POST /products
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "title": "Hamburguesa Clásica",
  "price": 12.99,
  "images": [
    "data:image/png;base64,iVBORw0KGgo...",
    "data:image/png;base64,iVBORw0KGgo..."
  ],
  "description": "Deliciosa hamburguesa con carne de res, queso, lechuga y tomate",
  "storeId": 1,
  "categoryId": 1
}
```

**Respuesta:**

```json
{
  "id": 1,
  "title": "Hamburguesa Clásica",
  "price": 12.99,
  "images": [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg"
  ],
  "description": "Deliciosa hamburguesa con carne de res, queso, lechuga y tomate",
  "storeId": 1,
  "categoryId": 1,
  "store": {
    "id": 1,
    "name": "Mi Restaurante"
  },
  "category": {
    "id": 1,
    "name": "Hamburguesas"
  },
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:00:00.000Z"
}
```

**Validaciones:**

- title: 2-100 caracteres
- price: número requerido
- images: array con al menos una imagen en formato base64
- description: 5-500 caracteres
- storeId: debe existir en Stores
- categoryId: debe existir en ProductsCategories

### Obtener Todos los Productos

```http
GET /products
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "title": "Hamburguesa Clásica",
    "price": 12.99,
    "images": [
      "https://cloudinary.com/image1.jpg",
      "https://cloudinary.com/image2.jpg"
    ],
    "description": "Deliciosa hamburguesa con carne de res",
    "storeId": 1,
    "categoryId": 1,
    "store": {
      "id": 1,
      "name": "Mi Restaurante"
    },
    "category": {
      "id": 1,
      "name": "Hamburguesas"
    },
    "createdAt": "2026-02-22T12:00:00.000Z",
    "updatedAt": "2026-02-22T12:00:00.000Z"
  }
]
```

### Obtener Productos por Tienda

```http
GET /products?storeId=1
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "title": "Hamburguesa Clásica",
    "price": 12.99,
    "images": ["https://cloudinary.com/image1.jpg"],
    "description": "Deliciosa hamburguesa con carne de res",
    "storeId": 1,
    "categoryId": 1,
    "store": {
      "id": 1,
      "name": "Mi Restaurante"
    },
    "category": {
      "id": 1,
      "name": "Hamburguesas"
    },
    "createdAt": "2026-02-22T12:00:00.000Z",
    "updatedAt": "2026-02-22T12:00:00.000Z"
  }
]
```

### Obtener Productos por Store ID (ruta alternativa)

```http
GET /products/store/:storeId
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "title": "Hamburguesa Clásica",
    "price": 12.99,
    "images": ["https://cloudinary.com/image1.jpg"],
    "description": "Deliciosa hamburguesa con carne de res",
    "storeId": 1,
    "categoryId": 1,
    "store": {
      "id": 1,
      "name": "Mi Restaurante"
    },
    "category": {
      "id": 1,
      "name": "Hamburguesas"
    },
    "createdAt": "2026-02-22T12:00:00.000Z",
    "updatedAt": "2026-02-22T12:00:00.000Z"
  }
]
```

### Obtener Producto por ID

```http
GET /products/:id
```

**Respuesta:**

```json
{
  "id": 1,
  "title": "Hamburguesa Clásica",
  "price": 12.99,
  "images": [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg"
  ],
  "description": "Deliciosa hamburguesa con carne de res, queso, lechuga y tomate",
  "storeId": 1,
  "categoryId": 1,
  "store": {
    "id": 1,
    "name": "Mi Restaurante"
  },
  "category": {
    "id": 1,
    "name": "Hamburguesas"
  },
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:00:00.000Z"
}
```

**Error (404):**

```json
{
  "statusCode": 404,
  "message": "Producto no encontrado",
  "timestamp": "2026-02-22T12:00:00.000Z"
}
```

### Actualizar Producto

```http
PUT /products/:id
Authorization: Bearer <token_jwt>
Content-Type: application/json

{
  "title": "Hamburguesa Gourmet",
  "price": 15.99,
  "images": [
    "data:image/png;base64,iVBORw0KGgo..."
  ],
  "description": "Nueva descripción del producto",
  "categoryId": 2
}
```

**Notas:**

- Solo los campos proporcionados serán actualizados
- Si se envía nuevo images, las anteriores serán eliminadas de Cloudinary

**Respuesta:**

```json
{
  "id": 1,
  "title": "Hamburguesa Gourmet",
  "price": 15.99,
  "images": ["https://cloudinary.com/new_image1.jpg"],
  "description": "Nueva descripción del producto",
  "storeId": 1,
  "categoryId": 2,
  "store": {
    "id": 1,
    "name": "Mi Restaurante"
  },
  "category": {
    "id": 2,
    "name": "Hamburguesas Gourmet"
  },
  "createdAt": "2026-02-22T12:00:00.000Z",
  "updatedAt": "2026-02-22T12:30:00.000Z"
}
```

### Eliminar Producto

```http
DELETE /products/:id
Authorization: Bearer <token_jwt>
```

**Notas:**

- Eliminará el producto y todas sus imágenes de Cloudinary

**Respuesta:**

```json
{
  "message": "Producto eliminado correctamente"
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
