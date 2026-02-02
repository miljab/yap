import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePosts from "./ProfilePosts";
import ProfileComments from "./ProfileComments";

type ProfileFeedProps = {
  userId: string;
};

function ProfileFeed({ userId }: ProfileFeedProps) {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="posts" className="flex-1">
          Posts
        </TabsTrigger>
        <TabsTrigger value="comments" className="flex-1">
          Comments
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts">
        <ProfilePosts userId={userId} />
      </TabsContent>

      <TabsContent value="comments">
        <ProfileComments userId={userId} />
      </TabsContent>
    </Tabs>
  );
}

export default ProfileFeed;
