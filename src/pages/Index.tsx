import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QuickAccess from "@/components/QuickAccess";
import Services from "@/components/Services";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <QuickAccess />
        <Services />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
