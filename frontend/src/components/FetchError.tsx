import { Button } from "./ui/button";
import type { FetchErrorState } from "@/lib/fetchError";

type FetchErrorProps = {
  error: FetchErrorState;
  onRetry: () => void;
};

function FetchError({ error, onRetry }: FetchErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4">
      <p className="text-sm text-neutral-500">{error.message}</p>
      {error.type !== "not_found" && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export default FetchError;
