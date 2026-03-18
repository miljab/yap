import SearchBar from "@/components/search_components/SearchBar";
import SearchTabs from "@/components/search_components/SearchTabs";
import type { Post } from "@/types/post";
import type { User } from "@/types/user";
import { useCallback, useState } from "react";

function SearchPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div>
      <SearchBar />
      <SearchTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default SearchPage;
