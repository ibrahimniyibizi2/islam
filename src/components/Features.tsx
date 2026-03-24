import { Shield, Clock, Smartphone, CreditCard, CheckCircle, Globe } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure & Verified",
    description: "All Imams and service providers are thoroughly verified and certified by Islamic authorities."
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Access our platform anytime, anywhere to request services or manage bookings."
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Fully responsive design works seamlessly on all devices - desktop, tablet, and mobile."
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Multiple payment options including MTN Mobile Money and Airtel Money for your convenience."
  },
  {
    icon: CheckCircle,
    title: "Digital Certificates",
    description: "Receive official Islamic certificates with QR code verification and digital signatures."
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Platform available in Kinyarwanda, French, and English for better accessibility."
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">IslamRwanda</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with the highest standards of Islamic principles and modern technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-muted/50 transition-colors group"
            >
              <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center mb-4 shadow-gold group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
