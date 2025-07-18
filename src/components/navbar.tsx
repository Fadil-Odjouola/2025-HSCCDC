import { useState, useEffect } from "react";
import { Menu, X, Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./miniUI/button";
import navbar_data from "@/data/navbarData";


type NavItem = {
  title: string;
  path: string;
  active: boolean;
  element: React.ReactNode;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(true);
  const currentUrl = window.location.pathname;

  const setActive = (currenturl: string) => {
    setnavItems((prev: NavItem[]) =>
      prev.map((item) =>
        item.path === currenturl
          ? { ...item, active: true }
          : { ...item, active: false }
      )
    );
  };

  useEffect(() => {
    setActive(currentUrl);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentUrl]);

  const [navItems, setnavItems] = useState<NavItem[]>(navbar_data);

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex flex-row
        ${
          isScrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-border shadow-sm"
            : "bg-transparent"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div
            className={` transition-all duration-300 flex items-center space-x-2 ${
              searchOpen ? "-translate-x-2" : ""
            }`}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl lg:text-2xl font-bold text-foreground">
              Nabber
            </span>
          </div>

          <div className="w-max h-max">
            <Button className=" md:flex  flex items-center justify-center">
              <button
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                }}
                className="hover:bg-gray-100 w-max pr-2 pl-2 h-10 flex justify-center items-center rounded-lg transition-all duration-200 ease-linear cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </button>
              <div className="w-max h-max  p-2">
                <input
                  type="text"
                  placeholder="Search..."
                  className={` transition-all duration-300
        ${searchOpen ? "w-48 px-4 opacity-100" : "w-0 px-0 opacity-0"}
        py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm text-base hover:shadow-lg`}
                  style={{ minWidth: searchOpen ? "12rem" : "0" }}
                />
              </div>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.title} className="relative group">
                <a
                  href={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-[16.5px] font-medium transition-all duration-300 ${
                    item.active
                      ? "text-[#7C3CED] hover:bg-[#F2EBFD] "
                      : "hover:bg-gray-100 opacity-65 hover:opacity-100 hover:font-bold"
                  }`}
                >
                  <span>{item.title}</span>
                </a>
              </div>
            ))}
          </div>
          {/* Right Side Actions */}
          <div className="flex items-center justify-around space-x-4 w-max h-max p-2 ">
            <div className="relative md:flex items-center space-x-3">
              <Button className="bg-[#7C3CED] w-max h-max p-3 pr-4 pl-4 font-bold text-white hover:bg-[#894EEF] transition-all duration-300 ease-linear cursor-pointer">Login</Button>
              <Button className="bg-[#4C1D95] w-max h-max p-3 pr-4 pl-4 font-bold text-white hover:bg-[#5B21B6] transition-all duration-300 ease-linear cursor-pointer">Sign up</Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "lg:hidden transition-all duration-[50ms] ease-in-out overflow-hidden",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="py-4 space-y-2 border-t border-border">
            {navItems.map((item) => (
              <a
                key={item.title}
                href={item.path}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200",
                  item.active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.title}
              </a>
            ))}
            <div className="pt-4 mt-4 border-t border-border space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button className="w-full mt-2">Get Started</Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
