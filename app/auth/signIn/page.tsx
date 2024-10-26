"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Head from "next/head";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Link from "next/link";

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    if (loading) {
      return;
    }

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    try {
      setLoading(true);

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result && result.error) {
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password");
        } else if (result.error === "Please login from your assigned device") {
          setError("Please login from your assigned device");
        } else {
          setError(result.error as string);
        }
      } else {
        const callbackUrl =
          searchParams.get("callbackUrl") || "/dashboard/admin";
        setIsRedirecting(true);
        router.push(callbackUrl);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("An unexpected error occurred during authentication.");
    } finally {
      // If not redirecting, set loading to false again
      if (!isRedirecting) {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900">E-Inventory</h2>
          <p className="text-sm text-gray-500">Online inventory management system</p>
          <form onSubmit={handleSignIn} className="w-full space-y-4">
            {error && (
              <div className="p-2 text-red-700 bg-red-200 rounded-lg">
                {error}
              </div>
            )}
            {emailError && (
              <div className="p-2 text-red-700 bg-red-200 rounded-lg">
                {emailError}
              </div>
            )}
            {passwordError && (
              <div className="p-2 text-red-700 bg-red-200 rounded-lg">
                {passwordError}
              </div>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 focus:outline-none"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="keepLoggedIn" className="mr-2" />
              <label htmlFor="keepLoggedIn" className="text-gray-600">
                Keep me logged in
              </label>
            </div>
            <button
              type="submit"
              className="w-full px-3 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  Logging in... <Loader2 className="animate-spin" />
                </div>
              ) : (
                "Log in"
              )}
            </button>
            <div className="flex justify-between">
              <div className="text-sm text-gray-600">
                <a href="#" className="hover:underline">
                  Forgot Password?
                </a>
              </div>
              
            </div>
          </form>
          <div className="flex items-center justify-center mt-4">
           
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
