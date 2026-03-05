import { Edit, Ellipsis, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";
import type { Post } from "@/types/post";
import { useState } from "react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import EditPostDialog from "./EditPostDialog";

type OptionsButtonCommentProps = {
  itemType: "comment";
  itemId: string;
  onDelete: () => void;
};

type OptionsButtonPostProps = {
  itemType: "post";
  itemId: string;
  content: string;
  images: { id: string }[];
  handlePostUpdate: (newPost: Post) => void;
  onDelete: () => void;
};

type OptionsButtonProps = OptionsButtonPostProps | OptionsButtonCommentProps;

function OptionsButton(props: OptionsButtonProps) {
  const axiosPrivate = useAxiosPrivate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    const apiUrl = `/${props.itemType}/${props.itemId}`;

    try {
      const response = await axiosPrivate.delete(apiUrl);

      toast.info(response.data.message);
      setDeleteDialogOpen(false);
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

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="cursor-pointer p-1">
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
        <EditPostDialog
          isOpen={editDialogOpen}
          setIsOpen={setEditDialogOpen}
          content={props.content}
          images={props.images}
          handleEdit={handlePostEdit}
        />
      )}

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        itemType={props.itemType}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default OptionsButton;
