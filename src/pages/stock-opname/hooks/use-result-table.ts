import { useCallback, useState } from "react";
import type { RowSelectionState, Updater } from "@tanstack/react-table";
import { errorMessage } from "@/lib/errors";
import {
  createStockOpname,
  deleteStockOpname,
  moveStockOpname,
  setQtyFactor,
  updateStockOpname,
} from "@/services/stock-opname.service";
import type {
  QtyFactor,
  QtyFactorScope,
  ResultSelectionItem,
  SelectionMode,
  StockOpname,
  StockOpnameCreateRequest,
  StockOpnameUpdateRequest,
} from "@/types/stock-opname";
import type { Coordinator } from "@/types/coordinator";
import type { Rack } from "@/types/rack";

type ShowToast = (message: string, type?: "error") => void;

export type ResultQueryPatch = {
  page?: number;
  search?: string;
  rackFilter?: string;
  coordinatorFilter?: string;
};

export type ResultFilterValues = {
  search: string;
  coordinatorId?: number;
  rakId?: number;
};

export type ResultTableOptions = {
  sessionId: number;
  sessionStatus?: string;
  coordinators: Coordinator[];
  /** Semua rak sesi: untuk lookup rak sumber dan sasaran pemindahan. */
  racks: Rack[];
  results: StockOpname[];
  totalItems: number;
  /** True saat tabel sedang dipersempit pencarian atau filter. */
  filterActive: boolean;
  filter: ResultFilterValues;
  /** Cakupan dialog faktor qty saat tabel tidak sedang difilter. */
  bulkScope: { scope: QtyFactorScope; scopeId?: number; label: string };
  /** Pesan saat pemindahan diblokir status sesi/koordinator, bukan seleksi. */
  moveBlockedMessages: { session: string; coordinator: string };
  /** Mengubah halaman/pencarian/filter; halaman yang memegang state kueri. */
  onQueryChange: (patch: ResultQueryPatch) => void;
  /** Dipanggil setelah mutasi berhasil: segarkan audit, ringkasan, dan tabel. */
  onChanged: () => void;
  showToast: ShowToast;
};

export type MoveState = {
  sourceRackId: number;
  sourceRackName: string;
  resultIds?: number[];
  itemCount?: number;
};

export type FactorTarget = {
  scope: QtyFactorScope;
  scopeId?: number;
  label: string;
  itemCount: number;
  currentFactor?: QtyFactor;
  mixed?: boolean;
  resultIds?: number[];
};

/**
 * State dan aksi tabel hasil stock opname: seleksi baris, dialog pindah, dialog
 * faktor qty, dan mutasi hasil. Data serta state kueri tetap dipegang halaman,
 * karena keduanya menyatu dengan cara halaman memuat data.
 */
export function useResultTable({
  sessionId,
  sessionStatus,
  coordinators,
  racks,
  results,
  totalItems,
  filterActive,
  filter,
  bulkScope,
  moveBlockedMessages,
  onQueryChange,
  onChanged,
  showToast,
}: ResultTableOptions) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedItems, setSelectedItems] = useState<Map<number, ResultSelectionItem>>(new Map());
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("manual");
  const [moveState, setMoveState] = useState<MoveState>();
  const [factorTarget, setFactorTarget] = useState<FactorTarget>();

  const clearSelection = useCallback(() => {
    setRowSelection({});
    setSelectedItems(new Map());
    setSelectionMode("manual");
  }, []);

  const handleRowSelectionChange = (updater: Updater<RowSelectionState>) => {
    const next = typeof updater === "function" ? updater(rowSelection) : updater;
    if (Object.keys(next).length > 500) {
      showToast("Maksimal 500 item untuk selection manual.", "error");
      return;
    }
    setRowSelection(next);
    setSelectedItems((previous) => {
      const updated = new Map(previous);
      for (const id of updated.keys()) {
        if (!next[String(id)]) updated.delete(id);
      }
      for (const item of results) {
        if (next[String(item.id)]) {
          updated.set(item.id, {
            id: item.id,
            rackId: item.rackId,
            coordinatorId: item.coordinatorId,
            qtyFactor: item.qtyFactor,
          });
        } else {
          updated.delete(item.id);
        }
      }
      return updated;
    });
    if (Object.keys(next).length > 0) {
      setSelectionMode("manual");
    }
  };

  const activateFilterMode = () => {
    setRowSelection({});
    setSelectedItems(new Map());
    setSelectionMode("filter");
  };

  const selectedItemsList = Array.from(selectedItems.values());
  const selectedCount = selectedItemsList.length;
  const selectedRackId =
    selectedItemsList.length > 0
      ? selectedItemsList.every((item) => item.rackId === selectedItemsList[0].rackId)
        ? selectedItemsList[0].rackId
        : undefined
      : undefined;
  const selectedRack =
    selectedRackId !== undefined ? racks.find((rack) => rack.id === selectedRackId) : undefined;
  const mixedSelectedFactor = new Set(selectedItemsList.map((item) => item.qtyFactor)).size > 1;
  const coordinatorStatusById = new Map(
    coordinators.map((coordinator) => [coordinator.id, coordinator.status]),
  );
  const sourceCoordinatorStatus = selectedRack
    ? coordinatorStatusById.get(selectedRack.coordinatorId)
    : undefined;
  const moveDisabledReason =
    selectedCount === 0
      ? "Pilih item terlebih dahulu."
      : selectedRackId === undefined
        ? "Pilih item dari satu rak untuk memindahkan."
        : !selectedRack
          ? "Rak sumber tidak ditemukan."
          : sessionStatus !== "IN_PROGRESS"
            ? moveBlockedMessages.session
            : sourceCoordinatorStatus === "COMPLETED" || sourceCoordinatorStatus === "CANCELLED"
              ? moveBlockedMessages.coordinator
              : undefined;

  // Jumps from an audit entry to the matching row in the results table.
  const openResultFromAudit = (term: string) => {
    onQueryChange({ search: term, page: 1 });
    requestAnimationFrame(() => {
      document.getElementById("stock-opname-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const openItemFactor = (item: StockOpname) => {
    setFactorTarget({
      scope: "item",
      scopeId: item.id,
      label: item.name,
      itemCount: 1,
      currentFactor: item.qtyFactor,
    });
  };

  const openSelectedFactor = () => {
    setFactorTarget({
      scope: "items",
      resultIds: selectedItemsList.map((item) => item.id),
      label: `${selectedCount} item terpilih`,
      itemCount: selectedCount,
      mixed: mixedSelectedFactor,
    });
  };

  const openBulkFactor = () => {
    setFactorTarget(
      filterActive
        ? {
            scope: "filter",
            label: "Semua hasil filter",
            itemCount: totalItems,
            mixed: true,
          }
        : {
            scope: bulkScope.scope,
            scopeId: bulkScope.scopeId,
            label: bulkScope.label,
            itemCount: totalItems,
          },
    );
  };

  // Membuka dialog faktor untuk cakupan apa pun (mis. satu rak utuh).
  const openFactor = (target: FactorTarget) => setFactorTarget(target);

  const handleMoveRequest = (item: { rackId: number; rackName: string; id: number }) => {
    setMoveState({
      sourceRackId: item.rackId,
      sourceRackName: item.rackName,
      resultIds: [item.id],
      itemCount: 1,
    });
  };

  const openSelectedMove = () => {
    if (selectedCount === 0 || !selectedRack || moveDisabledReason) return;
    setMoveState({
      sourceRackId: selectedRack.id,
      sourceRackName: selectedRack.name,
      resultIds: selectedItemsList.map((item) => item.id),
      itemCount: selectedCount,
    });
  };

  // Memindahkan seluruh isi rak tanpa memilih baris lebih dulu.
  const openRackMove = (rack: { id: number; name: string }) => {
    setMoveState({ sourceRackId: rack.id, sourceRackName: rack.name });
  };

  const handleMoveSubmit = async (targetRakId: number, note: string) => {
    if (!moveState) return;
    const result = await moveStockOpname({
      sourceRakId: moveState.sourceRackId,
      targetRakId,
      resultIds: moveState.resultIds,
      note,
    });
    clearSelection();
    showToast(
      `${result.data.moved_count} item dipindah${result.data.merged_count ? `, ${result.data.merged_count} digabung` : ""}.${
        result.data.reopened_rack_id ? " Upload asal dilepas dari rak sumber; rak bisa diupload ulang." : ""
      }`,
    );
    onChanged();
  };

  const handleFactorSubmit = async (factor: QtyFactor, note: string) => {
    if (!factorTarget) return;
    try {
      const result = await setQtyFactor(sessionId, {
        scope: factorTarget.scope,
        scopeId: factorTarget.scopeId,
        resultIds: factorTarget.resultIds,
        filter:
          factorTarget.scope === "filter"
            ? {
                search: filter.search.trim() || undefined,
                coordinatorId: filter.coordinatorId,
                rakId: filter.rakId,
              }
            : undefined,
        qtyFactor: factor,
        note,
      });
      showToast(
        result.updated_count === 0
          ? "Tidak ada perubahan faktor."
          : `${result.updated_count} item berhasil diubah faktornya.`,
      );
    } catch (mutationError) {
      showToast(errorMessage(mutationError, "Gagal mengubah faktor qty."), "error");
      throw mutationError;
    }
    clearSelection();
    setFactorTarget(undefined);
    onChanged();
  };

  const handleResultUpdate = async (resultId: number, data: StockOpnameUpdateRequest) => {
    try {
      await updateStockOpname(resultId, data);
    } catch (mutationError) {
      showToast(
        errorMessage(mutationError, "Gagal memperbarui data stock opname."),
        "error",
      );
      throw mutationError;
    }
    showToast("Data stock opname berhasil diperbarui.");
    clearSelection();
    onChanged();
  };

  const handleResultDelete = async (resultId: number) => {
    try {
      await deleteStockOpname(resultId);
    } catch (mutationError) {
      showToast(
        errorMessage(mutationError, "Gagal menghapus data stock opname."),
        "error",
      );
      throw mutationError;
    }
    showToast("Data stock opname berhasil dihapus.");
    clearSelection();
    onChanged();
  };

  const handleResultCreate = async (data: StockOpnameCreateRequest) => {
    try {
      await createStockOpname(data);
    } catch (mutationError) {
      showToast(errorMessage(mutationError, "Gagal menambahkan item."), "error");
      throw mutationError;
    }
    showToast("Item berhasil ditambahkan.");
    clearSelection();
    onChanged();
  };

  return {
    rowSelection,
    selectedItemsList,
    selectedCount,
    mixedSelectedFactor,
    selectionMode,
    moveDisabledReason,
    handleRowSelectionChange,
    clearSelection,
    activateFilterMode,
    openResultFromAudit,
    openItemFactor,
    openSelectedFactor,
    openBulkFactor,
    openFactor,
    handleMoveRequest,
    openSelectedMove,
    openRackMove,
    moveState,
    closeMove: () => setMoveState(undefined),
    handleMoveSubmit,
    factorTarget,
    closeFactor: () => setFactorTarget(undefined),
    handleFactorSubmit,
    handleResultUpdate,
    handleResultDelete,
    handleResultCreate,
  };
}
