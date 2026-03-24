import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QuickAccess from "@/components/QuickAccess";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Index = () => {
  const [showNotification, setShowNotification] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      {showNotification && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 text-sm">
                  🚧 System Under Construction
                </p>
                <p className="text-amber-700 text-xs">
                  This platform is currently in testing phase. Some features may not work properly.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-amber-600 hover:text-amber-800 p-1 rounded-full hover:bg-amber-100 transition-colors"
              aria-label="Close notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
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
