import React, { useState } from 'react';
import { RefreshCw, Database, Terminal, Server, Code, Wifi } from 'lucide-react';

interface DevHubProps {
  lang: string;
  t: (key: string) => string;
  triggerToast: (msg: string) => void;
}

export default function DevHub({ lang, t, triggerToast }: DevHubProps) {
  const [logs, setLogs] = useState<string[]>([
    "Laravel 12 kernel booted successfully (0.015s)",
    "Breeze authentication guards mapped default:web",
    "Database seeding: populated 7 active Cambodian Room records",
    "API endpoint loaded: GET /api/v1/rooms",
    "API endpoint loaded: POST /api/v1/auth/login",
    "CRON scheduler: calculated utility billing meters"
  ]);
  const [syncing, setSyncing] = useState(false);

  const triggerMockSync = () => {
    setSyncing(true);
    const newLogs = [
      `Initiating DB Sync with Remote host: ${new Date().toISOString()}`,
      "Syncing sqlite local database tables...",
      "SELECT * FROM rooms WHERE status = 'Occupied'",
      "Syncing guest registries: updated 3 rows",
      "Sync accomplished. Consolidated 0 structural conflicts.",
      "Laravel response returned code: 200 OK"
    ];

    setTimeout(() => {
      setLogs(prev => [...newLogs, ...prev]);
      setSyncing(false);
      triggerToast(lang === 'en' ? "Consolidated database tables with cloud storage." : "សមកាលកម្មទិន្នន័យជាមួយក្លោដបានជោគជ័យ។");
    }, 1500);
  };

  const controllerSnippet = `<?php

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Room;
use Illuminate\\Http\\Request;

class RoomManagementController extends Controller
{
    /**
     * Display a listing of rooms.
     * Laravel 12 High Performance REST API
     */
    public function index(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => Room::with('currentStays')->get()
        ], 200);
    }
}`;

  return (
    <div className="space-y-6">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{t('devHub')}</h2>
          <p className="text-xs text-slate-400">Inspect the Laravel 12 application stack, active route signatures, and trigger remote sync events.</p>
        </div>

        <button
          onClick={triggerMockSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Tables...' : t('syncDatabase')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* API Routes & MVC signatures */}
        <div className="lg:col-span-7 bg-slate-800/20 border border-slate-700/60 p-5 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-700 pb-3">
            <Code className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Laravel 12 API Controller Signature</h3>
          </div>

          <pre className="bg-slate-900 text-xs text-slate-300 p-4 rounded-xl overflow-x-auto font-mono leading-normal border border-slate-750 max-h-[350px]">
            {controllerSnippet}
          </pre>

          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-750/30 text-xs space-y-2">
            <span className="font-bold text-slate-205 block uppercase tracking-wider text-[10px]">Registered API Routes:</span>
            <div className="flex justify-between font-mono bg-slate-900 p-2 rounded">
              <span className="text-emerald-400 text-[11px]">GET /api/v1/branch/rooms</span>
              <span className="text-slate-500">Route::apiResource('rooms')</span>
            </div>
            <div className="flex justify-between font-mono bg-slate-900 p-2 rounded">
              <span className="text-emerald-400 text-[11px]">POST /api/v1/branch/invoice</span>
              <span className="text-slate-500">SettleInvoiceController@store</span>
            </div>
          </div>
        </div>

        {/* Live system state diagnostic terminal */}
        <div className="lg:col-span-5 bg-slate-800/20 border border-slate-700/60 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-slate-700 pb-3 mb-4">
              <Terminal className="w-4.5 h-4.5 text-indigo-400" />
              <h3 className="font-semibold text-slate-100 text-sm">System Logs & DB Query Audit</h3>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-4 font-mono text-[11px] text-indigo-300 space-y-2.5 max-h-[350px] overflow-y-auto border border-slate-750">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <span className="text-slate-500 select-none">&rarr;</span>
                  <p className="text-slate-250 leading-relaxed font-mono">{log}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 space-y-2 text-xs">
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Database Driver:</span>
              <span className="text-indigo-400 font-bold">MySQL (Production Cluster)</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-slate-400">Authentication Service:</span>
              <span className="text-emerald-400 font-bold">Laravel Breeze Auth Active</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t border-slate-800">
              <span className="text-slate-400">Cloud API Integration:</span>
              <span className="text-indigo-400 font-bold">Cloud Run Sandbox Service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
