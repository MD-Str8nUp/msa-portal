'use client';

import { useAuth } from '@/lib/contexts/AuthContext';

export default function Home() {
  const { userDetails, loading, signOut } = useAuth();

  const handleManualRedirect = (path: string) => {
    window.location.href = path;
  };

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">MSA Portal</h1>
          <p className="text-gray-600">Scout Management System</p>
        </div>

        {userDetails ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Welcome back!</h2>
              <p className="text-gray-600">{userDetails.name || userDetails.email}</p>
              <p className="text-sm text-gray-500">Role: {userDetails.role}</p>
            </div>

            <div className="space-y-3">
              {userDetails.role?.toLowerCase() === 'parent' && (
                <button
                  onClick={() => handleManualRedirect('/parent/dashboard')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Parent Dashboard
                </button>
              )}

              {userDetails.role?.toLowerCase() === 'leader' && (
                <button
                  onClick={() => handleManualRedirect('/leader/dashboard')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Go to Leader Dashboard
                </button>
              )}

              {['executive', 'admin', 'exec'].includes(userDetails.role?.toLowerCase()) && (
                <button
                  onClick={() => handleManualRedirect('/admin/data-management')}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Go to Admin Panel
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Please sign in to continue</p>
              <button
                onClick={() => handleManualRedirect('/login')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        <div className="text-center">
          <a 
            href="/test-redirect" 
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Debug Page
          </a>
        </div>
      </div>
    </div>
  );
}
