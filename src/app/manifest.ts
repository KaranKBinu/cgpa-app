import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PolyGrade - Kerala Polytechnic GPA & CGPA Calculator',
    short_name: 'PolyGrade',
    description: 'The most accurate GPA and CGPA calculator for Kerala Polytechnic students with PDF transcript support.',
    start_url: '/',
    display: 'standalone',
    background_color: '#064e3b',
    theme_color: '#10b981',
    icons: [
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
