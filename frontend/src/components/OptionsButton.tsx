import { Edit, Ellipsis, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

function OptionsButton() {
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
        <DropdownMenuItem className="text-red-500">
          <Trash className="text-red-500" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default OptionsButton;
