/**
 * Add a small image to public/works/, then add its filename below.
 * DURATION is how long each image stays in the square, in milliseconds.
 */

const file = (name) => `./works/${name}`

export const DURATION = 450
export const CROSSFADE_MS = 180

export const SEQUENCE = [
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
].map(file)

export const ABOUT = {
  name: 'Panna Drenkó',
  text: `Panna Drenkó (Panna Drenko) is a visual artist and graphic designer working across installation, print, animation, and digital media, exploring how meaning emerges through symbols, gestures, and atmosphere. Her practice draws on folk stories, public signage, publishing, and natural forms, with a focus on transformation and care. She is completing her BA in Graphic Design at the Royal Academy of Art, The Hague (2026).`,
}

export const CONTACT = {
  email: 'drenkopanna@gmail.com',
  instagram: {
    label: '@pannathepan',
    href: 'https://www.instagram.com/pannathepan',
  },
}
