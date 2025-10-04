import RequireGuest from "@/components/RequireGuest";
import PublicLayout from "@/layouts/PublicLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import { Route } from "react-router";

const publicRoutes = () => {
  return (
    <Route element={<RequireGuest />}>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
    </Route>
  );
};

export default publicRoutes;
