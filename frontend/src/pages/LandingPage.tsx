import AuthOptions from "@/components/AuthOptions";
import ToggleTheme from "../components/ui/ToggleTheme";
import Hero from "@/components/Hero";

function LandingPage() {
  return (
    <div className="w-[93%] md:w-5/6 flex items-center flex-col gap-8 m-auto font-[Roboto_Mono]">
      <div className="w-full flex justify-end">
        <ToggleTheme />
      </div>
      <Hero />
      <div>
        <AuthOptions />
      </div>
    </div>
  );
}

export default LandingPage;
