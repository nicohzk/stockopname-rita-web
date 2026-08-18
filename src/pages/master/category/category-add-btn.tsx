import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import CategoryAddForm from "./category-add-form";

export default function CategoryAddButton() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Add Category</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <Separator />
        <CategoryAddForm />
      </DialogContent>
    </Dialog>
  );
}