# 🗄️ Tests con CouchDB Real

Este documento explica cómo ejecutar tests contra una base de datos CouchDB **real** corriendo en Docker.

## 🎯 ¿Por qué CouchDB real?

**Tests con mocks (actuales):**
- ✅ Rápidos (1-2 segundos)
- ✅ Prueban lógica de negocio
- ❌ **NO prueban queries reales de PouchDB**
- ❌ **NO validan índices**
- ❌ **NO detectan errores de schema**

**Tests con CouchDB real:**
- ✅ **Prueban queries reales de PouchDB**
- ✅ **Validan que los índices funcionan**
- ✅ **Detectan errores de schema**
- ✅ **100% realista**
- ⚠️ Más lentos (5-10 segundos)

## 📋 Requisitos

- Docker instalado y corriendo
- Node.js y npm

## 🚀 Inicio rápido

### 1. Levantar CouchDB para tests

```bash
npm run test:couchdb:up
```

Esto levanta un contenedor Docker con:
- CouchDB 3.3
- Usuario: `admin`
- Password: `testpassword`
- Puerto: `5984`
- Datos en volumen temporal (se elimina con `down`)

### 2. Ejecutar tests

```bash
# Tests normales (con mocks)
npm test

# Tests contra CouchDB real
npm run test:real
```

### 3. Ver logs de CouchDB

```bash
npm run test:couchdb:logs
```

### 4. Detener y limpiar

```bash
npm run test:couchdb:down
```

Esto elimina el contenedor Y el volumen con todos los datos de testing.

## 📁 Archivos importantes

### `docker-compose.test.yml`
Configuración de Docker para CouchDB de testing.

### `src/test/couchdb-real-helpers.ts`
Helpers para conectarse a CouchDB real y crear/limpiar bases de datos.

### `src/hooks/__tests__/harvest.couchdb-real.test.tsx`
Ejemplo de test END-TO-END con CouchDB real.

## 🧪 Cómo escribir tests con CouchDB real

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  createRealTestDbContext,
  cleanupRealTestDatabases,
  verifyCouchDBConnection,
  RealTestDbContext,
} from '../../test/couchdb-real-helpers'

describe('Mi test con CouchDB real', () => {
  let realDbContext: RealTestDbContext

  beforeAll(async () => {
    // Verificar que CouchDB esté disponible
    const isConnected = await verifyCouchDBConnection()
    if (!isConnected) {
      throw new Error('CouchDB no disponible')
    }

    // Crear DBs de testing
    realDbContext = await createRealTestDbContext()
  }, 30000)

  afterAll(async () => {
    // Limpiar DBs
    await cleanupRealTestDatabases()
  }, 30000)

  it('debe guardar y consultar datos reales', async () => {
    // Insertar en CouchDB REAL
    await realDbContext.crops.put({
      _id: 'crop-1',
      descriptionES: 'Soja',
    })

    // Consultar con query REAL de PouchDB
    const result = await realDbContext.crops.find({
      selector: { _id: 'crop-1' },
    })

    expect(result.docs).toHaveLength(1)
    expect(result.docs[0].descriptionES).toBe('Soja')
  })
})
```

## 🔍 Verificar que CouchDB está corriendo

```bash
# Verificar status del contenedor
docker ps | grep couchdb-test

# Ver interfaz web (navegador)
http://localhost:5984/_utils/

# Ping a la API
curl http://admin:testpassword@localhost:5984/
```

## 🐛 Troubleshooting

### Error: "CouchDB no disponible"

1. Verificar que Docker esté corriendo:
   ```bash
   docker --version
   docker ps
   ```

2. Verificar que el puerto 5984 esté libre:
   ```bash
   # Windows
   netstat -ano | findstr :5984

   # Linux/Mac
   lsof -i :5984
   ```

3. Reiniciar el contenedor:
   ```bash
   npm run test:couchdb:down
   npm run test:couchdb:up
   ```

### Error: "Cannot connect to Docker daemon"

Docker no está corriendo. Iniciar Docker Desktop.

### Tests lentos

Es normal. CouchDB real es más lento que mocks. Para desarrollo rápido, usar tests con mocks (`npm test`). Para CI/CD o validación final, usar tests reales (`npm run test:real`).

## 📊 Comparación de estrategias

| Estrategia | Velocidad | Realismo | Cuándo usar |
|------------|-----------|----------|-------------|
| **Mocks** | ⚡⚡⚡ | 70% | Desarrollo diario, TDD |
| **CouchDB Real** | ⚡ | 100% | CI/CD, pre-deploy, bugs de queries |

## 🎯 Recomendación

1. **Durante desarrollo**: Usa mocks (`npm test`)
2. **Antes de commit**: Ejecuta tests reales (`npm run test:real`)
3. **En CI/CD**: Ejecuta ambos

## 📝 Notas

- Las DBs de testing tienen prefijo `test_` y se eliminan automáticamente
- Cada test genera DBs con timestamp único para evitar conflictos
- El cleanup elimina TODAS las DBs con prefijo `test_`
