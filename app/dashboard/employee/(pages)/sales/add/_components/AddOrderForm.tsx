"use client";

import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API } from "@/lib/config";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, Type } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";

// SKU Interface
export interface SKU {
  id: string;
  size: string;
  sku: string;
  stockQuantity: number;
  variantId: string;
  variant: Variant;
}

// Variant Interface
interface Variant {
  id: string;
  color: string;
  skus: SKU[];
  productId: string;
}

// ProductWithVariants Interface
interface ProductWithVariants extends Product {
  variants: Variant[];
}

// OrderItem Interface
export interface OrderItem {
  id: string;
  productId: string | null;
  skuId: string;
  price: number;
  quantity: number;
  product: ProductWithVariants | null;
  sku: SKU;
}

// Account Interface
interface Account {
  id: string;
  account: string;
  balance: number;
  cashBalance: number;
  default: boolean;
}

// Order Interface
export interface Order {
  id: string;
  status: string;
  type: Type;
  accountId: string;
  items: OrderItem[];
  cashAmount?: number;
  digitalAmount?: number;
}

interface FormValues {
  products: {
    id?: string;
    productId: string | null;
    name: string;
    variantId?: string;
    skuId?: string;
    price: number;
    quantity: number;
    stock?: number;
  }[];
  status: string;
  type: Type;
  accountId: string;
  cashAmount?: number;
  digitalAmount?: number;
}

// Option type for react-select
interface ProductOption {
  value: string;
  label: string;
  product: ProductWithVariants;
}

const AddOrderForm: React.FC<{ order?: Order }> = ({ order }) => {
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: number]: Variant[];
  }>({});
  const [selectedSkus, setSelectedSkus] = useState<{ [key: number]: SKU[] }>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [totalAmount, setTotalAmount] = useState<string>("0.00");
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<FormValues>({
    defaultValues: order
      ? {
          products: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.product?.name || "",
            variantId: item.sku.variantId,
            skuId: item.skuId,
            price: item.price,
            quantity: item.quantity,
            stock: item.sku.stockQuantity,
          })),
          status: order.status,
          type: "both", // Set default type to "both"
          accountId: order.accountId || "",
          cashAmount: order.cashAmount || undefined,
          digitalAmount: order.digitalAmount || undefined,
        }
      : {
          products: [],
          status: "paid",
          type: "both", // Default to "both"
          accountId: "",
        },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const watchProducts = watch("products");
  const watchCashAmount = watch("cashAmount");
  const watchDigitalAmount = watch("digitalAmount");

  // Fetch products using useQuery
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["EmployeeSellProduct"],
    queryFn: () =>
      axios.get<ProductWithVariants[]>(`${API}/employee/product`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  // Fetch accounts using useQuery
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["EmployeeSellAccounts"],
    queryFn: () =>
      axios.get<Account[]>(`${API}/employee/account`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  useEffect(() => {
    const calculateTotal = () => {
      const total = watchProducts.reduce(
        (acc, item) =>
          acc + Number(item.price || 0) * Number(item.quantity || 0),
        0
      ).toFixed(2);
      setTotalAmount(total);
    };

    calculateTotal();
  }, [watchProducts]);

  // Automatically update cash/digital to match total
  useEffect(() => {
    if (watchCashAmount) {
      const remainingDigitalAmount = (Number(totalAmount) - Number(watchCashAmount)).toFixed(2);
      setValue("digitalAmount", Number(remainingDigitalAmount));
    } else if (watchDigitalAmount) {
      const remainingCashAmount = (Number(totalAmount) - Number(watchDigitalAmount)).toFixed(2);
      setValue("cashAmount",Number(remainingCashAmount));
    }
  }, [watchCashAmount, watchDigitalAmount, totalAmount, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const outOfStockItems = data.products.filter(
      (item) => item.quantity > (item.stock || 0)
    );

    if (outOfStockItems.length > 0) {
      outOfStockItems.forEach((item) => {
        toast.error(
          `Not enough stock for ${item.name}. Available: ${item.stock}, Requested: ${item.quantity}`
        );
      });
      return;
    }

    const orderData = {
      items: data.products.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        skuId: item.skuId,
        price: Number(item.price),
        quantity: Number(item.quantity),
      })),
      status: data.status,
      type: "both", // Always set type to "both"
      accountId: data.accountId,
      cashAmount: Number(data.cashAmount), // Ensure number conversion
  digitalAmount: Number(data.digitalAmount), // Ensure number conversion
    };

    setLoading(true);

    try {
      if (order) {
        await axios.patch(`${API}/employee/sell/${order.id}`, orderData);
        queryClient.invalidateQueries({ queryKey: ["order"] });
        toast.success("Order updated successfully!");
      } else {
        await axios.post(`${API}/employee/sell`, orderData);
        queryClient.invalidateQueries({ queryKey: ["order"] });
        toast.success("Order created successfully!");
      }

      setLoading(false);
      router.push("/dashboard/employee/sales");
    } catch (error: any) {
      setLoading(false);
      toast.error("Error saving order. Please try again.");
    }
  };

  return (
    <div className="container mx-auto my-10 p-6 bg-white rounded-md shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Selection */}
        <div className="space-y-2">
          <label className="block text-gray-700 font-semibold">
            Add Product
          </label>
          <Select
            options={products?.map((product) => ({
              value: product.id,
              label: `${product.name} (${product.stockQuantity} Pcs)`,
              product,
            }))}
            onChange={(selectedOption) => {
              if (selectedOption) {
                const product = selectedOption.product;
                const productIndex = fields.length;

                append({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  stock: product.stockQuantity,
                });

                setSelectedVariants((prev) => ({
                  ...prev,
                  [productIndex]: product.variants,
                }));
              }
            }}
            placeholder="Select a product..."
            isClearable
          />
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Product</th>
                <th className="py-3 px-6 text-left">Variant</th>
                <th className="py-3 px-6 text-left">SKU</th>
                <th className="py-3 px-6 text-left">Price</th>
                <th className="py-3 px-6 text-left">Quantity</th>
                <th className="py-3 px-6 text-left">Total</th>
                <th className="py-3 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const selectedProduct = field.productId
                  ? (products ?? []).find((p) => p.id === field.productId)
                  : undefined;
                const selectedVariant = selectedProduct?.variants.find(
                  (v) => v.id === watchProducts[index]?.variantId
                );
                const selectedSKU = selectedVariant?.skus.find(
                  (s) => s.id === watchProducts[index]?.skuId
                );

                return (
                  <tr
                    key={field.id}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    {/* Product Name */}
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {field.name}
                        <br />
                        <span className="text-xs text-gray-500">
                          In stock: {watchProducts[index]?.stock ?? "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Variant */}
                    <td className="py-3 px-6 text-left">
                      <select
                        {...register(`products.${index}.variantId` as const)}
                        className="border border-gray-300 p-2 rounded-md w-full"
                        onChange={(e) =>
                          setSelectedSkus((prev) => ({
                            ...prev,
                            [index]: selectedProduct?.variants.find(
                              (v) => v.id === e.target.value
                            )?.skus ?? [],
                          }))
                        }
                        value={watchProducts[index]?.variantId || ""}
                      >
                        <option value="">Select Variant</option>
                        {selectedVariants[index]?.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.color}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* SKU */}
                    <td className="py-3 px-6 text-left">
                      <select
                        {...register(`products.${index}.skuId` as const)}
                        className="border border-gray-300 p-2 rounded-md w-full"
                        value={watchProducts[index]?.skuId || ""}
                      >
                        <option value="">Select SKU</option>
                        {selectedSkus[index]?.map((sku) => (
                          <option key={sku.id} value={sku.id}>
                            {sku.size} ({sku.stockQuantity} Pcs)
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-6 text-left">
                      <input
                        {...register(`products.${index}.price` as const)}
                        type="number"
                        className="border border-gray-300 p-2 rounded-md w-full"
                        value={watchProducts[index]?.price || ""}
                        onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
                      />
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-6 text-left">
                      <input
                        {...register(`products.${index}.quantity` as const)}
                        type="number"
                        className="border border-gray-300 p-2 rounded-md w-full"
                        value={watchProducts[index]?.quantity || ""}
                        onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
                      />
                    </td>

                    {/* Total */}
                    <td className="py-3 px-6 text-left">
                      <div className="text-sm text-gray-900">
                        {(
                          Number(watchProducts[index]?.price || 0) *
                          Number(watchProducts[index]?.quantity || 0)
                        ).toFixed(2)}{" "}
                      </div>
                    </td>

                    {/* Remove Button */}
                    <td className="py-3 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Account Selection */}
        <div className="space-y-2">
          <label className="block text-gray-700 font-semibold">
            Select Account
          </label>
          <select
            {...register("accountId")}
            className="border border-gray-300 p-2 rounded-md w-full"
          >
            {accounts &&
              accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.account} {account.default ? "(Default)" : ""}
                </option>
              ))}
          </select>
        </div>

        {/* Conditional Inputs for Cash and Digital Amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold">
              Cash Amount
            </label>
            <input
              type="number"
              {...register("cashAmount", {
                required: true,
              })}
              className="border border-gray-300 p-2 rounded-md w-full"
              placeholder="Enter cash amount"
              onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold">
              Digital Amount
            </label>
            <input
              type="number"
              {...register("digitalAmount", {
                required: true,
              })}
              className="border border-gray-300 p-2 rounded-md w-full"
              placeholder="Enter digital amount"
              onWheel={(e) => e.currentTarget.blur()} // Disable mouse wheel change
            />
          </div>
        </div>

        {/* Total Calculation */}
        <div className="text-right">
          <p className="text-lg font-semibold">Subtotal: {totalAmount}</p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md"
          disabled={loading || !isValid}
        >
          {loading ? (
            <>
              {order ? "Updating Order..." : "Creating Order..."}
              <Loader2 className="animate-spin h-5 w-5 text-white mx-2" />
            </>
          ) : order ? (
            "Update Order"
          ) : (
            "Create Order"
          )}
        </Button>
      </form>
      <Toaster />
    </div>
  );
};

export default AddOrderForm;
