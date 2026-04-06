import { useState, useMemo } from "react";

const KwibukaBanner = () => {
  // Check if current date is between April 7 and April 14 (inclusive)
  const shouldShowBanner = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11, April is 3
    const currentDay = today.getDate(); // 1-31
    
    // April is month 3 (0-indexed), check if day is between 7 and 14
    return currentMonth === 3 && currentDay >= 7 && currentDay <= 14;
  }, []);

  const [isVisible, setIsVisible] = useState(true);

  // Don't show banner outside of April 7-14
  if (!shouldShowBanner || !isVisible) return null;

  return (
    <div className="relative w-full">
      <a 
        href="https://www.kwibuka.rw" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full"
      >
        <img 
          src="https://olpvftgnmycofavltxoa.supabase.co/storage/v1/object/public/kwibuka/kwibuka/KWIBUKA-GOODAV.png" 
          alt="Kwibuka - We remember the 1994 Genocide against the Tutsi in Rwanda"
          className="w-full h-auto max-h-32 sm:max-h-40 md:max-h-48 object-cover"
        />
      </a>
      <div className="bg-slate-900 text-white py-2 px-4 text-center">
        <p className="text-sm md:text-base font-medium">
          <span className="font-bold">Kwibuka</span> — We remember the 1994 Genocide against the Tutsi in Rwanda.
          <a 
            href="https://www.kwibuka.rw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-orange-300 ml-1"
          >
            Learn more
          </a>
        </p>
      </div>
    </div>
  );
};

export default KwibukaBanner;
