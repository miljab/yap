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
        <DropdownMenuItem className="text-red-500" onClick={handleDelete}>
          <Trash className="text-red-500" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default OptionsButton;
