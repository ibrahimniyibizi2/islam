import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Sparkles } from "lucide-react";

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

  const quickLinks = [
    { label: 'Nikah', icon: '💍', color: 'bg-pink-100 text-pink-700' },
    { label: 'Funeral', icon: '🕌', color: 'bg-gray-100 text-gray-700' },
    { label: 'Education', icon: '📚', color: 'bg-blue-100 text-blue-700' },
    { label: 'Mosque', icon: '🕋', color: 'bg-emerald-100 text-emerald-700' },
  ];

  return (
    <section 
      className="relative min-h-[500px] flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(5, 150, 105, 0.9) 50%, rgba(16, 185, 129, 0.85) 100%), url('/hero-mosque.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white/90 text-sm font-medium">Rwanda's Premier Islamic Services Platform</span>
          </div>

          {/* Welcome Text */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Assalamu Alaikum
            <span className="block text-2xl md:text-3xl font-normal text-emerald-100 mt-2">
              Welcome to Rwanda Islamic Hub
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Apply for Islamic services online, track your applications, and access important documents from anywhere in Rwanda.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl group-hover:bg-white/30 transition-all"></div>
              <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  placeholder="Search for services (e.g., Nikah, Shahada, Zakat...)"
                  className="w-full h-14 pl-14 pr-36 border-0 text-gray-700 placeholder:text-gray-400 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSearch();
                  }}
                />
                <Button
                  type="button"
                  onClick={onSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 rounded-lg"
                >
                  Search
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-3">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  setServiceQuery(link.label);
                  navigate(`/search?q=${link.label}`);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${link.color} hover:scale-105 transition-all duration-200 font-medium text-sm`}
              >
                <span>{link.icon}</span>
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default Hero;
