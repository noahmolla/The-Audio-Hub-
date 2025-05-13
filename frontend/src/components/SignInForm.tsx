"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { login as apiLogin, type LoginData } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

// Updated formSchema with validation for single quotes
const formSchema = z.object({
    username: z
        .string()
        .min(2, { message: "Username must be at least 2 characters." })
        .regex(/^[^']*$/, { message: "Username cannot contain single quotes (')" }), // Disallow single quotes
    password: z.string().min(3, { message: "Password must be at least 3 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SignInForm() {
    const router = useRouter();
    const { login: contextLogin } = useAuth(); // Pull in the login function from AuthContext

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { username: "", password: "" },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            // Call the API to log in
            const { access_token } = await apiLogin(values as LoginData);

            // Save the token in the context
            contextLogin(access_token);

            // Show a success message
            toast.success("Welcome back!");

            // Redirect to the dashboard
            router.push("/file_path_view_all");
        } catch (err: any) {
            // Show an error message
            toast.error(err.message || "Login failed");
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-3">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="Username" {...field} />
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
                                <Input type="password" placeholder="Password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button variant="outline" type="submit" className="mt-5">
                    Sign In
                </Button>
            </form>
        </Form>
    );
}