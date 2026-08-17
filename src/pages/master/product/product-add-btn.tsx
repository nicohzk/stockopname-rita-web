import { Button } from "@/components/ui/button";
import ProductAddForm from "./product-add-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator"

export default function ProductCreateButton() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Add Product</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <Separator></Separator>
        </DialogHeader>
        <ProductAddForm />
      </DialogContent>
    </Dialog>
  );
}