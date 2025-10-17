import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import axios from "@/api/axios";

function CancelOnboardingDialog() {
  const navigate = useNavigate();

  const handleCancel = async () => {
    try {
      await axios.delete("/auth/onboarding/cancel", {
        withCredentials: true,
      });

      navigate("/");
    } catch (error) {
      console.error(error);
      navigate("/error", {
        state: { error: "Failed to cancel onboarding." },
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="grow">
          Cancel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Do you want to cancel onboarding?</DialogTitle>
          <DialogDescription>
            This will reset your signing up process and you will have to start
            over.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button onClick={handleCancel}>Confirm</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CancelOnboardingDialog;
