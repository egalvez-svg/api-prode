# Prode Mundial — Guía de API para Frontend

**Base URL:** `http://localhost:3000/api`  
**Autenticación:** Bearer Token (JWT) en el header `Authorization`

---

## Autenticación

### Registro
```
POST /auth/register
```
**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "password": "mi_password"  // mínimo 6 caracteres
}
```
**Respuesta 201:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

---

### Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "mi_password"
}
```
**Respuesta 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

> Guardar el `access_token` y enviarlo en todas las requests protegidas:
> ```
> Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
> ```

---

## Usuarios

### Mi perfil (con historial de apuestas)
```
GET /users/me
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "role": "USER",
  "createdAt": "2026-05-29T10:00:00.000Z",
  "bets": [
    {
      "id": 3,
      "matchId": 5,
      "homeScore": 2,
      "awayScore": 1,
      "points": 3,
      "match": {
        "id": 5,
        "homeTeam": "Argentina",
        "awayTeam": "Brasil",
        "matchDate": "2026-06-15T18:00:00.000Z",
        "status": "FINISHED",
        "homeScore": 2,
        "awayScore": 1
      }
    }
  ]
}
```

---

## Partidos

### Listar partidos
```
GET /matches
Authorization: Bearer <token>
```
**Query params opcionales:**
| Param | Valores | Descripción |
|-------|---------|-------------|
| `status` | `SCHEDULED` \| `IN_PLAY` \| `FINISHED` \| `POSTPONED` | Filtrar por estado |

Ejemplos:
- `GET /matches` — todos los partidos
- `GET /matches?status=SCHEDULED` — solo partidos por jugar (para apostar)
- `GET /matches?status=FINISHED` — resultados finales

**Respuesta 200:**
```json
[
  {
    "id": 1,
    "externalId": 415082,
    "homeTeam": "Argentina",
    "awayTeam": "Canadá",
    "matchDate": "2026-06-11T20:00:00.000Z",
    "homeScore": null,
    "awayScore": null,
    "status": "SCHEDULED",
    "stage": "GROUP_STAGE",
    "group": "Group A"
  }
]
```

### Detalle de un partido
```
GET /matches/:id
Authorization: Bearer <token>
```

---

## Apuestas

### Crear o actualizar apuesta
```
POST /bets
Authorization: Bearer <token>
```
**Body:**
```json
{
  "matchId": 1,
  "homeScore": 2,
  "awayScore": 0
}
```
- Si ya existe una apuesta para ese partido, se actualiza automáticamente.
- Solo se puede apostar si el partido está en estado `SCHEDULED` y faltan más de **30 minutos** para el inicio.

**Respuesta 201:**
```json
{
  "id": 7,
  "userId": 1,
  "matchId": 1,
  "homeScore": 2,
  "awayScore": 0,
  "points": 0,
  "match": { ... }
}
```

**Errores posibles:**
| Status | Mensaje |
|--------|---------|
| 400 | "Solo se puede apostar en partidos programados" |
| 400 | "Las apuestas cierran 30 minutos antes del partido" |
| 404 | "Partido no encontrado" |

---

### Mis apuestas
```
GET /bets/me
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": 7,
    "matchId": 1,
    "homeScore": 2,
    "awayScore": 0,
    "points": 1,
    "match": {
      "homeTeam": "Argentina",
      "awayTeam": "Canadá",
      "matchDate": "2026-06-11T20:00:00.000Z",
      "status": "FINISHED",
      "homeScore": 3,
      "awayScore": 0
    }
  }
]
```

### Eliminar apuesta
```
DELETE /bets/:id
Authorization: Bearer <token>
```
Solo se puede eliminar si el partido aún no cerró la ventana de apuestas (30 min antes).

---

## Ranking

### Tabla de posiciones completa
```
GET /rankings
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "position": 1,
    "id": 4,
    "name": "María López",
    "email": "maria@ejemplo.com",
    "totalPoints": 18,
    "totalBets": 10,
    "exactScores": 4,
    "correctResults": 6
  },
  {
    "position": 2,
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "totalPoints": 15,
    "totalBets": 10,
    "exactScores": 3,
    "correctResults": 6
  }
]
```

> **Desempate:** a igual `totalPoints`, gana quien tiene más `exactScores`.

### Mi posición en el ranking
```
GET /rankings/me
Authorization: Bearer <token>
```
Devuelve el mismo objeto de la tabla pero solo para el usuario logueado.

---

## Premios

### Ver premios
```
GET /prizes
Authorization: Bearer <token>
```
**Respuesta 200:**
```json
[
  {
    "id": 1,
    "name": "Premio 1er Lugar",
    "description": "$50.000 en efectivo",
    "position": 1,
    "awardedTo": {
      "id": 4,
      "name": "María López",
      "email": "maria@ejemplo.com"
    }
  },
  {
    "id": 2,
    "name": "Premio 2do Lugar",
    "description": "Camiseta oficial",
    "position": 2,
    "awardedTo": null
  }
]
```

> `awardedTo: null` significa que el premio aún no fue asignado.

---

## Endpoints exclusivos de Admin

> Requieren que el usuario tenga `"role": "ADMIN"` en el token.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/users` | Listar todos los usuarios |
| `GET` | `/users/:id` | Ver usuario por ID |
| `POST` | `/matches/sync` | Forzar sincronización con la API de fútbol |
| `POST` | `/prizes` | Crear un premio |
| `PATCH` | `/prizes/:id/award` | Asignar premio a un usuario |
| `DELETE` | `/prizes/:id` | Eliminar un premio |

### Crear premio (Admin)
```
POST /prizes
Authorization: Bearer <token-admin>
```
```json
{ "name": "Campeón del Prode", "description": "$50.000", "position": 1 }
```

### Asignar premio a usuario (Admin)
```
PATCH /prizes/1/award
Authorization: Bearer <token-admin>
```
```json
{ "userId": 4 }
```

---

## Sistema de puntaje

| Resultado | Puntos |
|-----------|--------|
| Marcador exacto (ej: predijo 2-1, fue 2-1) | **3 puntos** |
| Solo resultado correcto (ej: predijo 2-1, fue 3-0 — ambos gana local) | **1 punto** |
| Incorrecto | **0 puntos** |

Los puntos se calculan automáticamente cada vez que se sincronizan los partidos (cada 30 min).

---

## Estados de un partido

| Estado | Descripción | ¿Se puede apostar? |
|--------|-------------|-------------------|
| `SCHEDULED` | Programado, no empezó | Sí (hasta 30 min antes) |
| `IN_PLAY` | En curso | No |
| `FINISHED` | Finalizado | No |
| `POSTPONED` | Postergado | No |

---

## Errores comunes

| Status HTTP | Significado |
|-------------|-------------|
| `400` | Datos inválidos o regla de negocio violada |
| `401` | Sin token o token inválido/expirado |
| `403` | No tiene permisos (ej: usuario intentando acción de admin) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (ej: email ya registrado, posición de premio duplicada) |
