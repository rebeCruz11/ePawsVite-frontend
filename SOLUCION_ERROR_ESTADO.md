# 🔴 ERROR: Data truncated for column 'estado'

## Problema
```
Error: could not execute statement [Data truncated for column 'estado' at row 1]
```

Este error significa que el valor del campo `estado` que estamos enviando **NO coincide** con los valores permitidos en el ENUM de la base de datos.

---

## 🔍 Diagnóstico

### Posibles valores del ENUM en la BD:

La documentación dice: `Pendiente`, `En_proceso`, `Cerrado`

Pero el ENUM real en la BD podría ser:
- ✅ `Pendiente`, `En proceso`, `Cerrado` (con espacio)
- ✅ `Pendiente`, `En_proceso`, `Cerrado` (con guión bajo)
- ✅ `PENDIENTE`, `EN_PROCESO`, `CERRADO` (mayúsculas)
- ✅ `pendiente`, `en_proceso`, `cerrado` (minúsculas)

---

## 🛠️ SOLUCIÓN INMEDIATA

### Opción 1: Verificar en la Base de Datos (RECOMENDADO)

Ejecuta esta query en MySQL:

```sql
SHOW COLUMNS FROM reportes WHERE Field = 'estado';
```

Esto te mostrará el ENUM exacto, por ejemplo:
```
enum('Pendiente','En proceso','Cerrado')
```

### Opción 2: Probar valores comunes

He actualizado el código para hacer log del payload. 

**PASOS:**

1. Abre DevTools (F12) → Consola
2. Intenta aceptar/rechazar un reporte
3. En la consola verás: `Payload preparado: {...}`
4. Copia el valor de `estado` que se está enviando
5. Comparte ese valor conmigo

---

## 🎯 Valores probables según patrones comunes

| Framework/ORM | Formato común |
|---------------|---------------|
| Hibernate/JPA | `En_proceso` (guión bajo) |
| MySQL directo | `En proceso` (espacio) |
| Spring Boot | `EN_PROCESO` (mayúsculas + guión) |

---

## 📝 NECESITO QUE VERIFIQUES:

### En el backend, archivo `Reporte.java` o similar:

Busca algo como:
```java
public enum EstadoReporte {
    PENDIENTE,
    EN_PROCESO,
    CERRADO
}
```

O en la entidad:
```java
@Enumerated(EnumType.STRING)
private EstadoReporte estado;
```

**El nombre de los valores del ENUM es lo que debemos usar exactamente.**

---

## 🔧 SOLUCIÓN TEMPORAL

Mientras verificas el ENUM, prueba estos valores uno por uno:

### Test 1: Con espacio
```javascript
estado: 'En proceso'  // Sin guión bajo
```

### Test 2: Con guión bajo
```javascript
estado: 'En_proceso'  // Con guión bajo
```

### Test 3: Mayúsculas
```javascript
estado: 'EN_PROCESO'  // Todo mayúsculas
```

---

## ✅ CUANDO ENCUENTRES EL VALOR CORRECTO:

Dime cuál funcionó y actualizaré:
1. `organizacion/Reportes.vue` - función aceptarReporte
2. `cliente/MisReportes.vue` - detección de estados
3. `helpers.js` - mapeo de colores
4. Todos los filtros

---

## 🚨 QUICK FIX AHORA MISMO:

Abre el archivo:
```
src/views/organizacion/Reportes.vue
```

Línea ~226, cambia:
```javascript
// PRUEBA 1: Con espacio
const payload = prepararPayload(actual, { estado: 'En proceso' });

// Si no funciona, PRUEBA 2: Todo mayúsculas
const payload = prepararPayload(actual, { estado: 'EN_PROCESO' });

// Si no funciona, PRUEBA 3: Minúsculas
const payload = prepararPayload(actual, { estado: 'en_proceso' });
```

Prueba cada uno hasta que funcione, luego compárteme cuál fue.
