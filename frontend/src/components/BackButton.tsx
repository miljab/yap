import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

function BackButton() {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 flex h-12 items-center justify-start border-b">
      <button
        className="h-full cursor-pointer p-2 px-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft />
      </button>
      <span className="font-[Roboto_mono] text-2xl">Post</span>
    </div>
  );
}

export default BackButton;
