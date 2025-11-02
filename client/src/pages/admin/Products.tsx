// Products Page - Admin App product management
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatRupiah } from "@/utils/money";
import { queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  stock: z.coerce.number().min(0, "Stock must be zero or more"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const blankProduct: ProductFormValues = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  category: "",
  imageUrl: "",
};

export default function Products() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const {
    register: formRegister,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: blankProduct,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => api.getProducts(),
  });

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingProduct(null);
      reset(blankProduct);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload: Omit<Product, "id"> = {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        price: values.price,
        stock: values.stock,
        category: values.category.trim() || null,
        imageUrl: values.imageUrl?.trim() || null,
      };

      if (editingProduct) {
        return api.updateProduct(editingProduct.id, payload);
      }

      return api.createProduct(payload);
    },
    onSuccess: (product) => {
      const action = editingProduct ? "updated" : "created";
      toast({
        title: `Product ${action}`,
        description: `${product.name} successfully ${action}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      handleDialogOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Product deleted" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeleteTarget(null);
    },
  });

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      (product.category || "").toLowerCase().includes(query)
    );
  });

  const isEditing = Boolean(editingProduct);

  const handleCreate = () => {
    setEditingProduct(null);
    reset(blankProduct);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      category: product.category || "",
      imageUrl: product.imageUrl || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  };

  const onSubmit = (values: ProductFormValues) => {
    saveMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Products</h1>
          <Button className="gap-2 rounded-xl" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-12 rounded-xl"
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="h-14 w-full animate-pulse rounded-xl bg-muted/60"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                No products found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatRupiah(product.price)}
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{product.category || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => setDeleteTarget(product)}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Product" : "New Product"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update product details for the catalog."
                : "Fill in the details for the new product."}
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            data-testid="form-product"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">
                Product Name
              </label>
              <Input
                id="name"
                placeholder="Product Name"
                className="h-12 rounded-xl"
                {...formRegister("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Short product description"
                className="min-h-[100px] rounded-xl"
                {...formRegister("description")}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="price">
                  Price (Rp)
                </label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  className="h-12 rounded-xl"
                  {...formRegister("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="stock">
                  Stock
                </label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  className="h-12 rounded-xl"
                  {...formRegister("stock", { valueAsNumber: true })}
                />
                {errors.stock && (
                  <p className="text-sm text-destructive">
                    {errors.stock.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="category">
                Category
              </label>
              <Input
                id="category"
                placeholder="Category"
                className="h-12 rounded-xl"
                {...formRegister("category")}
              />
              {errors.category && (
                <p className="text-sm text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="imageUrl">
                Image URL
              </label>
              <Input
                id="imageUrl"
                placeholder="https://..."
                className="h-12 rounded-xl"
                {...formRegister("imageUrl")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => handleDialogOpenChange(false)}
                disabled={saveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will disappear from the
              mock catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
