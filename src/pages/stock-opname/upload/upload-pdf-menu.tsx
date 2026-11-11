import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UploadPdfMenu({
  uploadId,
  onOpen,
}: {
  uploadId: number;
  onOpen: (uploadId: number, includeCarton: boolean) => Promise<void>;
}) {
  const [opening, setOpening] = useState<"pdf" | "pdf-carton" | null>(null);

  const handleOpen = async (includeCarton: boolean) => {
    if (opening) return;
    setOpening(includeCarton ? "pdf-carton" : "pdf");
    try {
      await onOpen(uploadId, includeCarton);
    } finally {
      setOpening(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <FileText />
            PDF
            <ChevronDown />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={opening !== null}
          onClick={() => void handleOpen(false)}
        >
          <FileText />
          {opening === "pdf" ? "Membuat PDF..." : "PDF"}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={opening !== null}
          onClick={() => void handleOpen(true)}
        >
          <FileText />
          {opening === "pdf-carton"
            ? "Membuat PDF + Karton..."
            : "PDF + Karton"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
