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
import { StockQuantity } from "@prisma/client";

// Validation schema
const stockSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  variantId: z.string().min(1, "Please select a variant"),
  skuId: z.string().min(1, "Please select an SKU"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

// Types
interface Product {
  id: string;
  name: string;
  variants: Variant[];
}

interface Variant {
  id: string;
  color: string;
  skus: SKU[];
}

interface SKU {
  id: string;
  size: string;
  sku: string;
  stockQuantity: number;
}

const StockQuantityForm = ({
  stockQuantity,
}: {
  stockQuantity?: StockQuantity;
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
    queryFn: () =>
      axios.get<Product[]>(`${API}/admin/product`).then((res) => res.data),
    staleTime: 60 * 1000,
  });

  // Update variants when a product is selected
  useEffect(() => {
    if (watchProductId) {
      const selectedProduct = products?.find((p) => p.id === watchProductId);
      if (selectedProduct) {
        setSelectedVariants(selectedProduct.variants || []);
        setValue("variantId", stockQuantity?.variantId || ""); // Preselect variantId for editing
        setValue("skuId", stockQuantity?.skuId || ""); // Preselect skuId for editing
      }
    }
  }, [watchProductId, products, setValue, stockQuantity]);

  // Update SKUs when a variant is selected
  useEffect(() => {
    if (watchVariantId) {
      const selectedVariant = selectedVariants.find(
        (variant) => variant.id === watchVariantId
      );
      if (selectedVariant) {
        setSelectedSKUs(selectedVariant.skus || []);
        setValue("skuId", stockQuantity?.skuId || ""); // Preselect skuId for editing
      }
    }
  }, [watchVariantId, selectedVariants, setValue, stockQuantity]);

  const onSubmit = async (values: z.infer<typeof stockSchema>) => {
    setLoading(true);
    try {
      if (stockQuantity) {
        // Update stock quantity
        await axios.patch(
          `${API}/admin/product/stock/${stockQuantity.id}`,
          values
        );
        toast.success("Stock updated successfully");
      } else {
        // Add new stock quantity
        await axios.post(`${API}/admin/product/stock`, values);
        toast.success("Stock added successfully");
      }
      router.push("/dashboard/admin/product/stock");
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
          <CardTitle>
            {stockQuantity ? "Update Stock Quantity" : "Add Stock Quantity"}
          </CardTitle>
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
                          value={products
                            ?.filter((product) => product.id === field.value)
                            .map((product) => ({
                              value: product.id,
                              label: product.name,
                            }))[0] || null}
                          options={
                            products?.map((product) => ({
                              value: product.id,
                              label: product.name,
                            })) || []
                          }
                          onChange={(option) => {
                            field.onChange(option?.value || "");
                          }}
                          placeholder="Select a product"
                          isLoading={loadingProducts}
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
                          value={selectedVariants
                            ?.filter((variant) => variant.id === field.value)
                            .map((variant) => ({
                              value: variant.id,
                              label: variant.color,
                            }))[0] || null}
                          options={
                            selectedVariants.map((variant) => ({
                              value: variant.id,
                              label: variant.color,
                            })) || []
                          }
                          onChange={(option) => {
                            field.onChange(option?.value || "");
                          }}
                          placeholder="Select a variant"
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
                          value={selectedSKUs
                            ?.filter((sku) => sku.id === field.value)
                            .map((sku) => ({
                              value: sku.id,
                              label: `${sku.size} (${sku.stockQuantity} in stock)`,
                            }))[0] || null}
                          options={
                            selectedSKUs.map((sku) => ({
                              value: sku.id,
                              label: `${sku.size} (${sku.stockQuantity} in stock)`,
                            })) || []
                          }
                          onChange={(option) => {
                            field.onChange(option?.value || "");
                          }}
                          placeholder="Select an SKU"
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
                      <Input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}
                        placeholder="Enter quantity" {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  "Submit"
                )}
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
