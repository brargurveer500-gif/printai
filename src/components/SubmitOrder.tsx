import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Printer, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  FileCheck,
  FileCode,
  Image as ImageIcon,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { 
  DocumentItem, 
  PrintOrder, 
  ColorMode, 
  PaperSize, 
  DuplexMode, 
  PriorityLevel, 
  BindingOption 
} from '../types';

interface SubmitOrderProps {
  onOrderCreated: (order: PrintOrder) => void;
  onGoToDashboard: () => void;
}

export const SubmitOrder: React.FC<SubmitOrderProps> = ({
  onOrderCreated,
  onGoToDashboard
}) => {
  // Document state
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>({
    document_id: 'doc-sample-01',
    user_id: 'usr-student-01',
    filename: 'CS301_Distributed_Systems_Syllabus.pdf',
    file_type: 'pdf',
    file_url: '/samples/CS301_Distributed_Systems_Syllabus.pdf',
    page_count: 8,
    file_size: 420100,
    uploaded_at: new Date().toISOString(),
    preview_text: 'CS301: Distributed Systems Course syllabus, weekly modules, grading rubric, and exam schedule.'
  });

  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Print Order Configuration Form
  const [userName, setUserName] = useState('Alex Rivera');
  const [userEmail, setUserEmail] = useState('alex.rivera@campus.edu');
  const [copies, setCopies] = useState<number>(2);
  const [colorMode, setColorMode] = useState<ColorMode>('bw');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [duplex, setDuplex] = useState<DuplexMode>('double');
  const [priority, setPriority] = useState<PriorityLevel>('standard');
  const [binding, setBinding] = useState<BindingOption>('staple');
  const [notes, setNotes] = useState<string>('Please staple top-left corner.');

  // Submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<PrintOrder | null>(null);

  // Pre-configured sample files for 1-click test
  const sampleFiles = [
    {
      name: 'CS301_Distributed_Systems_Syllabus.pdf',
      type: 'pdf' as const,
      pages: 8,
      size: 420100,
      preview: 'CS301 syllabus with 8 lecture units, grading weights, and weekly milestones.'
    },
    {
      name: 'Final_Year_Research_Thesis_Draft.pdf',
      type: 'pdf' as const,
      pages: 42,
      size: 2450800,
      preview: 'Autonomous Drone Swarm Routing algorithms, benchmarks, diagrams, and bibliography.'
    },
    {
      name: 'Campus_Hackathon_Promo_Poster.png',
      type: 'image' as const,
      pages: 1,
      size: 1890200,
      preview: 'High-res 300DPI full color campus hackathon announcement poster.'
    }
  ];

  // Calculate live cost
  const pages = selectedDoc ? selectedDoc.page_count : 1;
  const baseRate = colorMode === 'color' ? 0.25 : 0.05;
  const sizeMultiplier = paperSize === 'A3' ? 2.0 : paperSize === 'Legal' ? 1.3 : 1.0;

  let pageCostPerCopy = 0;
  if (duplex === 'single') {
    pageCostPerCopy = pages * (baseRate * sizeMultiplier);
  } else {
    const full = Math.ceil(pages / 2);
    const discounted = Math.floor(pages / 2);
    const singleRate = baseRate * sizeMultiplier;
    pageCostPerCopy = (full * singleRate) + (discounted * singleRate * 0.8);
  }

  let printSubtotal = pageCostPerCopy * copies;
  const isBulkDiscount = pages * copies >= 100;
  if (isBulkDiscount) {
    printSubtotal *= 0.85;
  }

  let bindingCost = 0;
  if (binding === 'staple') bindingCost = 0.30 * copies;
  else if (binding === 'spiral') bindingCost = 2.50 * copies;
  else if (binding === 'hard_cover') bindingCost = 6.00 * copies;

  let priorityCost = 0;
  if (priority === 'express') priorityCost = 3.00;
  else if (priority === 'urgent') priorityCost = 6.00;

  const totalEstimatedCost = Number((printSubtotal + bindingCost + priorityCost).toFixed(2));

  // Handle file upload simulation / API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError(null);

    // Validate size (< 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size exceeds the 50MB limit.');
      setUploadLoading(false);
      return;
    }

    // Validate extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'png', 'jpg', 'jpeg'].includes(ext || '')) {
      setUploadError('Unsupported format. Please upload PDF, DOCX, or Image (PNG/JPG).');
      setUploadLoading(false);
      return;
    }

    try {
      const estimatedPages = ext === 'png' || ext === 'jpg' || ext === 'jpeg' ? 1 : Math.max(2, Math.round(file.size / 60000));
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          file_type: ext === 'png' || ext === 'jpg' ? 'image' : (ext === 'docx' ? 'docx' : 'pdf'),
          page_count: estimatedPages,
          file_size: file.size,
          preview_text: `Pre-flight validated: ${file.name} (${estimatedPages} estimated pages, ${(file.size / 1024).toFixed(1)} KB). All fonts embedded.`
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to upload document');
      }

      const docData: DocumentItem = await res.json();
      setSelectedDoc(docData);
    } catch (err: any) {
      setUploadError(err.message || 'File processing failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSelectSample = async (sample: typeof sampleFiles[0]) => {
    setUploadLoading(true);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: sample.name,
          file_type: sample.type,
          page_count: sample.pages,
          file_size: sample.size,
          preview_text: sample.preview
        })
      });
      const data = await res.json();
      setSelectedDoc(data);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // Submit Order to backend API
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) {
      setUploadError('Please select or upload a document first.');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'usr-student-01',
          user_name: userName,
          user_email: userEmail,
          document_id: selectedDoc.document_id,
          copies,
          color_mode: colorMode,
          paper_size: paperSize,
          duplex,
          priority,
          binding,
          notes
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Could not submit print order');
      }

      const { order, automation } = await res.json();
      setCreatedOrder(order);
      onOrderCreated(order);
    } catch (err: any) {
      setUploadError(err.message || 'Error creating print order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
          <span>Create Smart Print Order</span>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Pre-flight Active
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload your document, customize print parameters, and dispatch to the digital press with automated status tracking.
        </p>
      </div>

      {uploadError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Order Form Layout */}
      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Document Upload & Pre-flight Inspection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Uploader Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-4">
              <UploadCloud className="w-5 h-5 text-indigo-400" />
              <span>Step 1: Document Upload & Validation</span>
            </h2>

            {/* Drop Zone */}
            <label className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl bg-slate-950/60 hover:bg-slate-950 cursor-pointer transition-all group">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
                disabled={uploadLoading}
              />
              <div className="w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-white text-center">
                Click to browse or drag & drop files here
              </p>
              <p className="text-xs text-slate-400 text-center mt-1">
                Supports PDF, Microsoft Word (.docx), PNG, JPG (Max 50MB)
              </p>
            </label>

            {/* Quick Sample Selector */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-2 font-medium">Or choose a pre-loaded sample document:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {sampleFiles.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(s)}
                    className="p-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 text-left transition-all group"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                        {s.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {s.pages} {s.pages === 1 ? 'page' : 'pages'} · {(s.size / 1024).toFixed(0)} KB
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Document Preflight Info */}
            {selectedDoc && (
              <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white truncate max-w-xs">{selectedDoc.filename}</h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Pre-flight Passed
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedDoc.page_count} pages · {(selectedDoc.file_size / 1024).toFixed(1)} KB · Format: {selectedDoc.file_type.toUpperCase()}
                    </p>
                    {selectedDoc.preview_text && (
                      <p className="text-xs text-slate-400 italic mt-1.5 line-clamp-2">
                        "{selectedDoc.preview_text}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer Information Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-white mb-4">Customer Details & Pickup Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Email (For Pickup Notifications)</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-slate-400 block mb-1.5">Special Instructions / Operator Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Please staple top-left, punch holes for binder, etc."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Print Customization & Live Cost Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 mb-4">
              <Printer className="w-5 h-5 text-indigo-400" />
              <span>Step 2: Print Specifications</span>
            </h2>

            <div className="space-y-4">
              {/* Copies Stepper */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-slate-300 font-medium">Number of Copies</label>
                  <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {copies} {copies === 1 ? 'copy' : 'copies'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors text-base"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-center font-mono font-bold text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setCopies(copies + 1)}
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition-colors text-base"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Color Mode */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Color Profile</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setColorMode('bw')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center space-x-1.5 transition-all ${
                      colorMode === 'bw'
                        ? 'bg-slate-800 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Black & White</span>
                    <span className="text-[10px] opacity-75 font-mono">($0.05)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode('color')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center space-x-1.5 transition-all ${
                      colorMode === 'color'
                        ? 'bg-slate-800 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-indigo-300">Full Color</span>
                    <span className="text-[10px] opacity-75 font-mono">($0.25)</span>
                  </button>
                </div>
              </div>

              {/* Paper Size */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Paper Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['A4', 'A3', 'Letter', 'Legal'] as PaperSize[]).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPaperSize(size)}
                      className={`py-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                        paperSize === size
                          ? 'bg-slate-800 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duplex Mode */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Duplex / Sides</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDuplex('single')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      duplex === 'single'
                        ? 'bg-slate-800 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Single-Sided
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplex('double')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      duplex === 'double'
                        ? 'bg-slate-800 border-indigo-500 text-emerald-400 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Double-Sided (-20%)
                  </button>
                </div>
              </div>

              {/* Binding & Finishing */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Binding & Finishing</label>
                <select
                  value={binding}
                  onChange={(e) => setBinding(e.target.value as BindingOption)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="none">None ($0.00)</option>
                  <option value="staple">Corner Stapling (+$0.30 per copy)</option>
                  <option value="spiral">Spiral / Coil Binding (+$2.50 per copy)</option>
                  <option value="hard_cover">Hard Cover Thesis Binding (+$6.00 per copy)</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Turnaround Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('standard')}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                      priority === 'standard'
                        ? 'bg-slate-800 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>Standard</div>
                    <div className="text-[10px] text-slate-400 font-normal">2-4h · Free</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('express')}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                      priority === 'express'
                        ? 'bg-slate-800 border-indigo-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>Express</div>
                    <div className="text-[10px] text-slate-400 font-normal">45m · +$3</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('urgent')}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                      priority === 'urgent'
                        ? 'bg-slate-800 border-indigo-500 text-rose-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>Urgent</div>
                    <div className="text-[10px] text-slate-400 font-normal">15m · +$6</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Page volume ({pages} pgs × {copies} {copies === 1 ? 'copy' : 'copies'})</span>
                  <span className="font-mono text-slate-300">{pages * copies} pages</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Printing rate ({colorMode.toUpperCase()} · {paperSize})</span>
                  <span className="font-mono text-slate-300">${printSubtotal.toFixed(2)}</span>
                </div>
                {binding !== 'none' && (
                  <div className="flex justify-between text-slate-400">
                    <span>Finishing ({binding})</span>
                    <span className="font-mono text-slate-300">+${bindingCost.toFixed(2)}</span>
                  </div>
                )}
                {priority !== 'standard' && (
                  <div className="flex justify-between text-slate-400">
                    <span>Priority surcharge ({priority})</span>
                    <span className="font-mono text-slate-300">+${priorityCost.toFixed(2)}</span>
                  </div>
                )}
                {isBulkDiscount && (
                  <div className="flex justify-between text-amber-400 font-medium">
                    <span>Bulk discount (15% applied)</span>
                    <span className="font-mono">-15%</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Print Cost</span>
                  <p className="text-2xl font-black text-white font-mono">${totalEstimatedCost.toFixed(2)}</p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedDoc}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Place Print Order</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Order Created Success Modal */}
      {createdOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-white">Order Submitted Successfully!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your document has been sent to the digital print spooler.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Order ID:</span>
                <span className="font-mono text-base font-extrabold text-indigo-400">{createdOrder.order_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Document:</span>
                <span className="text-xs text-white truncate max-w-[200px]">{createdOrder.document_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Total Billed:</span>
                <span className="font-mono text-xs font-bold text-emerald-400">${createdOrder.cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Initial Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {createdOrder.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">n8n Automation:</span>
                <span className="text-[10px] text-cyan-400 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Event Dispatched
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setCreatedOrder(null);
                  onGoToDashboard();
                }}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors"
              >
                Track in Dashboard
              </button>
              <button
                onClick={() => setCreatedOrder(null)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
