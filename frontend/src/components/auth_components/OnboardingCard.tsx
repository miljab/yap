import { onboardingSchema } from "@/schemas/onboardingSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "@/api/axios";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { isAxiosError } from "axios";
import type { User } from "@/types/user";
import CancelOnboardingDialog from "./CancelOnboardingDialog";

type OnboardingFormData = z.infer<typeof onboardingSchema>;

type OnboardingUserData = {
  onboardingUser: User;
};

function OnboardingCard({ onboardingUser }: OnboardingUserData) {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: "onTouched",
    defaultValues: {
      email: onboardingUser.email || "",
      username: "",
    },
  });

  async function onSubmit(data: OnboardingFormData) {
    try {
      const response = await axios.post("/auth/onboarding", data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const accessToken = response.data.accessToken;
      const user = response.data.user;

      setAuth({ user, accessToken });
      navigate("/home");
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const responseData = error.response.data;

        if (responseData.errors && Array.isArray(responseData.errors)) {
          responseData.errors.forEach(
            (err: {
              path: keyof OnboardingFormData | "root";
              error: string;
            }) => {
              form.setError(err.path, {
                type: "server",
                message: err.error,
              });
            },
          );
        } else if (responseData.error) {
          form.setError("root", {
            type: "server",
            message: responseData.error,
          });
        } else {
          form.setError("root", {
            type: "unknown",
            message: "An unknown error occurred during signup.",
          });
        }
      } else {
        form.setError("root", {
          type: "unknown",
          message: "An unexpected error occurred.",
        });
      }
    }
  }

  const usernameLength = form.watch("username").length;

  return (
    <Card className="w-full px-4 py-8">
      <CardHeader>
        <CardTitle className="text-lg">Create a username</CardTitle>
        <CardDescription>
          Your username will be visible to other users.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-4">
            {form.formState.errors.root && (
              <div className="text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      required
                      disabled={onboardingUser.email ? true : false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Username</FormLabel>
                    <div className="text-muted-foreground text-sm">
                      {usernameLength}/32
                    </div>
                  </div>
                  <FormControl>
                    <Input {...field} required minLength={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="mt-8 flex justify-between gap-4">
            <CancelOnboardingDialog />
            <Button type="submit" className="grow">
              Confirm
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default OnboardingCard;
