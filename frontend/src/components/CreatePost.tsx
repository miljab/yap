import { Image } from "lucide-react";
import { Button } from "./ui/button";
import { useRef, useState } from "react";

function CreatePost() {
  const divRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");

  function handleInput() {
    setContent(divRef.current?.innerText || "");
    console.log(divRef.current?.innerText.length);
  }

  return (
    <div className="m-2 flex flex-col rounded-md border">
      <div className="relative min-h-16 p-2">
        {(content === "" || content === "\n") && (
          <span className="pointer-events-none absolute top-4 left-4 text-neutral-500 select-none">
            What's on your mind?
          </span>
        )}
        <div
          className="min-h-16 p-2 outline-none"
          contentEditable
          ref={divRef}
          onInput={handleInput}
          aria-label="Post content"
        />
      </div>
      <div className="flex items-center justify-end gap-4 border-t p-2">
        <button className="hover:bg-accent cursor-pointer rounded-2xl">
          <Image />
        </button>
        <Button className="rounded-2xl">Post</Button>
      </div>
    </div>
  );
}

export default CreatePost;
