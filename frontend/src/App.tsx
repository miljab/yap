import { ThemeProvider } from "./context/ThemeProvider";
import { Routes } from "react-router";
import publicRoutes from "./routes/publicRoutes";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="uiTheme">
      <Routes>{publicRoutes()}</Routes>
    </ThemeProvider>
  );
}

export default App;
