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
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await axios.get(`${API}/admin/account`);
        setAccounts(data);
        // Automatically detect and set the default account
        const defaultAccount = data.find((account: Accounts) => account.default);
        if (defaultAccount) {
          setDefaultAccountId(defaultAccount.id);
        }
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
          <Select
            value={field.value || defaultAccountId} // Use defaultAccountId if field.value is empty
            onValueChange={(value) => field.onChange(value)} // Handle value change
          >
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
