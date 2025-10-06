import { ThemeProvider } from "./context/ThemeProvider";
import { Routes } from "react-router";
import publicRoutes from "./routes/publicRoutes";
import authRoutes from "./routes/authRoutes";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="uiTheme">
      <Routes>{publicRoutes()}</Routes>
      <Routes>{authRoutes()}</Routes>
    </ThemeProvider>
  );
}

export default App;
