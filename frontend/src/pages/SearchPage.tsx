import SearchBar from "@/components/search_components/SearchBar";
import SearchTabs from "@/components/search_components/SearchTabs";
import { useState } from "react";

function SearchPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col">
      <SearchBar setQuery={setQuery} />
      <SearchTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        query={query}
      />
    </div>
  );
}

export default SearchPage;
