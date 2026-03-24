import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, ArrowLeft, CheckCircle } from "lucide-react";
import HajjUmrahApplicationForm from "@/components/hajj-umrah/HajjUmrahApplicationForm";

const HajjUmrahApplicationPage = () => {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="container mx-auto max-w-md text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Your Hajj/Umrah application has been successfully submitted. Our team will contact you soon with further details.
            </p>
            <Link to="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-4 text-gray-600 hover:text-emerald-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Header Card */}
        <Card className="mb-6 border-teal-200">
          <CardHeader className="bg-teal-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-xl">
                <Plane className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">Hajj & Umrah Application</CardTitle>
                <CardDescription className="text-gray-600">
                  Register for your sacred pilgrimage journey
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Processing Time</p>
                <p className="text-gray-600">1-3 Months</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Package Price</p>
                <p className="text-gray-600">Varies by Selection</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Provided by</p>
                <p className="text-gray-600">Hajj & Umrah Coordination Office</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <HajjUmrahApplicationForm 
          onSuccess={() => setSubmitted(true)}
          onCancel={() => window.history.back()}
        />
      </div>
    </div>
  );
};

export default HajjUmrahApplicationPage;
