import CreatePost from "@/components/post_components/CreatePost";
import HomeTabs from "@/components/post_components/HomeTabs";

function HomePage() {
  return (
    <div className="w-full">
      <CreatePost />
      <HomeTabs />
    </div>
  );
}

export default HomePage;
