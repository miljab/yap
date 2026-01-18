import { useRef, useState } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Trash, Image } from "lucide-react";

const MAX_FILE_SIZE = 5242880; // 5MB

type CreateCommentProps = {
  postId: string;
  parentId?: string;
};

function CreateComment({ postId, parentId }: CreateCommentProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const axiosPrivate = useAxiosPrivate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createComment() {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("text", content);

      if (selectedFiles && selectedFiles.length > 0) {
        selectedFiles.forEach((file) => formData.append("images", file));
      }

      const apiUrlString = parentId
        ? `/comment/${parentId}/reply`
        : `/post/${postId}/reply`;

      const response = await axiosPrivate.post(apiUrlString, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        toast.success("Commented successfully.");
        if (divRef.current) {
          divRef.current.innerText = "";
        }
        setContent("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedFiles([]);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create comment. Please try again.");
    }
  }
  function handleTextInput() {
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
      const validFiles = Array.from(files).filter(
        (f) => f.size <= MAX_FILE_SIZE,
      );

      if (validFiles.length < files.length)
        toast.warning("Max file size is 5MB.");

      const newFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);
    }
  }

  function displayImages() {
    if (!selectedFiles || selectedFiles.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {selectedFiles.map((file, idx) => (
          <div key={idx} className="relative w-fit">
            <img
              src={URL.createObjectURL(file)}
              alt={`preview-${idx}`}
              className="inline-block h-40 w-40 rounded-md object-cover"
            />
            <button
              className="hover:bg-accent bg-background absolute top-2 right-2 cursor-pointer rounded-full p-1"
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
    <div className="flex flex-col rounded-md border">
      <div className="relative min-h-16 p-2">
        {actualLength === 0 && (
          <span className="pointer-events-none absolute top-4 left-4 text-neutral-500 select-none">
            Post your reply
          </span>
        )}
        <div
          className="max-h-[70vh] min-h-16 overflow-auto p-2 outline-none"
          contentEditable
          ref={divRef}
          onInput={handleTextInput}
          aria-label="Post content"
        ></div>

        {displayImages()}
      </div>
      <div className="flex items-center justify-end gap-2 border-t p-2">
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
        <Button
          className="w-18 rounded-2xl disabled:bg-neutral-950 dark:disabled:bg-neutral-200"
          onClick={createComment}
          disabled={
            (actualLength === 0 && selectedFiles.length === 0) || isSubmitting
          }
        >
          {isSubmitting ? <Spinner /> : "Reply"}
        </Button>
      </div>
    </div>
  );
}

export default CreateComment;
