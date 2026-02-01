import { Route } from "react-router";
import RequireAuth from "@/components/RequireAuth";
import HomePage from "@/pages/HomePage";
import AuthLayout from "@/layouts/AuthLayout";
import PostViewPage from "@/pages/PostViewPage";
import ThreadView from "@/components/comment_components/ThreadView";
import ProfilePage from "@/pages/ProfilePage";

const authRoutes = () => {
  return (
    <Route element={<RequireAuth />}>
      <Route element={<AuthLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/post/:id" element={<PostViewPage />} />
        <Route path="/comment/:id" element={<ThreadView />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Route>
    </Route>
  );
};

export default authRoutes;
