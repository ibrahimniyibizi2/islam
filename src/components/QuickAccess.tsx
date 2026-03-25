import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Heart, Home, Building2, ArrowRight, Clock, DollarSign, Users, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const popularServices = [
  {
    icon: FileText,
    title: "Shahada Certificate",
    description: "Apply for conversion certificate",
    fullDescription: "Official services for those converting to Islam including Shahada declaration ceremony, conversion certificate issuance, and integration into the Muslim community. We provide educational materials for new Muslims, assign mentors, and help with name change documentation if desired. All conversions are registered with the Supreme Council of Islamic Affairs in Rwanda.",
    processingTime: "Same Day",
    price: "Free",
    providedBy: "Islamic Affairs Division",
    requirements: ["Valid ID", "Witnesses (2)", "Written Declaration"],
    applicationUrl: "/shahada-application",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
  },
  {
    icon: Heart,
    title: "Marriage Application",
    description: "Submit Nikah application",
    fullDescription: "Complete Islamic marriage (Nikah) application services including ceremony officiation by certified Imams, marriage contract preparation, legal registration with Rwandan authorities, and official marriage certificate issuance. We provide pre-marital Islamic counseling and witness arrangement services.",
    processingTime: "1-2 Days",
    price: "50,000 - 200,000 RWF",
    providedBy: "Supreme Council of Islamic Affairs",
    requirements: ["Valid IDs (Both)", "Birth Certificates", "Passport Photos", "Wali Consent"],
    applicationUrl: "/nikah-application",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
  },
  {
    icon: Home,
    title: "Certificate of Residence",
    description: "Get residence certificate",
    fullDescription: "Obtain official proof of residence for various administrative purposes including visa applications, school enrollment, business registration, and legal documentation. Our residence verification process includes address confirmation through local authorities and mosque verification.",
    processingTime: "2-4 Days",
    price: "1,000 RWF",
    providedBy: "Local Administration",
    requirements: ["Valid ID", "Proof of Address", "Mosque Verification"],
    applicationUrl: null,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Building2,
    title: "Business Registration",
    description: "Register new business",
    fullDescription: "Complete business registration services for Muslim entrepreneurs and companies seeking Halal certification. We handle business name registration, commercial permits, tax identification, and Halal compliance certification. Our team guides you through all regulatory requirements.",
    processingTime: "5-7 Days",
    price: "15,000 - 50,000 RWF",
    providedBy: "Business Registration Bureau",
    requirements: ["Business Plan", "ID Documents", "Address Proof", "Category Selection"],
    applicationUrl: null,
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-50",
  },
];
 
const QuickAccess = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<typeof popularServices[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
 
  const handleServiceClick = (service: typeof popularServices[0]) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };
 
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };
 
  const handleApply = () => {
    if (selectedService?.applicationUrl) {
      navigate(selectedService.applicationUrl);
    }
  };
 
  const IconComponent = selectedService?.icon || FileText;
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-4 py-1.5 mb-4">
            <Star className="w-4 h-4 fill-emerald-700" />
            <span className="text-sm font-semibold">Most Requested</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Popular Services
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Quick access to our most requested Islamic services. Click any service to learn more and apply.
          </p>
        </div>
 
        {/* Popular Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => handleServiceClick(service)}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Icon */}
                <div className={`relative w-14 h-14 ${service.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-7 h-7 text-gray-700" />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* Price tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600 font-semibold text-sm">{service.price}</span>
                    <div className="flex items-center gap-1 text-gray-400 group-hover:text-emerald-600 transition-colors">
                      <span className="text-sm font-medium">Details</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
 
        {/* Service Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl">
            {selectedService && (
              <>
                {/* Header */}
                <div className={`p-6 bg-gradient-to-r ${selectedService.color}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold text-white">
                          {selectedService.title}
                        </DialogTitle>
                        <Badge className="mt-1 bg-white/20 text-white border-0">
                          Popular Service
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
 
                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* About Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      About this Service
                    </h3>
                    <DialogDescription className="text-base text-gray-600 leading-relaxed">
                      {selectedService.fullDescription}
                    </DialogDescription>
                  </div>
 
                  {/* Requirements */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Required Documents
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.requirements.map((req, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
 
                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Processing</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {selectedService.processingTime}
                      </p>
                    </div>
 
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">Price</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-700">
                        {selectedService.price}
                      </p>
                    </div>
 
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Provider</span>
                      </div>
                      <p className="text-sm font-bold text-blue-700">
                        {selectedService.providedBy}
                      </p>
                    </div>
                  </div>
 
                  {/* Apply Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <Button 
                      className={`w-full h-12 bg-gradient-to-r ${selectedService.color} hover:opacity-90 text-white font-semibold text-lg rounded-xl`}
                      onClick={handleApply}
                    >
                      Apply Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Click to start your application process
                    </p>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
 
export default QuickAccess;
