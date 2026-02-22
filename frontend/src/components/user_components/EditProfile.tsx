import { useState, useRef } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Label } from "../ui/label";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import UserAvatar from "./UserAvatar";
import type { User } from "@/types/user";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

const MAX_FILE_SIZE = 5242880; // 5MB

type EditProfileProps = {
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
};

function EditProfile({ user, onProfileUpdate }: EditProfileProps) {
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const axiosPrivate = useAxiosPrivate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.warning("Max file size is 5MB.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("bio", bio.trim());
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await axiosPrivate.put("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onProfileUpdate(response.data);
      setOpen(false);
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setBio(user.bio ?? "");
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Edit profile</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit your profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <UserAvatar
              avatarUrl={avatarPreview ?? user.avatar}
              username={user.username}
              className="h-24 w-24"
              redirect={false}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Change avatar
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={160}
              rows={3}
              className="border-input bg-background focus-visible:ring-ring/50 focus-visible:border-ring w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
            />
            <span className="text-muted-foreground text-right text-xs">
              {bio.length}/160
            </span>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex gap-1">
                Saving...
                <Spinner />
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditProfile;
