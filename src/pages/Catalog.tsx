/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMedicines } from '@/hooks/useMedicines';
import { MedicineCard } from '@/components/catalog/MedicineCard';
import { SearchFilters } from '@/components/catalog/SearchFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function Catalog() {
  const location = useLocation();
  const { medicines, categories, loading, searchMedicines } = useMedicines();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
    searchMedicines(query);
  }, [location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchMedicines(searchQuery);
  };

  const handleFilter = (filters: any) => {
    searchMedicines(searchQuery, {
      category: filters.category === 'all' ? undefined : filters.category,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
      requiresPrescription: filters.requiresPrescription,
      sortBy: filters.sortBy,
    });
  };

  // Calculate pagination
  const totalPages = Math.ceil(medicines.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMedicines = medicines.slice(startIndex, endIndex);

  // Generate page numbers
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Medicine Catalog</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            <SearchFilters categories={categories} onFilter={handleFilter} />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {medicines.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No medicines found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentMedicines.map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-2">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        />
                      </PaginationItem>

                      {currentPage > 3 && (
                        <>
                          <PaginationItem>
                            <PaginationLink onClick={() => setCurrentPage(1)}>
                              1
                            </PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        </>
                      )}

                      {getPageNumbers().map((pageNum) => (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      {currentPage < totalPages - 2 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, medicines.length)} of{' '}
                    {medicines.length} medicines
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}