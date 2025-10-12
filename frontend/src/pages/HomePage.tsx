import LogoutButton from "@/components/ui/LogoutButton";
import useAuth from "@/hooks/useAuth";

function HomePage() {
  const { auth } = useAuth();
  console.log(auth.user);
  return (
    <div>
      <LogoutButton />
    </div>
  );
}

export default HomePage;
