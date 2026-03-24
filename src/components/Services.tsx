import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, BookOpen, FileText, HandHeart, Building2, Scroll, Plane, Scale } from "lucide-react";
import ServiceDetailModal from "./ServiceDetailModal";

const serviceCategories = [
  {
    icon: Heart,
    title: "Nikah Services",
    description: "Islamic marriage ceremonies and registration",
    fullDescription: "Complete Islamic marriage (Nikah) services including ceremony officiation by certified Imams, marriage contract preparation, legal registration with Rwandan authorities, and official marriage certificate issuance. We provide pre-marital Islamic counseling, dowry guidance, and witness arrangement services. All ceremonies follow authentic Islamic traditions while complying with Rwandan marriage laws.",
    processingTime: "1-2 Days",
    price: "50,000 - 200,000 RWF",
    providedBy: "Supreme Council of Islamic Affairs",
    color: "text-pink-600 bg-pink-50",
  },
  {
    icon: Users,
    title: "Funeral Services",
    description: "Islamic funeral arrangements and Janazah prayers",
    fullDescription: "Comprehensive Islamic funeral services including body washing (Ghusl) according to Islamic rites, Janazah prayer coordination, shroud (Kafan) provision, and burial arrangements. We work with local mosques and cemeteries to ensure dignified Islamic burials. Services include death certificate processing, transportation, and family support during the grieving period.",
    processingTime: "Same Day",
    price: "15,000 - 50,000 RWF",
    providedBy: "Islamic Funeral Services Dept",
    color: "text-gray-600 bg-gray-50",
  },
  {
    icon: BookOpen,
    title: "Islamic Education",
    description: "Quranic studies, Madrasa programs, and certification",
    fullDescription: "Islamic educational services including Quran memorization (Hifz) programs, Islamic studies courses, Arabic language classes, and Islamic teacher certification. We offer both online and in-person Madrasa programs for children and adults. Graduates receive recognized certificates from the Rwanda Muslim Community.",
    processingTime: "Ongoing / 3-12 Months",
    price: "Free - 20,000 RWF",
    providedBy: "Rwanda Muslim Education Board",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: FileText,
    title: "Shahada Certificate",
    description: "Conversion to Islam and certificate issuance",
    fullDescription: "Official services for those converting to Islam including Shahada declaration ceremony, conversion certificate issuance, and integration into the Muslim community. We provide educational materials for new Muslims, assign mentors, and help with name change documentation if desired. All conversions are registered with the Supreme Council.",
    processingTime: "Same Day",
    price: "Free",
    providedBy: "Islamic Affairs Division",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: HandHeart,
    title: "Zakat & Charity",
    description: "Zakat calculation, collection, and distribution",
    fullDescription: "Professional Zakat management services including Zakat calculation assistance, collection, and distribution to eligible recipients. We ensure proper Islamic guidelines are followed in Zakat distribution. Services also include Sadaqah (charitable giving) management, orphan support programs, and community welfare initiatives across Rwanda.",
    processingTime: "1-3 Days",
    price: "2.5% of Eligible Assets",
    providedBy: "Zakat & Waqf Foundation",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Building2,
    title: "Mosque Services",
    description: "Mosque registration, management, and community events",
    fullDescription: "Comprehensive mosque management services including mosque registration with the Supreme Council, Imam appointment and certification, mosque construction permits, and community event coordination. We assist with Jumu'ah prayer arrangements, Eid celebrations, Tarawih prayers during Ramadan, and other religious gatherings.",
    processingTime: "5-10 Days",
    price: "Free - Registration Fees",
    providedBy: "Mosque Development Board",
    color: "text-orange-600 bg-orange-50",
  },
  {
    icon: Scroll,
    title: "Islamic Halal Certification",
    description: "Halal food and business certification",
    fullDescription: "Official Halal certification services for restaurants, food manufacturers, and businesses. Our certification process includes facility inspection, ingredient verification, and ongoing compliance monitoring. Certified businesses receive official Halal certificates and are listed in the national Halal directory.",
    processingTime: "7-14 Days",
    price: "50,000 - 200,000 RWF",
    providedBy: "Halal Certification Authority",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Plane,
    title: "Hajj & Umrah Services",
    description: "Pilgrimage registration and travel arrangements",
    fullDescription: "Complete pilgrimage services including Hajj and Umrah registration with the Supreme Council, travel documentation assistance, vaccination requirements, and travel package coordination. We provide pre-departure orientation on Hajj rituals, Ihram guidance, and connections with authorized travel agencies.",
    processingTime: "1-3 Months",
    price: "Package Dependent",
    providedBy: "Hajj & Umrah Coordination Office",
    color: "text-teal-600 bg-teal-50",
  },
  {
    icon: Scale,
    title: "Islamic Mediation",
    description: "Family and community dispute resolution",
    fullDescription: "Islamic mediation services for family disputes, inheritance matters, and community conflicts. Our trained mediators follow Islamic principles of reconciliation (Sulh) and fairness. Services include marriage counseling, family reconciliation, inheritance distribution guidance according to Shariah, and community conflict resolution.",
    processingTime: "1-4 Weeks",
    price: "Free - 10,000 RWF",
    providedBy: "Islamic Mediation Council",
    color: "text-indigo-600 bg-indigo-50",
  },
];

const Services = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<typeof serviceCategories[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleServiceClick = (service: typeof serviceCategories[0]) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleApply = () => {
    if (selectedService?.title === "Nikah Services") {
      navigate("/nikah-application");
    } else if (selectedService?.title === "Shahada Certificate") {
      navigate("/shahada-application");
    } else if (selectedService?.title === "Hajj & Umrah Services") {
      navigate("/hajj-umrah-application");
    }
    // Add other service routes here as needed
  };
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            Service Categories
          </h2>
          <p className="text-gray-600">
            Browse services by category and apply online
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {serviceCategories.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-emerald-200"
                onClick={() => handleServiceClick(service)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${service.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-emerald-600 hover:text-emerald-700 mt-2 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceClick(service);
                        }}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Service Detail Modal */}
        <ServiceDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onApply={handleApply}
          service={selectedService}
        />
      </div>
    </section>
  );
};

export default Services;
