import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PolyCGPA - Kerala Polytechnic GPA Calculator',
    short_name: 'PolyCGPA',
    description: 'The definitive GPA calculation engine for Kerala Polytechnic students.',
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
