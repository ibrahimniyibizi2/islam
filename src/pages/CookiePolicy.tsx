import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie, Settings, Shield, Info } from "lucide-react";

const CookiePolicy = () => {
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
                <Cookie className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">Cookie Policy</CardTitle>
                <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">What Are Cookies?</h2>
              <p className="text-gray-600 mb-4">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help the website remember information about your visit, which can make it easier to visit again and make the site more useful to you.
              </p>
              <p className="text-gray-600">
                Rwanda Islamic Hub uses cookies to enhance your experience and to help us understand how our website is being used.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" />
                Types of Cookies We Use
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Essential Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>User authentication and login status</li>
                    <li>Security tokens and session management</li>
                    <li>Application form progress saving</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Performance Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Website analytics and usage statistics</li>
                    <li>Page load performance monitoring</li>
                    <li>Error tracking and reporting</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Functional Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies enable the website to provide enhanced functionality and personalization.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Remembering your preferences</li>
                    <li>Language and region settings</li>
                    <li>Form auto-completion</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Targeting Cookies</h3>
                  <p className="text-gray-600 mb-2">
                    These cookies may be set through our site by our advertising partners to build a profile of your interests.
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Personalized content recommendations</li>
                    <li>Service promotion notifications</li>
                    <li>Community event announcements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                How We Use Cookies
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">We use cookies for the following purposes:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Authentication:</strong> To keep you logged in during your session</li>
                  <li><strong>Security:</strong> To protect against fraud and attacks</li>
                  <li><strong>Preferences:</strong> To remember your settings and choices</li>
                  <li><strong>Analytics:</strong> To understand how our services are used</li>
                  <li><strong>Performance:</strong> To optimize website speed and functionality</li>
                  <li><strong>Communication:</strong> To send important service updates</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-600" />
                Managing Your Cookie Preferences
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  You have several options for managing cookies:
                </p>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Browser Settings</h3>
                    <p className="text-gray-600">
                      Most web browsers allow you to control cookies through their settings. You can:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                      <li>Accept all cookies</li>
                      <li>Reject all cookies</li>
                      <li>Delete existing cookies</li>
                      <li>Set alerts when cookies are sent</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Cookie Consent Banner</h3>
                    <p className="text-gray-600">
                      When you first visit our site, you'll see a cookie consent banner where you can:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                      <li>Accept all cookies</li>
                      <li>Accept only essential cookies</li>
                      <li>Customize your preferences</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website and your ability to use some features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Third-Party Cookies</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  We may use third-party services that set their own cookies on your device:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Analytics Services:</strong> Google Analytics for website usage statistics</li>
                  <li><strong>Payment Processors:</strong> Secure payment processing for service fees</li>
                  <li><strong>Communication Platforms:</strong> SMS and email delivery services</li>
                  <li><strong>Social Media:</strong> Content sharing and community engagement</li>
                </ul>
                <p className="text-gray-600">
                  These third-party services have their own privacy policies and cookie policies, which we encourage you to review.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Cookie Duration</h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Cookies have different lifespans:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until you delete them</li>
                  <li><strong>Authentication Cookies:</strong> Typically valid for your session duration</li>
                  <li><strong>Preference Cookies:</strong> Usually last for 30 days to 1 year</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Updates to This Policy</h2>
              <p className="text-gray-600">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. Any changes will be posted on this page with an updated revision date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about our use of cookies, please contact us:
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

export default CookiePolicy;
