import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control, Controller, UseFormSetValue } from "react-hook-form";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import axios from "axios";
import { API } from "@/lib/config";
import { Accounts } from "@prisma/client";

// Props for AccountSelect component
interface AccountSelectProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  getValues: () => any;
  accountType: "fromAccountId" | "toAccountId";
}

const AccountSelect = ({ control, setValue, getValues, accountType }: AccountSelectProps) => {
  const [accounts, setAccounts] = useState<Accounts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await axios.get(`${API}/admin/account`);
        setAccounts(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching accounts", err);
      }
    };
    fetchAccounts();
  }, []);

  const values = getValues();
  const selectedAccount = accountType === "fromAccountId" ? values.toAccountId : values.fromAccountId;

  if (loading) {
    return (
      <FormItem>
        <FormLabel>{accountType === "fromAccountId" ? "From Account" : "To Account"}</FormLabel>
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
      name={accountType}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{accountType === "fromAccountId" ? "From Account" : "To Account"}</FormLabel>
          <Select
            value={field.value}
            onValueChange={(value) => field.onChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts
                .filter((account) => account.id !== selectedAccount) // Exclude selected opposite account
                .map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AccountSelect;
