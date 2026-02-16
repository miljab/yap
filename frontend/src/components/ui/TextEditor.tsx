import { Image, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

const MAX_FILE_SIZE = 5242880; // 5MB

type TextEditorProps = {
  onSubmit: (content: string, files?: File[]) => Promise<void>;
  maxLength?: number;
  initialContent?: string;
  placeholder?: string;
  allowImages?: boolean;
  maxImages?: number;
  submitButtonText: string;
  autoFocus?: boolean;
};

function TextEditor({
  onSubmit,
  maxLength = 200,
  initialContent = "",
  placeholder,
  allowImages = true,
  maxImages = 4,
  submitButtonText,
  autoFocus = false,
}: TextEditorProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(initialContent);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (divRef.current && initialContent) {
      divRef.current.innerText = initialContent;
      setContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    if (autoFocus && divRef.current) {
      divRef.current.focus();
    }
  }, [autoFocus]);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      await onSubmit(content, selectedFiles);

      if (divRef.current) {
        divRef.current.innerText = "";
      }

      setContent("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSelectedFiles([]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }
  function handleTextInput() {
    let text = divRef.current?.innerText || "";
    if (text.length > maxLength) {
      text = text.slice(0, maxLength);

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

    if (
      files.length > maxImages ||
      files.length + selectedFiles.length > maxImages
    ) {
      toast.info(`Please, select up to ${maxImages} images.`);
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
  const warningThreshold = Math.floor(maxLength * 0.95);

  return (
    <div className="flex flex-col">
      <div className="relative min-h-16 p-2">
        {actualLength === 0 && (
          <span className="pointer-events-none absolute top-4 left-4 text-neutral-500 select-none">
            {placeholder}
          </span>
        )}
        <div
          className="max-h-[70vh] min-h-16 overflow-auto p-2 contain-inline-size outline-none"
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
            className={`grow text-sm ${actualLength > warningThreshold ? "text-red-400" : "text-neutral-500"}`}
          >
            Characters: {actualLength}/200
          </span>
        )}

        {allowImages && (
          <>
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
          </>
        )}

        <Button
          className="w-18 rounded-2xl disabled:bg-neutral-950 dark:disabled:bg-neutral-200"
          onClick={handleSubmit}
          disabled={
            (actualLength === 0 && selectedFiles.length === 0) || isSubmitting
          }
        >
          {isSubmitting ? <Spinner /> : submitButtonText}
        </Button>
      </div>
    </div>
  );
}

export default TextEditor;
