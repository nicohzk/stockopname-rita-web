import { type SubmitEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CategoryAddForm() {
  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    //logical post data to backend
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" />
      </div>
      <Button type="submit" className="w-full">
        Add Category
      </Button>
    </form>
  );
}
