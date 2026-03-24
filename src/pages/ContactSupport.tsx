import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle } from "lucide-react";

const ContactSupport = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    priority: "medium"
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const contactMethods = [
    {
      icon: <Phone className="w-5 h-5 text-emerald-600" />,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      contact: "+250 788 123 456",
      hours: "Mon-Fri: 8:00 AM - 6:00 PM",
      available: "Available now"
    },
    {
      icon: <Mail className="w-5 h-5 text-emerald-600" />,
      title: "Email Support",
      description: "Send us an email for detailed inquiries",
      contact: "support@rwandaislamichub.rw",
      hours: "Response within 24 hours",
      available: "Available 24/7"
    },
    {
      icon: <MapPin className="w-5 h-5 text-emerald-600" />,
      title: "Office Visit",
      description: "Visit our office for in-person support",
      contact: "Kigali, Rwanda - KN 123 St",
      hours: "Mon-Fri: 9:00 AM - 5:00 PM",
      available: "By appointment"
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
      title: "Live Chat",
      description: "Chat with our support team online",
      contact: "Available on website",
      hours: "Mon-Sat: 9:00 AM - 8:00 PM",
      available: "Available now"
    }
  ];

  const commonIssues = [
    {
      title: "Application Status",
      description: "Check the status of your submitted applications",
      link: "/dashboard"
    },
    {
      title: "Document Upload",
      description: "Help with uploading required documents",
      link: "/user-guides"
    },
    {
      title: "Payment Issues",
      description: "Assistance with payment processing",
      link: "/faqs"
    },
    {
      title: "Account Problems",
      description: "Login, registration, and profile issues",
      link: "/faqs"
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
                <MessageSquare className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900">Contact Support</CardTitle>
                <p className="text-gray-600">We're here to help you with any questions or concerns</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Methods */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Methods</h2>
            {contactMethods.map((method, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{method.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                      <p className="text-sm font-medium text-gray-800">{method.contact}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{method.hours}</span>
                      </div>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                        method.available === "Available now" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {method.available}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Send us a Message</h2>
                <p className="text-gray-600">Fill out the form below and we'll get back to you soon</p>
              </CardHeader>
              <CardContent className="pt-6">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600">We'll respond to your inquiry within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="nikah">Nikah Services</SelectItem>
                          <SelectItem value="hajj-umrah">Hajj & Umrah</SelectItem>
                          <SelectItem value="shahada">Shahada Conversion</SelectItem>
                          <SelectItem value="certificates">Certificate Issues</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="billing">Payment & Billing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Describe your issue or question in detail..."
                        className="min-h-[120px]"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Common Issues */}
            <Card className="mt-6">
              <CardHeader className="bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-900">Common Issues</h2>
                <p className="text-gray-600">Quick solutions to frequently asked questions</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {commonIssues.map((issue, index) => (
                    <Link key={index} to={issue.link}>
                      <div className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                        <h3 className="font-semibold text-gray-900 mb-1">{issue.title}</h3>
                        <p className="text-sm text-gray-600">{issue.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Emergency Support */}
        <Card className="mt-6 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-red-800">Emergency Support</h2>
            </div>
            <p className="text-gray-700 mb-3">
              For urgent matters requiring immediate attention, please call our emergency hotline:
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-semibold text-lg">+250 788 999 999</p>
              <p className="text-red-600 text-sm mt-1">Available 24/7 for emergencies only</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactSupport;
