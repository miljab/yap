import SearchBar from "@/components/search_components/SearchBar";
import SearchTabs from "@/components/search_components/SearchTabs";
import { useCachedValue } from "@/hooks/useCachedValue";

function SearchPage() {
  const [activeTab, setActiveTab] = useCachedValue("search:tab", "users");
  const [query, setQuery] = useCachedValue("search:query", "");

  return (
    <div className="flex flex-col">
      <SearchBar query={query} setQuery={setQuery} />
      <SearchTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        query={query}
      />
    </div>
  );
}

export default SearchPage;
