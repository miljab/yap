import { toast } from "sonner";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import TextEditor from "../ui/TextEditor";
import type { Post } from "@/types/post";

type CreatePostProps = {
  onPostCreate?: (post: Post) => void;
};

function CreatePost({ onPostCreate }: CreatePostProps) {
  const axiosPrivate = useAxiosPrivate();

  async function handleCreatePost(content: string, files?: File[]) {
    try {
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
        if (onPostCreate) onPostCreate(response.data);
      }
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
      throw error;
    }
  }

  return (
    <div className="border-b">
      <TextEditor
        onSubmit={handleCreatePost}
        placeholder="What's on your mind?"
        submitButtonText="Post"
      />
    </div>
  );
}

export default CreatePost;
