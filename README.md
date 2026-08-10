# Invitación de boda · Dulce & Eduardo

Demostración interactiva de una invitación digital VIP. Incluye sobre animado, música, cuenta regresiva, galería, video, itinerario, mapas, RSVP, pase personalizado, QR, vestimenta, regalos, calendario, álbum colaborativo y panel administrativo.

## Alcance de la demostración

La aplicación es completamente estática y no necesita servidor, base de datos, autenticación ni servicios de pago. Las funciones administrativas, RSVP, carga de fotografías y control de acceso se simulan en el navegador para poder mostrarlas en una presentación o video.

Los datos simulados permanecen temporalmente en el navegador. No deben utilizarse para un evento real sin conectar un servicio de almacenamiento.

## Desarrollo local

```bash
npm install
npm run dev
```

- Invitación: `http://localhost:3000`
- Panel de muestra: `http://localhost:3000/admin`

Puedes demostrar una invitación personalizada con parámetros:

```text
/?invitado=Familia%20Ejemplo&lugares=4&token=familia-ejemplo
```

## Publicar en Netlify

El archivo `netlify.toml` ya contiene la configuración completa:

- Comando: `npm run build`
- Directorio de publicación: `out`

No se necesitan variables de entorno, funciones, plugins ni redirects. Después de subir los cambios a GitHub, Netlify publicará los archivos estáticos generados en `out`.

## Comandos

- `npm run dev`: desarrollo local.
- `npm run build`: genera el sitio estático.
- `npm test`: genera el sitio y ejecuta las pruebas.
- `npm run lint`: revisa el código.
