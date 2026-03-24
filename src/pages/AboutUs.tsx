import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, Users, Globe, Award, Calendar, Target, Heart, Plane, FileText } from "lucide-react";

const AboutUs = () => {
  const stats = [
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      number: "50,000+",
      label: "Active Users"
    },
    {
      icon: <Award className="w-6 h-6 text-emerald-600" />,
      number: "10,000+",
      label: "Certificates Issued"
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-600" />,
      number: "15+",
      label: "Partner Organizations"
    },
    {
      icon: <Calendar className="w-6 h-6 text-emerald-600" />,
      number: "8+",
      label: "Years of Service"
    }
  ];

  const milestones = [
    {
      year: "2016",
      title: "Foundation",
      description: "Rwanda Islamic Hub was established to serve the Muslim community"
    },
    {
      year: "2018",
      title: "Digital Transformation",
      description: "Launched online platform for certificate verification"
    },
    {
      year: "2020",
      title: "Service Expansion",
      description: "Added Nikah and Hajj/Umrah coordination services"
    },
    {
      year: "2022",
      title: "National Recognition",
      description: "Official partnership with Ministry of Local Government"
    },
    {
      year: "2024",
      title: "Modern Platform",
      description: "Complete digital overhaul with enhanced security and features"
    }
  ];

  const partners = [
    {
      name: "Ministry of Local Government",
      type: "Government",
      description: "Official partnership for Islamic services regulation"
    },
    {
      name: "Rwanda Islamic Council",
      type: "Religious Organization",
      description: "Religious guidance and certification authority"
    },
    {
      name: "Rwanda Development Board",
      type: "Government",
      description: "Support for pilgrimage and tourism services"
    },
    {
      name: "Islamic Relief Rwanda",
      type: "NGO",
      description: "Community development and social services"
    }
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
                <Building className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">About Rwanda Islamic Hub</CardTitle>
                <p className="text-gray-600">Serving the Muslim community with excellence and integrity</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Our Story */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Our Story</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                Rwanda Islamic Hub began as a simple initiative to address the growing needs of the Muslim community in Rwanda. What started as a small office providing basic Islamic documentation has evolved into a comprehensive digital platform serving tens of thousands of Muslims across the country.
              </p>
              <p className="text-gray-600 mb-4">
                Founded in 2016, our organization recognized the need for a centralized, efficient, and trustworthy system for managing Islamic services. From traditional Nikah ceremonies to modern pilgrimage coordination, we've continuously adapted to meet the changing needs of our community while maintaining the highest standards of Islamic practice and Rwandan compliance.
              </p>
              <p className="text-gray-600">
                Today, Rwanda Islamic Hub stands as a beacon of innovation in Islamic services, combining traditional values with modern technology to provide accessible, reliable, and comprehensive support to Muslims throughout Rwanda and beyond.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Our Journey</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-bold">{milestone.year}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* What We Do */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">What We Do</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-emerald-600" />
                  Religious Services
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Nikah marriage registration and certification</li>
                  <li>• Shahada conversion services and guidance</li>
                  <li>• Islamic certificate verification</li>
                  <li>• Religious counseling and support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Plane className="w-5 h-5 text-emerald-600" />
                  Pilgrimage Services
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Hajj pilgrimage coordination</li>
                  <li>• Umrah journey planning</li>
                  <li>• Travel documentation assistance</li>
                  <li>• Group pilgrimage management</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Documentation
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Islamic certificate issuance</li>
                  <li>• Document verification services</li>
                  <li>• Record management and archiving</li>
                  <li>• Legal documentation support</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Community Support
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Islamic education programs</li>
                  <li>• Community event coordination</li>
                  <li>• Youth mentorship initiatives</li>
                  <li>• Social welfare assistance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Values */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Our Values</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Integrity</h3>
                <p className="text-sm text-gray-600">Upholding the highest standards of honesty and ethical conduct in all our operations</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-sm text-gray-600">Serving the Muslim community with compassion and dedication to collective welfare</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Excellence</h3>
                <p className="text-sm text-gray-600">Striving for the highest quality in service delivery and operational standards</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-sm text-gray-600">Embracing technology and modern approaches while preserving Islamic traditions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partners */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Our Partners</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partners.map((partner, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <Building className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {partner.type}
                      </span>
                      <p className="text-sm text-gray-600 mt-2">{partner.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="border-emerald-200">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Join Our Community</h2>
            <p className="text-gray-600 mb-6">
              Become part of our growing community and access all our Islamic services with ease and confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Create Account
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

export default AboutUs;
