import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RotateCcw, 
  Play, 
  Code, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  Bell,
  MessageSquare
} from 'lucide-react';
import { AutomationLog } from '../types';

export const Automations: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/automations');
      if (res.ok) {
        const data = await res.json();
        setWebhookUrl(data.webhook_url);
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching automations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleTestPing = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/automations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: webhookUrl })
      });
      if (res.ok) {
        const newLog = await res.json();
        setLogs(prev => [newLog, ...prev]);
        setStatusMessage('Webhook test event dispatched successfully!');
      }
    } catch (err: any) {
      setStatusMessage(`Test failed: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSimulateReadySMS = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/webhooks/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order.ready',
          orderId: 'PRT-9821',
          customerName: 'Sarah Jenkins',
          customerEmail: 's.jenkins@campus.edu',
          status: 'ready',
          pickupLocation: 'Counter #2, Building B (Locker #5)',
          message: 'Your print order PRT-9821 is ready for contactless pickup at Locker #5.',
          action: 'send_sms_and_email'
        })
      });
      if (res.ok) {
        await fetchAutomations();
        setStatusMessage('Simulated "order.ready" SMS automation workflow successfully!');
      }
    } catch (err: any) {
      setStatusMessage(`Simulation error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Webhook className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-extrabold text-white">n8n Automation Engine & Webhooks</h1>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Active Listeners
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time webhook events triggered on order creation and lifecycle status changes for automatic SMS dispatches and queue routing.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={fetchAutomations}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Refresh logs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleTestPing}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-cyan-600/20 flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Ping Webhook</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Webhook Configuration & Architecture Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoint Config */}
        <div className="lg:col-span-6 bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>n8n Webhook Configuration</span>
          </h3>
          <p className="text-xs text-slate-400">
            PrintAI POSTs JSON payloads to this endpoint whenever an order is submitted, moved to processing, or marked ready for customer collection.
          </p>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Webhook URL</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={handleSimulateReadySMS}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate "Order Ready" SMS Workflow</span>
            </button>
          </div>
        </div>

        {/* Workflow Diagram */}
        <div className="lg:col-span-6 bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2">Automation Workflow Architecture</h3>
            <p className="text-xs text-slate-400">
              Event pipeline executed automatically when order states change:
            </p>
          </div>

          <div className="my-4 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 text-xs">
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">1</span>
              <span className="text-slate-300 font-medium">PrintAI Order Event Triggered (`order.created` / `order.ready`)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">2</span>
              <span className="text-slate-300 font-medium">n8n Webhook Ingestion Node receives structured JSON</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">3</span>
              <span className="text-slate-300 font-medium">Workflow Branches: SMS notification to student + Print spooler ping</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">4</span>
              <span className="text-emerald-400 font-medium">Status Sync confirmed with 200 OK delivery receipt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Execution Logs Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Live Automation Event Logs</h3>
            <p className="text-xs text-slate-400">Audit record of dispatched n8n webhooks, response status codes, and JSON payloads.</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{logs.length} Total Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.map((log) => {
                const isExpanded = expandedLogId === log.event_id;
                return (
                  <React.Fragment key={log.event_id}>
                    <tr 
                      onClick={() => setExpandedLogId(isExpanded ? null : log.event_id)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-cyan-400 font-bold">{log.event_id}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-mono font-semibold text-[11px] bg-slate-800 text-slate-300">
                          {log.event_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">{log.order_id}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {log.status_code} {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-slate-300 truncate max-w-xs">{log.response_summary}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-slate-400 hover:text-white">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable JSON Payload Viewer */}
                    {isExpanded && (
                      <tr className="bg-slate-950">
                        <td colSpan={7} className="p-4 border-b border-slate-800/80">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                              Webhook Request Payload (JSON):
                            </span>
                            <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
