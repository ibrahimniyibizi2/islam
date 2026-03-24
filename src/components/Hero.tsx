import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const [serviceQuery, setServiceQuery] = useState('');

  const onSearch = () => {
    const q = serviceQuery.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    const queryString = params.toString();
    navigate(`/search${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <section className="bg-emerald-600 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Welcome Text */}
          <h1 className="text-3xl md:text-5xl font-semibold text-white mb-4">
            Welcome to the Online Services Portal
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 mb-8">
            Apply for Islamic services online, track your applications, and access important documents from anywhere.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
                placeholder="Search for services..."
                className="w-full h-14 pl-12 pr-32 bg-white border-0 rounded-lg text-gray-700 placeholder:text-gray-400 shadow-lg text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSearch();
                }}
              />
              <Button
                type="button"
                onClick={onSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 rounded-md"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="text-emerald-100 text-sm">Popular:</span>
            {['Nikah', 'Funeral', 'Education', 'Mosque'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setServiceQuery(term);
                  navigate(`/search?q=${term}`);
                }}
                className="text-sm text-emerald-200 hover:text-white underline underline-offset-2 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
