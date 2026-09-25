import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Layers, 
  Printer, 
  Sparkles, 
  Webhook, 
  BarChart3, 
  RotateCcw,
  Bot
} from 'lucide-react';

interface LiveDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
  onRefreshData: () => void;
}

interface StepItem {
  id: number;
  title: string;
  desc: string;
  status: 'pending' | 'running' | 'completed';
  result?: any;
}

export const LiveDemoModal: React.FC<LiveDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onRefreshData
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [demoOrderInfo, setDemoOrderInfo] = useState<any>(null);
  const [aiAnswerInfo, setAiAnswerInfo] = useState<any>(null);
  const [demoSteps, setDemoSteps] = useState<StepItem[]>([
    {
      id: 1,
      title: 'Step 1: Upload Sample Document',
      desc: 'System uploads Machine_Learning_Lecture_Notes_Final.pdf and passes pre-flight checks.',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Step 2: Create Print Order',
      desc: 'Creates order with 2 copies, A4, B&W, duplex, staple binding. Generates unique Order ID.',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Step 3: Admin Spools Job',
      desc: 'Staff operator claims job and transitions status from Pending → Processing.',
      status: 'pending'
    },
    {
      id: 4,
      title: 'Step 4: Mark Ready for Pickup',
      desc: 'Printing and stapling finish. Status transitions to Ready and Locker assigned.',
      status: 'pending'
    },
    {
      id: 5,
      title: 'Step 5: Trigger n8n Automation Webhook',
      desc: 'Dispatches "order.ready" payload to n8n for student pickup notification.',
      status: 'pending'
    },
    {
      id: 6,
      title: 'Step 6: Query Gemini RAG Assistant',
      desc: 'Asks: "What is the refund and reprint policy if my printed pages have toner streaks?"',
      status: 'pending'
    },
    {
      id: 7,
      title: 'Step 7: Live Analytics Update',
      desc: 'New print volume and revenue automatically reflected in operational charts.',
      status: 'pending'
    }
  ]);

  if (!isOpen) return null;

  const runFullScenario = async () => {
    setIsRunning(true);
    setActiveStep(1);

    // Update step 1 running
    setDemoSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: 'running' } : s));

    try {
      // Call the server runner
      const res = await fetch('/api/demo/run-scenario', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to run demo scenario on server');
      }

      const data = await res.json();
      setDemoOrderInfo(data.demoScenarioSteps[1]);
      setAiAnswerInfo(data.demoScenarioSteps[5]);

      // Animate through steps for maximum visual clarity
      for (let i = 1; i <= 7; i++) {
        setActiveStep(i);
        setDemoSteps(prev => prev.map(s => {
          if (s.id < i) return { ...s, status: 'completed' };
          if (s.id === i) return { ...s, status: 'running' };
          return s;
        }));
        await new Promise(r => setTimeout(r, 600));
      }

      setDemoSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
      onRefreshData();
    } catch (err) {
      console.error('Demo error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">PRD Section 15 Live Demo Scenario</h2>
            <p className="text-xs text-slate-400">Automated end-to-end simulation from document upload to RAG inquiry & analytics</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="my-6">
          <button
            onClick={runFullScenario}
            disabled={isRunning}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
          >
            {isRunning ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Executing Demo Scenario Steps...</span>
              </span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Complete Live Demo Workflow (7 Steps)</span>
              </>
            )}
          </button>
        </div>

        {/* Step-by-Step Progress List */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {demoSteps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isStepRunning = step.status === 'running';

            return (
              <div 
                key={step.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isStepRunning
                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-sm'
                    : isCompleted
                    ? 'bg-slate-950 border-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isStepRunning ? (
                      <span className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin block" />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-mono">
                        {step.id}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center justify-between">
                      <span>{step.title}</span>
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-mono">Verified OK</span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Output Snapshot Preview once completed */}
        {demoOrderInfo && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">
              Demo Output Result:
            </span>
            <div className="flex justify-between">
              <span className="text-slate-400">Created Order ID:</span>
              <span className="font-mono font-bold text-indigo-400">{demoOrderInfo.orderId}</span>
            </div>
            {aiAnswerInfo && (
              <div className="mt-2 pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 block font-semibold mb-1">RAG Grounded Response:</span>
                <p className="text-slate-300 italic line-clamp-3">
                  "{aiAnswerInfo.answer}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Shortcuts */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => {
              onClose();
              onNavigateToTab('dashboard');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            View in Dashboard Queue
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigateToTab('ai');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Open AI Assistant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
