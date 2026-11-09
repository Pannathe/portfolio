import { useCallback, useEffect, useRef, useState } from 'react'
import { ABOUT, CONTACT, CROSSFADE_MS, SEQUENCE } from './projects'

function isVideo(src = '') {
  return /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(src)
}

function normalizeSquare(square) {
  if (!square) return []
  const list = Array.isArray(square) ? square : [square]
  return list
    .map((entry) => (typeof entry === 'string' ? { src: entry } : entry))
    .filter((entry) => entry?.src)
    .map((entry) => ({
      src: entry.src,
      duration: entry.duration ?? 1200,
    }))
}

function preloadItem(item) {
  if (!item) return
  if (isVideo(item.src)) {
    const video = document.createElement('video')
    video.preload = 'auto'
    video.muted = true
    video.playsInline = true
    video.src = item.src
    video.load()
  } else {
    const image = new Image()
    image.src = item.src
  }
  normalizeSquare(item.square).forEach((frame) => {
    const image = new Image()
    image.src = frame.src
  })
}

function nextIndex(index) {
  return (index + 1) % SEQUENCE.length
}

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
  const [bgLayers, setBgLayers] = useState([])
  const [squareVisible, setSquareVisible] = useState(false)
  const [squareLayers, setSquareLayers] = useState([])

  const frozen = Boolean(overlay) || holding

  const frozenRef = useRef(frozen)
  const holdingRef = useRef(false)
  const overlayRef = useRef(overlay)
  const itemIndexRef = useRef(0)
  const squareIndexRef = useRef(0)
  const runIdRef = useRef(0)
  const bgTimerRef = useRef(null)
  const squareTimerRef = useRef(null)
  const bgRemainingRef = useRef(0)
  const squareRemainingRef = useRef(0)
  const bgStartedAtRef = useRef(0)
  const squareStartedAtRef = useRef(0)
  const bgCallbackRef = useRef(null)
  const squareCallbackRef = useRef(null)
  const videoNodes = useRef(new Map())
  const bgDoneRef = useRef(false)
  const squareDoneRef = useRef(true)
  const currentItemRef = useRef(SEQUENCE[0])
  const layerIdRef = useRef(0)

  frozenRef.current = frozen
  holdingRef.current = holding
  overlayRef.current = overlay

  const clearTimer = (ref) => {
    if (ref.current) {
      clearTimeout(ref.current)
      ref.current = null
    }
  }

  const pauseVideos = () => {
    videoNodes.current.forEach((node) => {
      if (node && !node.paused) node.pause()
    })
  }

  const playVideos = () => {
    videoNodes.current.forEach((node) => {
      if (node?.closest('.bg-layer.is-on')) node.play().catch(() => {})
    })
  }

  const schedule = (kind, delay, callback) => {
    const started = performance.now()
    if (kind === 'bg') {
      clearTimer(bgTimerRef)
      bgStartedAtRef.current = started
      bgRemainingRef.current = delay
      bgCallbackRef.current = callback
      if (frozenRef.current) return
      bgTimerRef.current = setTimeout(callback, delay)
    } else {
      clearTimer(squareTimerRef)
      squareStartedAtRef.current = started
      squareRemainingRef.current = delay
      squareCallbackRef.current = callback
      if (frozenRef.current) return
      squareTimerRef.current = setTimeout(callback, delay)
    }
  }

  const showBackground = useCallback((item) => {
    const id = ++layerIdRef.current
    setBgLayers((current) => {
      const incoming = { id, item, on: false }
      const kept = current.slice(-1)
      return [...kept, incoming]
    })
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setBgLayers((current) =>
          current.map((layer) => ({ ...layer, on: layer.id === id }))
        )
      })
    })
    window.setTimeout(() => {
      setBgLayers((current) => current.filter((layer) => layer.id === id || layer.on))
    }, CROSSFADE_MS + 80)
  }, [])

  const showSquareFrame = useCallback((src) => {
    const id = ++layerIdRef.current
    setSquareVisible(true)
    setSquareLayers((current) => {
      const incoming = { id, src, on: false }
      const kept = current.slice(-1)
      return [...kept, incoming]
    })
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSquareLayers((current) =>
          current.map((layer) => ({ ...layer, on: layer.id === id }))
        )
      })
    })
    window.setTimeout(() => {
      setSquareLayers((current) => current.filter((layer) => layer.id === id || layer.on))
    }, 260)
  }, [])

  const hideSquare = useCallback(() => {
    setSquareVisible(false)
    window.setTimeout(() => {
      if (!currentItemRef.current || !normalizeSquare(currentItemRef.current.square).length) {
        setSquareLayers([])
      }
    }, CROSSFADE_MS)
  }, [])

  const startItem = useCallback(
    (index) => {
      if (!SEQUENCE.length) return
      const item = SEQUENCE[index]
      const runId = ++runIdRef.current
      clearTimer(bgTimerRef)
      clearTimer(squareTimerRef)
      bgCallbackRef.current = null
      squareCallbackRef.current = null
      itemIndexRef.current = index
      squareIndexRef.current = 0
      currentItemRef.current = item
      bgDoneRef.current = false
      preloadItem(SEQUENCE[nextIndex(index)])

      const squares = normalizeSquare(item.square)
      squareDoneRef.current = squares.length === 0

      showBackground(item)

      const tryAdvance = () => {
        if (runId !== runIdRef.current) return
        if (!bgDoneRef.current) return
        if (item.holdForSquare && !squareDoneRef.current) return
        startItem(nextIndex(index))
      }

      const finishBackground = () => {
        if (runId !== runIdRef.current) return
        bgDoneRef.current = true
        if (isVideo(item.src) && item.holdForSquare && !squareDoneRef.current) {
          pauseVideos()
        }
        tryAdvance()
      }

      if (isVideo(item.src) && item.duration == null && !item.loop) {
        // Natural-length videos advance from onEnded.
      } else {
        schedule('bg', item.duration ?? (item.loop ? 4000 : 2000), finishBackground)
      }

      if (!squares.length) {
        hideSquare()
        return
      }

      const playSquare = (squareIndex) => {
        if (runId !== runIdRef.current) return
        const frame = squares[squareIndex]
        squareIndexRef.current = squareIndex
        showSquareFrame(frame.src)
        schedule('square', frame.duration, () => {
          const nextSquare = squareIndex + 1
          if (nextSquare < squares.length) {
            playSquare(nextSquare)
            return
          }
          squareDoneRef.current = true
          if (item.squareEnd === 'hide') hideSquare()
          tryAdvance()
        })
      }

      playSquare(0)
    },
    [hideSquare, showBackground, showSquareFrame]
  )

  useEffect(() => {
    startItem(0)
    return () => {
      runIdRef.current += 1
      clearTimer(bgTimerRef)
      clearTimer(squareTimerRef)
    }
  }, [startItem])

  const wasFrozenRef = useRef(false)
  useEffect(() => {
    if (frozen) {
      wasFrozenRef.current = true
      const now = performance.now()
      if (bgTimerRef.current) {
        bgRemainingRef.current = Math.max(
          0,
          bgRemainingRef.current - (now - bgStartedAtRef.current)
        )
        clearTimer(bgTimerRef)
      }
      if (squareTimerRef.current) {
        squareRemainingRef.current = Math.max(
          0,
          squareRemainingRef.current - (now - squareStartedAtRef.current)
        )
        clearTimer(squareTimerRef)
      }
      pauseVideos()
      return
    }

    if (!wasFrozenRef.current) return
    wasFrozenRef.current = false

    bgStartedAtRef.current = performance.now()
    squareStartedAtRef.current = performance.now()
    if (bgCallbackRef.current && !bgDoneRef.current) {
      bgTimerRef.current = setTimeout(bgCallbackRef.current, bgRemainingRef.current)
    }
    if (squareCallbackRef.current && !squareDoneRef.current) {
      squareTimerRef.current = setTimeout(squareCallbackRef.current, squareRemainingRef.current)
    }
    playVideos()
  }, [frozen])

  const setVideoNode = (layerId, node) => {
    if (node) videoNodes.current.set(layerId, node)
    else videoNodes.current.delete(layerId)
  }

  const onVideoEnded = (layer) => {
    if (layer.item?.loop) return
    if (layer.item?.duration != null) return
    if (!layer.on) return
    if (currentItemRef.current !== layer.item) return
    bgDoneRef.current = true
    if (layer.item.holdForSquare && !squareDoneRef.current) return
    startItem(nextIndex(itemIndexRef.current))
  }

  const onPointerDown = (event) => {
    if (overlayRef.current) return
    if (event.button != null && event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setHolding(true)
  }

  const onPointerUp = () => {
    setHolding(false)
  }

  const openOverlay = (name) => {
    setHolding(false)
    setOverlay((current) => (current === name ? null : name))
  }

  const closeOverlay = () => setOverlay(null)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') closeOverlay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const preventDrag = (event) => event.preventDefault()
    window.addEventListener('dragstart', preventDrag)
    return () => window.removeEventListener('dragstart', preventDrag)
  }, [])

  const chromeClass = overlay ? 'chrome is-plain' : 'chrome'

  return (
    <div className="app">
      <div
        className={holding ? 'stage is-holding' : 'stage'}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(event) => event.preventDefault()}
      >
        {bgLayers.map((layer) => (
          <div key={layer.id} className={layer.on ? 'bg-layer is-on' : 'bg-layer'}>
            {isVideo(layer.item.src) ? (
              <video
                ref={(node) => setVideoNode(layer.id, node)}
                src={layer.item.src}
                muted
                playsInline
                autoPlay={!frozen}
                loop={Boolean(layer.item.loop)}
                preload="auto"
                onEnded={() => onVideoEnded(layer)}
              />
            ) : (
              <img src={layer.item.src} alt="" draggable="false" />
            )}
          </div>
        ))}

        <div className={squareVisible ? 'square is-visible' : 'square'}>
          {squareLayers.map((layer) => (
            <img
              key={layer.id}
              src={layer.src}
              alt=""
              draggable="false"
              className={layer.on ? 'is-on' : ''}
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
        <div className="overlay" role="dialog" aria-label="About" onClick={closeOverlay}>
          <button className="close-hint" type="button">
            close
          </button>
          <div className="overlay-inner" onClick={(event) => event.stopPropagation()}>
            {ABOUT.portrait && (
              <img className="portrait" src={ABOUT.portrait} alt={ABOUT.name} draggable="false" />
            )}
            <p className="bio">{ABOUT.text}</p>
          </div>
        </div>
      )}

      {overlay === 'contact' && (
        <div className="overlay" role="dialog" aria-label="Contact" onClick={closeOverlay}>
          <button className="close-hint" type="button">
            close
          </button>
          <div className="overlay-inner is-contact" onClick={(event) => event.stopPropagation()}>
            <a className="contact-line" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
            {CONTACT.instagram && (
              <a
                className="contact-line"
                href={CONTACT.instagram.href}
                target="_blank"
                rel="noreferrer"
              >
                {CONTACT.instagram.label}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
