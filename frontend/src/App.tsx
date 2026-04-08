import { ThemeProvider } from "./context/ThemeProvider";
import { Routes, Route } from "react-router";
import publicRoutes from "./routes/publicRoutes";
import authRoutes from "./routes/authRoutes";
import { AuthProvider } from "./context/AuthProvider";
import { FollowProvider } from "./context/FollowProvider";
import ErrorPage from "./pages/ErrorPage";
import { PageCacheProvider } from "./context/PageCacheProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="uiTheme">
      <AuthProvider>
        <FollowProvider>
          <PageCacheProvider>
            <Routes>
              {publicRoutes()}
              {authRoutes()}
              <Route path="/error" element={<ErrorPage />} />
            </Routes>
          </PageCacheProvider>
        </FollowProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
