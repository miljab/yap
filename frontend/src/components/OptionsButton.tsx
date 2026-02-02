import { Edit, Ellipsis, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import type { Post } from "@/types/post";
import TextEditor from "./ui/TextEditor";
import { useState } from "react";

type OptionsButtonCommentProps = {
  itemType: "comment";
  itemId: string;
};

type OptionsButtonPostProps = {
  itemType: "post";
  itemId: string;
  content: string;
  handlePostUpdate: (newPost: Post) => void;
};

type OptionsButtonProps = OptionsButtonPostProps | OptionsButtonCommentProps;

function OptionsButton(props: OptionsButtonProps) {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    const apiUrl = `/${props.itemType}/${props.itemId}`;

    try {
      const response = await axiosPrivate.delete(apiUrl);

      toast.info(response.data.message);
      navigate("/home");
    } catch (error) {
      toast.error("Failed to delete post. Please try again.");
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="cursor-pointer">
          <Ellipsis size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-30">
        {props.itemType === "post" && (
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                data-no-navigate
              >
                <Edit />
                Edit
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent data-no-navigate>
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

        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => e.preventDefault()}
              data-no-navigate
            >
              <Trash />
              Delete
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogContent data-no-navigate>
            <DialogHeader>
              <DialogTitle>
                Are you sure you want to delete this {props.itemType}?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default OptionsButton;
