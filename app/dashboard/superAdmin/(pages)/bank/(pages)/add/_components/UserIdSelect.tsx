"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control, Controller } from "react-hook-form";
import { FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import axios from "axios";
import { API } from "@/lib/config";
import { User } from "@prisma/client";

interface BankUserIdSelectProps {
  control: Control<any>;
}

const BankUserIdSelect = ({ control }: BankUserIdSelectProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state to wait for accounts

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${API}/superAdmin/user`);
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <FormItem>
        <FormLabel>Choose Bank User</FormLabel>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Loading users..." />
          </SelectTrigger>
        </Select>
      </FormItem>
    );
  
  }
  return (
    <Controller
      control={control}
      name="userId" // This must match the form schema and form field name
      render={({ field }) => (
        <FormItem>
          <FormLabel>Choose Bank User <span className="text-red-700">(Optional)</span></FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose Bank User" />
            </SelectTrigger>
            <SelectContent>
              {users.map((BankUser) => (
                <SelectItem key={BankUser.id} value={BankUser.id}>
                  {BankUser.name}
                </SelectItem>
              ))}
            </SelectContent>
            
          </Select>
          <FormDescription> 
            This is an optional field. If you want to assign this bank to a user, select the user from the list.
          </FormDescription>
        </FormItem>
      )}
    />
  );
};

export default BankUserIdSelect;
