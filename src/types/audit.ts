export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "MOVE";

export type AuditData = {
  stock_opname_id: number;
  rak_id: number;
  rak_name: string;
  coordinator_id: number;
  coordinator_code: string;
  coordinator_status?: string;
  rak_upload_id?: number;
  rak_uploaded_at?: string;
  plu: string;
  barcode: string;
  name: string;
  quantity: number;
  buy_price: number;
  sell_price: number;
  qty_factor?: number;
  sell_factor?: number;
  effective_quantity?: number;
};

export type AuditEntry = {
  id: number;
  batch_id?: string;
  action: AuditAction;
  sesi_id: number;
  source_rak_id?: number;
  target_rak_id?: number;
  actor: string;
  note: string;
  before: AuditData | null;
  after: AuditData | null;
  created_at: string;
};

export type AuditBatchSummary = {
  batch_id: string;
  action: AuditAction;
  actor: string;
  note: string;
  item_count: number;
  created_at: string;
};
