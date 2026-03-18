import { useState } from "react";
import { Search } from "lucide-react";

function SearchBar() {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <div
      className={`border-input m-4 flex rounded-3xl border p-2 ${isInputFocused && "outline-1"}`}
    >
      <Search />
      <input
        onFocus={() => setIsInputFocused(true)}
        onBlur={() => setIsInputFocused(false)}
        onChange={(e) => setInputValue(e.target.value)}
        value={inputValue}
        className="w-full px-2 outline-0"
        type="text"
        placeholder="Search..."
      />
    </div>
  );
}

export default SearchBar;
