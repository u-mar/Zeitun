import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import DeleteAlertDialog from "../../../../_components/DeleteAlertDialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpDown, 
  Eye, 
  Edit, 
  PackageCheck, 
  Calendar, 
  Tag, 
  Layers 
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  no: number;
  name: string;
  category: {
    name: string;
  };
  createdAt: string;
  price: number;
  stockQuantity: number;
  variants: {
    color: string;
    skus: {
      size: string;
      sku: string;
      stockQuantity: number;
    }[];
  }[];
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "no",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center space-x-1 hover:text-primary transition-all"
        >
          <span>#</span>
          <ArrowUpDown className="w-3 h-3" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center">
        {row.index + 1}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex items-center space-x-2">
        <Tag className="w-4 h-4 text-primary" />
        <span>Product</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium max-w-[180px] truncate">
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: "category.name",
    header: ({ column }) => (
      <div className="flex items-center space-x-2">
        <Layers className="w-4 h-4 text-primary" />
        <span>Category</span>
      </div>
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
        {row.original.category.name}
      </Badge>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 hover:text-primary transition-all"
      >
        <span>Price</span>
        <ArrowUpDown className="w-3 h-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-bold text-emerald-600 dark:text-emerald-400">
        ${row.original.price.toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "stockQuantity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center space-x-2 hover:text-primary transition-all"
      >
        <span>Stock</span>
        <ArrowUpDown className="w-3 h-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const stock = row.original.stockQuantity;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className={cn(
                "flex items-center gap-1.5 font-medium",
                stock <= 10 ? "text-red-500" : 
                stock <= 30 ? "text-amber-500" : "text-green-500"
              )}>
                <PackageCheck className="w-4 h-4" />
                <span>{stock}</span>
                <Badge variant="outline" className={cn(
                  "text-xs font-normal ml-1",
                  stock <= 10 ? "bg-red-100 text-red-800" : 
                  stock <= 30 ? "bg-amber-100 text-amber-800" : 
                  "bg-green-100 text-green-800"
                )}>
                  {stock <= 10 ? "Low" : stock <= 30 ? "Medium" : "Good"}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{stock} units in stock</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <div className="flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-primary" />
        <span>Created At</span>
      </div>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {format(date, "PPP")}
          <div className="text-xs opacity-70">{format(date, "p")}</div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original;
      const router = useRouter();

      return (
        <div className="flex items-center space-x-2">
          <Link href={`/dashboard/superAdmin/product/view/${product.id}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 hover:bg-primary/10">
              <Eye className="w-4 h-4" />
              <span>View</span>
            </Button>
          </Link>

          <Link href={`/dashboard/superAdmin/product/edit/${product.id}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-1 bg-amber-50 text-amber-600 border-amber-300 hover:bg-amber-100">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          </Link>
          
          <DeleteAlertDialog id={product.id} type="product" />
        </div>
      );
    },
  },
];
