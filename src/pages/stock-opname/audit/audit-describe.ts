import type { AuditData, AuditEntry } from "@/types/audit";

export type ChangeKind = "create" | "delete" | "move" | "qty" | "factor" | "other";

const quantityFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

export function formatQuantity(value: number): string {
  return quantityFormatter.format(value);
}

/** qty_factor is the current field; sell_factor only appears on old audit rows. */
export function factorOf(data?: AuditData | null): number {
  return data?.qty_factor ?? data?.sell_factor ?? 1;
}

export function effectiveQuantity(data?: AuditData | null): number | undefined {
  if (!data) return undefined;
  return data.effective_quantity ?? data.quantity * factorOf(data);
}

export function factorName(value: number): string {
  if (value === -1) return "retur";
  if (value === 0) return "void";
  if (value === 1) return "normal";
  return `faktor ${value}`;
}

/**
 * Works out what really changed from the audit payload instead of trusting the
 * coarse action code: a MOVE also carries quantity changes when rows merge.
 */
export function classify(entry: AuditEntry): ChangeKind {
  if (!entry.after) return "delete";
  if (!entry.before) return "create";
  if (entry.before.rak_id !== entry.after.rak_id) return "move";
  if (entry.before.quantity !== entry.after.quantity) return "qty";
  if (factorOf(entry.before) !== factorOf(entry.after)) return "factor";
  return "other";
}

export type ChangeDescription = {
  kind: ChangeKind;
  product: string;
  change: string;
};

export function describeEntry(entry: AuditEntry): ChangeDescription {
  const kind = classify(entry);
  const before = entry.before;
  const after = entry.after;
  const product = after?.name || before?.name || "-";
  const rack = after?.rak_name || before?.rak_name || "-";

  switch (kind) {
    case "create": {
      const qty = effectiveQuantity(after) ?? 0;
      return {
        kind,
        product,
        change: `${rack} · ${formatQuantity(qty)} (faktor ${factorName(factorOf(after))})`,
      };
    }
    case "delete": {
      const qty = effectiveQuantity(before) ?? 0;
      return { kind, product, change: `${rack} · dihapus (${formatQuantity(qty)})` };
    }
    case "move": {
      const from = before?.rak_name || "-";
      const to = after?.rak_name || "-";
      const beforeQty = effectiveQuantity(before);
      const afterQty = effectiveQuantity(after);
      const merged = beforeQty !== undefined && afterQty !== undefined && afterQty !== beforeQty;
      return {
        kind,
        product,
        change: merged
          ? `${from} → ${to} · digabung menjadi ${formatQuantity(afterQty ?? 0)}`
          : `${from} → ${to} · ${formatQuantity(beforeQty ?? 0)}`,
      };
    }
    case "qty": {
      const beforeQty = effectiveQuantity(before) ?? 0;
      const afterQty = effectiveQuantity(after) ?? 0;
      return {
        kind,
        product,
        change: `${rack} · jumlah ${formatQuantity(beforeQty)} → ${formatQuantity(afterQty)}`,
      };
    }
    case "factor": {
      const beforeQty = effectiveQuantity(before) ?? 0;
      const afterQty = effectiveQuantity(after) ?? 0;
      return {
        kind,
        product,
        change: `${rack} · faktor ${factorName(factorOf(before))} → ${factorName(factorOf(after))} (qty ${formatQuantity(beforeQty)} → ${formatQuantity(afterQty)})`,
      };
    }
    default:
      // The API writes an UPDATE audit even when the saved value is unchanged.
      return { kind, product, change: `${rack} · tidak ada perubahan nilai` };
  }
}
