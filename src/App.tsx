import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardOrders } from './components/DashboardOrders';
import { SubmitOrder } from './components/SubmitOrder';
import { AIAssistant } from './components/AIAssistant';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Automations } from './components/Automations';
import { Analytics } from './components/Analytics';
import { OrderDetailModal } from './components/OrderDetailModal';
import { LiveDemoModal } from './components/LiveDemoModal';
import { PrintOrder, OrderStatus, UserRole } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PrintOrder | null>(null);
  const [isLiveDemoOpen, setIsLiveDemoOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Update order status handler
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, notes?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          changed_by: userRole === 'staff' ? 'Morgan Chen (Lead Staff)' : userRole === 'manager' ? 'Dr. Vance (Manager)' : 'Alex Rivera (Customer)',
          notes
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Update local orders list
        setOrders(prev => prev.map(o => o.order_id === orderId ? data.order : o));
        if (selectedOrder && selectedOrder.order_id === orderId) {
          setSelectedOrder(data.order);
        }
        showToast(`Order ${orderId} updated to ${newStatus.toUpperCase()}`);
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      showToast(`Error: ${err.message}`);
    }
  };

  // Reset data handler
  const handleResetData = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        await fetchOrders();
        showToast('Demo database reset to factory defaults.');
      }
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  // When order is created from SubmitOrder
  const handleOrderCreated = (newOrder: PrintOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    showToast(`Order ${newOrder.order_id} placed! n8n automation dispatched.`);
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onRunLiveDemo={() => setIsLiveDemoOpen(true)}
        onResetData={handleResetData}
        pendingCount={pendingCount}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentTab('order')}
            onRunLiveDemo={() => setIsLiveDemoOpen(true)}
            onOpenAI={() => setCurrentTab('ai')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardOrders
            orders={orders}
            userRole={userRole}
            onSelectOrder={(order) => setSelectedOrder(order)}
            onUpdateStatus={handleUpdateStatus}
            onRefresh={fetchOrders}
            onNewOrder={() => setCurrentTab('order')}
          />
        )}

        {currentTab === 'order' && (
          <SubmitOrder
            onOrderCreated={handleOrderCreated}
            onGoToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'ai' && <AIAssistant />}

        {currentTab === 'knowledge' && (
          <KnowledgeBase
            userRole={userRole}
            onSelectQuestionInAI={(q) => {
              setCurrentTab('ai');
            }}
          />
        )}

        {currentTab === 'automations' && <Automations />}

        {currentTab === 'analytics' && <Analytics />}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          userRole={userRole}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Section 15 Live Demo Modal */}
      <LiveDemoModal
        isOpen={isLiveDemoOpen}
        onClose={() => setIsLiveDemoOpen(false)}
        onNavigateToTab={(tab) => setCurrentTab(tab)}
        onRefreshData={fetchOrders}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>PrintAI Management Dashboard & RAG Intelligence Engine © 2026. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Model: Gemini 3.8 Flash</span>
            <span>·</span>
            <span>n8n Webhook: Enabled</span>
            <span>·</span>
            <span>Storage: In-Memory / File Persistent</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
