import { Spinner } from "@/components/ui/spinner";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import axios from "@/api/axios";
import { useNavigate } from "react-router";

function AuthProcessingPage() {
  const { setAuth } = useAuth();
  const [status, setStatus] = useState("Loading...");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("/auth/processing", {
          withCredentials: true,
        });

        const user = response.data.user;
        const accessToken = response.data.accessToken;

        setAuth({ user, accessToken });

        setStatus("Login successful. Redirecting...");

        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } catch (error) {
        console.error(error);
        navigate("/error", {
          state: { error: "Login failed. Please try again." },
        });
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex gap-4">
      <p>{status}</p> <Spinner />
    </div>
  );
}

export default AuthProcessingPage;
