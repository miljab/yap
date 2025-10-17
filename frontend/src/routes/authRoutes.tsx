import { Route } from "react-router";
import RequireAuth from "@/components/RequireAuth";
import HomePage from "@/pages/HomePage";
import AuthLayout from "@/layouts/AuthLayout";

const authRoutes = () => {
  return (
    <Route element={<RequireAuth />}>
      <Route element={<AuthLayout />}>
        <Route path="/home" element={<HomePage />} />
      </Route>
    </Route>
  );
};

export default authRoutes;
