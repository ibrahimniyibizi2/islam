import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, AlertCircle, CheckCircle, Gavel } from "lucide-react";

const TermsOfService = () => {
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
                <FileText className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">Terms of Service</CardTitle>
                <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Agreement to Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using Rwanda Islamic Hub, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p className="text-gray-600">
                These Terms of Service apply to all users of the service, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Services Provided
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Rwanda Islamic Hub provides the following Islamic services:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Nikah marriage registration and certification</li>
                  <li>Hajj and Umrah pilgrimage applications and coordination</li>
                  <li>Shahada conversion services and documentation</li>
                  <li>Islamic certificate verification</li>
                  <li>Masjid and community services directory</li>
                  <li>Islamic educational resources</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-emerald-600" />
                User Responsibilities
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">As a user of Rwanda Islamic Hub, you agree to:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Provide accurate and truthful information in all applications</li>
                  <li>Use the services for legitimate Islamic purposes only</li>
                  <li>Respect Islamic principles and values in all interactions</li>
                  <li>Not attempt to falsify documents or information</li>
                  <li>Pay any applicable fees for services rendered</li>
                  <li>Respect the privacy and rights of other users</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-emerald-600" />
                Legal Compliance
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  All services provided by Rwanda Islamic Hub comply with:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Rwandan national laws and regulations</li>
                  <li>Islamic Sharia principles and guidelines</li>
                  <li>International standards for Islamic services</li>
                  <li>Data protection and privacy laws</li>
                </ul>
                <p className="text-gray-600">
                  Users must ensure their requests and applications comply with all applicable laws and Islamic principles.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Service Fees and Payments</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Certain services may require payment of fees:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Hajj and Umrah pilgrimage packages</li>
                  <li>Certificate processing and verification</li>
                  <li>Specialized Islamic services</li>
                  <li>Administrative and documentation fees</li>
                </ul>
                <p className="text-gray-600">
                  All fees are clearly communicated before service provision. Refunds are subject to the specific service terms and conditions.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                All content, features, and functionality of Rwanda Islamic Hub are owned by Rwanda Islamic Hub and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
              <p className="text-gray-600">
                You may not use our trademarks, logos, or service marks without our prior written consent.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation.
              </p>
              <p className="text-gray-600">
                Upon termination, your right to use the service will cease immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Limitation of Liability</h2>
              <p className="text-gray-600">
                In no event shall Rwanda Islamic Hub, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Changes to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify or replace these Terms of Service at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700"><strong>Email:</strong> legal@rwandaislamichub.rw</p>
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

export default TermsOfService;
