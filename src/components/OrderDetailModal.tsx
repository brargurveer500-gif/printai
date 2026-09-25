import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  FileText, 
  User, 
  Layers, 
  History, 
  QrCode, 
  Download, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PrintOrder, StatusLog, OrderStatus, UserRole } from '../types';

interface OrderDetailModalProps {
  order: PrintOrder;
  userRole: UserRole;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus, notes?: string) => Promise<void>;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  userRole,
  onClose,
  onUpdateStatus
}) => {
  const [logs, setLogs] = useState<StatusLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [nextNote, setNextNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch status logs for this order
  const fetchOrderDetails = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/orders/${order.order_id}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.status_logs || []);
      }
    } catch (err) {
      console.error('Failed to load order logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [order.order_id]);

  const handleStatusAdvance = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(
        order.order_id,
        newStatus,
        nextNote.trim() ? nextNote : `Updated status to ${newStatus} by ${userRole}`
      );
      setNextNote('');
      await fetchOrderDetails();
    } finally {
      setIsUpdating(false);
    }
  };

  // Progression steps
  const steps: { key: OrderStatus; label: string }[] = [
    { key: 'pending', label: '1. Pending' },
    { key: 'processing', label: '2. Processing' },
    { key: 'ready', label: '3. Ready' },
    { key: 'completed', label: '4. Completed' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-2xl font-black text-indigo-400">{order.order_id}</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-800 text-white border border-slate-700">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Submitted on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Invoiced</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">${order.cost.toFixed(2)}</span>
          </div>
        </div>

        {/* Status Lifecycle Progress Stepper */}
        {order.status !== 'cancelled' ? (
          <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
              {steps.map((st, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = order.status === st.key;
                return (
                  <div key={st.key} className="relative z-10 flex flex-col items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] font-semibold mt-1.5 ${isCurrent ? 'text-indigo-400 font-bold' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="my-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>This order was cancelled. Per policy, 100% refund was dispatched to the customer account.</span>
          </div>
        )}

        {/* Specifications & Document Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Document & Print Specs */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Print Parameters</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Document File:</span>
                <span className="text-white font-medium truncate max-w-[180px]">{order.document_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Page Count:</span>
                <span className="text-white font-mono">{order.page_count} pgs/copy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Copies:</span>
                <span className="text-white font-mono font-bold">{order.copies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Color Mode:</span>
                <span className="text-white font-medium capitalize">{order.color_mode === 'color' ? 'Full Color' : 'Black & White'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Paper Size:</span>
                <span className="text-white font-medium">{order.paper_size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duplex Mode:</span>
                <span className="text-white font-medium">{order.duplex === 'double' ? 'Double-Sided (-20%)' : 'Single-Sided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Finishing / Binding:</span>
                <span className="text-white font-medium capitalize">{order.binding}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Priority Level:</span>
                <span className="text-white font-medium capitalize">{order.priority}</span>
              </div>
            </div>
          </div>

          {/* Customer & Pickup Verification */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Kiosk Pickup Voucher</span>
            </h4>
            <div className="flex items-center space-x-4 pt-1">
              {/* Mock QR Code Pattern */}
              <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-900 rounded grid grid-cols-4 gap-0.5 p-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-sm ${i % 3 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-transparent'}`} 
                    />
                  ))}
                </div>
              </div>
              <div className="text-xs space-y-1">
                <p className="text-slate-400">Pickup Counter:</p>
                <p className="text-white font-bold">Counter #2, Building B</p>
                <p className="text-slate-400 mt-2">Customer:</p>
                <p className="text-white font-medium truncate">{order.user_name}</p>
                <p className="text-slate-500 text-[11px] truncate">{order.user_email}</p>
              </div>
            </div>

            {order.notes && (
              <div className="mt-2 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 block font-medium">Customer Note:</span>
                <p className="text-xs text-slate-300 italic mt-0.5">"{order.notes}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Transition Action Bar */}
        {(userRole === 'staff' || userRole === 'manager') && order.status !== 'completed' && order.status !== 'cancelled' && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">
              Operator Quick Action (Advances Queue & Fires n8n Webhook)
            </h4>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="text"
                placeholder="Optional operator log notes (e.g. Printed on Canon Pro 4000, placed in Locker #3)..."
                value={nextNote}
                onChange={(e) => setNextNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center space-x-2 shrink-0">
                {order.status === 'pending' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusAdvance('processing')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                  >
                    Start Processing
                  </button>
                )}
                {order.status === 'processing' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusAdvance('ready')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                  >
                    Mark Ready for Pickup
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleStatusAdvance('completed')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                  >
                    Mark Picked Up / Completed
                  </button>
                )}
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusAdvance('cancelled')}
                  className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-medium border border-rose-500/30 transition-colors"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Self-Cancel for Pending Orders */}
        {userRole === 'customer' && order.status === 'pending' && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6 flex items-center justify-between">
            <span className="text-xs text-slate-300">
              Need to make changes? You can cancel with 100% full refund before print spooling begins.
            </span>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusAdvance('cancelled')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shrink-0 ml-3"
            >
              Cancel & Refund
            </button>
          </div>
        )}

        {/* Status History Audit Logs Table */}
        <div className="border-t border-slate-800 pt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 mb-3">
            <History className="w-4 h-4 text-indigo-400" />
            <span>Audit Trail & Status History</span>
          </h4>

          {loadingLogs ? (
            <p className="text-xs text-slate-500 py-3">Loading history logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">No state transitions recorded yet.</p>
          ) : (
            <div className="bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">State Transition</th>
                    <th className="py-2.5 px-3">Operator / Actor</th>
                    <th className="py-2.5 px-3">Log Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.map((lg) => (
                    <tr key={lg.log_id} className="hover:bg-slate-900/40">
                      <td className="py-2 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(lg.changed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-semibold text-slate-300 capitalize">{lg.old_status}</span>
                        <span className="text-indigo-400 mx-1">→</span>
                        <span className="font-semibold text-white capitalize">{lg.new_status}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{lg.changed_by}</td>
                      <td className="py-2 px-3 text-slate-400 italic">{lg.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
