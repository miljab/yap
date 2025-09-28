import LandingPage from "./components/LandingPage";
import { ThemeProvider } from "./context/ThemeProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="uiTheme">
      <LandingPage />
    </ThemeProvider>
  );
}

export default App;
