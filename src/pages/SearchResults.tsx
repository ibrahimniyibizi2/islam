import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Church, Heart, FileText, Users, Calendar, MapPin, Star, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const serviceIcons = {
  "Nikah Services": Heart,
  "Funeral Services": Users,
  "Islamic Education": FileText,
  "Mosque Management": Church,
};

const serviceColors = {
  "Nikah Services": "bg-pink-100 text-pink-800 hover:bg-pink-200",
  "Funeral Services": "bg-gray-100 text-gray-800 hover:bg-gray-200",
  "Islamic Education": "bg-blue-100 text-blue-800 hover:bg-blue-200",
  "Mosque Management": "bg-green-100 text-green-800 hover:bg-green-200",
};

const allServices = [
  {
    id: 1,
    title: "Nikah Services",
    description: "Complete marriage ceremony services including documentation, officiation, and certificate issuance.",
    icon: Heart,
    features: ["Marriage Registration", "Certificate Issuance", "Officiation Services", "Document Processing"],
    category: "Nikah Services"
  },
  {
    id: 2,
    title: "Funeral Services",
    description: "Comprehensive funeral arrangements following Islamic traditions and local regulations.",
    icon: Users,
    features: ["Burial Arrangements", "Janazah Prayers", "Transportation", "Documentation Support"],
    category: "Funeral Services"
  },
  {
    id: 3,
    title: "Islamic Education",
    description: "Educational programs and resources for Islamic learning at all levels.",
    icon: FileText,
    features: ["Quranic Studies", "Islamic Courses", "Workshops", "Certification Programs"],
    category: "Islamic Education"
  },
  {
    id: 4,
    title: "Mosque Management",
    description: "Digital tools and services for effective mosque administration and community engagement.",
    icon: Church,
    features: ["Member Management", "Event Scheduling", "Donation Tracking", "Communication Tools"],
    category: "Mosque Management"
  }
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filteredServices, setFilteredServices] = useState(allServices);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    
    if (query.trim()) {
      const filtered = allServices.filter(service => 
        service.title.toLowerCase().startsWith(query.toLowerCase()) ||
        service.description.toLowerCase().includes(query.toLowerCase()) ||
        service.category.toLowerCase().startsWith(query.toLowerCase())
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(allServices);
    }
  }, [searchParams]);

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) {
      params.set('q', newQuery.trim());
    }
    window.history.pushState({}, '', `/search?${params.toString()}`);
  };

  const handleLearnMore = (service: typeof allServices[0]) => {
    // Navigate to appropriate service page or section
    switch (service.category) {
      case "Nikah Services":
        navigate('/?service=nikah#services');
        break;
      case "Funeral Services":
        navigate('/?service=funeral#services');
        break;
      case "Islamic Education":
        navigate('/?service=education#services');
        break;
      case "Mosque Management":
        navigate('/?service=mosque#services');
        break;
      default:
        navigate('/#services');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Search Islamic Services</h1>
            <p className="text-muted-foreground text-center mb-6">
              Find the right Islamic services for your needs
            </p>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search services (e.g., Nikah, Funeral, Education)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {searchQuery.trim() ? (
              <>Found {filteredServices.length} result{filteredServices.length !== 1 ? 's' : ''} for "{searchQuery}"</>
            ) : (
              <>Showing all {filteredServices.length} services</>
            )}
          </p>
        </div>

        {/* Search Results */}
        {filteredServices.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => {
              const IconComponent = serviceIcons[service.category as keyof typeof serviceIcons] || Church;
              const colorClass = serviceColors[service.category as keyof typeof serviceColors] || "bg-gray-100 text-gray-800";
              
              return (
                <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {service.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {service.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{service.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        size="sm"
                        onClick={() => handleLearnMore(service)}
                      >
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any services matching "{searchQuery}". Try searching with different keywords.
              </p>
              <Button 
                variant="outline" 
                onClick={() => handleSearch('')}
              >
                Show All Services
              </Button>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-semibold mb-4">Popular Searches</h2>
          <div className="flex flex-wrap gap-2">
            {['Nikah', 'Funeral', 'Education', 'Mosque', 'Certificate', 'Marriage'].map((term) => (
              <Button
                key={term}
                variant="outline"
                size="sm"
                onClick={() => handleSearch(term)}
                className="hover:bg-primary hover:text-primary-foreground"
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
