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
import { FormItem, FormLabel } from "@/components/ui/form";
import axios from "axios";
import { API } from "@/lib/config";
import { Accounts } from "@prisma/client";

interface AccountIdSelectProps {
  control: Control<any>;
}

const AccountIdSelect = ({ control }: AccountIdSelectProps) => {
  const [accounts, setAccounts] = useState<Accounts[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await axios.get(`${API}/employee/account`);
        setAccounts(data);
      } catch (err) {
        console.error("Error fetching accounts", err);
      }
    };
    fetchAccounts();
  }, []);

  return (
    <Controller
      control={control}
      name="accountId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Choose Account</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.account}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};

export default AccountIdSelect;
