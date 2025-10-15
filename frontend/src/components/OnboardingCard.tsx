import { usernameSchema } from "@/schemas/usernameSchema";
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
} from "./ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "@/api/axios";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { isAxiosError } from "axios";

type UsernameFormData = z.infer<typeof usernameSchema>;

function OnboardingCard() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const form = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
    mode: "onTouched",
    defaultValues: {
      username: "",
    },
  });

  async function onSubmit(data: UsernameFormData) {
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
            (err: { path: keyof UsernameFormData | "root"; error: string }) => {
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
          <CardContent>
            {form.formState.errors.root && (
              <div className="text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="mt-8 flex justify-between gap-4">
            <Button className="grow" type="button" variant="destructive">
              Cancel
            </Button>
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
