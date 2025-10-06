import SignupCard from "@/components/SignupCard";
import { Link } from "react-router";

function SignupPage() {
  return (
    <div className="flex min-h-screen w-11/12 max-w-[450px] flex-col items-center justify-center gap-12 py-8">
      <div className="flex flex-col items-center justify-center gap-4 font-[Roboto_Mono]">
        <Link to="/">
          <h1 className="text-4xl tracking-wider">yap.</h1>
        </Link>
        <p className="xs:text-lg text-[1rem]">Join us now and start yapping.</p>
      </div>
      <SignupCard />
    </div>
  );
}

export default SignupPage;
