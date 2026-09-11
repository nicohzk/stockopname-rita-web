import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function PrintDetailButton({ onPrint }: { onPrint: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const handlePrint = async () => {
    if (loading) return;
    setLoading(true);
    try { await onPrint(); }
    catch (error) { showToast(error instanceof Error ? error.message : "Failed to generate PDF.", "error"); }
    finally { setLoading(false); }
  };
  return <Button variant="outline" onClick={() => void handlePrint()} disabled={loading}><Printer />{loading ? "Generating..." : "Print Detail"}</Button>;
}