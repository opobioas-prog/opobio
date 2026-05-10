// Configuracion de Supabase
const SUPABASE_URL = 'https://ddlnggscsgguftfbjmdm.supabase.co'
const SUPABASE_KEY = 'sb_publishable_75fK1H7tDIhLmK3UREm6UQ_80kKvleE'

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

;(function initTheme() {
  const saved = localStorage.getItem('opotest-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = saved === 'dark' || (!saved && prefersDark)
  if (dark) document.documentElement.classList.add('dark')
})()

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark')
  localStorage.setItem('opotest-theme', isDark ? 'dark' : 'light')
  const btn = document.getElementById('themeBtn')
  if (btn) btn.textContent = isDark ? 'Tema claro' : 'Tema oscuro'
}
