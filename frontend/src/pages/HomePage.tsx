import CreatePost from "@/components/CreatePost";
import useAuth from "@/hooks/useAuth";

function HomePage() {
  const { auth } = useAuth();
  console.log(auth);
  return (
    <div>
      <CreatePost />
    </div>
  );
}

export default HomePage;
