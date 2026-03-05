import { type SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

type DeleteConfirmDialogProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  itemType: "post" | "comment";
  onConfirm: () => void;
  isDeleting: boolean;
};

function DeleteConfirmDialog({
  isOpen,
  setIsOpen,
  itemType,
  onConfirm,
  isDeleting,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent data-no-navigate>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete this {itemType}?
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isDeleting}>Cancel</Button>
          </DialogClose>

          <Button
            disabled={isDeleting}
            variant="destructive"
            onClick={onConfirm}
          >
            {isDeleting ? <Spinner /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmDialog;
