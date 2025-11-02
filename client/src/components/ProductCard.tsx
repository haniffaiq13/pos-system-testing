// Product Card Component - displays product in marketplace grid

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";
import { formatRupiah } from "@/utils/money";
import type { Product } from "@shared/schema";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showAddButton?: boolean;
}

export function ProductCard({ product, onAddToCart, showAddButton = true }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden rounded-2xl border-2 hover:border-primary/20 transition-all duration-200 hover-elevate h-full">
        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          
          {/* Fallback gradient with initial */}
          {!product.imageUrl && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-bold text-primary/20">
                {product.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full border-2 border-border">
              <span className="font-mono font-bold text-sm">{formatRupiah(product.price)}</span>
            </div>
          </div>

          {/* Stock indicator */}
          {product.stock <= 10 && product.stock > 0 && (
            <div className="absolute bottom-4 left-4">
              <div className="bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded-full">
                <span className="text-xs font-medium text-white">Only {product.stock} left</span>
              </div>
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {product.description}
              </p>
            )}
          </div>

          {showAddButton && (
            <Button
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className="w-full rounded-xl gap-2 font-semibold"
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <Plus className="w-4 h-4" />
              Add to Cart
            </Button>
          )}

          {!showAddButton && (
            <Button
              onClick={() => onAddToCart(product)}
              variant="outline"
              disabled={product.stock === 0}
              className="w-full rounded-xl gap-2 font-semibold"
              data-testid={`button-select-product-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4" />
              Select
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
