/**
 * Exhibition sequence
 * -------------------
 * Put files in public/works/ then point to them here.
 *
 * Background item fields:
 *   src            path from the site root, e.g. './works/1.jpg' or './works/3.mp4'
 *   duration       milliseconds the background should stay on screen.
 *                  Omit this on videos to play the file's natural length.
 *   loop           videos only. If true, the video loops until `duration` elapses.
 *   square         optional. One image, an array of images, or omitted/[] to hide the square.
 *                  Each square entry can be a string path or { src, duration }.
 *   holdForSquare  if true, the background waits until the square sequence finishes
 *                  (useful for book presentations). If a video ends first, it freezes
 *                  on the last frame.
 *   squareEnd      'hide' fades the square out after its last image.
 *                  'hold' keeps the last square image until the background item ends.
 *
 * Timing tips:
 *   Images usually feel right between 800 and 3000 ms.
 *   Very short durations (400–700 ms) create flashes.
 *   Longer durations (4–8 s) give the square time to present a book.
 */

const works = (file) => `./works/${file}`

export const CROSSFADE_MS = 220

export const ABOUT = {
  name: 'Panna Drenkó',
  portrait: works('portrait.jpg'),
  text: `Panna Drenkó (Panna Drenko) is a visual artist and graphic designer working across installation, print, animation, and digital media, exploring how meaning emerges through symbols, gestures, and atmosphere. Her practice draws on folk stories, public signage, publishing, and natural forms, with a focus on transformation and care. She is completing her BA in Graphic Design at the Royal Academy of Art, The Hague (2026).`,
}

export const CONTACT = {
  email: 'drenkopanna@gmail.com',
  instagram: {
    label: '@pannathepan',
    href: 'https://www.instagram.com/pannathepan',
  },
}

export const SEQUENCE = [
  // Background image 1 — no square
  {
    src: works('1.jpg'),
    duration: 1400,
  },

  // Background image 2 — no square, slightly faster
  {
    src: works('2.jpg'),
    duration: 1100,
  },

  // Background image 3 with center square image 1
  {
    src: works('4.jpg'),
    duration: 2000,
    square: [{ src: works('square-1.jpg'), duration: 2000 }],
  },

  // Background image 4 with center square image 2
  {
    src: works('5.jpg'),
    duration: 1800,
    square: [{ src: works('square-2.jpg'), duration: 1800 }],
  },

  // Background video 1 with square images 3 then 4
  // The video plays once (natural duration). The square changes independently.
  {
    src: works('3.mp4'),
    square: [
      { src: works('square-3.jpg'), duration: 2200 },
      { src: works('square-4.jpg'), duration: 2200 },
    ],
    squareEnd: 'hide',
  },

  // Background image 5 — square gone, a brief flash
  {
    src: works('7.jpg'),
    duration: 700,
  },

  // Background image 6 — book presentation in the square
  // holdForSquare keeps this still until cover + spreads have shown.
  {
    src: works('6.jpg'),
    duration: 1600,
    holdForSquare: true,
    squareEnd: 'hide',
    square: [
      { src: works('book-cover.jpg'), duration: 1600 },
      { src: works('book-spread-1.jpg'), duration: 1800 },
      { src: works('book-spread-2.jpg'), duration: 1800 },
    ],
  },
]
