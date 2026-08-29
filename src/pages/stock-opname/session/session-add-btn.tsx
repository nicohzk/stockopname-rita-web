import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import SessionAddForm from "./session-add-form";

export default function SessionAddBtn() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Add Sesi</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Sesi</DialogTitle>
          <Separator></Separator>
        </DialogHeader>
          <SessionAddForm />
      </DialogContent>
    </Dialog>
  );
}
