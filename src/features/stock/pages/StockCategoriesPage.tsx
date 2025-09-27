<<<<<<< HEAD
import { useMemo, useState } from 'react';

=======
import { useEffect, useMemo, useRef, useState } from 'react';
>>>>>>> a3c25d8
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { Button } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Skeleton } from '@/components/ui/Skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Textarea } from '@/components/ui/Textarea';
import { useStockQuery } from '@/hooks';
import { PencilLine, Trash2, UploadCloud } from 'lucide-react';

const formatDate = (date: Date | undefined) => {
  if (!date) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const getInitials = (value: string) => {
  return value
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
};

type CategoryRow = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

const fmt = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const StockCategoriesPage = () => {
  const { data, isLoading } = useStockQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const productCounts = useMemo(() => {
    if (!data) {
      return {} as Record<string, number>;
    }

    return data.products.reduce<Record<string, number>>((acc, product) => {
      acc[product.categoryId] = (acc[product.categoryId] ?? 0) + 1;
      return acc;
    }, {});
  }, [data]);

  const generatedTimestamps = useMemo(() => {
    if (!data) {
      return {} as Record<string, { created: Date; updated: Date }>;
    }

    return data.categories.reduce<Record<string, { created: Date; updated: Date }>>((acc, category, index) => {
      const created = new Date(Date.UTC(2024, index % 12, 4 + index));
      const updated = new Date(created);
      updated.setDate(updated.getDate() + 12);
      acc[category.id] = { created, updated };
      return acc;
    }, {});
  }, [data]);

  const filteredCategories = useMemo(() => {
    if (!data) {
      return [];
    }

    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return data.categories;
    }

    return data.categories.filter((category) => {
      const idMatch = category.id.toLowerCase().includes(query);
      const nameMatch = category.name.toLowerCase().includes(query);
      const descriptionMatch = (category.description ?? '').toLowerCase().includes(query);
      return idMatch || nameMatch || descriptionMatch;
    });
  }, [data, searchTerm]);

  // ---------- Local state ----------
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState('');

  // form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showZoom, setShowZoom] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // helpers
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handlePickClick = () => fileInputRef.current?.click();

  const handlePickChange = (f?: File | null) => {
    if (!f) return;
    // basic validation
    if (!f.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const maxBytes = 2 * 1024 * 1024; // 2 MB
    if (f.size > maxBytes) {
      alert('Image is too large. Max 2 MB.');
      return;
    }
    setImageFile(f);
  };

  // ---------- Sync incoming data ----------
  useEffect(() => {
    if (!data?.categories) return;
    const nowIso = new Date().toISOString();

    const mapped: CategoryRow[] = data.categories.map((c: any, idx: number) => ({
      id: typeof c.id === 'number' ? c.id : idx + 1,
      name: c.name ?? 'Untitled',
      description: c.description ?? '',
      imageUrl: c.imageUrl ?? null,
      createdAt: c.createdAt ?? nowIso,
      updatedAt: c.updatedAt ?? nowIso,
    }));

    setCategories((prev) => (prev.length ? prev : mapped));
  }, [data]);

  // ---------- Image preview handling ----------
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // ---------- Filter ----------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        String(c.id).includes(q)
    );
  }, [categories, search]);

  // ---------- Helpers ----------
  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    clearImage();
  };

  const nextId = () => (categories.length ? Math.max(...categories.map((c) => c.id)) + 1 : 1);

  // ---------- Actions ----------
  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter category name.');
      return;
    }

    const nowIso = new Date().toISOString();
    const newImageUrl = imagePreview ?? null;

    if (editingId == null) {
      const row: CategoryRow = {
        id: nextId(),
        name: name.trim(),
        description: description.trim(),
        imageUrl: newImageUrl,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      setCategories((prev) => [row, ...prev]);
    } else {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: name.trim(),
                description: description.trim(),
                imageUrl: newImageUrl ?? c.imageUrl,
                updatedAt: nowIso,
              }
            : c
        )
      );
    }

    resetForm();
  };

  const handleEdit = (row: CategoryRow) => {
    setEditingId(row.id);
    setName(row.name);
    setDescription(row.description ?? '');
    setImageFile(null);
    setImagePreview(row.imageUrl ?? null);
  };

  const handleDelete = (row: CategoryRow) => {
    const ok = window.confirm(`Delete category "${row.name}" (ID: ${row.id})?`);
    if (!ok) return;
    setCategories((prev) => prev.filter((c) => c.id !== row.id));
    if (editingId === row.id) resetForm();
  };

  // ---------- UI ----------
  return (
    <div className="space-y-6">
<<<<<<< HEAD
      
=======
     

      <Callout>
        Category management currently runs client-side. Connect to your ERP or accounting stack to persist changes
        centrally.
      </Callout>
>>>>>>> a3c25d8

      {isLoading || !data ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <Skeleton className="h-[460px] w-full" />
          <Skeleton className="h-[460px] w-full" />
        </div>
      ) : (
<<<<<<< HEAD
        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <Card className="border-slate-800/80 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-base text-slate-200">Create category</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="category-name" className="text-sm text-slate-300">
                    Category name
                  </Label>
                  <Input id="category-name" placeholder="e.g. Art Supplies" autoComplete="off" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-slug" className="text-sm text-slate-300">
                    Identifier
                  </Label>
                  <Input id="category-slug" placeholder="e.g. cat-art" autoComplete="off" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-description" className="text-sm text-slate-300">
                    Description
                  </Label>
                  <Textarea
                    id="category-description"
                    placeholder="Add a short note about how this category is used"
                    rows={4}
                  />
                </div>

                <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/40 p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900/80">
                      <UploadCloud className="h-5 w-5 text-slate-300" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-200">Category image</p>
                      <p className="text-xs text-slate-400">
                        Drag and drop an image here, or click the button below to upload from your device.
                      </p>
                      <Button type="button" variant="outline" size="sm" className="mt-3">
                        Browse files
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="ghost" size="sm">
                    Reset
                  </Button>
                  <Button type="submit" size="sm">
                    Save category
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col border-slate-800/80 bg-slate-900/70">
            <CardHeader className="gap-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base text-slate-200">Defined categories</CardTitle>
              </div>
              <div className="relative">
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, ID, or description"
                  className="pr-20"
                />
                {searchTerm && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-xs"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 overflow-x p-0">
              <div className="overflow-x-auto">
                <div className="max-h-[420px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur">
                      <TableRow>
                        <TableHead className="w-[40px]">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Products</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead className="w-[110px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCategories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="py-12 text-center text-sm text-slate-400">
                            No categories match your search.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCategories.map((category) => {
                          const timestamps = generatedTimestamps[category.id];
                          const initials = getInitials(category.name);
                          const productCount = productCounts[category.id] ?? 0;

                          return (
                            <TableRow key={category.id}>
                              <TableCell className="font-mono text-xs uppercase text-slate-400">
                                {category.id}
                              </TableCell>
                              <TableCell className="font-medium text-slate-100">{category.name}</TableCell>
                              <TableCell>
                                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-800/80 bg-slate-950/60 text-sm font-semibold text-slate-200">
                                  {initials || '�'}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[220px] text-sm text-slate-400">
                                {category.description ?? 'No description'}
                              </TableCell>
                              <TableCell className="text-right text-sm font-semibold text-slate-200">
                                {productCount}
                              </TableCell>
                              <TableCell className="text-sm text-slate-400">
                                {formatDate(timestamps?.created)}
                              </TableCell>
                              <TableCell className="text-sm text-slate-400">
                                {formatDate(timestamps?.updated)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  <Button variant="ghost" size="sm" className="px-2">
                                    <PencilLine className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="px-2 text-rose-300 hover:text-rose-200"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
=======
        <div className="flex flex-col gap-6 md:flex-row">
          {/* LEFT: 30% - Form */}
          <div className="md:w-[30%] md:flex-none">
            <Card className="border-slate-800/80 bg-slate-900/70">
              <CardHeader>
                <CardTitle className="text-base text-slate-200">
                  {editingId == null ? 'Add Category' : `Edit Category (ID: ${editingId})`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="category-name" className="text-sm text-slate-300">
                    Category name
                  </label>
                  <input
                    id="category-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Laptops"
                    className="w-full rounded-md border border-slate-700 bg-slate-800/70 px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="category-desc" className="text-sm text-slate-300">
                    Description
                  </label>
                  <textarea
                    id="category-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description..."
                    rows={3}
                    className="w-full rounded-md border border-slate-700 bg-slate-800/70 px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Image</label>

                  <div
                    onClick={handlePickClick}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const f = e.dataTransfer.files?.[0];
                      handlePickChange(f ?? null);
                    }}
                    className={[
                      'relative flex h-44 w-full flex-col items-center justify-center rounded-md border-2 border-dashed px-4 text-center overflow-hidden cursor-pointer',
                      'bg-slate-800/40',
                      dragActive ? 'border-slate-300' : 'border-slate-500 hover:border-slate-400',
                    ].join(' ')}
                  >
                    {/* hidden input for click */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePickChange(e.target.files?.[0] ?? null)}
                    />

                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="preview"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowZoom(true);
                          }}
                          className="h-full w-full object-cover rounded-md cursor-zoom-in"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearImage();
                          }}
                          className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
                          aria-label="Remove image"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mb-2 h-8 w-8 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3"
                          />
                        </svg>
                        <p className="text-slate-300">Drag and Drop</p>
                        <p className="text-sm text-slate-400">or</p>
                        <span className="mt-2 inline-block rounded-md bg-slate-700 px-3 py-1 text-sm text-slate-100">
                          Browse file
                        </span>
                      </>
                    )}
                  </div>

                  
                </div>

                {/* Zoom modal */}
                {showZoom && imagePreview && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setShowZoom(false)}
                  >
                    <img
                      src={imagePreview}
                      alt="zoom"
                      className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setShowZoom(false)}
                      className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
                    >
                      Close
                    </button>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <Button onClick={handleSave}>{editingId == null ? 'Save Category' : 'Update Category'}</Button>
                  <Button variant="secondary" onClick={resetForm}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: 70% - Table */}
          <div className="md:flex-1">
            <Card className="border-slate-800/80 bg-slate-900/70">
              <CardHeader className="space-y-4">
                <CardTitle className="text-base text-slate-200">Categories</CardTitle>

                {/* Search bar */}
                <div className="flex items-center gap-3 w-[300px]"> 
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID, name, description…"
                    className="w-full rounded-md border border-slate-700 bg-slate-800/70 px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
                  />
                  {search && (
                    <Button variant="secondary" onClick={() => setSearch('')}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead >Image</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-slate-400">
                          No categories found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-slate-300">{row.id}</TableCell>
                          <TableCell className="font-medium text-slate-100">{row.name}</TableCell>
                          <TableCell>
                            {row.imageUrl ? (
                              <img
                                src={row.imageUrl}
                                alt={row.name}
                                className="h-10 w-10 rounded-md border border-slate-700 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-slate-700 text-[10px] text-slate-400 ">
                                None
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-300">{fmt(row.createdAt)}</TableCell>
                          <TableCell className="text-slate-300">{fmt(row.updatedAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(row)}
                                className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1 text-xs text-slate-100 hover:bg-slate-700"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(row)}
                                className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1 text-xs text-red-300 hover:bg-slate-700"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
>>>>>>> a3c25d8
        </div>
      )}
    </div>
  );
};

export default StockCategoriesPage;
