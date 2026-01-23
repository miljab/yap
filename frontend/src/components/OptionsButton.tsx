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

type OptionsButtonProps = {
  itemType: "post" | "comment";
  itemId: string;
};

function OptionsButton({ itemType, itemId }: OptionsButtonProps) {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const apiUrl = `/${itemType}/${itemId}`;

    try {
      const response = await axiosPrivate.delete(apiUrl);

      toast.info(response.data.message);
      navigate("/home");
    } catch (error) {
      toast.error("Failed to delete post. Please try again.");
      console.error(error);
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
        <DropdownMenuItem>
          <Edit />
          Edit
        </DropdownMenuItem>

        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash />
              Delete
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Are you sure you want to delete this {itemType}?
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
