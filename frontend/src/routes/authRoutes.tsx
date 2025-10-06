import { Route } from "react-router";
import RequireAuth from "@/components/RequireAuth";
import HomePage from "@/pages/HomePage";

const authRoutes = () => {
  return (
    <Route element={<RequireAuth />}>
      <Route path="/home" element={<HomePage />} />
    </Route>
  );
};

export default authRoutes;
