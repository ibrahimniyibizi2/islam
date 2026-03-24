import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Award, BookOpen, Mail, Phone, MapPin } from "lucide-react";

const Leadership = () => {
  const leadershipTeam = [
    {
      name: "Sheikh Abdul Karim Niyonzima",
      position: "Executive Director & Chief Imam",
      bio: "With over 20 years of experience in Islamic leadership and community development, Sheikh Abdul Karim leads our organization with wisdom and dedication. He holds a Master's in Islamic Studies from Al-Azhar University.",
      expertise: ["Islamic Jurisprudence", "Community Leadership", "Interfaith Dialogue"],
      email: "director@rwandaislamichub.rw",
      image: "/api/placeholder/200/200"
    },
    {
      name: "Hajja Fatuma Mukantwari",
      position: "Deputy Director - Women's Affairs",
      bio: "Hajja Fatuma has been a champion for women's empowerment in the Muslim community for over 15 years. She specializes in Islamic education and family counseling.",
      expertise: ["Women's Islamic Education", "Family Counseling", "Community Outreach"],
      email: "women@rwandaislamichub.rw",
      image: "/api/placeholder/200/200"
    },
    {
      name: "Alhaji Ibrahim Mugisha",
      position: "Director of Pilgrimage Services",
      bio: "Alhaji Ibrahim has organized over 50 successful Hajj and Umrah trips for Rwandan Muslims. His expertise in logistics and Islamic requirements ensures smooth pilgrimage experiences.",
      expertise: ["Hajj & Umrah Coordination", "Travel Logistics", "Islamic Documentation"],
      email: "pilgrimage@rwandaislamichub.rw",
      image: "/api/placeholder/200/200"
    },
    {
      name: "Ustadh Hassan Nsengiyumva",
      position: "Director of Education & Research",
      bio: "Ustadh Hassan is a renowned Islamic scholar with a PhD in Islamic Studies. He leads our educational programs and ensures all services comply with authentic Islamic principles.",
      expertise: ["Islamic Education", "Research & Development", "Curriculum Design"],
      email: "education@rwandaislamichub.rw",
      image: "/api/placeholder/200/200"
    }
  ];

  const boardMembers = [
    {
      name: "Dr. Amina Uwimana",
      title: "Chairperson - Board of Directors",
      role: "Academic & Research Advisor",
      background: "Professor of Islamic Studies, University of Rwanda"
    },
    {
      name: "Alhaji Musa Tuyishime",
      title: "Vice Chairperson",
      role: "Business & Finance Advisor",
      background: "CEO, Tuyishime Group of Companies"
    },
    {
      name: "Hajja Zawadi Mukamana",
      title: "Board Secretary",
      role: "Legal & Compliance Advisor",
      background: "Senior Lawyer, Kigali Bar Association"
    },
    {
      name: "Sheikh Omar Kayitare",
      title: "Board Member",
      role: "Religious Affairs Advisor",
      background: "Chief Imam, Kigali Central Mosque"
    },
    {
      name: "Mrs. Sada Niyibizi",
      title: "Board Member",
      role: "Community Development Advisor",
      background: "Director, Rwanda Women's Development Initiative"
    },
    {
      name: "Dr. Bilal Kamanzi",
      title: "Board Member",
      role: "Technology & Innovation Advisor",
      background: "CTO, Rwanda Digital Solutions"
    }
  ];

  const advisors = [
    {
      name: "Sheikh Dr. Muhammad Al-Tahir",
      title: "International Islamic Scholar",
      organization: "Al-Azhar University, Cairo",
      expertise: "Islamic Jurisprudence & Comparative Religion"
    },
    {
      name: "Prof. Aisha Hassan",
      title: "Islamic Education Specialist",
      organization: "International Islamic University, Malaysia",
      expertise: "Modern Islamic Pedagogy & Curriculum Development"
    },
    {
      name: "Dr. Omar Abdullahi",
      title: "Digital Transformation Consultant",
      organization: "Islamic Digital Initiative, UAE",
      expertise: "Technology Integration in Islamic Services"
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
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">Leadership Team</CardTitle>
                <p className="text-gray-600">Meet the dedicated individuals leading our mission</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Leadership Introduction */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Leadership Philosophy</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Our leadership team combines deep Islamic knowledge with modern expertise to serve the Muslim community effectively. 
                Each leader brings unique skills and experiences, united by their commitment to Islamic values and community service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Executive Team */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leadershipTeam.map((leader, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-emerald-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{leader.name}</h3>
                      <p className="text-emerald-600 font-medium mb-2">{leader.position}</p>
                      <p className="text-gray-600 text-sm mb-3">{leader.bio}</p>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-800 mb-2">Expertise:</p>
                        <div className="flex flex-wrap gap-2">
                          {leader.expertise.map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{leader.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Board of Directors */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Board of Directors</h2>
            <p className="text-gray-600">Strategic guidance and oversight from respected community leaders</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boardMembers.map((member, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-emerald-600 font-medium">{member.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{member.role}</p>
                      <p className="text-xs text-gray-500 mt-2">{member.background}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* International Advisors */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">International Advisors</h2>
            <p className="text-gray-600">Global expertise and guidance from renowned Islamic scholars</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {advisors.map((advisor, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{advisor.name}</h3>
                  <p className="text-sm text-emerald-600 font-medium mb-1">{advisor.title}</p>
                  <p className="text-sm text-gray-600 mb-2">{advisor.organization}</p>
                  <div className="bg-emerald-50 rounded-lg p-2">
                    <p className="text-xs text-emerald-700">{advisor.expertise}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leadership Values */}
        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Our Leadership Values</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Service</h3>
                <p className="text-sm text-gray-600">Dedicated to serving the Muslim community with humility and commitment</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Knowledge</h3>
                <p className="text-sm text-gray-600">Continuous learning and adherence to authentic Islamic teachings</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Integrity</h3>
                <p className="text-sm text-gray-600">Upholding the highest ethical standards in all leadership decisions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Collaboration</h3>
                <p className="text-sm text-gray-600">Working together to achieve common goals and community objectives</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Leadership */}
        <Card className="border-emerald-200">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Connect With Our Leadership</h2>
            <p className="text-gray-600 mb-6">
              Our leadership team is always open to feedback, suggestions, and collaboration opportunities. 
              Feel free to reach out to any of our leaders directly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900">General Inquiries</p>
                  <p className="text-sm text-gray-600">info@rwandaislamichub.rw</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900">Office Phone</p>
                  <p className="text-sm text-gray-600">+250 788 123 456</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-900">Office Location</p>
                  <p className="text-sm text-gray-600">Kigali, Rwanda</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leadership;
