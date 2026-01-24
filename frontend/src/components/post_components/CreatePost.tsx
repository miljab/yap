import { toast } from "sonner";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import TextEditor from "../ui/TextEditor";

function CreatePost() {
  const axiosPrivate = useAxiosPrivate();

  async function handleCreatePost(content: string, files: File[]) {
    const formData = new FormData();
    formData.append("text", content);

    if (files && files.length > 0) {
      files.forEach((file) => formData.append("images", file));
    }

    const response = await axiosPrivate.post("/post/new", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 201) {
      toast.success("Post created successfully.");
    }
  }

  return (
    <div className="m-4">
      <TextEditor
        onSubmit={handleCreatePost}
        placeholder="What's on your mind?"
        submitButtonText="Post"
      />
    </div>
  );
}

export default CreatePost;
