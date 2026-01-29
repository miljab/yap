import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";
import type { Comment } from "@/types/post";
import TextEditor from "../ui/TextEditor";

type CreateCommentProps = {
  postId: string;
  parentId?: string;
  onCommentCreated: (newComment: Comment) => void;
  closeDialog?: () => void;
  autoFocus?: boolean;
};

function CreateComment({
  postId,
  parentId,
  onCommentCreated,
  closeDialog,
  autoFocus,
}: CreateCommentProps) {
  const axiosPrivate = useAxiosPrivate();

  async function handleCreateComment(content: string, files: File[]) {
    const formData = new FormData();
    formData.append("text", content);

    if (files && files.length > 0) {
      files.forEach((file) => formData.append("images", file));
    }

    const apiUrlString = parentId
      ? `/comment/${parentId}/reply`
      : `/post/${postId}/reply`;

    const response = await axiosPrivate.post(apiUrlString, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 201) {
      toast.success("Commented successfully.");
      if (closeDialog) closeDialog();
      onCommentCreated(response.data);
    }
  }

  return (
    <TextEditor
      onSubmit={handleCreateComment}
      placeholder="Post your reply"
      submitButtonText="Reply"
      autoFocus={autoFocus}
    />
  );
}

export default CreateComment;
