import "./globals.css"

export const metadata = {
  title: "VOTOGRAPHER",
  description: "Compare and rank your photos",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <main>{children}</main>
        <footer className="container mx-auto mt-12 text-center border-t border-black pt-4">
          <p className="font-medium text-black font-sans">© {new Date().getFullYear()} VOTOGRAPHER</p>
        </footer>
      </body>
    </html>
  )
}


import './globals.css'