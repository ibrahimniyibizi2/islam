import { useState } from 'react';
import { FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrackApplicationModal } from './TrackApplicationModal';

export function TrackApplicationCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-2xl flex justify-between items-center text-white cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Track Your Applications</h3>
            <p className="text-sm text-white/90">
              Sign in to track your application status
            </p>
          </div>
        </div>

        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/20 group-hover:translate-x-1 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
        >
          Sign In
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <TrackApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
