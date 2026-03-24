import { Button } from "@/components/ui/button";
import { Menu, X, Globe, HelpCircle, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">Rwanda Islamic Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/contact-support"
              className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium"
            >
              <HelpCircle className="w-4 h-4" />
              Support
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-gray-600 border-gray-300 hover:border-emerald-600 hover:text-emerald-600"
                  >
                    <User className="w-4 h-4" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/user" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium"
                >
                  Log In
                </Link>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-gray-600 border-gray-300 hover:border-emerald-600 hover:text-emerald-600"
            >
              <Globe className="w-4 h-4" />
              English
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-emerald-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-3">
            <div className="flex flex-col gap-2">
              <Link
                to="/contact-support"
                className="flex items-center gap-2 py-2 text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HelpCircle className="w-4 h-4" />
                Support
              </Link>
              
              {user ? (
                <>
                  <Link
                    to="/dashboard/user"
                    className="flex items-center gap-2 py-2 text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    className="flex items-center gap-2 py-2 text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium text-left"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="py-2 text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="py-2 text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1 mt-2 text-gray-600 border-gray-300"
              >
                <Globe className="w-4 h-4" />
                English
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
