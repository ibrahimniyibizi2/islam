import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Users, ArrowRight } from "lucide-react";

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  service: {
    icon: any;
    title: string;
    fullDescription: string;
    processingTime: string;
    price: string;
    providedBy: string;
    color: string;
  } | null;
}

const ServiceDetailModal = ({ isOpen, onClose, onApply, service }: ServiceDetailModalProps) => {
  if (!service) return null;

  const IconComponent = service.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95%] sm:w-full p-0 overflow-hidden rounded-2xl max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>{service.title}</DialogTitle>
          <DialogDescription>{service.fullDescription}</DialogDescription>
        </VisuallyHidden>
        {/* Header */}
        <div className={`p-4 sm:p-6 ${service.color.includes('emerald') ? 'bg-emerald-50' : service.color.includes('pink') ? 'bg-pink-50' : service.color.includes('gray') ? 'bg-gray-50' : service.color.includes('blue') ? 'bg-blue-50' : service.color.includes('green') ? 'bg-green-50' : service.color.includes('orange') ? 'bg-orange-50' : service.color.includes('purple') ? 'bg-purple-50' : service.color.includes('teal') ? 'bg-teal-50' : 'bg-indigo-50'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-2.5 sm:p-3 ${service.color.includes('emerald') ? 'bg-emerald-100' : service.color.includes('pink') ? 'bg-pink-100' : service.color.includes('gray') ? 'bg-gray-100' : service.color.includes('blue') ? 'bg-blue-100' : service.color.includes('green') ? 'bg-green-100' : service.color.includes('orange') ? 'bg-orange-100' : service.color.includes('purple') ? 'bg-purple-100' : service.color.includes('teal') ? 'bg-teal-100' : 'bg-indigo-100'} rounded-xl shrink-0`}>
                <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${service.color.split(' ')[0].replace('text-', '')}`} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {service.title}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* About Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              About this Service
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {service.fullDescription}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">Processing Time</span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {service.processingTime}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">Price</span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {service.price}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">Provided by</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {service.providedBy}
              </p>
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-3 sm:pt-4 border-t border-gray-200">
            <Button 
              className="w-full h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base sm:text-lg rounded-xl"
              onClick={onApply}
            >
              Apply Now
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
            <p className="text-center text-xs sm:text-sm text-gray-500 mt-2">
              Click to start your application process
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailModal;
