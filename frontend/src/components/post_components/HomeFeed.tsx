import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HomeFeedAllPosts from "./HomeFeedAllPosts";
import HomeFeedFollowing from "./HomeFeedFollowing";

function HomeFeed() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="all" className="flex-1 cursor-pointer">
          All
        </TabsTrigger>
        <TabsTrigger value="following" className="flex-1 cursor-pointer">
          Following
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="all"
        forceMount
        className={activeTab !== "all" ? "hidden" : ""}
      >
        <HomeFeedAllPosts />
      </TabsContent>

      <TabsContent
        value="following"
        forceMount
        className={activeTab !== "following" ? "hidden" : ""}
      >
        <HomeFeedFollowing />
      </TabsContent>
    </Tabs>
  );
}

export default HomeFeed;
