import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePosts from "./ProfilePosts";
import ProfileComments from "./ProfileComments";
import { useCachedValue } from "@/hooks/useCachedValue";

type ProfileTabsProps = {
  userId: string;
};

function ProfileTabs({ userId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useCachedValue<"posts" | "comments">(
    `profile:${userId}:tab`,
    "posts",
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as "posts" | "comments")}
      className="w-full"
    >
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
        className={activeTab !== "posts" ? "hidden" : ""}
      >
        <ProfilePosts userId={userId} />
      </TabsContent>

      <TabsContent
        value="comments"
        className={activeTab !== "comments" ? "hidden" : ""}
      >
        <ProfileComments userId={userId} />
      </TabsContent>
    </Tabs>
  );
}

export default ProfileTabs;
