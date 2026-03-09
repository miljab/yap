import { ThemeProvider } from "./context/ThemeProvider";
import { Routes, Route } from "react-router";
import publicRoutes from "./routes/publicRoutes";
import authRoutes from "./routes/authRoutes";
import { AuthProvider } from "./context/AuthProvider";
import { FollowProvider } from "./context/FollowProvider";
import ErrorPage from "./pages/ErrorPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="uiTheme">
      <AuthProvider>
        <FollowProvider>
          <Routes>{publicRoutes()}</Routes>
          <Routes>{authRoutes()}</Routes>
          <Routes>
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </FollowProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
