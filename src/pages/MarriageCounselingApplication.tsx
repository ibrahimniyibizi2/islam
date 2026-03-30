import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarriageCounselingForm from "@/components/counseling/MarriageCounselingForm";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const MarriageCounselingApplication = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast({
      title: "Application Submitted",
      description: "Your Marriage Counseling application has been submitted. A counselor will contact you within 48 hours.",
    });
    navigate("/dashboard/user/track");
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Marriage Counseling Application
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Complete the form below to request marriage counseling services. 
              Our qualified Islamic counselors are here to help strengthen your marriage.
            </p>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
            <MarriageCounselingForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-6">
            <h3 className="font-semibold text-emerald-900 mb-2">Need Help?</h3>
            <p className="text-sm text-emerald-800 mb-3">
              If you need assistance with your application or have questions about our counseling services, 
              please contact our Family Affairs department.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 text-sm text-emerald-800">
              <span className="flex items-center gap-1">
                <span className="font-medium">Phone:</span> +250 788 123 456
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Email:</span> family.affairs@ric.gov.rw
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MarriageCounselingApplication;
