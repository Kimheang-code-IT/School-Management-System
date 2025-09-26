import { useMemo, useState } from 'react';

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

  return (
    <div className="space-y-6">
      

      {isLoading || !data ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <Skeleton className="h-[460px] w-full" />
          <Skeleton className="h-[460px] w-full" />
        </div>
      ) : (
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
        </div>
      )}
    </div>
  );
};

export default StockCategoriesPage;
