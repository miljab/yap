import { signupSchema } from "@/schemas/signupSchema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "@/api/axios";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router";
import { useState } from "react";

type SignupFormData = z.infer<typeof signupSchema>;

function SignupCard() {
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const navigate = useNavigate();
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignupFormData) {
    try {
      await axios.post("/auth/signup", data);

      navigate("/");
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const responseData = error.response.data;
        if (responseData.errors && Array.isArray(responseData.errors)) {
          responseData.errors.forEach(
            (err: { path: keyof SignupFormData | "root"; error: string }) => {
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
        <CardTitle className="text-center text-2xl">Sign up</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="flex flex-col gap-8">
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
                    <Input type="email" {...field} />
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
                    <div
                      className={`text-muted-foreground text-sm transition-opacity duration-300 ${
                        isUsernameFocused ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {usernameLength}/32
                    </div>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      onFocus={() => setIsUsernameFocused(true)}
                      onBlur={() => {
                        field.onBlur();
                        setIsUsernameFocused(false);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="mt-12">
            <Button type="submit" className="ml-auto">
              Create account
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default SignupCard;
