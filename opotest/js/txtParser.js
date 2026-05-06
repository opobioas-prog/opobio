function extraerCodigo(nombreArchivo) {
  return nombreArchivo.replace(/\.txt$/i, '').split('_')[0].toUpperCase()
}

function parsearTxt(contenido) {
  const lineas = contenido.split('\n')
  const preguntas = []
  const errores = []

  for (let i = 1; i < lineas.length; i++) {
    const linea = lineas[i].trim()
    if (!linea) continue

    const partes = linea.split('|').map(p => p.trim())
    if (partes.length < 7) {
      errores.push(`Linea ${i + 1}: formato incorrecto (${partes.length} campos)`)
      continue
    }

    const [numStr, pregunta, a, b, c, d, correctaRaw, ...explParts] = partes
    const numero = parseInt(numStr, 10)

    if (isNaN(numero)) {
      errores.push(`Linea ${i + 1}: numero invalido "${numStr}"`)
      continue
    }
    if (!pregunta || !a || !b || !c || !d) {
      errores.push(`Linea ${i + 1}: faltan campos`)
      continue
    }

    const correcta = correctaRaw.trim().toLowerCase()
    if (!['a', 'b', 'c', 'd'].includes(correcta)) {
      errores.push(`Linea ${i + 1}: respuesta invalida "${correctaRaw}"`)
      continue
    }

    preguntas.push({
      numero,
      pregunta,
      opcion_a: a,
      opcion_b: b,
      opcion_c: c,
      opcion_d: d,
      respuesta_correcta: correcta,
      explicacion: explParts.join('|').trim(),
    })
  }

  return { preguntas, errores }
}

function leerArchivo(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = e => resolve(e.target.result)
    r.onerror = () => reject(new Error(`Error al leer ${file.name}`))
    r.readAsText(file, 'utf-8')
  })
}
