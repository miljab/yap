import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePosts from "./ProfilePosts";
import ProfileComments from "./ProfileComments";
import { useCachedTab } from "@/hooks/useCachedTab";

type ProfileTabsProps = {
  userId: string;
};

function ProfileTabs({ userId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useCachedTab(`profile:${userId}`, "posts");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList variant="line" className="w-full border-b">
        <TabsTrigger value="posts" className="flex-1 cursor-pointer">
          Posts
        </TabsTrigger>
        <TabsTrigger value="comments" className="flex-1 cursor-pointer">
          Comments
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="posts"
        forceMount
        className={activeTab !== "posts" ? "hidden" : ""}
      >
        <ProfilePosts userId={userId} />
      </TabsContent>

      <TabsContent
        value="comments"
        forceMount
        className={activeTab !== "comments" ? "hidden" : ""}
      >
        <ProfileComments userId={userId} />
      </TabsContent>
    </Tabs>
  );
}

export default ProfileTabs;
