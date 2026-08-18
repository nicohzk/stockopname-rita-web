import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DepartmentAddForm from "./department-add-form";
import { Separator } from "@/components/ui/separator";

export default function DepartmentAddButton() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Add Department</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <Separator></Separator>
        </DialogHeader>
        <DepartmentAddForm />
      </DialogContent>
    </Dialog>
  );
}
