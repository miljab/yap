import LandingPage from "./pages/LandingPage";
import { ThemeProvider } from "./context/ThemeProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="uiTheme">
      <LandingPage />
    </ThemeProvider>
  );
}

export default App;
