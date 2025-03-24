import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="border-b w-full">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Navigate through our online pharmacy
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-2">
                  <Link to="/" className="text-lg font-medium">
                    Home
                  </Link>
                  <Link to="/catalog" className="text-lg font-medium">
                    Catalog
                  </Link>
                  <Link to="/orders" className="text-lg font-medium">
                    Orders
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link to="/" className="text-xl font-bold text-primary ml-2 md:ml-0">
              FirstCare
            </Link>
            
            <div className="hidden md:flex items-center ml-8 space-x-6">
              <Link to="/catalog" className="text-sm font-medium">
                Catalog
              </Link>
              <Link to="/orders" className="text-sm font-medium">
                Orders
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search medicines..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}