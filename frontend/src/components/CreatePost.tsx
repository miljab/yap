import { Image, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { useRef, useState } from "react";
import { toast } from "sonner";

function CreatePost() {
  const divRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    if (files.length > 4 || files.length + selectedFiles.length > 4) {
      toast.info("Please, select up to 4 images.");
      return;
    }

    if (files) {
      const newFiles = [...selectedFiles, ...Array.from(files)];
      setSelectedFiles(newFiles);
    }
  }

  function displayImages() {
    if (!selectedFiles || selectedFiles.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {selectedFiles.map((file, idx) => (
          <div className="relative w-fit">
            <img
              key={idx}
              src={URL.createObjectURL(file)}
              alt={`preview-${idx}`}
              className="inline-block h-40 w-40 rounded-md object-cover"
            />
            <button
              className="hover:bg-accent absolute top-2 right-2 cursor-pointer rounded-full bg-neutral-900 p-1"
              onClick={() => {
                setSelectedFiles((prevFiles) =>
                  prevFiles.filter((_, i) => i !== idx),
                );
              }}
            >
              <Trash />
            </button>
          </div>
        ))}
      </div>
    );
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
          className="max-h-[70vh] min-h-16 overflow-auto p-2 outline-none"
          contentEditable
          ref={divRef}
          onInput={handleInput}
          aria-label="Post content"
        ></div>

        {displayImages()}
      </div>
      <div className="flex items-center justify-end gap-4 border-t p-2">
        {actualLength > 0 && (
          <span
            className={`grow text-sm ${actualLength > 190 ? "text-red-400" : "text-neutral-500"}`}
          >
            Characters: {actualLength}/200
          </span>
        )}
        <input
          type="file"
          className="hidden"
          accept=".jpg, .jpeg, .png, .gif"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
        />
        <button
          className="hover:bg-accent cursor-pointer rounded-full p-2"
          onClick={triggerFileInput}
        >
          <Image />
        </button>
        <Button className="rounded-2xl">Post</Button>
      </div>
    </div>
  );
}

export default CreatePost;
