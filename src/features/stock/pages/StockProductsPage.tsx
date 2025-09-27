import { useEffect, useMemo, useRef, useState } from "react";
import { ModuleHeader } from "@/components/layout/ModuleHeader";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useStockQuery } from "@/hooks";
import { formatCurrency, formatNumber } from "@/utils/formatters";

type Product = {
  id: number;
  barcode?: string;
  categoryId: number;
  imageUrl?: string | null;
  name: string;
  description?: string;
  unitPrice: number;
  quantity?: number;
  stock_in?: number;
  stock_add?: number;
  total_stock?: number;
  avail?: "Yes" | "No";
  updatedAt?: string;
};

type Category = { id: number; name: string };

const RIEL_RATE = 4100;
const khr = (usd: number) => formatNumber(Math.round((usd || 0) * RIEL_RATE));

/* ------------------------------ Image hook ------------------------------ */
function usePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

/* ------------------------------ Modals ----------------------------- */
function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  if (!open) return null;
  const width =
    size === "xl" ? "max-w-5xl" : size === "lg" ? "max-w-3xl" : "max-w-xl";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className={`w-full ${width} rounded-lg bg-slate-900 text-slate-100 shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button 
            onClick={onClose} 
            className="rounded-md p-1 hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-700 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Image Upload ------------------------- */
function ImageUpload({
  label,
  file,
  setFile,
  initialUrl,
}: {
  label?: string;
  file: File | null;
  setFile: (f: File | null) => void;
  initialUrl?: string | null;
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const live = usePreview(file);
  const preview = live ?? initialUrl ?? null;

  const clickPick = () => inputRef.current?.click();
  
  const onPick = (f?: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return alert("Please choose an image file.");
    if (f.size > 2 * 1024 * 1024) return alert("Max image size: 2 MB.");
    setFile(f);
  };

  return (
    <div className="space-y-2">
      {!!label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <div
        onClick={clickPick}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onPick(e.dataTransfer.files?.[0] ?? null);
        }}
        className={[
          "relative w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed bg-slate-800/40 p-6 text-center transition-all",
          drag ? "border-blue-400 bg-blue-900/20" : "border-slate-600 hover:border-slate-400",
          "flex flex-col items-center justify-center gap-2 min-h-[120px]",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="h-20 w-20 rounded-md object-cover"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="rounded-md bg-rose-600 px-3 py-1 text-xs text-white hover:bg-rose-500 transition-colors"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={clickPick}
                className="rounded-md bg-slate-600 px-3 py-1 text-xs text-white hover:bg-slate-500 transition-colors"
              >
                Change
              </button>
            </div>
          </>
        ) : (
          <>
            <svg className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3"/>
            </svg>
            <div>
              <p className="text-slate-300 font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400">PNG, JPG up to 2MB</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =============================== MAIN PAGE ================================== */
const StockProductsCrudPage = () => {
  const { data, isLoading } = useStockQuery();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!data) return;
    setCategories(data.categories as Category[]);
    setProducts(
      (data.products as any[]).map((p: any) => ({
        id: p.id,
        barcode: p.barcode ?? String(p.id).padStart(12, "0"),
        categoryId: p.categoryId,
        imageUrl: p.imageUrl ?? null,
        name: p.name,
        description: p.description ?? "",
        unitPrice: p.unitPrice ?? 0,
        quantity: p.quantity ?? 0,
        stock_in: p.stock_in ?? p.quantity ?? 0,
        stock_add: p.stock_add ?? 0,
        total_stock: p.total_stock ?? (p.quantity ?? 0) + (p.stock_add ?? 0),
        avail: p.total_stock > 0 || p.quantity > 0 ? "Yes" : "No",
        updatedAt: p.updatedAt,
      }))
    );
  }, [data]);

  /* ------------------------------- Search ------------------------------ */
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    
    return products.filter((p) => {
      const categoryName = categories.find((c) => c.id === p.categoryId)?.name?.toLowerCase() ?? "";
      return (
        (p.barcode ?? "").toLowerCase().includes(term) ||
        categoryName.includes(term) ||
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, products, categories]);

  /* -------------------------- Product Form ------------------------- */
  type ProductForm = {
    id?: number;
    categoryId: number | "";
    name: string;
    description: string;
    unitPrice: string;
    stockQty: string;
    isActive: boolean;
    imageFile: File | null;
    imageUrl?: string | null;
  };

  const defaultForm: ProductForm = {
    categoryId: "",
    name: "",
    description: "",
    unitPrice: "",
    stockQty: "0",
    isActive: true,
    imageFile: null,
  };

  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);

  // Open modal for adding new product
  const openAddModal = () => {
    setProductForm(defaultForm);
    setIsEditing(false);
    setShowProductModal(true);
  };

  // Open modal for editing existing product
  const openEditModal = (product: Product) => {
    setProductForm({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description ?? "",
      unitPrice: String(product.unitPrice ?? ""),
      stockQty: String(product.stock_in ?? product.quantity ?? 0),
      isActive: product.avail === "Yes",
      imageFile: null,
      imageUrl: product.imageUrl ?? null,
    });
    setIsEditing(true);
    setShowProductModal(true);
  };

  // Save product (both add and edit)
  const saveProduct = () => {
    if (!productForm.categoryId || !productForm.name.trim() || !productForm.unitPrice) {
      return alert("Please fill in all required fields: Category, Name, and Price.");
    }

    const price = parseFloat(productForm.unitPrice);
    if (isNaN(price) || price < 0) {
      return alert("Please enter a valid price.");
    }

    const stockQty = parseInt(productForm.stockQty || "0", 10);

    if (isEditing && productForm.id) {
      // Update existing product
      setProducts(prev => prev.map(p => 
        p.id === productForm.id ? {
          ...p,
          categoryId: Number(productForm.categoryId),
          name: productForm.name.trim(),
          description: productForm.description.trim(),
          unitPrice: price,
          imageUrl: productForm.imageFile ? URL.createObjectURL(productForm.imageFile) : (productForm.imageUrl ?? p.imageUrl),
          stock_in: stockQty,
          total_stock: stockQty + (p.stock_add ?? 0),
          avail: (stockQty + (p.stock_add ?? 0)) > 0 ? "Yes" : "No",
          updatedAt: new Date().toISOString(),
        } : p
      ));
    } else {
      // Add new product
      const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const newProduct: Product = {
        id: newId,
        barcode: String(newId).padStart(12, "0"),
        categoryId: Number(productForm.categoryId),
        imageUrl: productForm.imageFile ? URL.createObjectURL(productForm.imageFile) : null,
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        unitPrice: price,
        stock_in: stockQty,
        stock_add: 0,
        total_stock: stockQty,
        avail: stockQty > 0 ? "Yes" : "No",
        updatedAt: new Date().toISOString(),
      };
      setProducts(prev => [newProduct, ...prev]);
    }

    setShowProductModal(false);
    // TODO: API call here
  };

  /* ------------------------------ Add Stock ---------------------------- */
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockToAdd, setStockToAdd] = useState("");

  const openStockModal = (product: Product) => {
    setSelectedProduct(product);
    setStockToAdd("");
    setShowStockModal(true);
  };

  const addStock = () => {
    if (!selectedProduct) return;
    
    const quantity = parseInt(stockToAdd, 10);
    if (isNaN(quantity) || quantity <= 0) {
      return alert("Please enter a valid quantity.");
    }

    setProducts(prev => prev.map(p => 
      p.id === selectedProduct.id ? {
        ...p,
        stock_add: (p.stock_add ?? 0) + quantity,
        total_stock: (p.total_stock ?? 0) + quantity,
        avail: "Yes",
      } : p
    ));

    setShowStockModal(false);
    // TODO: API call here
  };

  /* -------------------------------- Delete ----------------------------- */
  const deleteProduct = (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }
    
    setProducts(prev => prev.filter(p => p.id !== product.id));
    // TODO: API call here
  };

  /* ------------------------------- Render ------------------------------ */
  return (
    <div className="space-y-6 p-6">
      <ModuleHeader
        title="Product Catalog"
        description="Manage your inventory and product information"
        actions={
          <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-500">
            + Add New Product
          </Button>
        }
      />

      <Callout>
        Monitor your stock levels and manage product information. Low stock indicators help you plan replenishment.
      </Callout>

      {/* Search and Controls */}
      <Card className="border-slate-700 bg-slate-900/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="relative max-w-md">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products by name, barcode, or category..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2 pl-10 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <svg 
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>{filteredProducts.length} products</span>
              <span className="text-slate-600">•</span>
              <span>{products.filter(p => p.total_stock && p.total_stock > 0).length} in stock</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <Card className="border-slate-700 bg-slate-900/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-200">Products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="w-12 text-slate-400">#</TableHead>
                    <TableHead className="text-slate-400">Product</TableHead>
                    <TableHead className="text-slate-400">Category</TableHead>
                    <TableHead className="text-slate-400">Price</TableHead>
                    <TableHead className="text-slate-400">Stock</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-right text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                        {searchTerm ? "No products found matching your search." : "No products available."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product, index) => {
                      const category = categories.find(c => c.id === product.categoryId)?.name ?? "-";
                      const isLowStock = (product.total_stock ?? 0) < 10;
                      const isOutOfStock = (product.total_stock ?? 0) === 0;

                      return (
                        <TableRow key={product.id} className="border-slate-800 hover:bg-slate-800/30">
                          <TableCell className="text-slate-300">{filteredProducts.length - index}</TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="h-10 w-10 rounded-lg border border-slate-700 object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-800/50">
                                  <span className="text-xs text-slate-400">📦</span>
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-slate-100 truncate">{product.name}</div>
                                <div className="text-xs text-slate-400 truncate">{product.barcode}</div>
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-slate-300">{category}</TableCell>
                          
                          <TableCell>
                            <div className="text-slate-100">{formatCurrency(product.unitPrice)}</div>
                            <div className="text-xs text-slate-400">{khr(product.unitPrice)}</div>
                          </TableCell>
                          
                          <TableCell>
                            <div className={`font-medium ${
                              isOutOfStock ? "text-rose-400" : 
                              isLowStock ? "text-amber-400" : 
                              "text-emerald-400"
                            }`}>
                              {formatNumber(product.total_stock ?? 0)}
                            </div>
                            {product.stock_add && product.stock_add > 0 && (
                              <div className="text-xs text-blue-400">+{formatNumber(product.stock_add)} added</div>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              product.avail === "Yes" 
                                ? "bg-emerald-900/50 text-emerald-400 border border-emerald-800/50"
                                : "bg-rose-900/50 text-rose-400 border border-rose-800/50"
                            }`}>
                              {product.avail === "Yes" ? "In Stock" : "Out of Stock"}
                            </span>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openStockModal(product)}
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
                                title="Add Stock"
                              >
                                ＋ Stock
                              </button>
                              <button
                                onClick={() => openEditModal(product)}
                                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteProduct(product)}
                                className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 transition-colors"
                                title="Delete"
                              >
                                Delete
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Modal (Add/Edit) */}
      <Modal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={isEditing ? "Edit Product" : "Add New Product"}
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setShowProductModal(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveProduct}
              className="bg-blue-600 hover:bg-blue-500"
            >
              {isEditing ? "Update Product" : "Create Product"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4 md:col-span-1">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={productForm.categoryId}
                onChange={(e) => setProductForm(f => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : "" }))}
              >
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={productForm.name}
                onChange={(e) => setProductForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Enter product name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Price (USD) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="0.00"
                  value={productForm.unitPrice}
                  onChange={(e) => setProductForm(f => ({ ...f, unitPrice: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Initial Stock
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={productForm.stockQty}
                  onChange={(e) => setProductForm(f => ({ ...f, stockQty: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
              <input
                id="productActive"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                checked={productForm.isActive}
                onChange={(e) => setProductForm(f => ({ ...f, isActive: e.target.checked }))}
              />
              <label htmlFor="productActive" className="text-sm font-medium text-slate-300">
                Product is active and available for sale
              </label>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:col-span-1">
            <ImageUpload
              label="Product Image"
              file={productForm.imageFile}
              setFile={(file) => setProductForm(f => ({ ...f, imageFile: file }))}
              initialUrl={productForm.imageUrl}
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={productForm.description}
                onChange={(e) => setProductForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the product features and details..."
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Stock Modal */}
      <Modal
        open={showStockModal}
        onClose={() => setShowStockModal(false)}
        title="Add Stock"
        size="md"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setShowStockModal(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={addStock}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Add Stock
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Product</label>
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
              <div className="font-medium text-slate-100">{selectedProduct?.name}</div>
              <div className="text-sm text-slate-400">Current stock: {formatNumber(selectedProduct?.total_stock ?? 0)}</div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Quantity to Add
            </label>
            <input
              type="number"
              min="1"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              value={stockToAdd}
              onChange={(e) => setStockToAdd(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>
          
          {stockToAdd && parseInt(stockToAdd) > 0 && (
            <div className="rounded-lg bg-emerald-900/20 p-3 border border-emerald-800/50">
              <div className="text-sm text-emerald-400">
                New total stock: {formatNumber((selectedProduct?.total_stock ?? 0) + parseInt(stockToAdd))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StockProductsCrudPage;