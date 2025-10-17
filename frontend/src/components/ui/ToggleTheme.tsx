import useTheme from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

function ToggleTheme() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="border-input relative flex w-fit gap-2 rounded-2xl border p-1 shadow-xs">
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
        className={`bg-foreground absolute z-0 h-7 w-7 -translate-0.5 rounded-full transition-transform duration-200 ${
          theme === "dark" && "translate-x-7.5"
        }`}
      ></div>
    </div>
  );
}

export default ToggleTheme;
