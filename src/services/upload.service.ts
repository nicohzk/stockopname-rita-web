import { api, type ApiResponse } from "@/lib/api";
import type { Upload } from "@/types/upload";

type UploadResponse = {
  upload_id: number;
  rack_count: number;
  item_count: number;
  created_at: string;
};

function mapUpload(item: UploadResponse): Upload {
  return {
    uploadId: item.upload_id,
    rackCount: item.rack_count,
    itemCount: item.item_count,
    createdAt: item.created_at,
  };
}

export async function getUploads(coordinatorId: number) {
  const response = await api<ApiResponse<UploadResponse[]>>(
    `/stockopname/uploads?coordinatorId=${coordinatorId}`,
  );
  return (response.data ?? []).map(mapUpload);
}
