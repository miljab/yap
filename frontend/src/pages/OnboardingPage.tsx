import { useEffect, useState } from "react";
import OnboardingCard from "../components/auth_components/OnboardingCard";
import { Spinner } from "@/components/ui/spinner";
import type { User } from "@/types/user";
import axios from "@/api/axios";
import { useNavigate } from "react-router";

function OnboardingPage() {
  const [isLoading, setLoading] = useState(true);
  const [onboardingUserData, setOnboardingUserData] = useState<User | null>(
    null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("/auth/onboarding/user", {
          withCredentials: true,
        });

        if (response.data.user) {
          setOnboardingUserData(response.data.user);
          setLoading(false);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error(error);
        navigate("/error", {
          state: { error: "Failed to fetch onboarding user data." },
        });
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-11/12 max-w-[450px] flex-col items-center justify-center gap-12 py-8">
        <p className="flex items-center justify-center gap-2">
          Loading... <Spinner />
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-11/12 max-w-[450px] flex-col items-center justify-center gap-12 py-8">
      <OnboardingCard onboardingUser={onboardingUserData!} />
    </div>
  );
}

export default OnboardingPage;
