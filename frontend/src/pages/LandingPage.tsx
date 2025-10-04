import AuthOptions from "@/components/AuthOptions";
import Hero from "@/components/Hero";

function LandingPage() {
  return (
    <div className="m-auto flex w-[93%] flex-col items-center gap-8 md:w-5/6">
      <Hero />
      <div>
        <AuthOptions />
      </div>
    </div>
  );
}

export default LandingPage;
