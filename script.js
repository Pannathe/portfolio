/**
 * Add a small image to the works/ folder, then add its filename here.
 * DURATION is how long each image stays in the square, in milliseconds.
 */
const DURATION = 450
const CROSSFADE_MS = 180

const SEQUENCE = [
  'napraforgo2.jpg',
  'napraforgo.jpg',
  'napraforgo3.jpg',
  'napraforgo4.jpg',
  'napraforgo5.jpg',
  'rock1.jpg',
  'rock2.jpg',
  'rock3.jpg',
  'rock4.jpg',
  'linegrid1.jpg',
  'linegrid2.jpg',
  'linegrid3.jpg',
  'filmfem1.jpg',
  'filmfem2.jpg',
  'filmfem3.jpg',
  'filmfem4.jpg',
  'filmfem5.jpg',
  'sneaking1.jpg',
  'sneaking4.jpg',
  'sneaking5.jpg',
  'sneaking6.jpg',
  'feminist.jpg',
  'feminist2.jpg',
].map((name) => `works/${name}`)

const square = document.querySelector('#square')
const stage = document.querySelector('#stage')
const about = document.querySelector('#about')
const contact = document.querySelector('#contact')
const chrome = document.querySelectorAll('.chrome')

let index = 0
let frameId = 0
let timer = null
let remaining = DURATION
let started = 0
let holding = false
let openName = null

function frozen() {
  return holding || openName !== null
}

function clearTimer() {
  clearTimeout(timer)
  timer = null
}

function show(nextIndex) {
  if (!SEQUENCE.length) return
  index = nextIndex
  const id = ++frameId
  const img = document.createElement('img')
  img.src = SEQUENCE[index]
  img.alt = ''
  img.draggable = false
  img.className = 'is-on'
  square.querySelectorAll('img.is-on').forEach((current) => current.classList.remove('is-on'))
  square.appendChild(img)

  const preload = new Image()
  preload.src = SEQUENCE[(index + 1) % SEQUENCE.length]

  window.setTimeout(() => {
    square.querySelectorAll('img').forEach((node) => {
      if (node !== img && !node.classList.contains('is-on')) node.remove()
    })
  }, CROSSFADE_MS + 40)

  remaining = DURATION
  started = performance.now()
  clearTimer()
  if (frozen()) return
  timer = window.setTimeout(() => show((index + 1) % SEQUENCE.length), DURATION)
}

function setOverlay(name) {
  openName = openName === name ? null : name
  holding = false
  about.hidden = openName !== 'about'
  contact.hidden = openName !== 'contact'
  chrome.forEach((item) => item.classList.toggle('is-plain', openName !== null))
  if (openName) {
    if (timer) {
      remaining = Math.max(0, remaining - (performance.now() - started))
      clearTimer()
    }
    return
  }
  started = performance.now()
  timer = window.setTimeout(() => show((index + 1) % SEQUENCE.length), remaining)
}

document.querySelector('#about-btn').addEventListener('click', () => setOverlay('about'))
document.querySelector('#contact-btn').addEventListener('click', () => setOverlay('contact'))
document.querySelectorAll('[data-close]').forEach((button) => {
  button.addEventListener('click', () => setOverlay(openName))
})
about.addEventListener('click', (event) => {
  if (event.target === about) setOverlay('about')
})
contact.addEventListener('click', (event) => {
  if (event.target === contact) setOverlay('contact')
})

stage.addEventListener('pointerdown', (event) => {
  if (openName || event.button) return
  event.preventDefault()
  holding = true
  if (!timer) return
  remaining = Math.max(0, remaining - (performance.now() - started))
  clearTimer()
})

function release() {
  if (!holding) return
  holding = false
  if (openName) return
  started = performance.now()
  timer = window.setTimeout(() => show((index + 1) % SEQUENCE.length), remaining)
}

stage.addEventListener('pointerup', release)
stage.addEventListener('pointercancel', release)
stage.addEventListener('contextmenu', (event) => event.preventDefault())
stage.addEventListener('dragstart', (event) => event.preventDefault())

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && openName) setOverlay(openName)
})

show(0)
