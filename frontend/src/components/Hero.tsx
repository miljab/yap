import HeroSentence from "./HeroSentence";

function Hero() {
  return (
    <div>
      <h1 className="mb-4 text-left text-4xl tracking-wider md:text-5xl">
        yap.
      </h1>
      <div className="w-full text-center">
        <HeroSentence />
      </div>
    </div>
  );
}

export default Hero;
