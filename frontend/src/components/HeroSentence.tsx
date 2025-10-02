import { useEffect, useState } from "react";

const words = [
  "liked.",
  "desired.",
  "needed.",
  "the goal.",
  "heard.",
  "loved.",
  "limitless.",
];

function TypewriterText() {
  const [wordIndex, setWordIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause) return;

    if (subIndex === words[wordIndex].length + 1 && !deleting) {
      // pause at full word
      setPause(true);
      setTimeout(() => {
        setDeleting(true);
        setPause(false);
      }, 2000); // how long word is displayed before start of deleting
      return;
    }

    if (subIndex === 0 && deleting) {
      // move to next word
      setDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        setSubIndex((prev) => prev + (deleting ? -1 : 1));
      },
      deleting ? 50 : 150 // deleting time : typing time
    );

    return () => clearTimeout(timeout);
  }, [subIndex, wordIndex, deleting, pause]);

  // blinking cursor
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <span className="inline-block text-left text-primary font-bold min-w-[11ch]">
      {words[wordIndex].substring(0, subIndex)}
      <span
        className={`relative sm:bottom-0.5 bottom-[1px] ${
          blink ? "opacity-100" : "opacity-0"
        }`}
      >
        |
      </span>
    </span>
  );
}

function HeroSentence() {
  return (
    <div className="w-fit m-auto flex flex-col items-start xs:items-center xs:flex-row text-sm sm:text-[1rem] md:text-lg lg:text-xl font-[Roboto_Mono]">
      <span>The only place where your&nbsp;</span>
      <span className="inline-block whitespace-nowrap">
        yapping is <TypewriterText />
      </span>
    </div>
  );
}

export default HeroSentence;
