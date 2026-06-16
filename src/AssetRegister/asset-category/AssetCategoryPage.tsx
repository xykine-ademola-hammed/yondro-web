import React, { useMemo, useState } from "react";
import {
  useAssetCategories,
  useDeleteAssetCategory,
} from "../Components/assetHooks";
import { Badge, Button, Input } from "../Components/primitive";
import type { AssetCategory } from "../Components/types";
import CreateAssetCategoryModal from "./CreateAssetCategoryModal";

interface AssetCategoryPageProps {
  unitType: string;
}

const AssetCategoryPage: React.FC<AssetCategoryPageProps> = ({ unitType }) => {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<AssetCategory | null>(null);

  const { data: categories, isLoading, error } = useAssetCategories(unitType);

  // NOTE: your hook currently takes selectedCategory?.id. That means if you click Delete on another row,
  // the hook still points to old selectedCategory. Use a single delete hook without binding to selectedCategory if possible.
  // For now, keep your current pattern but set selectedCategory before delete.
  const deleteMutation = useDeleteAssetCategory(selectedCategory?.id || "");

  const filteredCategories = useMemo(() => {
    const list = categories?.data || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [categories?.data, search]);

  const handleEdit = (category: AssetCategory) => {
    setSelectedCategory(category);
    setCreateOpen(true);
  };

  const handleDelete = async (category: AssetCategory) => {
    if (!confirm(`Delete category "${category.code} - ${category.name}"?`))
      return;

    try {
      setSelectedCategory(category);
      await deleteMutation.mutateAsync(category.id);
    } catch {
      alert("Failed to delete category");
    } finally {
      setSelectedCategory(null);
    }
  };

  const handleCloseModal = () => {
    setCreateOpen(false);
    setSelectedCategory(null);
  };

  const EmptyState = (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <div className="text-3xl">📭</div>
      <p className="text-sm font-semibold text-slate-800">
        No categories found
      </p>
      <p className="text-sm text-slate-500">
        Try adjusting your search or create a new category.
      </p>
      <div className="mt-2 hidden sm:block">
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          New Category
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-3 pb-24 pt-4 sm:px-6 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 sm:text-2xl">
            Asset Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Define and manage asset categories, depreciation methods, and GL
            accounts.
          </p>
        </div>

        {/* Desktop primary action */}
        <div className="hidden sm:flex items-center gap-2">
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            New Category
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-6">
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Search
            </label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or name..."
            />
          </div>

          <div className="sm:col-span-6 sm:flex sm:justify-end">
            <div className="text-xs text-slate-500">
              {filteredCategories.length} result
              {filteredCategories.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      </div>

      {/* List container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />
              <span className="text-sm font-medium text-slate-600">
                Loading categories...
              </span>
            </div>
          </div>
        )}

        {/* Mobile cards (no horizontal scroll) */}
        <div className="divide-y divide-slate-200 md:hidden">
          {filteredCategories.length === 0 && !isLoading
            ? EmptyState
            : filteredCategories.map((c) => (
              <div key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {c.code} • {c.name}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Depreciation:{" "}
                      <span className="font-medium text-slate-700">
                        {c.depMethod === "SL"
                          ? "Straight Line"
                          : "Reducing Balance"}
                      </span>
                      {" • "}
                      Useful life:{" "}
                      <span className="font-medium text-slate-700">
                        {c.usefulLifeMonths
                          ? `${c.usefulLifeMonths} months`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <Badge tone={c.status === "ACTIVE" ? "green" : "gray"}>
                    {c.status}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending && selectedCategory?.id === c.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-4">Code</th>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Dep. Method</th>
                  <th className="px-5 py-4">Useful Life</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCategories.length > 0
                  ? filteredCategories.map((c) => (
                    <tr
                      key={c.id}
                      className="group hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {c.code}
                      </td>
                      <td className="px-5 py-4 text-slate-700">{c.name}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {c.depMethod === "SL"
                          ? "Straight Line"
                          : "Reducing Balance"}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {c.usefulLifeMonths
                          ? `${c.usefulLifeMonths} Months`
                          : "N/A"}
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          tone={c.status === "ACTIVE" ? "green" : "gray"}
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            className="text-rose-600 hover:text-rose-800 font-medium disabled:opacity-50"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending &&
                              selectedCategory?.id === c.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                  : !isLoading && (
                    <tr>
                      <td
                        className="px-5 py-12 text-center text-sm text-slate-500"
                        colSpan={6}
                      >
                        {EmptyState}
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CreateAssetCategoryModal
        open={createOpen}
        onClose={handleCloseModal}
        unitType={unitType}
        category={selectedCategory}
      />

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">Error loading categories</p>
          <p className="mt-1">{String((error as any)?.message || error)}</p>
        </div>
      )}

      {/* Mobile sticky action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-800">
              Asset Categories
            </div>
            <div className="truncate text-xs text-slate-500">
              {filteredCategories.length} result
              {filteredCategories.length === 1 ? "" : "s"}
            </div>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"
          >
            New Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetCategoryPage;
