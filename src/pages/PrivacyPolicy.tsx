import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Database, UserCheck } from "lucide-react";

const PrivacyPolicy = () => {
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

        {/* Header */}
        <Card className="mb-6 border-emerald-200">
          <CardHeader className="bg-emerald-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">Privacy Policy</CardTitle>
                <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Introduction</h2>
              <p className="text-gray-600 mb-4">
                Rwanda Islamic Hub is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.
              </p>
              <p className="text-gray-600">
                By using Rwanda Islamic Hub, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Full name and contact details</li>
                    <li>Email address and phone number</li>
                    <li>Passport information for pilgrimage applications</li>
                    <li>Emergency contact information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Service-Specific Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Nikah marriage application details</li>
                    <li>Hajj and Umrah pilgrimage applications</li>
                    <li>Shahada conversion requests</li>
                    <li>Health and vaccination records</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Technical Information</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                How We Use Your Information
              </h2>
              <div className="space-y-3">
                <p className="text-gray-600">We use your information to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Process and manage your applications for Islamic services</li>
                  <li>Communicate with you regarding your applications</li>
                  <li>Provide customer support and assistance</li>
                  <li>Improve our services and user experience</li>
                  <li>Ensure compliance with Islamic and legal requirements</li>
                  <li>Send important notifications and updates</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Data Protection and Security
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  We implement appropriate security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Secure servers and encryption protocols</li>
                  <li>Restricted access to personal data</li>
                  <li>Regular security audits and updates</li>
                  <li>Compliance with data protection regulations</li>
                </ul>
                <p className="text-gray-600">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Rights</h2>
              <p className="text-gray-600 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700"><strong>Email:</strong> privacy@rwandaislamichub.rw</p>
                <p className="text-gray-700"><strong>Phone:</strong> +250 788 123 456</p>
                <p className="text-gray-700"><strong>Address:</strong> Kigali, Rwanda</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
