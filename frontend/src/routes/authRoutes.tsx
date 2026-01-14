import { Route } from "react-router";
import RequireAuth from "@/components/RequireAuth";
import HomePage from "@/pages/HomePage";
import AuthLayout from "@/layouts/AuthLayout";
import PostViewPage from "@/pages/PostViewPage";
import ReplyView from "@/components/ReplyView";

const authRoutes = () => {
  return (
    <Route element={<RequireAuth />}>
      <Route element={<AuthLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/post/:id" element={<PostViewPage />} />
        <Route path="/comment/:id" element={<ReplyView />} />
      </Route>
    </Route>
  );
};

export default authRoutes;
