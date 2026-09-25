import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ArrowUpRight, 
  ChevronRight, 
  Layers, 
  Printer, 
  DollarSign, 
  Calendar, 
  User as UserIcon, 
  FileText, 
  Eye, 
  Sparkles, 
  Check, 
  X,
  PlayCircle
} from 'lucide-react';
import { PrintOrder, OrderStatus, PriorityLevel, UserRole } from '../types';

interface DashboardOrdersProps {
  orders: PrintOrder[];
  userRole: UserRole;
  onSelectOrder: (order: PrintOrder) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus, notes?: string) => Promise<void>;
  onRefresh: () => void;
  onNewOrder: () => void;
}

export const DashboardOrders: React.FC<DashboardOrdersProps> = ({
  orders,
  userRole,
  onSelectOrder,
  onUpdateStatus,
  onRefresh,
  onNewOrder
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Status counts
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const processingCount = orders.filter(o => o.status === 'processing').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.cost : 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && order.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.order_id.toLowerCase().includes(q);
      const matchDoc = order.document_name.toLowerCase().includes(q);
      const matchUser = order.user_name.toLowerCase().includes(q) || order.user_email.toLowerCase().includes(q);
      if (!matchId && !matchDoc && !matchUser) return false;
    }
    return true;
  });

  const handleQuickStatusChange = async (orderId: string, nextStatus: OrderStatus, defaultNote: string) => {
    setActionLoadingId(orderId);
    try {
      await onUpdateStatus(orderId, nextStatus, defaultNote);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 animate-pulse" />
            Processing
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ready for Pickup
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Cancelled
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    if (priority === 'urgent') {
      return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">Urgent</span>;
    }
    if (priority === 'express') {
      return <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Express</span>;
    }
    return <span className="px-2 py-0.5 text-[10px] font-medium text-slate-400">Standard</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Print Job Queue & Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-slate-800 text-indigo-400 border border-slate-700">
              {userRole === 'staff' ? 'Admin / Staff Mode' : userRole === 'manager' ? 'Executive Dashboard' : 'Student Mode'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time digital spooler queue with automated n8n webhook notifications and status progression logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Refresh Orders"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onNewOrder}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-2"
          >
            <span>+ Submit New Print Job</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl bg-slate-900 border transition-all cursor-pointer ${
            statusFilter === 'all' ? 'border-indigo-500 shadow-md shadow-indigo-500/10' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs text-slate-400 font-medium">Total Orders</span>
          <p className="text-2xl font-black text-white font-mono mt-1">{orders.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">All recorded print jobs</p>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl bg-slate-900 border transition-all cursor-pointer ${
            statusFilter === 'pending' ? 'border-amber-500 shadow-md shadow-amber-500/10' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-medium">Pending Queue</span>
            {pendingCount > 0 && <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
          </div>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">{pendingCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting print spool</p>
        </div>

        <div 
          onClick={() => setStatusFilter('processing')}
          className={`p-4 rounded-2xl bg-slate-900 border transition-all cursor-pointer ${
            statusFilter === 'processing' ? 'border-blue-500 shadow-md shadow-blue-500/10' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs text-blue-400 font-medium">In Processing</span>
          <p className="text-2xl font-black text-blue-400 font-mono mt-1">{processingCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active on press & binding</p>
        </div>

        <div 
          onClick={() => setStatusFilter('ready')}
          className={`p-4 rounded-2xl bg-slate-900 border transition-all cursor-pointer ${
            statusFilter === 'ready' ? 'border-emerald-500 shadow-md shadow-emerald-500/10' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs text-emerald-400 font-medium">Ready for Pickup</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{readyCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">At Counter #2 / Lockers</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-400 font-medium">Gross Revenue</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">${totalRevenue.toFixed(2)}</p>
          <p className="text-[11px] text-slate-500 mt-1">{completedCount} completed orders</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID, document, student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Statuses ({orders.length})</option>
              <option value="pending" className="bg-slate-900 text-white">Pending ({pendingCount})</option>
              <option value="processing" className="bg-slate-900 text-white">Processing ({processingCount})</option>
              <option value="ready" className="bg-slate-900 text-white">Ready ({readyCount})</option>
              <option value="completed" className="bg-slate-900 text-white">Completed ({completedCount})</option>
              <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Priorities</option>
              <option value="standard" className="bg-slate-900 text-white">Standard</option>
              <option value="express" className="bg-slate-900 text-white">Express</option>
              <option value="urgent" className="bg-slate-900 text-white">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Document & Specs</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Cost</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-medium">No print orders match your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isLoading = actionLoadingId === order.order_id;
                  return (
                    <tr 
                      key={order.order_id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectOrder(order)}
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-indigo-400 group-hover:text-indigo-300">
                          {order.order_id}
                        </span>
                      </td>

                      {/* Document & Specs */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-medium text-white truncate max-w-[200px]" title={order.document_name}>
                            {order.document_name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {order.copies} {order.copies === 1 ? 'copy' : 'copies'} · {order.paper_size} · {order.color_mode.toUpperCase()} · {order.duplex === 'double' ? 'Duplex' : 'Single'}
                          {order.binding !== 'none' && ` · ${order.binding}`}
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="text-white font-medium truncate max-w-[130px]">{order.user_name}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[130px]">{order.user_email}</p>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-emerald-400">${order.cost.toFixed(2)}</span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        {getPriorityBadge(order.priority)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Created */}
                      <td className="py-3.5 px-4 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Staff / Admin Workflow Controls */}
                          {(userRole === 'staff' || userRole === 'manager') && (
                            <>
                              {order.status === 'pending' && (
                                <button
                                  type="button"
                                  disabled={isLoading}
                                  onClick={() => handleQuickStatusChange(order.order_id, 'processing', 'Job accepted by operator. Spool sent to digital press.')}
                                  className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold border border-blue-500/30 transition-colors"
                                  title="Accept & Start Printing"
                                >
                                  Process
                                </button>
                              )}

                              {order.status === 'processing' && (
                                <button
                                  type="button"
                                  disabled={isLoading}
                                  onClick={() => handleQuickStatusChange(order.order_id, 'ready', 'Print and finishing complete. Dispatched to Pickup Counter #2.')}
                                  className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-500/30 transition-colors"
                                  title="Mark Ready & Trigger n8n Notification"
                                >
                                  Mark Ready
                                </button>
                              )}

                              {order.status === 'ready' && (
                                <button
                                  type="button"
                                  disabled={isLoading}
                                  onClick={() => handleQuickStatusChange(order.order_id, 'completed', 'Order picked up by customer. QR locker code verified.')}
                                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                                  title="Mark Completed"
                                >
                                  Complete
                                </button>
                              )}
                            </>
                          )}

                          {/* Customer Cancellation Option for Pending orders */}
                          {userRole === 'customer' && order.status === 'pending' && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleQuickStatusChange(order.order_id, 'cancelled', 'Order cancelled by customer. 100% refund initiated.')}
                              className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs font-medium border border-rose-500/30 transition-colors"
                              title="Cancel order before processing begins"
                            >
                              Cancel
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onSelectOrder(order)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="View full order details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
