# 🧪 PRUEBAS - Flujo de Reportes con Reasignación

## ✅ Cambios Realizados

### 🔄 SOLUCIÓN FINAL: Adaptación a Estados del Backend

**El backend solo acepta 3 estados**: `Pendiente`, `En_proceso`, `Cerrado`

**Nuestra solución inteligente**:
- ✅ Reporte **rechazado** = `estado: 'Cerrado'` + `organizacion: null`
- ✅ Reporte **completado** = `estado: 'Cerrado'` + `organizacion: exists`
- ✅ Reporte **en proceso** = `estado: 'En_proceso'` (con guión bajo)

### 1. **CrearReporte.vue**
- ✅ Modal con buscador de organizaciones
- ✅ Selección obligatoria de organización
- ✅ Veterinaria eliminada (solo organizaciones pueden asignar)

### 2. **MisReportes.vue**
- ✅ Botón "Editar" solo para estado "Pendiente"
- ✅ Botón "Reasignar" para reportes rechazados (`Cerrado` sin organización)
- ✅ Badge rojo "Rechazado" cuando `estado === 'Cerrado' && !organizacion`
- ✅ Badge verde "Completado" cuando `estado === 'Cerrado' && organizacion`
- ✅ Modal de reasignación con búsqueda de organizaciones
- ✅ Al reasignar: estado → "Pendiente", organización → nueva, veterinaria → null

### 3. **organizacion/Reportes.vue**
- ✅ Aceptar: estado cambia a "En_proceso" (con guión bajo)
- ✅ Rechazar: estado cambia a "Cerrado" + quita organización
- ✅ Payload mejorado para evitar errores 400
- ✅ Obtiene datos frescos del backend antes de actualizar

### 4. **helpers.js**
- ✅ Soporte para "En_proceso" y "En proceso"
- ✅ formatearEstado reemplaza guiones bajos por espacios

---

## 📊 ESTADOS VÁLIDOS DEL BACKEND

| Estado Backend | Cómo se muestra | Color | Cuándo |
|----------------|-----------------|-------|--------|
| `Pendiente` | Pendiente | Amarillo | Usuario crea/reasigna |
| `En_proceso` | En proceso | Azul | Organización acepta |
| `Cerrado` (sin org) | **Rechazado** | Rojo | Organización rechaza |
| `Cerrado` (con org) | Cerrado | Gris | Caso completado |

---

## 🔍 CÓMO PROBAR

### PASO 1: Crear un reporte como USUARIO
1. Inicia sesión como **Cliente/Usuario**
2. Ve a "Crear Reporte"
3. Completa el formulario
4. Click en "Buscar" para seleccionar organización
5. Busca y selecciona una organización
6. Envía el reporte
7. **Verifica**: El reporte debe crearse con estado "Pendiente"

### PASO 2: Rechazar el reporte como ORGANIZACIÓN
1. Cierra sesión del usuario
2. Inicia sesión como **Organización** (la que seleccionaste)
3. Ve a "Reportes Asignados"
4. **Verifica**: Debes ver el reporte en estado "Pendiente"
5. Click en botón "Rechazar"
6. Confirma el rechazo
7. **Verifica**: 
   - El estado en BD debe ser "Cerrado"
   - El campo `organizacion` debe ser `null`
   - El reporte desaparece de la lista de la organización

### PASO 3: Reasignar el reporte como USUARIO
1. Cierra sesión de la organización
2. Inicia sesión nuevamente como **Cliente/Usuario**
3. Ve a "Mis Reportes"
4. **Verifica**: 
   - El badge debe decir "Rechazado" (rojo)
   - Debe aparecer el botón "Reasignar" (azul)
   - NO debe aparecer el botón "Editar"
5. Click en "Reasignar"
6. En el modal, busca y selecciona OTRA organización
7. Click en "Confirmar Reasignación"
8. **Verifica**: 
   - El estado debe cambiar a "Pendiente" (amarillo)
   - El botón debe cambiar a "Editar"
   - El botón "Reasignar" debe desaparecer

### PASO 4: Aceptar el reporte como ORGANIZACIÓN
1. Inicia sesión como la **nueva organización**
2. Ve a "Reportes Asignados"
3. **Verifica**: El reporte debe estar en "Pendiente"
4. Click en "Aceptar"
5. **Verifica**: El estado debe cambiar a "En proceso" (badge azul)

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: "No aparece el botón Reasignar"
**Causa**: El estado no es exactamente "Rechazado"
**Solución**: 
1. Abre las DevTools del navegador (F12)
2. Ve a "Mis Reportes"
3. Inspecciona el elemento del badge de estado
4. Verifica que diga exactamente "Rechazado" (con R mayúscula)
5. Si dice "Cerrado", la organización usó el código viejo

**Fix temporal**: 
- Actualiza manualmente en la base de datos:
```sql
UPDATE reportes SET estado = 'Rechazado' WHERE estado = 'Cerrado' AND id_reporte = [ID];
```

### Problema: "Error 400 Bad Request al aceptar/rechazar"
**Causa**: Campos null o faltantes en el payload
**Solución aplicada**:
- ✅ `prepararPayload` ahora omite campos null
- ✅ `fotoUrl` solo se envía si existe
- ✅ Se obtienen datos frescos del backend antes de actualizar

**Si persiste**:
1. Abre DevTools → Network
2. Click en "Aceptar" o "Rechazar"
3. Busca la petición PUT a `/api/reportes/{id}`
4. Revisa el "Payload" enviado
5. Comparte el error exacto del "Response"

### Problema: "El estado no cambia después de reasignar"
**Causa**: El backend no está guardando el cambio
**Verifica**:
1. DevTools → Network → Busca la petición PUT
2. Verifica que el Response sea 200 OK
3. Verifica que el payload incluya: `"estado": "Pendiente"`

**Backend necesario** (ReporteController.java):
```java
@PutMapping("/{id}")
public ResponseEntity<Reporte> actualizar(@PathVariable Integer id, @RequestBody Reporte reporte) {
    Reporte reporteExistente = reporteService.obtenerPorId(id);
    
    // Actualizar todos los campos
    reporteExistente.setTitulo(reporte.getTitulo());
    reporteExistente.setDescripcion(reporte.getDescripcion());
    reporteExistente.setUbicacion(reporte.getUbicacion());
    reporteExistente.setEstado(reporte.getEstado()); // ← IMPORTANTE
    reporteExistente.setFotoUrl(reporte.getFotoUrl());
    reporteExistente.setOrganizacion(reporte.getOrganizacion());
    reporteExistente.setVeterinaria(reporte.getVeterinaria());
    
    return ResponseEntity.ok(reporteService.guardar(reporteExistente));
}
```

---

## 📊 ESTADOS VÁLIDOS

| Estado | Color | Cuándo |
|--------|-------|--------|
| Pendiente | Amarillo (warning) | Usuario crea/reasigna reporte |
| En proceso | Azul (info) | Organización acepta |
| Rechazado | Rojo (danger) | Organización rechaza |
| Cerrado | Gris (secondary) | Organización cierra caso |

---

## 🔄 FLUJO COMPLETO

```
USUARIO
  └→ Crea reporte → selecciona Organización A
     └→ Estado: "Pendiente"
        
ORGANIZACIÓN A
  └→ Ve reporte en "Pendiente"
  └→ OPCIÓN 1: Acepta
     └→ Estado: "En proceso"
     └→ Puede asignar veterinaria
  └→ OPCIÓN 2: Rechaza
     └→ Estado: "Rechazado"
     
USUARIO (si rechazado)
  └→ Ve botón "Reasignar"
  └→ Selecciona Organización B
     └→ Estado: "Pendiente" (reset)
     └→ Veterinaria: null
     
ORGANIZACIÓN B
  └→ Ve reporte nuevo en "Pendiente"
  └→ Acepta → "En proceso"
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Usuario puede crear reporte con organización obligatoria
- [ ] Organización ve reportes "Pendiente"
- [ ] Organización puede aceptar → estado "En proceso"
- [ ] Organización puede rechazar → estado "Rechazado"
- [ ] Usuario ve badge rojo en reporte rechazado
- [ ] Usuario ve botón "Reasignar" (azul) en rechazados
- [ ] Usuario NO ve botón "Editar" en rechazados
- [ ] Usuario puede reasignar a otra organización
- [ ] Después de reasignar, estado vuelve a "Pendiente"
- [ ] Nueva organización ve el reporte en su lista

---

## 📝 NOTAS IMPORTANTES

1. **El botón "Reasignar" solo aparece si `estado === 'Rechazado'`** (con R mayúscula)
2. **El backend debe soportar el estado "Rechazado"** en el ENUM
3. **Al reasignar, la veterinaria se limpia automáticamente**
4. **Las organizaciones NO pueden editar reportes, solo cambiar estado**
5. **Los usuarios NO pueden asignar veterinarias, solo organizaciones**

---

## 🚀 PRÓXIMOS PASOS

1. ⏳ Implementar asignación de veterinarias por organizaciones
2. ⏳ Vista de veterinarias para aceptar/rechazar reportes
3. ⏳ Reasignación de veterinarias si rechazan
4. ⏳ Notificaciones en tiempo real
