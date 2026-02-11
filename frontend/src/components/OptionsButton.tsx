import { Edit, Ellipsis, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import type { Post } from "@/types/post";
import TextEditor from "./ui/TextEditor";
import { useState } from "react";

type OptionsButtonCommentProps = {
  itemType: "comment";
  itemId: string;
  onDelete: () => void;
};

type OptionsButtonPostProps = {
  itemType: "post";
  itemId: string;
  content: string;
  handlePostUpdate: (newPost: Post) => void;
  onDelete: () => void;
};

type OptionsButtonProps = OptionsButtonPostProps | OptionsButtonCommentProps;

function OptionsButton(props: OptionsButtonProps) {
  const axiosPrivate = useAxiosPrivate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    const apiUrl = `/${props.itemType}/${props.itemId}`;

    try {
      const response = await axiosPrivate.delete(apiUrl);

      toast.info(response.data.message);
      setEditDialogOpen(false);
      props.onDelete();
    } catch (error) {
      toast.error(`Failed to delete ${props.itemType}. Please try again.`);
      console.error(error);
    }
  };

  const handlePostEdit = async (content: string) => {
    if (props.itemType !== "post") return;
    try {
      const response = await axiosPrivate.put(`/post/${props.itemId}`, {
        content,
      });

      props.handlePostUpdate(response.data);
      toast.info("Post edited successfully.");
      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Failed to edit post. Please try again.");
      throw error;
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="cursor-pointer">
            <Ellipsis size={20} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-30">
          {props.itemType === "post" && (
            <DropdownMenuItem
              data-no-navigate
              onSelect={() => setEditDialogOpen(true)}
            >
              <Edit />
              Edit
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            variant="destructive"
            data-no-navigate
            onSelect={() => setDeleteDialogOpen(true)}
          >
            <Trash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {props.itemType === "post" && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="p-4" data-no-navigate>
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
            </DialogHeader>
            <TextEditor
              onSubmit={handlePostEdit}
              initialContent={props.content}
              submitButtonText="Save"
              allowImages={false}
              placeholder="Edit post content"
            />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent data-no-navigate>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this {props.itemType}?
            </DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>

            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default OptionsButton;
