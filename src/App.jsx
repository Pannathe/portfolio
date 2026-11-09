import { useEffect, useRef, useState } from 'react'
import { ABOUT, CONTACT, CROSSFADE_MS, DURATION, SEQUENCE } from './projects'

function Logo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="9" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    </svg>
  )
}

export default function App() {
  const [overlay, setOverlay] = useState(null)
  const [holding, setHolding] = useState(false)
  const [frames, setFrames] = useState([])

  const frozen = Boolean(overlay) || holding
  const frozenRef = useRef(frozen)
  const overlayRef = useRef(overlay)
  const indexRef = useRef(0)
  const runRef = useRef(0)
  const idRef = useRef(0)
  const timerRef = useRef(null)
  const remainingRef = useRef(DURATION)
  const startedRef = useRef(0)
  const wasFrozenRef = useRef(false)

  frozenRef.current = frozen
  overlayRef.current = overlay

  function clearTimer() {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }

  function show(index) {
    if (!SEQUENCE.length) return
    const run = ++runRef.current
    indexRef.current = index
    const id = ++idRef.current
    const next = new Image()
    next.src = SEQUENCE[(index + 1) % SEQUENCE.length]

    setFrames((current) => {
      const incoming = { id, src: SEQUENCE[index], on: true }
      const previous = current
        .filter((frame) => frame.on)
        .slice(-1)
        .map((frame) => ({ ...frame, on: false }))
      return [...previous, incoming]
    })
    window.setTimeout(() => {
      setFrames((current) => current.filter((frame) => frame.id === id || frame.on))
    }, CROSSFADE_MS + 40)

    remainingRef.current = DURATION
    startedRef.current = performance.now()
    clearTimer()
    if (frozenRef.current) return
    timerRef.current = setTimeout(() => {
      if (run === runRef.current) show((index + 1) % SEQUENCE.length)
    }, DURATION)
  }

  useEffect(() => {
    show(0)
    return () => {
      runRef.current += 1
      clearTimer()
    }
  }, [])

  useEffect(() => {
    if (frozen) {
      wasFrozenRef.current = true
      if (!timerRef.current) return
      remainingRef.current = Math.max(0, remainingRef.current - (performance.now() - startedRef.current))
      clearTimer()
      return
    }

    if (!wasFrozenRef.current) return
    wasFrozenRef.current = false
    const run = runRef.current
    const index = indexRef.current
    startedRef.current = performance.now()
    timerRef.current = setTimeout(() => {
      if (run === runRef.current) show((index + 1) % SEQUENCE.length)
    }, remainingRef.current)
  }, [frozen])

  function openOverlay(name) {
    setHolding(false)
    setOverlay((current) => (current === name ? null : name))
  }

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setOverlay(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const chromeClass = overlay ? 'chrome is-plain' : 'chrome'

  return (
    <div className="app">
      <div
        className="stage"
        onPointerDown={(event) => {
          if (overlayRef.current || event.button) return
          event.preventDefault()
          setHolding(true)
        }}
        onPointerUp={() => setHolding(false)}
        onPointerCancel={() => setHolding(false)}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      >
        <div className="square">
          {frames.map((frame) => (
            <img
              key={frame.id}
              src={frame.src}
              alt=""
              draggable="false"
              className={frame.on ? 'is-on' : ''}
            />
          ))}
        </div>
      </div>

      <div className={`${chromeClass} name`}>Panna Drenko</div>
      <button className={`${chromeClass} about`} type="button" onClick={() => openOverlay('about')}>
        about
      </button>
      <button className={`${chromeClass} contact`} type="button" onClick={() => openOverlay('contact')}>
        contact
      </button>
      <div className={`${chromeClass} logo`} aria-hidden="true">
        <Logo />
      </div>

      {overlay === 'about' && (
        <div className="overlay" role="dialog" aria-label="About" onClick={() => setOverlay(null)}>
          <button className="close-hint" type="button">
            close
          </button>
          <div className="overlay-inner" onClick={(event) => event.stopPropagation()}>
            <p className="bio">{ABOUT.text}</p>
          </div>
        </div>
      )}

      {overlay === 'contact' && (
        <div className="overlay" role="dialog" aria-label="Contact" onClick={() => setOverlay(null)}>
          <button className="close-hint" type="button">
            close
          </button>
          <div className="overlay-inner is-contact" onClick={(event) => event.stopPropagation()}>
            <a className="contact-line" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
            <a className="contact-line" href={CONTACT.instagram.href} target="_blank" rel="noreferrer">
              {CONTACT.instagram.label}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
