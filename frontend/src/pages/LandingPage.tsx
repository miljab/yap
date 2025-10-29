import AuthOptions from "@/components/AuthOptions";
import Hero from "@/components/Hero";
import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

function LandingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "auth-error") {
      toast.error("Error during authentication. Please try again.");
      searchParams.delete("error");
      setSearchParams(searchParams);
    }

    if (searchParams.get("signup") === "success") {
      toast.success("Account created successfully! You can log in now.");
      searchParams.delete("signup");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="m-auto flex w-[93%] flex-col items-center justify-center gap-12 md:w-5/6 md:flex-row md:items-start md:gap-32 lg:gap-48">
      <Hero />
      <div>
        <AuthOptions />
      </div>
    </div>
  );
}

export default LandingPage;
