export type UserRole = 'customer' | 'staff' | 'manager';

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface DocumentItem {
  document_id: string;
  user_id: string;
  filename: string;
  file_type: 'pdf' | 'docx' | 'image' | 'doc';
  file_url: string;
  page_count: number;
  file_size: number; // in bytes
  uploaded_at: string;
  preview_text?: string;
  thumbnail_color?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
export type ColorMode = 'bw' | 'color';
export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type DuplexMode = 'single' | 'double';
export type PriorityLevel = 'standard' | 'express' | 'urgent';
export type BindingOption = 'none' | 'staple' | 'spiral' | 'hard_cover';

export interface PrintOrder {
  order_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  document_id: string;
  document_name: string;
  document_type: string;
  page_count: number;
  copies: number;
  color_mode: ColorMode;
  paper_size: PaperSize;
  duplex: DuplexMode;
  priority: PriorityLevel;
  binding: BindingOption;
  total_pages: number; // page_count * copies
  cost: number;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StatusLog {
  log_id: string;
  order_id: string;
  old_status: OrderStatus | 'created';
  new_status: OrderStatus;
  changed_at: string;
  changed_by: string;
  notes: string;
}

export interface KnowledgeDoc {
  doc_id: string;
  title: string;
  source: string;
  category: 'faq' | 'pricing' | 'specifications' | 'policy' | 'operations';
  content: string;
  uploaded_at: string;
}

export interface RetrievedChunk {
  doc_id: string;
  title: string;
  category: string;
  snippet: string;
  score: number;
}

export interface AILog {
  session_id: string;
  user_id: string;
  question: string;
  retrieved_context: RetrievedChunk[];
  response: string;
  grounded: boolean;
  created_at: string;
}

export interface AutomationLog {
  event_id: string;
  order_id: string;
  event_type: 'order.created' | 'order.status_changed' | 'order.ready' | 'order.completed' | 'order.cancelled' | 'system.test';
  webhook_url: string;
  status_code: number;
  status: 'delivered' | 'simulated' | 'failed';
  payload: Record<string, any>;
  timestamp: string;
  response_summary: string;
}

export interface AnalyticsData {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  readyOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalPagesPrinted: number;
  avgTurnaroundMinutes: number;
  dailyStats: {
    date: string;
    dayName: string;
    orders: number;
    pages: number;
    revenue: number;
  }[];
  paperSizeDistribution: {
    size: PaperSize;
    count: number;
    percentage: number;
  }[];
  colorModeDistribution: {
    mode: 'B&W' | 'Color';
    count: number;
    percentage: number;
    revenue: number;
  }[];
  priorityDistribution: {
    priority: PriorityLevel;
    count: number;
  }[];
}
