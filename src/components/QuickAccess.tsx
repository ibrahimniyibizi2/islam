import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Heart, Home, Building2, ArrowRight, Clock, DollarSign, Users, ArrowRight as ArrowRightIcon } from "lucide-react";
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
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            Popular Services
          </h2>
          <p className="text-gray-600">
            Quick access to most requested services
          </p>
        </div>
 
        {/* Popular Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-lg p-5 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => handleServiceClick(service)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
 
        {/* Service Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden">
            {selectedService && (
              <>
                {/* Header */}
                <div className="p-6 bg-emerald-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-xl">
                        <IconComponent className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                          {selectedService.title}
                        </DialogTitle>
                        <Badge variant="secondary" className="mt-1">
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
                    <ul className="space-y-2">
                      {selectedService.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-600">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
 
                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Processing Time</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedService.processingTime}
                      </p>
                    </div>
 
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">Price</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedService.price}
                      </p>
                    </div>
 
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">Provided by</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {selectedService.providedBy}
                      </p>
                    </div>
                  </div>
 
                  {/* Apply Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <Button 
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg"
                      onClick={handleApply}
                    >
                      Apply Now
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
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
