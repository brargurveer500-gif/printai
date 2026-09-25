import {
  User,
  DocumentItem,
  PrintOrder,
  StatusLog,
  KnowledgeDoc,
  AILog,
  AutomationLog,
  AnalyticsData,
  OrderStatus,
  PaperSize,
  ColorMode,
  DuplexMode,
  PriorityLevel,
  BindingOption
} from '../src/types.js';

// Pre-seeded knowledge base documents as mandated by PRD
const DEFAULT_KNOWLEDGE_DOCS: KnowledgeDoc[] = [
  {
    doc_id: 'doc-faq-01',
    title: 'PrintAI Service FAQ & Operational Guidelines',
    source: 'Campus & Office Central Print Center Manual 2026',
    category: 'faq',
    uploaded_at: '2026-09-01T08:00:00.000Z',
    content: `PrintAI Centralized Printing Center FAQ:
1. Supported File Formats: We accept PDF (.pdf), Microsoft Word (.docx, .doc), and high-resolution images (PNG, JPEG). For best vector and font fidelity, PDF format is strongly recommended.
2. Resolution: All documents should ideally be rasterized or generated at 300 DPI or higher to avoid pixelation or blurry graphics.
3. Turnaround Times: Standard priority orders are processed within 2 to 4 hours during business days. Express priority orders are prepared within 45 minutes. Urgent priority orders receive immediate queue interruption and print within 15 minutes.
4. Operating Hours: Monday through Friday 8:00 AM - 9:00 PM; Saturday & Sunday 9:00 AM - 5:00 PM. Automated kiosks operate 24/7 for order pickup once marked Ready.
5. Pickup Location: Central Student Hub, Building B, Room 104, Print Counter #2. Bring your Order ID or QR code from your dashboard.`
  },
  {
    doc_id: 'doc-pricing-02',
    title: 'Official Printing & Finishing Pricing Schedule',
    source: 'Financial Services & Print Operations Rate Sheet',
    category: 'pricing',
    uploaded_at: '2026-09-01T08:00:00.000Z',
    content: `PrintAI Standard Rate Schedule (Effective 2026):
1. Black & White (B&W) Printing:
   - A4 size: $0.05 per single-sided page.
   - Letter size: $0.05 per single-sided page.
   - A3 size: $0.12 per single-sided page.
   - Legal size: $0.08 per single-sided page.
2. Full Color Printing:
   - A4 size: $0.25 per single-sided page.
   - Letter size: $0.25 per single-sided page.
   - A3 size: $0.48 per single-sided page.
   - Legal size: $0.32 per single-sided page.
3. Duplex (Double-Sided) Discount:
   - Printing duplex provides a 20% discount on the reverse (second) side, saving paper and reducing student costs.
4. Finishing & Binding Add-ons:
   - None: $0.00
   - Corner Stapling (up to 40 sheets): $0.30 flat.
   - Coil / Spiral Binding (with transparent plastic cover and back card): $2.50 flat.
   - Hard Cover Thesis Bookbinding (gold embossed foil): $6.00 flat.
5. Priority Surcharges:
   - Standard: $0.00 extra.
   - Express (under 45 min): $3.00 flat fee.
   - Urgent (jump to front of queue, under 15 min): $6.00 flat fee.
6. Bulk Discount: Orders exceeding 100 total pages automatically receive a 15% discount across the print cost.`
  },
  {
    doc_id: 'doc-paper-03',
    title: 'Paper Sizes, GSM Weights & Material Specifications',
    source: 'Print Shop Technical Handbook v4.2',
    category: 'specifications',
    uploaded_at: '2026-09-01T08:00:00.000Z',
    content: `Paper Size & Substrate Specifications:
1. A4 Paper Size: 210 x 297 mm (8.27 x 11.69 inches). Default standard for university essays, research papers, lecture handouts, and official documentation. Available in 80gsm standard office paper and 100gsm satin premium.
2. A3 Paper Size: 297 x 420 mm (11.69 x 16.54 inches). Double the area of A4. Ideal for architectural blueprints, engineering schematics, campus event posters, and visual mind maps.
3. Letter Paper Size: 215.9 x 279.4 mm (8.5 x 11.0 inches). North American standard for corporate letters, forms, and administrative memos.
4. Legal Paper Size: 215.9 x 355.6 mm (8.5 x 14.0 inches). Standard for legal contracts, balance sheets, and extended tabular filings.
5. Margins and Bleed: Maintain a minimum 10mm margin on all borders for non-binding edges. For spiral or thermal binding, ensure a left margin of at least 18mm to avoid hole punch clipping text. Bleed for edge-to-edge printing is 3mm.`
  },
  {
    doc_id: 'doc-policy-04',
    title: 'Cancellation, Refund & Misprint Guarantee Policy',
    source: 'Student Affairs & Customer Assurance Policy 2026',
    category: 'policy',
    uploaded_at: '2026-09-01T08:00:00.000Z',
    content: `PrintAI Cancellation and Refund Policy:
1. Cancellation Rules: A print order can be cancelled with a 100% full refund at any time as long as its status is "Pending". Once the order switches to "Processing", paper and toner have already been committed to the print queue, and cancellations are strictly disallowed.
2. Quality & Misprint Guarantee: If an order arrives with machine streaks, toner smudging, paper jams, double feeding, or clipped borders caused by hardware error, customers are entitled to a 100% free reprint within 24 hours of pickup. Simply flag the order with staff at Counter #2 or open a ticket.
3. User Formatting Errors: PrintAI is not responsible for typos, low-resolution source images provided in the original document, or incorrect margins selected by the user. Users can inspect the instant live print preview prior to submitting their order.
4. Payment Methods: We accept Campus SmartCard, Apple Pay, Google Pay, Credit/Debit cards, and departmental billing accounts.`
  },
  {
    doc_id: 'doc-ops-05',
    title: 'Operating Instructions, Self-Service Kiosks & Binding Options',
    source: 'Print Production Engineering SOP',
    category: 'operations',
    uploaded_at: '2026-09-01T08:00:00.000Z',
    content: `Operating Procedures & Workflow:
1. Document Ingestion: Documents uploaded to PrintAI undergo automatic pre-flight checks: PDF stream verification, page count extraction, color space detection (RGB to CMYK conversion preview), and DPI sanity check.
2. Workflow Pipeline:
   - Step 1: User uploads document and configures copies, color mode, paper size, duplex, and binding.
   - Step 2: System issues unique Order ID (e.g. PRT-9482) and sets status to Pending.
   - Step 3: Webhook event dispatched to n8n automation engine.
   - Step 4: Printing staff claims job and advances status to Processing. Print spool sends data to digital press.
   - Step 5: Post-press binding/finishing applied. Staff inspects quality and sets status to Ready.
   - Step 6: Automated SMS/email notification delivered via n8n.
   - Step 7: Customer picks up package and scans QR code -> Completed.`
  }
];

// Initial users
const DEFAULT_USERS: User[] = [
  {
    user_id: 'usr-student-01',
    name: 'Alex Rivera',
    email: 'alex.rivera@campus.edu',
    role: 'customer',
    created_at: '2026-08-20T10:00:00.000Z'
  },
  {
    user_id: 'usr-staff-01',
    name: 'Morgan Chen (Lead Operator)',
    email: 'morgan.chen@printai.io',
    role: 'staff',
    created_at: '2026-08-15T09:00:00.000Z'
  },
  {
    user_id: 'usr-manager-01',
    name: 'Dr. Sarah Vance (Director of Services)',
    email: 'sarah.vance@printai.io',
    role: 'manager',
    created_at: '2026-08-10T08:30:00.000Z'
  }
];

// Initial documents
const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    document_id: 'doc-sample-01',
    user_id: 'usr-student-01',
    filename: 'CS301_Distributed_Systems_Syllabus.pdf',
    file_type: 'pdf',
    file_url: '/samples/CS301_Distributed_Systems_Syllabus.pdf',
    page_count: 8,
    file_size: 420100,
    uploaded_at: '2026-09-24T14:10:00.000Z',
    preview_text: 'CS301: Distributed Systems & Cloud Infrastructure. Course syllabus, weekly modules, grading rubric, office hours, and exam schedules.',
    thumbnail_color: '#3b82f6'
  },
  {
    document_id: 'doc-sample-02',
    user_id: 'usr-student-01',
    filename: 'Final_Year_Research_Thesis_Draft.pdf',
    file_type: 'pdf',
    file_url: '/samples/Final_Year_Research_Thesis_Draft.pdf',
    page_count: 42,
    file_size: 2450800,
    uploaded_at: '2026-09-24T15:30:00.000Z',
    preview_text: 'Autonomous Multi-Agent Routing in High-Density Drone Networks. Abstract, methodology, performance benchmarks, and literature citations.',
    thumbnail_color: '#8b5cf6'
  },
  {
    document_id: 'doc-sample-03',
    user_id: 'usr-student-01',
    filename: 'Robotics_Club_Hackathon_Poster.png',
    file_type: 'image',
    file_url: '/samples/Robotics_Club_Hackathon_Poster.png',
    page_count: 1,
    file_size: 1890200,
    uploaded_at: '2026-09-24T16:05:00.000Z',
    preview_text: 'Campus AI & Robotics Hackathon 2026. $5,000 in grand prizes. Register before October 15.',
    thumbnail_color: '#10b981'
  }
];

// Initial orders
const DEFAULT_ORDERS: PrintOrder[] = [
  {
    order_id: 'PRT-1082',
    user_id: 'usr-student-01',
    user_name: 'Alex Rivera',
    user_email: 'alex.rivera@campus.edu',
    document_id: 'doc-sample-01',
    document_name: 'CS301_Distributed_Systems_Syllabus.pdf',
    document_type: 'pdf',
    page_count: 8,
    copies: 2,
    color_mode: 'bw',
    paper_size: 'A4',
    duplex: 'double',
    priority: 'standard',
    binding: 'staple',
    total_pages: 16,
    cost: 1.10,
    status: 'ready',
    notes: 'Please staple upper left corner.',
    created_at: '2026-09-24T14:15:00.000Z',
    updated_at: '2026-09-24T15:00:00.000Z'
  },
  {
    order_id: 'PRT-1083',
    user_id: 'usr-student-01',
    user_name: 'Elena Rostova',
    user_email: 'elena.r@campus.edu',
    document_id: 'doc-sample-02',
    document_name: 'Final_Year_Research_Thesis_Draft.pdf',
    document_type: 'pdf',
    page_count: 42,
    copies: 1,
    color_mode: 'color',
    paper_size: 'A4',
    duplex: 'double',
    priority: 'express',
    binding: 'spiral',
    total_pages: 42,
    cost: 14.85,
    status: 'processing',
    notes: 'Glossy front transparent cover requested.',
    created_at: '2026-09-24T16:20:00.000Z',
    updated_at: '2026-09-24T16:45:00.000Z'
  },
  {
    order_id: 'PRT-1084',
    user_id: 'usr-student-01',
    user_name: 'Marcus Vance',
    user_email: 'marcus.v@campus.edu',
    document_id: 'doc-sample-03',
    document_name: 'Robotics_Club_Hackathon_Poster.png',
    document_type: 'image',
    page_count: 1,
    copies: 20,
    color_mode: 'color',
    paper_size: 'A3',
    duplex: 'single',
    priority: 'standard',
    binding: 'none',
    total_pages: 20,
    cost: 9.60,
    status: 'pending',
    notes: 'Poster print run for campus noticeboards.',
    created_at: '2026-09-24T17:10:00.000Z',
    updated_at: '2026-09-24T17:10:00.000Z'
  },
  {
    order_id: 'PRT-1079',
    user_id: 'usr-student-01',
    user_name: 'Jessica Taylor',
    user_email: 'jessica.t@campus.edu',
    document_id: 'doc-sample-01',
    document_name: 'Biology_Lab_Worksheet.pdf',
    document_type: 'pdf',
    page_count: 6,
    copies: 5,
    color_mode: 'bw',
    paper_size: 'Letter',
    duplex: 'single',
    priority: 'standard',
    binding: 'staple',
    total_pages: 30,
    cost: 1.80,
    status: 'completed',
    notes: 'Collected at Locker #4.',
    created_at: '2026-09-24T11:00:00.000Z',
    updated_at: '2026-09-24T12:30:00.000Z'
  }
];

// Initial status logs
const DEFAULT_STATUS_LOGS: StatusLog[] = [
  {
    log_id: 'log-001',
    order_id: 'PRT-1079',
    old_status: 'created',
    new_status: 'pending',
    changed_at: '2026-09-24T11:00:00.000Z',
    changed_by: 'System (Alex Rivera)',
    notes: 'Order placed by customer'
  },
  {
    log_id: 'log-002',
    order_id: 'PRT-1079',
    old_status: 'pending',
    new_status: 'processing',
    changed_at: '2026-09-24T11:30:00.000Z',
    changed_by: 'Morgan Chen (Staff)',
    notes: 'Job queued on Canon Pro 4000'
  },
  {
    log_id: 'log-003',
    order_id: 'PRT-1079',
    old_status: 'processing',
    new_status: 'ready',
    changed_at: '2026-09-24T12:00:00.000Z',
    changed_by: 'Morgan Chen (Staff)',
    notes: 'Stapling complete. Placed in Locker #4'
  },
  {
    log_id: 'log-004',
    order_id: 'PRT-1079',
    old_status: 'ready',
    new_status: 'completed',
    changed_at: '2026-09-24T12:30:00.000Z',
    changed_by: 'Alex Rivera (Customer)',
    notes: 'QR code scanned at kiosk locker'
  },
  {
    log_id: 'log-005',
    order_id: 'PRT-1082',
    old_status: 'created',
    new_status: 'pending',
    changed_at: '2026-09-24T14:15:00.000Z',
    changed_by: 'System (Alex Rivera)',
    notes: 'Order submitted'
  },
  {
    log_id: 'log-006',
    order_id: 'PRT-1082',
    old_status: 'pending',
    new_status: 'processing',
    changed_at: '2026-09-24T14:35:00.000Z',
    changed_by: 'Morgan Chen (Staff)',
    notes: 'Assigned to Xerox WorkCentre'
  },
  {
    log_id: 'log-007',
    order_id: 'PRT-1082',
    old_status: 'processing',
    new_status: 'ready',
    changed_at: '2026-09-24T15:00:00.000Z',
    changed_by: 'Morgan Chen (Staff)',
    notes: 'Ready for pickup at Counter #2'
  },
  {
    log_id: 'log-008',
    order_id: 'PRT-1083',
    old_status: 'created',
    new_status: 'pending',
    changed_at: '2026-09-24T16:20:00.000Z',
    changed_by: 'System (Elena Rostova)',
    notes: 'Express order placed'
  },
  {
    log_id: 'log-009',
    order_id: 'PRT-1083',
    old_status: 'pending',
    new_status: 'processing',
    changed_at: '2026-09-24T16:45:00.000Z',
    changed_by: 'Morgan Chen (Staff)',
    notes: 'Color printing 42 pages; spiral binding in queue'
  },
  {
    log_id: 'log-010',
    order_id: 'PRT-1084',
    old_status: 'created',
    new_status: 'pending',
    changed_at: '2026-09-24T17:10:00.000Z',
    changed_by: 'System (Marcus Vance)',
    notes: 'New A3 poster order placed'
  }
];

// Initial automation logs
const DEFAULT_AUTOMATION_LOGS: AutomationLog[] = [
  {
    event_id: 'evt-n8n-901',
    order_id: 'PRT-1082',
    event_type: 'order.ready',
    webhook_url: 'https://n8n.campusprint.io/webhook/v1/print-events',
    status_code: 200,
    status: 'delivered',
    timestamp: '2026-09-24T15:00:05.000Z',
    payload: {
      event: 'order.ready',
      orderId: 'PRT-1082',
      customerName: 'Alex Rivera',
      customerEmail: 'alex.rivera@campus.edu',
      pickupLocation: 'Counter #2, Building B',
      action: 'send_sms_notification'
    },
    response_summary: '200 OK - Workflow "SMS & Push Notify Student" executed in 142ms'
  },
  {
    event_id: 'evt-n8n-902',
    order_id: 'PRT-1083',
    event_type: 'order.created',
    webhook_url: 'https://n8n.campusprint.io/webhook/v1/print-events',
    status_code: 200,
    status: 'delivered',
    timestamp: '2026-09-24T16:20:02.000Z',
    payload: {
      event: 'order.created',
      orderId: 'PRT-1083',
      priority: 'express',
      colorMode: 'color',
      binding: 'spiral',
      action: 'flag_express_queue'
    },
    response_summary: '200 OK - Workflow "Express Job Routing" triggered operator alert'
  }
];

export class StorageService {
  private users: User[] = [...DEFAULT_USERS];
  private documents: DocumentItem[] = [...DEFAULT_DOCUMENTS];
  private orders: PrintOrder[] = [...DEFAULT_ORDERS];
  private statusLogs: StatusLog[] = [...DEFAULT_STATUS_LOGS];
  private knowledgeDocs: KnowledgeDoc[] = [...DEFAULT_KNOWLEDGE_DOCS];
  private aiLogs: AILog[] = [];
  private automationLogs: AutomationLog[] = [...DEFAULT_AUTOMATION_LOGS];
  private webhookUrl: string = process.env.N8N_WEBHOOK_URL || 'https://n8n.campusprint.io/webhook/v1/print-events';

  getUsers(): User[] {
    return this.users;
  }

  getDocuments(): DocumentItem[] {
    return this.documents;
  }

  getDocumentById(id: string): DocumentItem | undefined {
    return this.documents.find(d => d.document_id === id);
  }

  createDocument(doc: Omit<DocumentItem, 'document_id' | 'uploaded_at'>): DocumentItem {
    const newDoc: DocumentItem = {
      ...doc,
      document_id: `doc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      uploaded_at: new Date().toISOString()
    };
    this.documents.unshift(newDoc);
    return newDoc;
  }

  getOrders(): PrintOrder[] {
    return this.orders;
  }

  getOrderById(id: string): PrintOrder | undefined {
    return this.orders.find(o => o.order_id === id);
  }

  createOrder(orderParams: {
    user_id: string;
    user_name: string;
    user_email: string;
    document_id: string;
    copies: number;
    color_mode: ColorMode;
    paper_size: PaperSize;
    duplex: DuplexMode;
    priority: PriorityLevel;
    binding: BindingOption;
    notes?: string;
  }): PrintOrder {
    const doc = this.getDocumentById(orderParams.document_id);
    const pageCount = doc ? doc.page_count : 1;
    const docName = doc ? doc.filename : 'Untitled Document';
    const docType = doc ? doc.file_type : 'pdf';

    const calculatedCost = this.calculatePrintCost({
      pages: pageCount,
      copies: orderParams.copies,
      colorMode: orderParams.color_mode,
      paperSize: orderParams.paper_size,
      duplex: orderParams.duplex,
      priority: orderParams.priority,
      binding: orderParams.binding
    });

    const orderId = `PRT-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newOrder: PrintOrder = {
      order_id: orderId,
      user_id: orderParams.user_id,
      user_name: orderParams.user_name,
      user_email: orderParams.user_email,
      document_id: orderParams.document_id,
      document_name: docName,
      document_type: docType,
      page_count: pageCount,
      copies: orderParams.copies,
      color_mode: orderParams.color_mode,
      paper_size: orderParams.paper_size,
      duplex: orderParams.duplex,
      priority: orderParams.priority,
      binding: orderParams.binding,
      total_pages: pageCount * orderParams.copies,
      cost: Number(calculatedCost.toFixed(2)),
      status: 'pending',
      notes: orderParams.notes || '',
      created_at: now,
      updated_at: now
    };

    this.orders.unshift(newOrder);

    // Record creation in status log
    this.addStatusLog({
      order_id: orderId,
      old_status: 'created',
      new_status: 'pending',
      changed_by: orderParams.user_name,
      notes: `Order created for ${orderParams.copies} copies of ${docName}`
    });

    return newOrder;
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, changedBy: string, notes?: string): PrintOrder | null {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    const oldStatus = order.status;
    order.status = newStatus;
    order.updated_at = new Date().toISOString();

    this.addStatusLog({
      order_id: orderId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: changedBy,
      notes: notes || `Status changed from ${oldStatus} to ${newStatus}`
    });

    return order;
  }

  getStatusLogs(orderId?: string): StatusLog[] {
    if (orderId) {
      return this.statusLogs.filter(l => l.order_id === orderId);
    }
    return this.statusLogs;
  }

  addStatusLog(log: Omit<StatusLog, 'log_id' | 'changed_at'>): StatusLog {
    const newLog: StatusLog = {
      ...log,
      log_id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      changed_at: new Date().toISOString()
    };
    this.statusLogs.unshift(newLog);
    return newLog;
  }

  getKnowledgeDocs(): KnowledgeDoc[] {
    return this.knowledgeDocs;
  }

  getKnowledgeDocById(id: string): KnowledgeDoc | undefined {
    return this.knowledgeDocs.find(d => d.doc_id === id);
  }

  addKnowledgeDoc(doc: Omit<KnowledgeDoc, 'doc_id' | 'uploaded_at'>): KnowledgeDoc {
    const newDoc: KnowledgeDoc = {
      ...doc,
      doc_id: `doc-${Date.now().toString(36)}`,
      uploaded_at: new Date().toISOString()
    };
    this.knowledgeDocs.unshift(newDoc);
    return newDoc;
  }

  getAILogs(): AILog[] {
    return this.aiLogs;
  }

  addAILog(log: AILog): void {
    this.aiLogs.unshift(log);
    if (this.aiLogs.length > 50) {
      this.aiLogs.pop();
    }
  }

  getAutomationLogs(): AutomationLog[] {
    return this.automationLogs;
  }

  addAutomationLog(log: Omit<AutomationLog, 'event_id' | 'timestamp'>): AutomationLog {
    const newLog: AutomationLog = {
      ...log,
      event_id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.automationLogs.unshift(newLog);
    return newLog;
  }

  getWebhookUrl(): string {
    return this.webhookUrl;
  }

  setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }

  // Cost calculation function matching PRD Pricing rules
  calculatePrintCost(params: {
    pages: number;
    copies: number;
    colorMode: ColorMode;
    paperSize: PaperSize;
    duplex: DuplexMode;
    priority: PriorityLevel;
    binding: BindingOption;
  }): number {
    const { pages, copies, colorMode, paperSize, duplex, priority, binding } = params;
    const totalSheetsPerCopy = duplex === 'double' ? Math.ceil(pages / 2) : pages;

    // Base rate per page
    let baseRate = 0.05; // standard A4 B&W
    if (colorMode === 'color') {
      baseRate = 0.25;
    }

    // Paper size multiplier
    let sizeMultiplier = 1.0;
    if (paperSize === 'A3') sizeMultiplier = 2.0;
    else if (paperSize === 'Legal') sizeMultiplier = 1.3;
    else if (paperSize === 'Letter') sizeMultiplier = 1.0;

    // Per page calculation with duplex 20% discount on 2nd side
    let pagesCostPerCopy = 0;
    if (duplex === 'single') {
      pagesCostPerCopy = pages * (baseRate * sizeMultiplier);
    } else {
      // 1st side full price, 2nd side 20% off
      const fullSides = Math.ceil(pages / 2);
      const discountedSides = Math.floor(pages / 2);
      const singleSideRate = baseRate * sizeMultiplier;
      pagesCostPerCopy = (fullSides * singleSideRate) + (discountedSides * singleSideRate * 0.8);
    }

    let subtotal = pagesCostPerCopy * copies;

    // Bulk discount for total pages > 100
    const totalPageVolume = pages * copies;
    if (totalPageVolume >= 100) {
      subtotal *= 0.85; // 15% discount
    }

    // Binding add-ons (per copy)
    let bindingCost = 0;
    if (binding === 'staple') bindingCost = 0.30 * copies;
    else if (binding === 'spiral') bindingCost = 2.50 * copies;
    else if (binding === 'hard_cover') bindingCost = 6.00 * copies;

    // Priority surcharges (flat per order)
    let priorityCost = 0;
    if (priority === 'express') priorityCost = 3.00;
    else if (priority === 'urgent') priorityCost = 6.00;

    return Number((subtotal + bindingCost + priorityCost).toFixed(2));
  }

  getAnalytics(): AnalyticsData {
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
    const processingOrders = this.orders.filter(o => o.status === 'processing').length;
    const readyOrders = this.orders.filter(o => o.status === 'ready').length;
    const completedOrders = this.orders.filter(o => o.status === 'completed').length;
    const cancelledOrders = this.orders.filter(o => o.status === 'cancelled').length;

    const totalRevenue = Number(this.orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.cost : 0), 0).toFixed(2));
    const totalPagesPrinted = this.orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_pages : 0), 0);

    // Mock daily analytics for the past 7 days
    const dailyStats = [
      { date: '2026-09-18', dayName: 'Fri', orders: 18, pages: 340, revenue: 42.50 },
      { date: '2026-09-19', dayName: 'Sat', orders: 9, pages: 180, revenue: 21.00 },
      { date: '2026-09-20', dayName: 'Sun', orders: 7, pages: 120, revenue: 16.80 },
      { date: '2026-09-21', dayName: 'Mon', orders: 24, pages: 520, revenue: 68.40 },
      { date: '2026-09-22', dayName: 'Tue', orders: 31, pages: 690, revenue: 84.20 },
      { date: '2026-09-23', dayName: 'Wed', orders: 28, pages: 610, revenue: 76.50 },
      { date: '2026-09-24', dayName: 'Today', orders: totalOrders, pages: totalPagesPrinted, revenue: totalRevenue }
    ];

    // Paper sizes
    const sizeCounts: Record<PaperSize, number> = { A4: 0, A3: 0, Letter: 0, Legal: 0 };
    this.orders.forEach(o => {
      if (sizeCounts[o.paper_size] !== undefined) {
        sizeCounts[o.paper_size]++;
      }
    });

    const paperSizeDistribution = (Object.keys(sizeCounts) as PaperSize[]).map(size => ({
      size,
      count: sizeCounts[size],
      percentage: totalOrders > 0 ? Math.round((sizeCounts[size] / totalOrders) * 100) : 0
    }));

    // Color mode
    const bwOrders = this.orders.filter(o => o.color_mode === 'bw');
    const colorOrders = this.orders.filter(o => o.color_mode === 'color');
    const colorModeDistribution = [
      {
        mode: 'B&W' as const,
        count: bwOrders.length,
        percentage: totalOrders > 0 ? Math.round((bwOrders.length / totalOrders) * 100) : 0,
        revenue: Number(bwOrders.reduce((sum, o) => sum + o.cost, 0).toFixed(2))
      },
      {
        mode: 'Color' as const,
        count: colorOrders.length,
        percentage: totalOrders > 0 ? Math.round((colorOrders.length / totalOrders) * 100) : 0,
        revenue: Number(colorOrders.reduce((sum, o) => sum + o.cost, 0).toFixed(2))
      }
    ];

    // Priority
    const priorityCounts: Record<PriorityLevel, number> = { standard: 0, express: 0, urgent: 0 };
    this.orders.forEach(o => {
      priorityCounts[o.priority]++;
    });
    const priorityDistribution = (Object.keys(priorityCounts) as PriorityLevel[]).map(priority => ({
      priority,
      count: priorityCounts[priority]
    }));

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      readyOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      totalPagesPrinted,
      avgTurnaroundMinutes: 28,
      dailyStats,
      paperSizeDistribution,
      colorModeDistribution,
      priorityDistribution
    };
  }

  resetToDefaults(): void {
    this.users = [...DEFAULT_USERS];
    this.documents = [...DEFAULT_DOCUMENTS];
    this.orders = [...DEFAULT_ORDERS];
    this.statusLogs = [...DEFAULT_STATUS_LOGS];
    this.knowledgeDocs = [...DEFAULT_KNOWLEDGE_DOCS];
    this.aiLogs = [];
    this.automationLogs = [...DEFAULT_AUTOMATION_LOGS];
  }
}

export const storage = new StorageService();
