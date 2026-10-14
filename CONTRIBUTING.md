# Contribuir

Gracias por tu interés en el proyecto. Estas convenciones ayudan a mantener el repositorio ordenado y predecible.

## Flujo de trabajo

No se trabaja directamente sobre `main`. Cada cambio pasa por una rama y un Pull Request.

1. Partí de `main` actualizado:

   ```bash
   git checkout main
   git pull
   ```

2. Creá una rama con un nombre descriptivo.
3. Hacé commits chicos y con mensajes claros.
4. Abrí un Pull Request hacia `main`.
5. Una vez mergeado, borrá la rama.

## Nombres de ramas

| Prefijo      | Uso                                                  |
| ------------ | ---------------------------------------------------- |
| `feat/`      | Nueva funcionalidad                                  |
| `fix/`       | Corrección de errores                                |
| `security/`  | Endurecimiento o correcciones de seguridad           |
| `docs/`      | Documentación                                        |
| `refactor/`  | Reestructuración sin cambio de comportamiento        |
| `chore/`     | Tareas de mantenimiento, dependencias y configuración |
| `ci/`        | Integración continua                                 |

Ejemplo: `feat/reserva-recurrente`.

## Mensajes de commit

Se sigue [Conventional Commits](https://www.conventionalcommits.org/es/):

```
<tipo>(<alcance>): <descripción>
```

Ejemplos:

- `feat(reservas): permitir reservar canchas de 7`
- `fix(api): validar el rango de fechas`
- `security(api): exigir el secreto del webhook en producción`

## Antes de abrir el Pull Request

Ejecutá las verificaciones localmente:

```bash
# backend
cd backend
npm run typecheck
npm run build

# frontend
cd frontend
npm run lint
npm run build
```

El CI vuelve a ejecutarlas automáticamente en cada Pull Request.
