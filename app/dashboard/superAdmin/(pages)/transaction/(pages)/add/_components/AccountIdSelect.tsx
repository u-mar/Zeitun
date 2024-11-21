"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { FormItem, FormLabel } from "@/components/ui/form";
import axios from "axios";
import { API } from "@/lib/config";
import { Accounts } from "@prisma/client";

interface AccountIdSelectProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;  // Ensure setValue is available
}

const AccountIdSelect = ({ control, setValue }: AccountIdSelectProps) => {
  const [accounts, setAccounts] = useState<Accounts[]>([]);
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await axios.get(`${API}/superAdmin/account`);
        setAccounts(data);

        // Automatically detect and set the default account
        const defaultAccount = data.find((account: Accounts) => account.default);
        if (defaultAccount) {
          setDefaultAccountId(defaultAccount.id);
          // Update the form state with the default accountId
          setValue("accountId", defaultAccount.id);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching accounts", err);
      }
    };
    fetchAccounts();
  }, [setValue]);  // Add setValue to dependencies

  if (loading) {
    return (
      <FormItem>
        <FormLabel>Choose Account</FormLabel>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Loading accounts..." />
          </SelectTrigger>
        </Select>
      </FormItem>
    );
  }

  return (
    <Controller
      control={control}
      name="accountId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Choose Account</FormLabel>
          <Select
            value={field.value || defaultAccountId} // Use defaultAccountId if no value is selected yet
            onValueChange={(value) => field.onChange(value)} // Update form state on change
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.account} {account.default ? "(Default)" : ""}
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
