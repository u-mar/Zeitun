"use client";

import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/lib/config";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, Type } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface SKU {
  id: string;
  size: string;
  sku: string;
  stockQuantity: number;
  variantId: string;
  variant: Variant;
}

interface Variant {
  id: string;
  color: string;
  skus: SKU[];
  productId: string;
}

interface ProductWithVariants extends Product {
  variants: Variant[];
}

interface OrderItem {
  id: string;
  productId: string | null;
  skuId: string;
  price: number;
  quantity: number;
  product: ProductWithVariants | null;
  sku: SKU;
}

interface Account {
  id: string;
  account: string;
  balance: number;
  cashBalance: number;
  default: boolean;
}

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

const AddOrderForm: React.FC<{ order?: Order }> = ({ order }) => {
  const [selectedVariants, setSelectedVariants] = useState<{ [key: number]: Variant[] }>({});
  const [selectedSkus, setSelectedSkus] = useState<{ [key: number]: SKU[] }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [totalAmount, setTotalAmount] = useState<string>("0.00");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true);
  const [defaultAccount, setDefaultAccount] = useState<Account | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { register, control, handleSubmit, watch, setValue, formState: { isValid } } = useForm<FormValues>({
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
        type: "both",
        accountId: order.accountId || "",
        cashAmount: order.cashAmount || undefined,
        digitalAmount: order.digitalAmount || undefined,
      }
      : {
        products: [{ productId: "", name: "", price: 0, quantity: 1 }],
        status: "paid",
        type: "both",
        accountId: "",
      },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({ control, name: "products" });
  const watchProducts = watch("products");
  const watchCashAmount = watch("cashAmount");
  const watchDigitalAmount = watch("digitalAmount");

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ["AdminSellProduct"],
    queryFn: () => axios.get<ProductWithVariants[]>(`${API}/admin/product`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  // Fetch accounts and set default account if available
  const { data: accounts } = useQuery({
    queryKey: ["AdminSellAccounts"],
    queryFn: () => axios.get<Account[]>(`${API}/admin/account`).then((res) => res.data),
    staleTime: 60 * 1000,
    retry: 3,
  });

  useEffect(() => {
    if (accounts) {
      const defaultAcc = accounts.find(account => account.default);
      if (defaultAcc) {
        setDefaultAccount(defaultAcc);
        setValue("accountId", defaultAcc.id);
      }
    }
  }, [accounts, setValue]);

  // Set selected variants and SKUs if in edit mode
  useEffect(() => {
    if (order && products) {
      order.items.forEach((item, index) => {
        const product = item.product;
        if (product) {
          setSelectedVariants((prev) => ({ ...prev, [index]: product.variants }));
          const variant = product.variants.find((v) => v.id === item.sku.variantId);
          if (variant) {
            setSelectedSkus((prev) => ({ ...prev, [index]: variant.skus }));
          }
        }
      });
    }
  }, [order, products]);

  const handleProductSelect = (index: number, productId: string | null) => {
    const selectedProduct = products?.find((p) => p.id === productId);
    if (selectedProduct) {
      setSelectedVariants((prev) => ({ ...prev, [index]: selectedProduct.variants }));
      setSelectedSkus((prev) => ({ ...prev, [index]: [] }));
      setValue(`products.${index}.productId`, productId);
      setValue(`products.${index}.variantId`, "");
      setValue(`products.${index}.skuId`, "");
      setValue(`products.${index}.price`, selectedProduct.price);
    }
  };

  const handleVariantSelect = (index: number, variantId: string) => {
    const selectedProduct = products?.find((p) => p.id === watchProducts[index].productId);
    const selectedVariant = selectedProduct?.variants.find((variant) => variant.id === variantId);
    if (selectedVariant) {
      setSelectedSkus((prev) => ({ ...prev, [index]: selectedVariant.skus }));
      setValue(`products.${index}.variantId`, variantId);
      setValue(`products.${index}.skuId`, "");
    }
  };

  const handleSkuSelect = (index: number, skuId: string) => {
    setValue(`products.${index}.skuId`, skuId);
    const selectedSku = selectedSkus[index]?.find((sku) => sku.id === skuId);
    setValue(`products.${index}.stock`, selectedSku?.stockQuantity || 0);
  };

  useEffect(() => {
    const subscription = watch((values) => {
      const total = (values.products ?? []).reduce(
        (acc, item) =>
          acc + Number(item?.price || 0) * Number(item?.quantity || 0),
        0
      ).toFixed(2);
      setTotalAmount(total);
    });

    // Clean up the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, [watch, setTotalAmount]);

  // Validate form fields and conditions for submit button
  useEffect(() => {
    const isProductsValid = watchProducts.every((item) => item.productId && item.variantId && item.skuId && item.price > 0 && item.quantity > 0);
    const isCashDigitalValid = (Number(watchCashAmount) + Number(watchDigitalAmount)) === Number(totalAmount);
    const isFormValid = isProductsValid && isCashDigitalValid && isValid;

    setIsSubmitDisabled(!isFormValid);
  }, [watchProducts, watchCashAmount, watchDigitalAmount, totalAmount, isValid]);

  const handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
    event.currentTarget.blur();
  };
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
    setLoading(true);
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
      type: "both",
      accountId: data.accountId,
      cashAmount: Number(data.cashAmount),
      digitalAmount: Number(data.digitalAmount),
    };

    try {
      if (order) {
        await axios.patch(`${API}/admin/sell/${order.id}`, orderData);
        queryClient.invalidateQueries({ queryKey: ["order"] });
        toast.success("Order updated successfully!");
      } else {
        await axios.post(`${API}/admin/sell`, orderData);
        queryClient.invalidateQueries({ queryKey: ["order"] });
        toast.success("Order created successfully!");
      }
      setLoading(false);
      router.push("/dashboard/admin/sales");
    } catch (error) {
      setLoading(false);
      toast.error("Error saving order. Please try again.");
    }
  };

  return (
    <div className="container mx-auto my-10 p-6 bg-white rounded-md shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <th className="py-3 px-6 text-center">Remove</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b border-gray-200">
                  <td className="p-2 border">
                    <select
                      className="w-full border border-gray-300 rounded-md p-1"
                      value={watchProducts[index]?.productId || ""}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                    >
                      <option value="">Select Product</option>
                      {products?.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2 border">
                    <select
                      className="w-full border border-gray-300 rounded-md p-1"
                      value={watchProducts[index]?.variantId || ""}
                      onChange={(e) => handleVariantSelect(index, e.target.value)}
                    >
                      <option value="">Select Variant</option>
                      {selectedVariants[index]?.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.color}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2 border">
                    <select
                      className="w-full border border-gray-300 rounded-md p-1"
                      value={watchProducts[index]?.skuId || ""}
                      onChange={(e) => handleSkuSelect(index, e.target.value)}
                    >
                      <option value="">Select SKU</option>
                      {selectedSkus[index]?.map((sku) => (
                        <option key={sku.id} value={sku.id}>
                          {sku.size} ({sku.stockQuantity} in stock)
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2 border">
                    <input
                      type="number"
                      onWheel={handleWheel}
                      className="w-full border p-1 rounded-md"
                      placeholder={`Price: ${watchProducts[index]?.price || ''}`}
                      {...register(`products.${index}.price`)}
                      onFocus={(e) => (e.target.value = "")}
                    />
                  </td>

                  <td className="p-2 border">
                    <input
                      type="number"
                      onWheel={handleWheel}
                      className="w-full border p-1 rounded-md"
                      {...register(`products.${index}.quantity`)}
                    />
                  </td>

                  <td className="p-2 border">
                    {(Number(watchProducts[index]?.price || 0) * Number(watchProducts[index]?.quantity || 0)).toFixed(2)}
                  </td>

                  <td className="p-2 border text-center">
                    <button type="button" onClick={() => remove(index)} className="text-red-500">
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button type="button" onClick={() => append({ productId: "", name: "", price: 0, quantity: 1 })} className="mt-4">
            Add Product
          </Button>
        </div>

        {/* Account Selection */}
        {defaultAccount && (
          <div className="space-y-2 mt-4">
            <label>Select Account</label>
            <select className="border p-2 rounded-md w-full" value={defaultAccount.id} {...register("accountId")} disabled>
              <option value={defaultAccount.id}>
                {defaultAccount.account} (Default)
              </option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label>Cash Amount</label>
            <input
              type="number"
              onWheel={handleWheel}
              className="w-full border p-2 rounded-md"
              {...register("cashAmount")}
              placeholder="Enter cash amount"
            />
          </div>
          <div>
            <label>Digital Amount</label>
            <input
              type="number"
              onWheel={handleWheel}
              className="w-full border p-2 rounded-md"
              {...register("digitalAmount")}
              placeholder="Enter digital amount"
            />
          </div>
        </div>

        <div className="text-right mt-4">
          <p className="text-lg font-semibold">Subtotal: {totalAmount}</p>
        </div>

        <Button type="submit" disabled={loading || isSubmitDisabled} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md mt-6">
          {loading ? <Loader2 className="animate-spin h-5 w-5 mx-2" /> : order ? "Update Order" : "Create Order"}
        </Button>
      </form>
      <Toaster />
    </div>
  );
};

export default AddOrderForm;
