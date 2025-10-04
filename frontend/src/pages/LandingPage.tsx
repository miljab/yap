import AuthOptions from "@/components/AuthOptions";
import Hero from "@/components/Hero";

function LandingPage() {
  return (
    <div className="m-auto flex w-[93%] flex-col items-center justify-center gap-12 md:w-5/6 md:flex-row md:items-start md:gap-32 lg:gap-48">
      <Hero />
      <div>
        <AuthOptions />
      </div>
    </div>
  );
}

export default LandingPage;
