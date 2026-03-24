import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Heart, Plane, Users, FileText, Download, Video, ChevronRight } from "lucide-react";

const UserGuides = () => {
  const guides = [
    {
      title: "Getting Started",
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      description: "Learn how to create your account and navigate the platform",
      topics: [
        "Account Registration",
        "Dashboard Overview",
        "Profile Setup",
        "Security Settings"
      ],
      difficulty: "Beginner",
      duration: "15 minutes"
    },
    {
      title: "Nikah Application Guide",
      icon: <Heart className="w-6 h-6 text-emerald-600" />,
      description: "Complete guide to applying for Islamic marriage registration",
      topics: [
        "Required Documents",
        "Application Process",
        "Witness Requirements",
        "Certificate Collection"
      ],
      difficulty: "Intermediate",
      duration: "20 minutes"
    },
    {
      title: "Hajj & Umrah Planning",
      icon: <Plane className="w-6 h-6 text-emerald-600" />,
      description: "Everything you need to know about pilgrimage applications",
      topics: [
        "Package Selection",
        "Health Requirements",
        "Visa Processing",
        "Travel Preparation"
      ],
      difficulty: "Intermediate",
      duration: "25 minutes"
    },
    {
      title: "Shahada Conversion Process",
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      description: "Step-by-step guide for those interested in converting to Islam",
      topics: [
        "Preparation Phase",
        "Learning Requirements",
        "Shahada Declaration",
        "Post-Conversion Support"
      ],
      difficulty: "Beginner",
      duration: "30 minutes"
    },
    {
      title: "Certificate Verification",
      icon: <FileText className="w-6 h-6 text-emerald-600" />,
      description: "How to verify and manage Islamic certificates",
      topics: [
        "Verification Process",
        "Digital Certificate Features",
        "Replacement Requests",
        "International Recognition"
      ],
      difficulty: "Beginner",
      duration: "10 minutes"
    }
  ];

  const resources = [
    {
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      icon: <Video className="w-5 h-5 text-blue-600" />,
      items: [
        "Account Setup Tutorial",
        "Nikah Application Walkthrough",
        "Hajj Package Selection Guide",
        "Certificate Verification Demo"
      ]
    },
    {
      title: "Downloadable PDFs",
      description: "Print-friendly guides and checklists",
      icon: <Download className="w-5 h-5 text-red-600" />,
      items: [
        "Document Requirements Checklist",
        "Hajj Preparation Guide",
        "Nikah Application Form",
        "Conversion Process Overview"
      ]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
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
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">User Guides</CardTitle>
                <p className="text-gray-600">Comprehensive guides to help you make the most of our services</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Start */}
        <Card className="mb-6">
          <CardHeader className="bg-blue-50">
            <h2 className="text-xl font-semibold text-gray-900">Quick Start Guide</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Create Account</h3>
                <p className="text-sm text-gray-600">Register with your email and verify</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Complete Profile</h3>
                <p className="text-sm text-gray-600">Add your personal information</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Choose Service</h3>
                <p className="text-sm text-gray-600">Select the service you need</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Submit Application</h3>
                <p className="text-sm text-gray-600">Complete and submit your request</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Guides */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Detailed Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      {guide.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{guide.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{guide.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {guide.duration}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {guide.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <ChevronRight className="w-4 h-4 text-emerald-600" />
                        {topic}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    View Guide
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {resources.map((resource, index) => (
            <Card key={index}>
              <CardHeader className="bg-gray-50">
                <div className="flex items-center gap-3">
                  {resource.icon}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {resource.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-700">{item}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Need Additional Help?</h2>
            <p className="text-gray-600 mb-4">
              Our support team is available to assist you with any questions or issues you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact-support">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Contact Support
                </Button>
              </Link>
              <Link to="/faqs">
                <Button variant="outline">
                  Browse FAQs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserGuides;
