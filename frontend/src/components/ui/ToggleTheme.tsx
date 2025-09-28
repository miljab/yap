import useTheme from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

function ToggleTheme() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="border-foreground border-1 rounded-2xl mt-4 ml-4 p-1 flex gap-2 w-fit relative">
      <button
        className={`z-1 cursor-pointer rounded-full ${
          theme === "light" && "text-background"
        }`}
        onClick={() => setTheme("light")}
      >
        <Sun />
      </button>
      <button
        className={`z-1 cursor-pointer rounded-full ${
          theme === "dark" && "text-background"
        }`}
        onClick={() => setTheme("dark")}
      >
        <Moon />
      </button>
      <div
        className={`transition-transform duration-200 absolute w-7 h-7 bg-foreground rounded-full z-0 -translate-0.5 ${
          theme === "dark" && "translate-x-7.5"
        }`}
      ></div>
    </div>
  );
}

export default ToggleTheme;
