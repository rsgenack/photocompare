import "./globals.css"

export const metadata = {
  title: "PhotoCompare",
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
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <main>{children}</main>
        <footer className="container mx-auto mt-12 text-center border-t border-gray-200 pt-4">
          <p className="font-medium text-gray-600">© {new Date().getFullYear()} PhotoCompare</p>
        </footer>
      </body>
    </html>
  )
}



import './globals.css'