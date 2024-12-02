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
import { Product } from '@prisma/client';

interface ProductIdSelectProps {
    control: Control<any>;
}

const fetchProducts = async () => {
    const { data } = await axios.get<Product[]>(`${API}/superAdmin/product`);
    return data;
};

const ProductIdSelect = ({ control }: ProductIdSelectProps) => {
    const { data: products, isLoading, isError } = useQuery({
        queryKey: ['product'],
        queryFn: fetchProducts,
        staleTime: 60 * 1000, // Cache the products data for 1 minute
    });

    if (isLoading) {
        return (
            <FormItem>
                <FormLabel>Choose Product</FormLabel>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Loading products..." />
                    </SelectTrigger>
                </Select>
            </FormItem>
        );
    }
    if (isError) return <p>Failed to load products.</p>;

    return (
        <Controller
            control={control}
            name='productId'
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Choose Product</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose product" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                products?.map(product => (
                                    <SelectItem key={product.id} value={product.id}>
                                        {product.name}
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

export default ProductIdSelect;
