# Cardio Escape Room

Experiencia de escape room de dos pantallas para evento:

- `outside`: registro de grupo y participantes.
- `room`: flujo principal del juego en sala.
- `admin`: control, pruebas de fase, ranking e import/export de datos.

## Comandos

```bash
bun install
bun run dev
bun run lint
bun run build
```

Por defecto el servidor corre en `http://localhost:5173`.

## Rutas

- `/` o `/outside`: pantalla de registro.
- `/room`: pantalla del escape room.
- `/admin`: panel de control.

## Juego

El flujo actual tiene 3 retos:

- Reto 1: Cartas, 2 minutos.
- Reto 2: Rompecabezas, 2 minutos.
- Reto 3: Activacion en equipo, 1 minuto.

La duracion total se calcula desde `src/shared/game.ts`.

## Datos

El ranking se guarda localmente en `data/groups.json`. Esa carpeta esta ignorada por git y el servidor la recrea cuando se guardan datos.
