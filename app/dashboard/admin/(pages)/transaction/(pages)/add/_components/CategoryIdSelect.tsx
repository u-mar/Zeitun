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
import { TransactionCategory } from "@prisma/client";

interface TransactionCategoryIdSelectProps {
  control: Control<any>;
}

const TransactionCategoryIdSelect = ({ control }: TransactionCategoryIdSelectProps) => {
  const [categories, setCategories] = useState<TransactionCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API}/admin/transaction/category`);
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Controller
      control={control}
      name="categoryId" // This must match the form schema and form field name
      render={({ field }) => (
        <FormItem>
          <FormLabel>Choose TransactionCategory</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose Transaction Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((TransactionCategory) => (
                <SelectItem key={TransactionCategory.id} value={TransactionCategory.id}>
                  {TransactionCategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};

export default TransactionCategoryIdSelect;
