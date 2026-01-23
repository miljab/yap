import LoginCard from "@/components/auth_components/LoginCard";
import { Link } from "react-router";

function LoginPage() {
  return (
    <div className="flex min-h-screen w-11/12 max-w-[450px] flex-col items-center justify-center gap-12 py-8">
      <div className="flex flex-col items-center justify-center gap-4 font-[Roboto_Mono]">
        <Link to="/">
          <h1 className="text-4xl tracking-wider">yap.</h1>
        </Link>
      </div>
      <LoginCard />
    </div>
  );
}

export default LoginPage;
