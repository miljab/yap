import { type KeyboardEvent, useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

type SearchBarProps = {
  setQuery: (query: string) => void;
};

function SearchBar({ setQuery }: SearchBarProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(inputValue.trim()), 300);

    return () => clearTimeout(timer);
  }, [inputValue, setQuery]);

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;

    if (e.key === "Enter" || e.key === "Escape") {
      inputRef.current.blur();
      return;
    }
  };

  return (
    <div
      className={`border-input m-2 flex rounded-3xl border p-2 ${isInputFocused && "outline-1"}`}
    >
      <Search />
      <input
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        onKeyDown={(e) => handleInputKeyDown(e)}
        onChange={(e) => setInputValue(e.target.value)}
        value={inputValue}
        ref={inputRef}
        className="w-full px-2 outline-0"
        type="text"
        placeholder="Search..."
      />
    </div>
  );
}

export default SearchBar;
