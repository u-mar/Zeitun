"use client";
import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Control, Controller } from 'react-hook-form';
import { FormItem, FormLabel } from '@/components/ui/form';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { API } from '@/lib/config';
import { Category } from '@prisma/client';

interface CategoryIdSelectProps {
    control: Control<any>;
}

const fetchCategories = async () => {
    const { data } = await axios.get<Category[]>(`${API}/superAdmin/category`);
    return data;
};

const CategoryIdSelect = ({ control }: CategoryIdSelectProps) => {
    const { data: categories, isLoading, isError } = useQuery({
        queryKey: ['category'],
        queryFn: fetchCategories,
        staleTime: 60 * 1000, // Cache the categories data for 1 minute
    });

    if (isLoading) {
        return (
            <FormItem>
                <FormLabel>Choose Category</FormLabel>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Loading categories..." />
                    </SelectTrigger>
                </Select>
            </FormItem>
        );
    }
    if (isError) return <p>Failed to load categories.</p>;

    return (
        <Controller
            control={control}
            name='categoryId'
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Choose Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose category" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                categories?.map(category => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />
    );
}

export default CategoryIdSelect;
