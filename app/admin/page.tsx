'use client';

import { useState } from 'react';

export default function AdminImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    setImporting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/import-msa-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Import failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    setImporting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-800 mb-2">
            🕌 Mi'raj Scouts Academy
          </h1>
          <p className="text-teal-600">Database Import Administration</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Import Real MSA Data</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              This will import:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>3 Scout groups (Joeys, Cubs, Scouts)</li>
              <li>12+ Real MSA leaders and staff</li>
              <li>18+ Sample Islamic families with scouts</li>
              <li>Sample events and activities</li>
              <li>Leader group assignments</li>
            </ul>
          </div>
          
          <button
            onClick={handleImport}
            disabled={importing}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white ${
              importing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {importing ? '🔄 Importing Data...' : '🚀 Import Mi\'raj Scouts Data'}
          </button>
          
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? '✅ Import Successful!' : '❌ Import Failed'}
              </h3>
              
              {result.success ? (
                <div className="space-y-2 text-sm text-green-700">
                  <p><strong>Message:</strong> {result.message}</p>
                  <div>
                    <strong>Statistics:</strong>
                    <ul className="list-disc list-inside ml-4">
                      <li>Parents: {result.stats.parents}</li>
                      <li>Scouts: {result.stats.scouts}</li> 
                      <li>Leaders: {result.stats.leaders}</li>
                      <li>Total Users: {result.stats.totalUsers}</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Group Distribution:</strong>
                    <ul className="list-disc list-inside ml-4">
                      <li>Joeys: {result.groupDistribution.joeys}</li>
                      <li>Cubs: {result.groupDistribution.cubs}</li>
                      <li>Scouts: {result.groupDistribution.scouts}</li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 p-3 bg-green-100 rounded">
                    <p className="font-semibold text-green-800">🎉 Next Steps:</p>
                    <ul className="text-sm text-green-700 list-disc list-inside mt-1">
                      <li>Visit your <a href="/leader/dashboard" className="underline">Leader Dashboard</a></li>
                      <li>Check <a href="/api/scouts" className="underline">Scout API</a></li>
                      <li>Test <a href="/api/attendance" className="underline">Attendance API</a></li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-700">
                  <p><strong>Error:</strong> {result.error}</p>
                  {result.details && <p><strong>Details:</strong> {result.details}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
