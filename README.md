# Cookee

Red social de recetas. TFG Maria Muñoz Ferrer Ciclo Superior DAW.

## Tecnologías

- Frontend: Angular 21
- Backend: Node.js + Express
- Base de datos: MongoDB Atlas
- Imágenes: Cloudinary
- Autenticación: JWT

## Requisitos

- Node.js 20 o superior
- Angular CLI 21

```bash
npm install -g @angular/cli
```

### Instalación Backend

```bash
cd api
npm install
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### Instalación Frontend

```bash
npm install
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## Datos de prueba

```bash
cd api
npm run seed
```

## Variables de entorno

Se adjunta el archivo `.env` con las credenciales necesarias para levantar el proyecto.

## Datos de prueba

La base de datos ya tiene datos cargados. Credenciales de acceso:

- Email: laura@cookee.com
- Contraseña: password123
