import { type SubmitEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function DepartmentAddForm() {
  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    //logical post data to backend
  };

  return (
    <form className="space-y-4 w-full min-w-0" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input id="code" name="code" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description</Label>
        <Textarea name="desc" id="desc" />
      </div>

      <Button type="submit" className="w-full">
        Add Department
      </Button>
    </form>
  );
}
