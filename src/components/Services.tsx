import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HeartHandshake, 
  Flower2, 
  GraduationCap, 
  FileText, 
  HandHeart, 
  Landmark, 
  Scroll, 
  Plane, 
  Scale,
  Heart,
  Users,
  BookOpen,
  Building2,
  ChevronRight
} from "lucide-react";
import ServiceDetailModal from "./ServiceDetailModal";

const serviceGroups = [
  {
    id: "marriage-family",
    title: "Marriage & Family Services",
    description: "Complete family and matrimonial services",
    icon: Heart,
    color: "text-pink-600 bg-pink-50",
    services: [
      {
        icon: HeartHandshake,
        title: "Nikah Services",
        shortTitle: "Nikah",
        description: "Islamic marriage ceremonies and registration",
        fullDescription: "Complete Islamic marriage (Nikah) services including ceremony officiation by certified Imams, marriage contract preparation, legal registration with Rwandan authorities, and official marriage certificate issuance. We provide pre-marital Islamic counseling, dowry guidance, and witness arrangement services.",
        processingTime: "1-2 Days",
        price: "50,000 - 200,000 RWF",
        providedBy: "Supreme Council of Islamic Affairs",
        color: "text-pink-600 bg-pink-50",
        applicationUrl: "/nikah-application",
      },
      {
        icon: Scale,
        title: "Talaq (Divorce)",
        shortTitle: "Talaq",
        description: "Islamic divorce procedures and counseling",
        fullDescription: "Islamic divorce (Talaq) services including marriage dissolution procedures, reconciliation counseling, mediation between spouses, and documentation of divorce proceedings. We follow proper Islamic guidelines while ensuring legal compliance in Rwanda.",
        processingTime: "2-4 Weeks",
        price: "10,000 - 30,000 RWF",
        providedBy: "Islamic Family Affairs",
        color: "text-red-600 bg-red-50",
        applicationUrl: "/talaq-application",
      },
      {
        icon: Users,
        title: "Marriage Counseling",
        shortTitle: "Counseling",
        description: "Pre and post-marital guidance",
        fullDescription: "Professional Islamic marriage counseling services for couples experiencing difficulties. Our certified counselors provide guidance based on Islamic principles, communication coaching, conflict resolution, and family reconciliation services.",
        processingTime: "Ongoing",
        price: "Free - 5,000 RWF/session",
        providedBy: "Islamic Counseling Center",
        color: "text-rose-600 bg-rose-50",
        applicationUrl: "/marriage-counseling-application",
      },
    ],
  },
  {
    id: "funeral",
    title: "Funeral & Burial Services",
    description: "Respectful Islamic funeral arrangements",
    icon: Flower2,
    color: "text-gray-600 bg-gray-50",
    services: [
      {
        icon: Flower2,
        title: "Janazah Services",
        shortTitle: "Janazah",
        description: "Islamic funeral prayers and arrangements",
        fullDescription: "Complete Islamic funeral services including body washing (Ghusl) according to Islamic rites, Janazah prayer coordination, shroud (Kafan) provision, and burial arrangements. We work with local mosques and cemeteries to ensure dignified Islamic burials.",
        processingTime: "Same Day",
        price: "15,000 - 50,000 RWF",
        providedBy: "Islamic Funeral Services Dept",
        color: "text-gray-600 bg-gray-50",
        applicationUrl: null,
      },
      {
        icon: Scroll,
        title: "Burial Permits",
        shortTitle: "Permits",
        description: "Death certificates and burial authorization",
        fullDescription: "Assistance with death certificate processing, burial permit applications, cemetery coordination, and all legal documentation required for Islamic burial in Rwanda. We handle paperwork with local authorities.",
        processingTime: "1-3 Days",
        price: "5,000 - 15,000 RWF",
        providedBy: "Local Administration",
        color: "text-slate-600 bg-slate-50",
        applicationUrl: null,
      },
    ],
  },
  {
    id: "education",
    title: "Islamic Education & Learning",
    description: "Quranic studies and Islamic knowledge",
    icon: GraduationCap,
    color: "text-blue-600 bg-blue-50",
    services: [
      {
        icon: GraduationCap,
        title: "Quranic Studies",
        shortTitle: "Quran",
        description: "Quran memorization (Hifz) and Tajweed",
        fullDescription: "Quran memorization (Hifz) programs, Tajweed (proper pronunciation) classes, and Quran recitation training. We offer programs for all ages with certified teachers and flexible scheduling.",
        processingTime: "Ongoing / 1-5 Years",
        price: "Free - 15,000 RWF/month",
        providedBy: "Rwanda Muslim Education Board",
        color: "text-blue-600 bg-blue-50",
        applicationUrl: null,
      },
      {
        icon: BookOpen,
        title: "Islamic Madrasa",
        shortTitle: "Madrasa",
        description: "Islamic studies and Arabic language",
        fullDescription: "Comprehensive Islamic studies courses covering Fiqh, Aqeedah, Hadith, Seerah, and Arabic language classes. Programs available for children, youth, and adults with recognized certificates.",
        processingTime: "Ongoing / 3-12 Months",
        price: "Free - 20,000 RWF",
        providedBy: "Rwanda Muslim Education Board",
        color: "text-indigo-600 bg-indigo-50",
        applicationUrl: null,
      },
      {
        icon: FileText,
        title: "Teacher Certification",
        shortTitle: "Certification",
        description: "Islamic educator training and licensing",
        fullDescription: "Professional certification programs for Islamic teachers and Imams. Includes pedagogy training, curriculum development, and official licensing from the Supreme Council of Islamic Affairs.",
        processingTime: "3-6 Months",
        price: "25,000 - 50,000 RWF",
        providedBy: "Islamic Teacher Training Institute",
        color: "text-violet-600 bg-violet-50",
        applicationUrl: null,
      },
    ],
  },
  {
    id: "religious-affairs",
    title: "Religious Affairs & Community",
    description: "Spiritual guidance and community support",
    icon: Landmark,
    color: "text-emerald-600 bg-emerald-50",
    services: [
      {
        icon: FileText,
        title: "Shahada Certificate",
        shortTitle: "Shahada",
        description: "Conversion to Islam and certificate",
        fullDescription: "Official services for those converting to Islam including Shahada declaration ceremony, conversion certificate issuance, and integration into the Muslim community. We provide educational materials and assign mentors to new Muslims.",
        processingTime: "Same Day",
        price: "Free",
        providedBy: "Islamic Affairs Division",
        color: "text-emerald-600 bg-emerald-50",
        applicationUrl: "/shahada-application",
      },
      {
        icon: HandHeart,
        title: "Zakat & Charity",
        shortTitle: "Zakat",
        description: "Zakat calculation and distribution",
        fullDescription: "Professional Zakat management including calculation assistance, collection, and distribution to eligible recipients. Also includes Sadaqah management, orphan support, and community welfare programs.",
        processingTime: "1-3 Days",
        price: "2.5% of Eligible Assets",
        providedBy: "Zakat & Waqf Foundation",
        color: "text-green-600 bg-green-50",
        applicationUrl: null,
      },
      {
        icon: Landmark,
        title: "Mosque Services",
        shortTitle: "Mosque",
        description: "Mosque management and events",
        fullDescription: "Mosque registration, Imam appointment and certification, construction permits, and community event coordination. We assist with Jumu'ah prayers, Eid celebrations, Tarawih prayers, and religious gatherings.",
        processingTime: "5-10 Days",
        price: "Free - Registration Fees",
        providedBy: "Mosque Development Board",
        color: "text-orange-600 bg-orange-50",
        applicationUrl: null,
      },
    ],
  },
  {
    id: "halal",
    title: "Halal Certification",
    description: "Official Halal compliance certification",
    icon: Scroll,
    color: "text-purple-600 bg-purple-50",
    services: [
      {
        icon: Scroll,
        title: "Halal Food Certification",
        shortTitle: "Food",
        description: "Food product Halal verification",
        fullDescription: "Official Halal certification for food manufacturers, restaurants, and food products. Includes facility inspection, ingredient verification, supply chain audit, and ongoing compliance monitoring.",
        processingTime: "7-14 Days",
        price: "50,000 - 200,000 RWF",
        providedBy: "Halal Certification Authority",
        color: "text-purple-600 bg-purple-50",
        applicationUrl: null,
      },
      {
        icon: Building2,
        title: "Business Halal License",
        shortTitle: "Business",
        description: "Commercial Halal compliance",
        fullDescription: "Halal certification for businesses including hotels, cosmetics, pharmaceuticals, and services. Complete audit process and official licensing with national directory listing.",
        processingTime: "10-21 Days",
        price: "100,000 - 500,000 RWF",
        providedBy: "Halal Certification Authority",
        color: "text-fuchsia-600 bg-fuchsia-50",
        applicationUrl: null,
      },
    ],
  },
  {
    id: "pilgrimage",
    title: "Pilgrimage Services",
    description: "Hajj and Umrah arrangements",
    icon: Plane,
    color: "text-teal-600 bg-teal-50",
    services: [
      {
        icon: Plane,
        title: "Hajj Registration",
        shortTitle: "Hajj",
        description: "Annual pilgrimage registration",
        fullDescription: "Complete Hajj registration with the Supreme Council, documentation assistance, vaccination coordination, travel package booking, pre-departure orientation, and on-ground support in Saudi Arabia.",
        processingTime: "3-6 Months",
        price: "Package Dependent",
        providedBy: "Hajj & Umrah Coordination Office",
        color: "text-teal-600 bg-teal-50",
        applicationUrl: "/hajj-umrah-application",
      },
      {
        icon: Plane,
        title: "Umrah Services",
        shortTitle: "Umrah",
        description: "Umrah pilgrimage throughout the year",
        fullDescription: "Year-round Umrah services including visa processing, travel arrangements, accommodation booking, and guidance on Umrah rituals. Flexible packages for individuals and groups.",
        processingTime: "1-3 Months",
        price: "Package Dependent",
        providedBy: "Hajj & Umrah Coordination Office",
        color: "text-cyan-600 bg-cyan-50",
        applicationUrl: "/hajj-umrah-application",
      },
    ],
  },
  {
    id: "legal",
    title: "Islamic Legal Services",
    description: "Mediation and dispute resolution",
    icon: Scale,
    color: "text-indigo-600 bg-indigo-50",
    services: [
      {
        icon: Scale,
        title: "Family Mediation",
        shortTitle: "Mediation",
        description: "Family and marital dispute resolution",
        fullDescription: "Islamic mediation services for family disputes following principles of reconciliation (Sulh). Includes marriage counseling, family reconciliation, and conflict resolution by trained mediators.",
        processingTime: "1-4 Weeks",
        price: "Free - 10,000 RWF",
        providedBy: "Islamic Mediation Council",
        color: "text-indigo-600 bg-indigo-50",
        applicationUrl: null,
      },
      {
        icon: Scroll,
        title: "Inheritance Matters",
        shortTitle: "Inheritance",
        description: "Shariah-compliant estate distribution",
        fullDescription: "Guidance on Islamic inheritance distribution according to Shariah law. We provide calculation services, documentation assistance, and mediation for estate matters.",
        processingTime: "2-6 Weeks",
        price: "5,000 - 25,000 RWF",
        providedBy: "Islamic Legal Affairs",
        color: "text-blue-700 bg-blue-100",
        applicationUrl: null,
      },
    ],
  },
];

const Services = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleServiceClick = (service: any) => {
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

  return (
    <section className="py-6 sm:py-8 md:py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-4 sm:mb-6 px-2 sm:px-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Service Categories
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
            Browse all our Islamic services by category
          </p>
        </div>

        {/* Service Groups - Compact Layout */}
        <div className="space-y-4 sm:space-y-6">
          {serviceGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.id} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-sm border border-gray-100">
                {/* Compact Group Header */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 pb-2 border-b border-gray-100">
                  <div className={`p-2 rounded-lg ${group.color}`}>
                    <GroupIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {group.title}
                    </h3>
                    <p className="text-gray-500 text-xs">
                      {group.description}
                    </p>
                  </div>
                </div>

                {/* Services Grid - More compact */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
                  {group.services.map((service, index) => {
                    const ServiceIcon = service.icon;
                    return (
                      <Card
                        key={index}
                        className="group hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 hover:border-emerald-200 active:scale-[0.98] bg-gray-50/50 hover:bg-white"
                        onClick={() => handleServiceClick(service)}
                      >
                        <CardContent className="p-2.5 sm:p-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md ${service.color} shrink-0`}>
                              <ServiceIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs sm:text-sm text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors">
                                {service.shortTitle || service.title}
                              </h4>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
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
