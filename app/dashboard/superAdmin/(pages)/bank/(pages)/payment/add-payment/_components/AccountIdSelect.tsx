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
  initialAccountId?: string;       // Add initialAccountId prop
}

const AccountIdSelect = ({ control, setValue, initialAccountId }: AccountIdSelectProps) => {
  const [accounts, setAccounts] = useState<Accounts[]>([]);
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(initialAccountId || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await axios.get(`${API}/superAdmin/account`);
        setAccounts(data);

        // Automatically detect and set the default account if no initialAccountId
        if (!initialAccountId) {
          const defaultAccount = data.find((account: Accounts) => account.default);
          if (defaultAccount) {
            setDefaultAccountId(defaultAccount.id);
            setValue("accountId", defaultAccount.id);
          }
        } else {
          setValue("accountId", initialAccountId); // Set initial account ID for editing
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching accounts", err);
      }
    };
    fetchAccounts();
  }, [initialAccountId, setValue]);  // Add initialAccountId to dependencies

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
            value={field.value || defaultAccountId} // Use initialAccountId or detected default
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
