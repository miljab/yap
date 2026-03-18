import type { SetStateAction } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import SearchUsers from "./SearchUsers";

type SearchTabsProps = {
  activeTab: string;
  setActiveTab: React.Dispatch<SetStateAction<string>>;
  query: string;
};

function SearchTabs({ activeTab, setActiveTab, query }: SearchTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList variant="line" className="w-full border-b">
        <TabsTrigger value="users" className="flex-1 cursor-pointer">
          Users
        </TabsTrigger>
        <TabsTrigger value="posts" className="flex-1 cursor-pointer">
          Posts
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="users"
        className={activeTab !== "users" ? "hidden" : ""}
      >
        <SearchUsers query={query} />
      </TabsContent>

      <TabsContent
        value="posts"
        className={activeTab !== "posts" ? "hidden" : ""}
      ></TabsContent>
    </Tabs>
  );
}

export default SearchTabs;
