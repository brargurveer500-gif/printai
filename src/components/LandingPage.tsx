import React, { useState } from 'react';
import { 
  Printer, 
  Sparkles, 
  UploadCloud, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  FileText, 
  Play, 
  DollarSign, 
  Layers, 
  Bot, 
  Webhook, 
  ChevronRight 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onRunLiveDemo: () => void;
  onOpenAI: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onRunLiveDemo,
  onOpenAI
}) => {
  // Quick interactive cost calculator on landing page
  const [calcPages, setCalcPages] = useState<number>(12);
  const [calcCopies, setCalcCopies] = useState<number>(2);
  const [calcColor, setCalcColor] = useState<'bw' | 'color'>('bw');
  const [calcDuplex, setCalcDuplex] = useState<boolean>(true);

  const calculateEstimate = () => {
    const base = calcColor === 'color' ? 0.25 : 0.05;
    let costPerCopy = 0;
    if (!calcDuplex) {
      costPerCopy = calcPages * base;
    } else {
      const full = Math.ceil(calcPages / 2);
      const discounted = Math.floor(calcPages / 2);
      costPerCopy = (full * base) + (discounted * base * 0.8);
    }
    return (costPerCopy * calcCopies).toFixed(2);
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Upload & Pre-flight Inspection',
      desc: 'Submit PDF, DOCX or images. Automated pre-flight checks verify DPI resolution, page counts, and formatting bounds.',
      icon: UploadCloud,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      step: '02',
      title: 'Smart Print Customization',
      desc: 'Configure copies, A4/A3/Letter sizes, duplex discounts, and finishing options (staple, spiral, hardcover) with live pricing.',
      icon: Layers,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      step: '03',
      title: 'Real-time Lifecycle Spooling',
      desc: 'Track jobs across Pending → Processing → Ready → Completed with full audit logs and kiosk QR pickup verification.',
      icon: Clock,
      color: 'from-violet-500 to-pink-500'
    },
    {
      step: '04',
      title: 'Gemini RAG & n8n Automation',
      desc: 'Instant answers grounded in real print policies, with automatic SMS/email dispatches via n8n workflow triggers.',
      icon: Sparkles,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const features = [
    {
      title: 'Zero WhatsApp / Slip Chaos',
      desc: 'Eliminates lost files, incorrect paper sizes, duplicate requests, and verbal miscommunications with structured digital jobs.',
      icon: ShieldCheck
    },
    {
      title: 'RAG Grounded Intelligence',
      desc: 'Google Gemini 3.8 Flash grounded strictly in official store policies, pricing schedules, and paper guidelines with transparent source citations.',
      icon: Bot
    },
    {
      title: 'Automated n8n Webhooks',
      desc: 'Instant webhook event emissions when orders are submitted or state transitions occur, powering automated notifications and fleet queueing.',
      icon: Webhook
    },
    {
      title: 'Enterprise Analytics',
      desc: 'Monitor print volume, ink & paper consumption, peak student turnaround times, and departmental revenue breakdown in real time.',
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Print Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Transform Printing Into an{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                Intelligent, Automated
              </span>{' '}
              Workflow
            </h1>

            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              PrintAI centralizes document submission, print order configuration, live queue tracking, 
              Gemini-powered RAG support, and n8n webhook automation for campus, corporate, and print service centers.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold text-base shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Submit Print Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onRunLiveDemo}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-base border border-amber-500/40 shadow-sm flex items-center space-x-2 transition-all"
              >
                <Play className="w-4 h-4 fill-amber-400" />
                <span>Run Section 15 Live Demo</span>
              </button>

              <button
                onClick={onOpenAI}
                className="px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-base border border-slate-700 flex items-center space-x-2 transition-all"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Ask AI Policy Assistant</span>
              </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-left">
              <div className="p-3 border-r border-slate-800/80 last:border-none">
                <p className="text-xs text-slate-400">Queue Processing</p>
                <p className="text-xl font-bold text-white font-mono mt-0.5">Under 15 Mins</p>
                <p className="text-[11px] text-emerald-400 flex items-center mt-1">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Express & Urgent Queues
                </p>
              </div>
              <div className="p-3 border-r border-slate-800/80 last:border-none">
                <p className="text-xs text-slate-400">RAG Grounding</p>
                <p className="text-xl font-bold text-white font-mono mt-0.5">100% Verified</p>
                <p className="text-[11px] text-indigo-400 flex items-center mt-1">
                  <Sparkles className="w-3 h-3 mr-1 inline" /> Zero Hallucinations Policy
                </p>
              </div>
              <div className="p-3 border-r border-slate-800/80 last:border-none">
                <p className="text-xs text-slate-400">Automation Engine</p>
                <p className="text-xl font-bold text-white font-mono mt-0.5">n8n Connected</p>
                <p className="text-[11px] text-cyan-400 flex items-center mt-1">
                  <Webhook className="w-3 h-3 mr-1 inline" /> Real-time Webhook Events
                </p>
              </div>
              <div className="p-3">
                <p className="text-xs text-slate-400">Duplex Paper Saving</p>
                <p className="text-xl font-bold text-white font-mono mt-0.5">20% Discount</p>
                <p className="text-[11px] text-amber-400 flex items-center mt-1">
                  <DollarSign className="w-3 h-3 mr-1 inline" /> Campus Eco-Print Mode
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Architecture */}
      <section className="py-16 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">End-to-End Digital Pipeline</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              From Document Upload to Kiosk Pickup in 4 Steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div 
                  key={idx}
                  className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-800 font-mono group-hover:text-slate-700 transition-colors">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Cost Estimator & Comparison Feature */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              Transparent Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Instant Quotation Engine with Bulk & Duplex Savings
            </h2>
            <p className="text-slate-300 leading-relaxed">
              No hidden fees or unexpected billing. Calculate prices in real time with our campus rate sheet: 
              B&W at $0.05/page, Color at $0.25/page, 20% discount on reverse duplex sides, and automatic 15% bulk discount for orders over 100 pages.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">
                  <strong className="text-white">Strict Quality Guarantee:</strong> Free 24h reprints for machine or toner misprints.
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">
                  <strong className="text-white">Full Cancellation Window:</strong> 100% instant refund while order is in "Pending" status.
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">
                  <strong className="text-white">Finishing Options:</strong> Corner staples ($0.30), coil spiral binding ($2.50), or thesis hardcover ($6.00).
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors"
              >
                <span>Upload Document & Order Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Calculator Card */}
          <div className="lg:col-span-6 bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Live Price Estimator</h3>
                <p className="text-xs text-slate-400">Simulate print cost based on official 2026 rate schedule</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Est. Total</span>
                <p className="text-3xl font-extrabold text-emerald-400 font-mono">${calculateEstimate()}</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {/* Pages Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                  <span>Document Page Count</span>
                  <span className="font-mono text-white font-bold">{calcPages} pages</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={calcPages}
                  onChange={(e) => setCalcPages(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Copies Stepper */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                  <span>Copies Needed</span>
                  <span className="font-mono text-white font-bold">{calcCopies} {calcCopies === 1 ? 'copy' : 'copies'}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={calcCopies}
                  onChange={(e) => setCalcCopies(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Color Mode Toggle */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Color Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCalcColor('bw')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      calcColor === 'bw'
                        ? 'bg-slate-800 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Black & White ($0.05/pg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcColor('color')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      calcColor === 'color'
                        ? 'bg-slate-800 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Full Color ($0.25/pg)
                  </button>
                </div>
              </div>

              {/* Duplex Toggle */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Duplex Setting</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCalcDuplex(false)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      !calcDuplex
                        ? 'bg-slate-800 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Single-Sided (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcDuplex(true)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      calcDuplex
                        ? 'bg-slate-800 border-indigo-500 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Double-Sided (20% Off 2nd Side)
                  </button>
                </div>
              </div>

              {calcPages * calcCopies >= 100 && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Bulk Order Discount Active! 15% discount applied for orders exceeding 100 total pages.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-slate-900/30 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
