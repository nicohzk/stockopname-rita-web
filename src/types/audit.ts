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

/**
 * One row of GET /stockopname/audits/timeline. A batch that holds a single row
 * comes back as kind="single" with before/after filled in.
 */
export type AuditTimelineItem =
  | {
      kind: "single";
      id: number;
      batch_id?: string;
      action: AuditAction;
      actor: string;
      note: string;
      created_at: string;
      before: AuditData | null;
      after: AuditData | null;
    }
  | {
      kind: "batch";
      batch_id: string;
      action: AuditAction;
      actor: string;
      note: string;
      created_at: string;
      item_count: number;
      factor_before?: number;
      factor_after?: number;
      source_rak_name?: string;
      target_rak_name?: string;
      merged_count?: number;
    };
