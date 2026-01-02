import { Image } from "lucide-react";
import { Button } from "./ui/button";
import { useRef, useState } from "react";

function CreatePost() {
  const divRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");

  function handleInput() {
    let text = divRef.current?.innerText || "";
    if (text.length > 200) {
      text = text.slice(0, 200);

      if (divRef.current) {
        divRef.current.innerText = text;
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(divRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }

    setContent(text);
  }

  const actualLength = content === "" || content === "\n" ? 0 : content.length;

  return (
    <div className="m-4 flex flex-col rounded-md border">
      <div className="relative min-h-16 p-2">
        {actualLength === 0 && (
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
        {actualLength > 0 && (
          <span
            className={`grow text-sm ${actualLength > 190 ? "text-red-400" : "text-neutral-500"}`}
          >
            Characters: {actualLength}/200
          </span>
        )}
        <button className="hover:bg-accent cursor-pointer rounded-2xl">
          <Image />
        </button>
        <Button className="rounded-2xl">Post</Button>
      </div>
    </div>
  );
}

export default CreatePost;
