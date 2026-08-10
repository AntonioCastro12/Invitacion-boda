# Invitación de boda · Dulce & Eduardo

Invitación digital VIP construida con Next.js y preparada para Netlify. Incluye portada tipo sobre, música, cuenta regresiva, galería, video, itinerario, mapas, RSVP, pases personalizados, QR, control de acceso, panel administrativo, calendario y álbum colaborativo.

## Requisitos

- Node.js 22 o superior
- Una cuenta de Netlify

## Desarrollo local

Para revisar la interfaz sin conectar los servicios de Netlify:

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`. Cuando no existen variables administrativas en desarrollo, `/admin` permite acceso local automático.

Para probar también Netlify Database y Netlify Blobs:

```bash
npx netlify-cli login
npx netlify-cli link
npm run netlify:dev
```

Netlify Dev abre normalmente `http://localhost:8888` y replica el entorno de producción.

## Publicar en Netlify

1. Sube este repositorio a GitHub.
2. En Netlify selecciona **Add new site > Import an existing project**.
3. Elige el repositorio. Netlify detectará Next.js y usará `npm run build` desde `netlify.toml`.
4. En **Site configuration > Environment variables**, agrega:

   - `ADMIN_PASSWORD`: contraseña privada para `/admin`.
   - `ADMIN_SESSION_SECRET`: texto aleatorio largo para firmar la sesión.

   Puedes generar el secreto con:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

5. Publica el sitio. Netlify Database aplicará la migración de `netlify/database/migrations` y creará el invitado de demostración.

No hace falta configurar redirects manuales: el adaptador oficial de Next.js de Netlify procesa `/i/[token]`, `/admin` y las rutas `/api/*`.

## Datos y archivos

- Netlify Database (PostgreSQL): invitados, confirmaciones, accesos y metadatos del álbum.
- Netlify Blobs: archivos de las fotografías del álbum.
- Invitación de demostración: `/i/familia-castro-cuevas`.
- Panel: `/admin`.

## Comandos

- `npm run dev`: desarrollo Next.js.
- `npm run netlify:dev`: desarrollo con el entorno de Netlify.
- `npm run build`: compilación de producción.
- `npm test`: compilación y pruebas estructurales.
- `npm run lint`: revisión del código.
