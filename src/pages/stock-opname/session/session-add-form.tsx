import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type SubmitEvent } from "react";

export default function SessionAddForm() {
  const [coordinatorCodes, setCoordinatorCodes] = useState<string[]>([""]); 
  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    //logical post data to backend
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input id="code" name="code" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" />
      </div>

      <div className="space-y-2 overflow-y-auto max-h-60">
        <Label htmlFor="coordinatorCodes">Coordinator Code</Label>

        {coordinatorCodes.map((code, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder={`Coordinator code ${index + 1}`}
              value={code}
              onChange={(e) => {
                const newCodes = [...coordinatorCodes];
                newCodes[index] = e.target.value;
                setCoordinatorCodes(newCodes);
              }}
            />

            {coordinatorCodes.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCoordinatorCodes(
                    coordinatorCodes.filter((_, i) => i !== index),
                  );
                }}
              >
                Hapus
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() => setCoordinatorCodes([...coordinatorCodes, ""])}
        >
          + Tambah Coordinator
        </Button>
      </div>

      <Button type="submit" className="w-full">
        Add Sesi
      </Button>
    </form>
  );
}
