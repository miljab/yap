import { Route } from "react-router";
import RequireAuth from "@/components/RequireAuth";
import HomePage from "@/pages/HomePage";
import AuthLayout from "@/layouts/AuthLayout";
import PostViewPage from "@/pages/PostViewPage";
import ThreadViewPage from "@/pages/ThreadViewPage";
import ProfilePage from "@/pages/ProfilePage";
import PostViewLayout from "@/layouts/PostViewLayout";
import SearchPage from "@/pages/SearchPage";

const authRoutes = () => {
  return (
    <Route element={<RequireAuth />}>
      <Route element={<AuthLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
      </Route>
      <Route element={<PostViewLayout />}>
        <Route path="/post/:id" element={<PostViewPage />} />
        <Route path="/comment/:id" element={<ThreadViewPage />} />
      </Route>
    </Route>
  );
};

export default authRoutes;
