"use client";
import { z } from "zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { API } from "@/lib/config";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { User } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["employee", "admin"]),
  phoneNumber: z.string().min(10, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const UserRegisterForm = ({ user }: { user?: User }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("12345678");
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: (user?.role as "employee" | "admin") || "employee",
      phoneNumber: user?.phoneNumber || "",
      password: "12345678",
    },
  });

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    setLoading(true);
    try {

      const response = user
        ? await axios.patch(`${API}/admin/user/${user.id}`, values)
        : await axios.post(`${API}/admin/user`, values);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Successfully Registered User");
      router.push("/dashboard/admin/user");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const newPassword = Math.random().toString(36).slice(-8); // Generate a simple random password
    setPassword(newPassword);
    form.setValue("password", newPassword); // Update the form value with the new password
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto my-10 p-4 shadow-lg rounded-lg">
        <CardHeader className="mb-6">
          <CardTitle className="text-2xl font-bold">Register New User</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Register a new user with role and default password settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter user's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter user's email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring"
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter user's phone number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="flex items-center space-x-2">
                      <FormControl className="flex-1">
                        <Input
                          type="text"
                          placeholder="Password"
                          {...field}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            field.onChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={generatePassword}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Generate Password
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <SubmitButtonWithContent
                loading={form.formState.isSubmitting || loading}
                isUpdate={false}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
};

export default UserRegisterForm;

// Submit Button Component
export const SubmitButtonWithContent = ({
  loading,
  isUpdate,
}: {
  loading: boolean;
  isUpdate: boolean;
}) => {
  if (loading) {
    return (
      <Button className="space-x-2 gap-x-1 bg-gray-400" disabled>
        {isUpdate ? "Updating" : "Registering"} User
        <Loader2 className="animate-spin h-5 w-5 text-white mx-2" />
      </Button>
    );
  }

  return (
    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
      {isUpdate ? "Update User" : "Register User"}
    </Button>
  );
};
