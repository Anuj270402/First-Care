/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Category } from "@/lib/types";

interface SearchFiltersProps {
  categories: Category[];
  onFilter: (filters: any) => void;
}

export function SearchFilters({ categories, onFilter }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    category: "all",
    priceRange: [0, 1000],
    requiresPrescription: undefined as boolean | undefined,
    sortBy: "name-asc",
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = {
      ...filters,
      [key]:
        key === "category" && value !== "all"
          ? Number(value) // convert string to number for category ID
          : value,
    };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      category: "all",
      priceRange: [0, 1000],
      requiresPrescription: undefined,
      sortBy: "name-asc",
    };
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => handleFilterChange("sortBy", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sorting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
            <SelectItem value="manufacturer-asc">Manufacturer (A-Z)</SelectItem>
            <SelectItem value="manufacturer-desc">
              Manufacturer (Z-A)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={filters.category.toString()}
          onValueChange={(value) => handleFilterChange("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={filters.requiresPrescription}
          onCheckedChange={(value) =>
            handleFilterChange("requiresPrescription", value)
          }
        />
        <Label>Prescription Required</Label>
      </div>

      <Button variant="outline" className="w-full" onClick={resetFilters}>
        Reset Filters
      </Button>
    </div>
  );
}
