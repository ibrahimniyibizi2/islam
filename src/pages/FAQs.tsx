import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Users, FileText, Plane, Heart } from "lucide-react";

const FAQs = () => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const faqCategories = [
    {
      title: "General Questions",
      icon: <HelpCircle className="w-5 h-5 text-emerald-600" />,
      questions: [
        {
          q: "What is Rwanda Islamic Hub?",
          a: "Rwanda Islamic Hub is a comprehensive digital platform that provides Islamic services including Nikah marriage registration, Hajj and Umrah pilgrimage coordination, Shahada conversion services, and Islamic certificate verification for the Muslim community in Rwanda."
        },
        {
          q: "Who can use Rwanda Islamic Hub?",
          a: "Our services are available to all Muslims in Rwanda and those seeking Islamic services. Some services may require specific documentation or meet certain criteria as per Islamic and Rwandan regulations."
        },
        {
          q: "Is the platform free to use?",
          a: "Basic services like certificate verification and information access are free. However, some services like Hajj/Umrah packages, Nikah registration, and specialized documentation may involve fees to cover administrative and service costs."
        },
        {
          q: "How do I create an account?",
          a: "Click on the 'Sign Up' button on our homepage, provide your basic information, and verify your email address. Once registered, you can access all our services and track your applications."
        }
      ]
    },
    {
      title: "Nikah Services",
      icon: <Heart className="w-5 h-5 text-emerald-600" />,
      questions: [
        {
          q: "What documents are required for Nikah registration?",
          a: "You'll need: valid identification cards (national ID or passport), birth certificates, passport-sized photos, witness information, and proof of Islamic conversion if applicable. Additional documents may be required based on individual circumstances."
        },
        {
          q: "How long does the Nikah registration process take?",
          a: "Typically 3-7 working days after submission of all required documents. The timeline may vary depending on the completeness of documentation and verification requirements."
        },
        {
          q: "Can non-Muslims use the Nikah service?",
          a: "The Nikah service is specifically for Muslim couples. If one partner is considering conversion, we provide Shahada services and guidance before proceeding with the marriage registration."
        },
        {
          q: "Is the Nikah certificate legally recognized in Rwanda?",
          a: "Yes, our Nikah certificates are recognized by Rwandan authorities and Islamic institutions. We ensure compliance with both Islamic Sharia and Rwandan civil laws."
        }
      ]
    },
    {
      title: "Hajj & Umrah Services",
      icon: <Plane className="w-5 h-5 text-emerald-600" />,
      questions: [
        {
          q: "When should I apply for Hajj/Umrah?",
          a: "For Hajj, applications should be submitted 6-12 months in advance due to high demand and limited quotas. Umrah can be arranged throughout the year, but applying 2-3 months ahead is recommended for better planning and pricing."
        },
        {
          q: "What is included in the pilgrimage packages?",
          a: "Packages typically include: visa processing, flights, accommodation in Makkah/Madinah, transportation, guided tours, and selected meals. Premium packages may include additional services like private guides and special accommodation arrangements."
        },
        {
          q: "Are there health requirements for pilgrimage?",
          a: "Yes, you'll need: COVID-19 vaccination certificate, Yellow Fever vaccination, Meningitis (ACYW135) vaccination, and a basic medical fitness certificate. Additional health requirements may apply based on current regulations."
        },
        {
          q: "Can I apply for family members?",
          a: "Yes, you can include family members in your application. Each member will need to meet the requirements individually. Family packages are available with special pricing for groups."
        }
      ]
    },
    {
      title: "Shahada & Conversion",
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      questions: [
        {
          q: "What is the process for converting to Islam?",
          a: "The process includes: attending counseling sessions, learning basic Islamic principles, reciting the Shahada declaration, receiving your conversion certificate, and getting connected with local Islamic community support."
        },
        {
          q: "How long does the conversion process take?",
          a: "The duration varies based on individual readiness. Typically, it takes 2-4 weeks including counseling and education sessions. We ensure each person has proper understanding before proceeding."
        },
        {
          q: "Do I need to change my name after conversion?",
          a: "While not mandatory, many converts choose to adopt an Islamic name. We can guide you through this process and update your documentation if desired."
        },
        {
          q: "What support is available after conversion?",
          a: "We provide ongoing support including: mentorship programs, Islamic education classes, community integration assistance, and access to Islamic resources and events."
        }
      ]
    },
    {
      title: "Certificates & Documentation",
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
      questions: [
        {
          q: "How do I verify an Islamic certificate?",
          a: "Use our certificate verification tool on the homepage. Enter the certificate number, and we'll instantly verify its authenticity. You can also contact us directly for verification assistance."
        },
        {
          q: "What if I lost my certificate?",
          a: "Contact our support team with your identification details. We can verify your records and issue a replacement certificate for a small administrative fee."
        },
        {
          q: "Are certificates accepted internationally?",
          a: "Yes, our certificates are recognized internationally by Islamic institutions. We ensure compliance with global Islamic documentation standards."
        },
        {
          q: "How secure are the digital certificates?",
          a: "Our certificates use advanced security features including unique QR codes, digital signatures, and blockchain verification to prevent forgery and ensure authenticity."
        }
      ]
    }
  ];

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
                <HelpCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">Frequently Asked Questions</CardTitle>
                <p className="text-gray-600">Find answers to common questions about our services</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader className="bg-gray-50">
                <div className="flex items-center gap-3">
                  {category.icon}
                  <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex;
                    const isExpanded = expandedItems.has(globalIndex);
                    
                    return (
                      <div key={faqIndex} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleExpanded(globalIndex)}
                          className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">{faq.q}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-3 pt-0">
                            <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Still Have Questions?</h2>
            <p className="text-gray-600 mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact-support">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Contact Support
                </Button>
              </Link>
              <Link to="/user-guides">
                <Button variant="outline">
                  View User Guides
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQs;
