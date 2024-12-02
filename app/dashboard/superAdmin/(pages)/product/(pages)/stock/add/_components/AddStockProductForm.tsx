"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Select from "react-select";
import { API } from "@/lib/config";

// Validation schema
const stockSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  variantId: z.string().min(1, "Please select a variant"),
  skuId: z.string().min(1, "Please select a SKU"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  variants: Variant[];
}

interface Variant {
  id: string;
  color: string;
  SKUs: SKU[];
}

interface SKU {
  id: string;
  size: string;
  sku: string;
  stockQuantity: number;
}

// Component
const StockQuantityForm = ({
  stockQuantity,
}: {
  stockQuantity?: {
    productId: string;
    variantId: string;
    skuId: string;
    quantity: number;
  };
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Variant[]>([]);
  const [selectedSKUs, setSelectedSKUs] = useState<SKU[]>([]);

  const form = useForm({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      productId: stockQuantity?.productId || "",
      variantId: stockQuantity?.variantId || "",
      skuId: stockQuantity?.skuId || "",
      quantity: stockQuantity?.quantity || 1,
    },
  });

  const { control, handleSubmit, watch, setValue } = form;

  const watchProductId = watch("productId");
  const watchVariantId = watch("variantId");

  // Fetch products with variants and SKUs included
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => axios.get<Product[]>(`${API}/superAdmin/product`).then((res) => res.data),
    staleTime: 60 * 1000,
  });

  // Debugging logs
  useEffect(() => {
    console.log("Products:", products);
    console.log("Selected Variants:", selectedVariants);
    console.log("Selected SKUs:", selectedSKUs);
  }, [products, selectedVariants, selectedSKUs]);

  // Update variants when a product is selected
  useEffect(() => {
    if (watchProductId) {
      const selectedProduct = products?.find((p) => p.id === watchProductId);
      if (selectedProduct) {
        console.log("Selected Product Variants:", selectedProduct.variants);
        setSelectedVariants(selectedProduct.variants || []);
        setSelectedSKUs([]);
        setValue("variantId", "");
        setValue("skuId", "");
      }
    }
  }, [watchProductId, products, setValue]);

  // Update SKUs when a variant is selected
  useEffect(() => {
    if (watchVariantId) {
      const selectedVariant = selectedVariants.find((variant) => variant.id === watchVariantId);
      if (selectedVariant) {
        console.log("Selected Variant SKUs:", selectedVariant.SKUs);
        setSelectedSKUs(selectedVariant.SKUs || []);
        setValue("skuId", "");
      }
    }
  }, [watchVariantId, selectedVariants, setValue]);

  const onSubmit = async (values: z.infer<typeof stockSchema>) => {
    setLoading(true);
    try {
      if (stockQuantity) {
        // Update stock quantity
        await axios.patch(`${API}/superAdmin/stock/${stockQuantity.skuId}`, values);
        toast.success("Stock updated successfully");
      } else {
        // Add new stock quantity
        await axios.post(`${API}/superAdmin/stock`, values);
        toast.success("Stock added successfully");
      }
      router.push("/dashboard/superAdmin/stock");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-10 p-6 bg-gray-50 rounded-lg shadow-xl">
      <Card>
        <CardHeader>
          <CardTitle>{stockQuantity ? "Update Stock Quantity" : "Add Stock Quantity"}</CardTitle>
          <CardDescription>
            {stockQuantity
              ? "Update the existing stock quantity"
              : "Add a new stock quantity for a product"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Product Selection */}
              <FormField
                control={control}
                name="productId"
                render={() => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Controller
                      name="productId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={
                            products?.map((product) => ({
                              value: product.id,
                              label: product.name,
                            })) || []
                          }
                          onChange={(option: any) => {
                            field.onChange(option?.value || "");
                          }}
                          placeholder="Select a product"
                          isLoading={loadingProducts}
                          styles={{
                            control: (base) => ({ ...base, borderRadius: "0.375rem" }),
                          }}
                        />
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Variant Selection */}
              <FormField
                control={control}
                name="variantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant</FormLabel>
                    <Controller
                      name="variantId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={
                            selectedVariants.map((variant) => ({
                              value: variant.id,
                              label: variant.color,
                            })) || []
                          }
                          onChange={(option: any) => {
                            field.onChange(option?.value || "");
                          }}
                          placeholder="Select a variant"
                          isDisabled={selectedVariants.length === 0}
                          styles={{
                            control: (base) => ({ ...base, borderRadius: "0.375rem" }),
                          }}
                        />
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SKU Selection */}
              <FormField
                control={control}
                name="skuId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <Controller
                      name="skuId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={
                            selectedSKUs.map((sku: SKU) => ({
                              value: sku.id,
                              label: `${sku.size} (${sku.stockQuantity} in stock)`,
                            })) || []
                          }
                          onChange={(option: any) => {
                            field.onChange(option?.value || "");
                          }}
                          placeholder="Select an SKU"
                          isDisabled={selectedSKUs.length === 0}
                          styles={{
                            control: (base) => ({ ...base, borderRadius: "0.375rem" }),
                          }}
                        />
                      )}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity Input */}
              <FormField
                control={control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter quantity" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-blue-600 text-white mt-6">
                {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Submit"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default StockQuantityForm;
