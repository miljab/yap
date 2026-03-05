import type { SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import TextEditor from "./ui/TextEditor";

type EditPostDialogProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  content: string;
  images: { id: string }[];
  handleEdit: (content: string) => Promise<void>;
};

function EditPostDialog({
  isOpen,
  setIsOpen,
  content,
  images,
  handleEdit,
}: EditPostDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-4" data-no-navigate>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <div className="rounded-md border">
          <TextEditor
            onSubmit={handleEdit}
            initialContent={content}
            submitButtonText="Save"
            allowImages={false}
            placeholder="Edit post content"
            existingImagesCount={images.length}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EditPostDialog;
