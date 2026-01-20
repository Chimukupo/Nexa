"use client";

import React from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Checkbox } from "@workspace/ui/components/checkbox";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signInWithEmail } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await signInWithEmail(data.email, data.password);
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);

      const firebaseCode =
        typeof error === "object" && error !== null && "code" in error
          ? (error as { code?: string }).code
          : undefined;

      if (
        firebaseCode === "auth/invalid-credential" ||
        firebaseCode === "auth/user-not-found" ||
        firebaseCode === "auth/wrong-password"
      ) {
        setError("root", {
          message: "Invalid email or password",
        });
      } else {
        setError("root", {
          message: "An error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome!
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          We Are Happy To See You Again
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex rounded-full bg-gray-100 dark:bg-gray-800 p-1">
        <Link
          href="/login"
          className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-all"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="flex-1 rounded-full bg-transparent px-4 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
        >
          Sign Up
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {errors.root.message}
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-full border-0 bg-gray-50 dark:bg-gray-800 py-4 pl-12 pr-4 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full rounded-full border-0 bg-gray-50 dark:bg-gray-800 py-4 pl-12 pr-12 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Checkbox
                  id="rememberMe"
                  checked={!!field.value}
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                    field.onChange(!!checked)
                  }
                />
                <span>Remember me</span>
              </label>
            )}
          />
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:text-blue-600 dark:hover:text-blue-400"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>

      {/* Divider */}
      {/* <div className="relative my-8">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-sm text-gray-500">OR</span>
        </div>
      </div> */}
    </div>
  );
}
