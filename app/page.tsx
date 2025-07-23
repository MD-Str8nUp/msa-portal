export default function Home() {
  // Middleware will handle redirects automatically
  // If user is not logged in -> redirect to /login
  // If user is logged in -> redirect to /dashboard
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">MSA Portal</h1>
        <div className="text-gray-600">Redirecting...</div>
      </div>
    </div>
  );
}
