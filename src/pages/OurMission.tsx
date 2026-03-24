import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Heart, Users, Globe, BookOpen, Lightbulb, Award } from "lucide-react";

const OurMission = () => {
  const missionAreas = [
    {
      icon: <Heart className="w-8 h-8 text-emerald-600" />,
      title: "Spiritual Well-being",
      description: "Nurturing the spiritual growth of Muslims through accessible religious services, guidance, and support for all aspects of Islamic life.",
      focus: "Faith development, religious education, spiritual counseling"
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: "Community Unity",
      description: "Building a strong, united Muslim community in Rwanda through collaborative initiatives, events, and support networks.",
      focus: "Community building, social cohesion, mutual support"
    },
    {
      icon: <Globe className="w-8 h-8 text-emerald-600" />,
      title: "Global Connection",
      description: "Connecting Rwandan Muslims to the global Islamic community while preserving local traditions and cultural identity.",
      focus: "International partnerships, pilgrimage services, global outreach"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-emerald-600" />,
      title: "Islamic Education",
      description: "Providing comprehensive Islamic education that combines traditional knowledge with modern understanding and practical application.",
      focus: "Quranic studies, Islamic jurisprudence, Arabic language"
    }
  ];

  const principles = [
    {
      title: "Islamic Principles First",
      description: "All our services and operations are guided by the teachings of the Quran and Sunnah, ensuring authenticity and religious compliance.",
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Accessibility for All",
      description: "We believe every Muslim should have easy access to Islamic services regardless of their location, background, or circumstances.",
      icon: <Globe className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Excellence in Service",
      description: "We strive for the highest standards in everything we do, from documentation accuracy to customer service and operational efficiency.",
      icon: <Award className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Innovation with Tradition",
      description: "We embrace modern technology and methods while preserving and respecting Islamic traditions and cultural heritage.",
      icon: <Lightbulb className="w-6 h-6 text-emerald-600" />
    }
  ];

  const impact = [
    {
      metric: "50,000+",
      description: "Muslims served with digital Islamic services",
      area: "Service Delivery"
    },
    {
      metric: "10,000+",
      description: "Islamic certificates issued and verified",
      area: "Documentation"
    },
    {
      metric: "5,000+",
      description: "Pilgrims assisted for Hajj and Umrah",
      area: "Pilgrimage Support"
    },
    {
      metric: "100+",
      description: "Community events and programs organized",
      area: "Community Engagement"
    }
  ];

  const visionPoints = [
    "To be the leading digital platform for Islamic services in Africa",
    "To serve over 100,000 Muslims with comprehensive digital services by 2026",
    "To establish partnerships with Islamic organizations across East Africa",
    "To develop innovative solutions for modern Islamic challenges",
    "To create a sustainable model for Islamic community development"
  ];

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
                <Target className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">Our Mission & Vision</CardTitle>
                <p className="text-gray-600">Serving the Muslim community with purpose and dedication</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Mission Statement */}
        <Card className="mb-6 border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                To provide accessible, reliable, and comprehensive Islamic services that empower the Muslim community in Rwanda to practice their faith with ease, dignity, and confidence while fostering spiritual growth and community unity.
              </p>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                To become the premier digital hub for Islamic services in Africa, combining traditional Islamic values with modern technology to serve the evolving needs of Muslim communities worldwide.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mission Areas */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mission Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {missionAreas.map((area, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg flex-shrink-0">
                      {area.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{area.title}</h3>
                      <p className="text-gray-600 mb-3">{area.description}</p>
                      <div className="bg-emerald-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-emerald-800">Focus Areas:</p>
                        <p className="text-sm text-emerald-700">{area.focus}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Core Principles */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Our Core Principles</h2>
            <p className="text-gray-600">The foundation of everything we do</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {principles.map((principle, index) => (
                <div key={index} className="flex gap-4">
                  <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                    {principle.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{principle.title}</h3>
                    <p className="text-gray-600">{principle.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vision Points */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Strategic Vision Points</h2>
            <p className="text-gray-600">Our roadmap for the future</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {visionPoints.map((point, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-700">{point}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Impact Metrics */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Our Impact</h2>
            <p className="text-gray-600">Making a difference in the community</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {impact.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{item.metric}</div>
                  <p className="text-gray-700 font-medium mb-1">{item.description}</p>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {item.area}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-emerald-200">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Join Our Mission</h2>
            <p className="text-gray-600 mb-6">
              Be part of our journey to serve the Muslim community with excellence and integrity. Together, we can make a lasting impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Get Involved
                </Button>
              </Link>
              <Link to="/contact-support">
                <Button variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OurMission;
