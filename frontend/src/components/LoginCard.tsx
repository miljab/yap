import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { loginSchema } from "../schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import axios from "@/api/axios";
import useAuth from "@/hooks/useAuth";
import { AxiosError } from "axios";

type LoginFormData = z.infer<typeof loginSchema>;

function LoginCard() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const response = await axios.post("/auth/login", data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const accessToken = response.data.accessToken;
      const user = response.data.user;

      setAuth({ user, accessToken });

      navigate("/home");
    } catch (error) {
      let message = "Login failed. Please try again later.";
      if (error instanceof AxiosError && error.response) {
        message = error.response.data.error || message;
      }
      form.setError("root", { message });
    }
  }

  return (
    <Card className="w-full px-4 py-8">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Log in</CardTitle>
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
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or username</FormLabel>
                  <FormControl>
                    <Input {...field} required />
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
                    <Input {...field} type="password" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="mt-12">
            <Button type="submit" className="ml-auto">
              Log in
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export default LoginCard;
