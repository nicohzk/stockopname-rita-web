import { type SubmitEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Department } from "@/types/department";

export default function DepartmentAddForm({ onSubmit, initialData, submitLabel = "Add Department" }: { onSubmit: (data: { code: string; name: string; description: string }) => Promise<void>; initialData?: Department; submitLabel?: string }) {
  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await onSubmit({ code: String(formData.get("code")), name: String(formData.get("name")), description: String(formData.get("description") ?? "") });
  };

  return (
    <form className="space-y-4 w-full min-w-0" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={initialData?.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input id="code" name="code" defaultValue={initialData?.code} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea name="description" id="description" defaultValue={initialData?.description} />
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
