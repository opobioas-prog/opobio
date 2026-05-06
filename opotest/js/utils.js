// ── Utilidades de UI compartidas ──────────────────────

// Mostrar/ocultar spinner de carga
function showSpinner(id = 'spinner') {
  const el = document.getElementById(id)
  if (el) el.classList.remove('hidden')
}
function hideSpinner(id = 'spinner') {
  const el = document.getElementById(id)
  if (el) el.classList.add('hidden')
}

// Mostrar mensaje de error en un elemento
function showError(id, msg) {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = msg
  el.classList.remove('hidden')
}
function hideError(id) {
  const el = document.getElementById(id)
  if (el) el.classList.add('hidden')
}

// Toast flotante
function toast(msg, type = 'info', duration = 3000) {
  const colors = {
    info:    'bg-gray-800 text-white',
    success: 'bg-green-600 text-white',
    error:   'bg-red-600 text-white',
    warning: 'bg-yellow-500 text-white',
  }
  const t = document.createElement('div')
  t.className = `fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl
                 shadow-lg text-sm font-medium animate-slide max-w-xs text-center
                 ${colors[type] || colors.info}`
  t.textContent = msg
  document.body.appendChild(t)
  setTimeout(() => t.remove(), duration)
}

// Formatear fecha
function fmtFecha(iso) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Color según porcentaje
function colorPct(pct) {
  if (pct >= 70) return 'text-green-600 dark:text-green-400'
  if (pct >= 50) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-500 dark:text-red-400'
}
function bgColorPct(pct) {
  if (pct >= 70) return 'bg-green-500'
  if (pct >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

// Parámetros de URL
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key)
}

function conTiempoLimite(promise, ms = 10000, mensaje = 'La consulta ha tardado demasiado') {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(mensaje)), ms)
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId))
}

// Cuenta preguntas por tema sin descargar todas las filas al navegador.
async function contarPreguntasPorTema(temaIds, filtros = {}) {
  const ids = [...new Set((temaIds || []).filter(Boolean))]
  const resultado = Object.fromEntries(ids.map(id => [id, 0]))
  const puedeUsarRpc = typeof db.rpc === 'function'

  if (puedeUsarRpc) {
    try {
      const { data, error } = await conTiempoLimite(
        db.rpc('conteo_preguntas_por_tema', {
          p_activa: filtros.activa ?? null,
          p_eliminada: filtros.eliminada ?? null,
        }),
        8000,
        'El recuento agrupado de preguntas ha tardado demasiado'
      )
      if (error) throw error

      ;(data || []).forEach(row => {
        if (row.tema_id in resultado) resultado[row.tema_id] = Number(row.total) || 0
      })
      return resultado
    } catch (e) {
      console.warn('RPC de conteo no disponible; usando recuento por lotes.', e)
    }
  }

  const batchSize = 8

  for (let i = 0; i < ids.length; i += batchSize) {
    const lote = ids.slice(i, i + batchSize)
    const consultas = lote.map(async id => {
      let query = db
        .from('preguntas')
        .select('id', { count: 'exact', head: true })
        .eq('tema_id', id)

      if (filtros.activa !== undefined) query = query.eq('activa', filtros.activa)
      if (filtros.eliminada !== undefined) query = query.eq('eliminada', filtros.eliminada)

      const { count, error } = await conTiempoLimite(
        query,
        8000,
        'El recuento de preguntas ha tardado demasiado'
      )
      if (error) throw error
      resultado[id] = count || 0
    })

    await Promise.all(consultas)
  }

  return resultado
}

// ── Sesión de test (localStorage) ────────────────────

const SESSION_KEY = id => `opotest_session_${id}`

function guardarSesion(session) {
  localStorage.setItem(SESSION_KEY(session.intentoId), JSON.stringify(session))
}
function cargarSesion(id) {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY(id))) } catch { return null }
}
function eliminarSesion(id) {
  localStorage.removeItem(SESSION_KEY(id))
}
function getSesionesAbiertas() {
  const ids = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith('opotest_session_')) ids.push(k.replace('opotest_session_', ''))
  }
  return ids
}

// ── Bottom nav: marcar activo ─────────────────────────
function setNavActive(page) {
  document.querySelectorAll('.nav-item').forEach(el => {
    const isActive = el.dataset.page === page
    el.classList.toggle('text-indigo-600',  isActive)
    el.classList.toggle('dark:text-indigo-400', isActive)
    el.classList.toggle('text-gray-400',    !isActive)
    el.classList.toggle('dark:text-gray-500', !isActive)
  })
}
