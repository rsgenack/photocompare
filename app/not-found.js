export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-medium mb-6">Page Not Found</h2>
        <p className="mb-8 text-muted-foreground">The page you are looking for doesn't exist or has been moved.</p>
        <a href="/" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md">
          Return Home
        </a>
      </div>
    </div>
  )
}

