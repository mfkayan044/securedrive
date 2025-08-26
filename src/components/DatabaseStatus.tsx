import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase, adminSupabase, isSupabaseConfigured } from '../lib/supabase';

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'no-config'>('checking');
  const [error, setError] = useState<string>('');
  const [tableCount, setTableCount] = useState<number>(0);

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  const checkDatabaseConnection = async () => {
    try {
      // Check if environment variables exist
      if (!isSupabaseConfigured()) {
        setStatus('no-config');
        setError('Supabase environment variables not found. Please connect to Supabase.');
        return;
      }

      if (!supabase) {
        setStatus('error');
        setError('Supabase client initialization failed.');
        return;
      }

      // Test connection by fetching locations (prefer adminSupabase if available, else use supabase)
      const client = adminSupabase || supabase;
      const { data, error: dbError } = await client
        .from('locations')
        .select('*')
        .limit(1);

      if (dbError) {
        setStatus('error');
        setError(`Database error: ${dbError.message}`);
        return;
      }

      // Get total count
      const { count, error: countError } = await client
        .from('locations')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.warn('Count error:', countError);
        setTableCount(data?.length || 0);
      } else {
        setTableCount(count || 0);
      }

      setStatus('connected');
    } catch (err) {
      setStatus('error');
      setError(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader className="w-5 h-5 animate-spin text-blue-600" />;
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'no-config':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Database className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'checking':
        return 'Veritabanı bağlantısı kontrol ediliyor...';
      case 'connected':
        return `✅ Supabase bağlantısı başarılı! (${tableCount} lokasyon)`;
      case 'error':
        return `❌ Veritabanı hatası: ${error}`;
      case 'no-config':
        return '⚠️ Supabase yapılandırması bulunamadı';
      default:
        return 'Bilinmeyen durum';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'no-config':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div>
          <h3 className="font-semibold">Veritabanı Durumu</h3>
          <p className="text-sm">{getStatusMessage()}</p>
          {status === 'no-config' && (
            <p className="text-xs mt-1">
              Sağ üstteki "Connect to Supabase" butonuna tıklayın.
            </p>
          )}
          {status === 'error' && (
            <button
              onClick={checkDatabaseConnection}
              className="text-xs mt-2 px-2 py-1 bg-white rounded border hover:bg-gray-50"
            >
              Tekrar Dene
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatus;