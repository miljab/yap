import CreatePost from "@/components/post_components/CreatePost";
import HomeFeed from "@/components/post_components/HomeFeed";

function HomePage() {
  return (
    <div className="w-full">
      <CreatePost />
      <HomeFeed />
    </div>
  );
}

export default HomePage;
