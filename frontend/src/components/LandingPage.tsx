import LandingPageSentence from "./LandingPageSentence";
import ToggleTheme from "./ui/ToggleTheme";

function LandingPage() {
  return (
    <div>
      <div>
        <ToggleTheme />
      </div>
      <h1>yap.</h1>
      <LandingPageSentence />
    </div>
  );
}

export default LandingPage;
