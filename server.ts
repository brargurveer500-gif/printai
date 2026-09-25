import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { storage } from './server/storage.js';
import { ragEngine } from './server/rag.js';
import { automationService } from './server/automation.js';
import { OrderStatus, ColorMode, PaperSize, DuplexMode, PriorityLevel, BindingOption } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. Document Upload API
app.post('/api/documents/upload', (req: Request, res: Response) => {
  try {
    const { filename, file_type, page_count, file_size, preview_text, user_id } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Type validation
    const validExtensions = ['pdf', 'docx', 'doc', 'png', 'jpg', 'jpeg'];
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(ext) && file_type !== 'pdf' && file_type !== 'docx' && file_type !== 'image') {
      return res.status(400).json({ error: 'Unsupported file type. Please upload PDF, DOCX, or Image (PNG/JPG).' });
    }

    // Size validation (max 50MB)
    const size = Number(file_size) || 1024 * 350;
    if (size > 50 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds maximum limit of 50MB' });
    }

    const doc = storage.createDocument({
      user_id: user_id || 'usr-student-01',
      filename,
      file_type: ext === 'png' || ext === 'jpg' || ext === 'jpeg' ? 'image' : (ext === 'docx' || ext === 'doc' ? 'docx' : 'pdf'),
      file_url: `/uploads/${filename}`,
      page_count: Math.max(1, Number(page_count) || (ext === 'png' || ext === 'jpg' ? 1 : Math.floor(Math.random() * 8 + 2))),
      file_size: size,
      preview_text: preview_text || `Document ${filename} analyzed and pre-flight verified. Ready for print queue.`,
      thumbnail_color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 5)]
    });

    res.status(201).json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents', (req: Request, res: Response) => {
  res.json(storage.getDocuments());
});

// 2. Print Orders API
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      user_name,
      user_email,
      document_id,
      copies,
      color_mode,
      paper_size,
      duplex,
      priority,
      binding,
      notes
    } = req.body;

    if (!document_id) {
      return res.status(400).json({ error: 'document_id is required' });
    }

    const order = storage.createOrder({
      user_id: user_id || 'usr-student-01',
      user_name: user_name || 'Alex Rivera',
      user_email: user_email || 'alex.rivera@campus.edu',
      document_id,
      copies: Math.max(1, Number(copies) || 1),
      color_mode: (color_mode as ColorMode) || 'bw',
      paper_size: (paper_size as PaperSize) || 'A4',
      duplex: (duplex as DuplexMode) || 'single',
      priority: (priority as PriorityLevel) || 'standard',
      binding: (binding as BindingOption) || 'none',
      notes: notes || ''
    });

    // Trigger n8n automation webhook for order.created
    const automationLog = await automationService.dispatchOrderEvent('order.created', order);

    res.status(201).json({
      order,
      automation: automationLog
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', (req: Request, res: Response) => {
  const { status, search, priority } = req.query;
  let orders = storage.getOrders();

  if (status && status !== 'all') {
    orders = orders.filter(o => o.status === status);
  }

  if (priority && priority !== 'all') {
    orders = orders.filter(o => o.priority === priority);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    orders = orders.filter(o =>
      o.order_id.toLowerCase().includes(q) ||
      o.document_name.toLowerCase().includes(q) ||
      o.user_name.toLowerCase().includes(q) ||
      o.user_email.toLowerCase().includes(q)
    );
  }

  res.json(orders);
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = storage.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const document = storage.getDocumentById(order.document_id);
  const statusLogs = storage.getStatusLogs(order.order_id);

  res.json({
    order,
    document,
    status_logs: statusLogs
  });
});

app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, changed_by, notes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses: OrderStatus[] = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
    }

    const updated = storage.updateOrderStatus(
      req.params.id,
      status,
      changed_by || 'Staff Operator',
      notes
    );

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Determine event type for n8n automation
    let eventType: 'order.ready' | 'order.completed' | 'order.cancelled' | 'order.status_changed' = 'order.status_changed';
    if (status === 'ready') eventType = 'order.ready';
    else if (status === 'completed') eventType = 'order.completed';
    else if (status === 'cancelled') eventType = 'order.cancelled';

    const automationLog = await automationService.dispatchOrderEvent(eventType, updated, {
      previousStatus: req.body.previousStatus,
      statusNotes: notes
    });

    res.json({
      order: updated,
      automation: automationLog,
      status_logs: storage.getStatusLogs(updated.order_id)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. AI Assistant & RAG API
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { question, user_id, session_id } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question string is required' });
    }

    const result = await ragEngine.answerQuestion(question);

    const logEntry = {
      session_id: session_id || `sess-${Date.now().toString(36)}`,
      user_id: user_id || 'usr-student-01',
      question,
      retrieved_context: result.retrieved_chunks,
      response: result.answer,
      grounded: result.grounded,
      created_at: new Date().toISOString()
    };

    storage.addAILog(logEntry);

    res.json({
      answer: result.answer,
      retrieved_chunks: result.retrieved_chunks,
      grounded: result.grounded,
      session_id: logEntry.session_id
    });
  } catch (err: any) {
    console.error('AI chat endpoint error:', err);
    res.status(500).json({ error: err.message || 'Internal server error in AI Assistant' });
  }
});

app.get('/api/ai/logs', (req: Request, res: Response) => {
  res.json(storage.getAILogs());
});

// 4. Knowledge Base API
app.get('/api/knowledge', (req: Request, res: Response) => {
  res.json(storage.getKnowledgeDocs());
});

app.post('/api/knowledge', (req: Request, res: Response) => {
  try {
    const { title, source, category, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const doc = storage.addKnowledgeDoc({
      title,
      source: source || 'User Uploaded Documentation',
      category: category || 'faq',
      content
    });

    ragEngine.refreshIndex();
    res.status(201).json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Operational Analytics API
app.get('/api/analytics', (req: Request, res: Response) => {
  res.json(storage.getAnalytics());
});

// 6. n8n Webhook & Automation API
app.post('/api/webhooks/n8n', (req: Request, res: Response) => {
  // Ingest webhook payload from n8n or external system
  const payload = req.body;
  const log = storage.addAutomationLog({
    order_id: payload.orderId || payload.order_id || 'INCOMING-N8N',
    event_type: payload.event || 'system.test',
    webhook_url: '/api/webhooks/n8n',
    status_code: 200,
    status: 'delivered',
    payload,
    response_summary: `200 OK - Ingested external event: ${payload.event || 'n8n webhook execution'}`
  });

  res.json({
    success: true,
    message: 'Webhook event received and recorded',
    log_id: log.event_id
  });
});

app.get('/api/automations', (req: Request, res: Response) => {
  res.json({
    webhook_url: storage.getWebhookUrl(),
    logs: storage.getAutomationLogs()
  });
});

app.post('/api/automations/test', async (req: Request, res: Response) => {
  const { webhook_url } = req.body;
  if (webhook_url) {
    storage.setWebhookUrl(webhook_url);
  }
  const log = await automationService.testWebhookPing(webhook_url);
  res.json(log);
});

// 7. PRD Section 15 Live Demo Scenario Automated Runner
app.post('/api/demo/run-scenario', async (req: Request, res: Response) => {
  try {
    // 1. Create Sample Document
    const demoDoc = storage.createDocument({
      user_id: 'usr-student-01',
      filename: 'Machine_Learning_Lecture_Notes_Final.pdf',
      file_type: 'pdf',
      file_url: '/samples/Machine_Learning_Lecture_Notes_Final.pdf',
      page_count: 14,
      file_size: 1048576,
      preview_text: 'CS229 Lecture Notes: Neural Architecture, Backpropagation, Gradient Descent, and Transformer Attention Mechanisms.',
      thumbnail_color: '#3b82f6'
    });

    // 2. Create Print Order for 2 copies, A4, B&W, duplex
    const demoOrder = storage.createOrder({
      user_id: 'usr-student-01',
      user_name: 'Alex Rivera (Demo Student)',
      user_email: 'alex.rivera@campus.edu',
      document_id: demoDoc.document_id,
      copies: 2,
      color_mode: 'bw',
      paper_size: 'A4',
      duplex: 'double',
      priority: 'standard',
      binding: 'staple',
      notes: 'Demo scenario order per PRD Section 15 specification.'
    });

    // 3. Move order from Pending -> Processing
    const processingOrder = storage.updateOrderStatus(
      demoOrder.order_id,
      'processing',
      'Morgan Chen (Lead Operator)',
      'PRD Demo Step: Print queue accepted job'
    );

    // 4. Move order from Processing -> Ready
    const readyOrder = storage.updateOrderStatus(
      demoOrder.order_id,
      'ready',
      'Morgan Chen (Lead Operator)',
      'PRD Demo Step: Order printed, stapled and placed in Locker #2'
    );

    // 5. Trigger n8n notification for Ready
    const n8nNotification = await automationService.dispatchOrderEvent('order.ready', readyOrder!, {
      demoScenario: true,
      pickupLocker: 'Locker #2, Building B'
    });

    // 6. Ask AI Assistant printing-policy question
    const policyQuestion = 'What is the refund and reprint policy if my printed pages have toner streaks?';
    const aiAnswer = await ragEngine.answerQuestion(policyQuestion);

    // 7. Fetch updated analytics
    const updatedAnalytics = storage.getAnalytics();

    res.json({
      success: true,
      demoScenarioSteps: [
        { step: 1, action: 'Upload sample PDF', document: demoDoc },
        { step: 2, action: 'Create print order (2 copies, A4, B&W, duplex)', orderId: demoOrder.order_id, initialCost: demoOrder.cost },
        { step: 3, action: 'Update status to Processing', status: 'processing' },
        { step: 4, action: 'Update status to Ready', status: 'ready' },
        { step: 5, action: 'Trigger n8n webhook notification', event: n8nNotification },
        { step: 6, action: 'RAG question answered', question: policyQuestion, answer: aiAnswer.answer, citations: aiAnswer.retrieved_chunks },
        { step: 7, action: 'Analytics updated live', analytics: updatedAnalytics }
      ],
      createdOrderId: demoOrder.order_id
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset data
app.post('/api/reset', (req: Request, res: Response) => {
  storage.resetToDefaults();
  ragEngine.refreshIndex();
  res.json({ success: true, message: 'All demo data reset to default state' });
});

// In development, hook Vite middleware; in production, serve built dist files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`PrintAI Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
