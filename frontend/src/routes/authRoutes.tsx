import { Route } from "react-router";
import RequireAuth from "@/components/RequireAuth";
import HomePage from "@/pages/HomePage";
import AuthLayout from "@/layouts/AuthLayout";
import PostViewPage from "@/pages/PostViewPage";
import ThreadViewPage from "@/pages/ThreadViewPage";
import ProfilePage from "@/pages/ProfilePage";

const authRoutes = () => {
  return (
    <Route element={<RequireAuth />}>
      <Route element={<AuthLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/post/:id" element={<PostViewPage />} />
        <Route path="/comment/:id" element={<ThreadViewPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Route>
    </Route>
  );
};

export default authRoutes;
