import type { SetStateAction } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

type SearchTabsProps = {
  activeTab: string;
  setActiveTab: React.Dispatch<SetStateAction<string>>;
};

function SearchTabs({ activeTab, setActiveTab }: SearchTabsProps) {
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
      ></TabsContent>

      <TabsContent
        value="posts"
        className={activeTab !== "posts" ? "hidden" : ""}
      ></TabsContent>
    </Tabs>
  );
}

export default SearchTabs;
