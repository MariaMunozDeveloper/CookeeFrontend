# Cookee - Red social de recetas



\# Cookee 🍳



Red social de recetas desarrollada como Trabajo Final de Grado del Ciclo Superior DAW.



\## Tecnologías



\- \*\*Frontend:\*\* Angular 21, TypeScript

\- \*\*Backend:\*\* Node.js, Express

\- \*\*Base de datos:\*\* MongoDB Atlas

\- \*\*Autenticación:\*\* JWT



\---



\## Requisitos previos



Antes de instalar el proyecto asegúrate de tener instalado:



\- \[Node.js](https://nodejs.org/) — versión 20 o superior

\- \[npm](https://www.npmjs.com/) — versión 8 o superior

\- \[Angular CLI](https://angular.io/cli) — versión 21



```bash

npm install -g @angular/cli

```



\---



\## Instalación



El proyecto tiene dos repositorios separados: \*\*back\*\* y \*\*front\*\*.



\### 1. Backend



```bash

\# Clonar el repositorio del back

git clone https://github.com/tu-usuario/pfg-Back.git

cd pfg-Back/api



\# Instalar dependencias

npm install



\# Crear el archivo de variables de entorno

\# Crea un archivo .env en la carpeta api/ con el siguiente contenido:

```



Contenido del `.env`:



PORT=3000

MONGODB\_URI=mongodb+srv://munozferrer.maria\_db\_user:NUEVA\_CONTRASEÑA@cookee.pv6unwy.mongodb.net/Cookee

JWT\_ACCESS\_SECRET=access\_secret\_dev

JWT\_REFRESH\_SECRET=refresh\_secret\_dev





```bash

\# Crear las carpetas de uploads (necesarias para las imágenes)

mkdir -p uploads/avatars

mkdir -p uploads/publications



\# Arrancar el servidor

npm run dev

```



El backend estará disponible en `http://localhost:3000`



\---



\### 2. Frontend



```bash

\# Clonar el repositorio del front

git clone https://github.com/tu-usuario/pfg-Front.git

cd pfg-Front



\# Instalar dependencias

npm install



\# Arrancar la aplicación

npm start

```



La aplicación estará disponible en `http://localhost:4200`



\---



\## Poblar la base de datos (opcional)



El proyecto incluye un script para generar datos de prueba con usuarios y recetas reales.



Antes de ejecutarlo, añade tu API key de Unsplash al `.env`:



UNSPLASH\_KEY=tu\_api\_key\_de\_unsplash


Puedes obtener una API key gratuita en \[unsplash.com/developers](https://unsplash.com/developers).



```bash

cd api

npm run seed

```



Esto creará:

\- 8 usuarios de prueba

\- 8 recetas con fotos reales

\- Follows, likes y comentarios de ejemplo



Credenciales de acceso tras el seed:

\- \*\*Email:\*\* laura@cookee.com

\- \*\*Contraseña:\*\* password123



\---



\## Estructura del proyecto

pfg-Back/

└── api/

├── config/         # Conexión a base de datos

├── controllers/    # Lógica de negocio

├── middlewares/    # Autenticación y subida de archivos

├── models/         # Esquemas de MongoDB

├── routes/         # Rutas de la API

├── scripts/        # Script de seed

├── services/       # JWT

└── uploads/        # Imágenes subidas por los usuarios



pfg-Front/

└── src/

└── app/

├── common/         # Interfaces TypeScript

├── components/

│   ├── auth/       # Login y registro

│   ├── home/       # Página de inicio

│   ├── message/    # Mensajería

│   ├── publication/ # Recetas (crear, editar, feed, explorar, detalle)

│   ├── shared/     # Componentes reutilizables

│   ├── structure/  # Navbar y footer

│   └── user/       # Perfil, datos, cocinillas, seguidores

├── guards/         # Protección de rutas

├── interceptors/   # Interceptor de autenticación

├── pipes/          # Pipes personalizados

├── services/       # Servicios HTTP

└── validators/     # Validadores de formularios


## Funcionalidades



\- Registro e inicio de sesión con JWT

\- Feed de recetas de usuarios seguidos

\- Explorar recetas con filtros y búsqueda por hashtag

\- Crear, editar y eliminar recetas con fotos por paso

\- Likes y comentarios en recetas

\- Seguir y dejar de seguir usuarios

\- Mensajería privada

\- Perfil de usuario con recetario personal

\- Vista previa de recetas para usuarios no registrados

