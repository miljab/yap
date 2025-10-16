import { ThemeProvider } from "./context/ThemeProvider";
import { Routes } from "react-router";
import publicRoutes from "./routes/publicRoutes";
import authRoutes from "./routes/authRoutes";
import { AuthProvider } from "./context/AuthProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="uiTheme">
      <AuthProvider>
        <Routes>{publicRoutes()}</Routes>
        <Routes>{authRoutes()}</Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
