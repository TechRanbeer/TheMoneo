import React from 'react';

const FloatingBackground: React.FC = () => {
  // Using the images provided
  const images = [
    "https://i.ibb.co/4wWYdzRT/image.png", 
    "https://i.ibb.co/vvLQz2jH/image.png",
    "https://i.ibb.co/m5CDnD0B/image.png",
    "https://i.ibb.co/qFCBMs3C/image.png"
  ];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-brand-dark/90 z-10"></div>

      {/* Floating Images Container */}
      <div className="absolute inset-0 z-0 opacity-20">
        
        {/* Top Left - Drift */}
        <div className="absolute top-10 left-10 w-64 h-64 animate-drift opacity-60">
           <img src={images[0]} alt="" className="w-full h-full object-contain blur-[2px]" onError={(e) => e.currentTarget.style.display = 'none'} />
        </div>

        {/* Bottom Right - Float Delayed */}
        <div className="absolute bottom-20 right-10 w-80 h-80 animate-float-delayed opacity-50">
           <img src={images[1]} alt="" className="w-full h-full object-contain blur-[1px]" onError={(e) => e.currentTarget.style.display = 'none'} />
        </div>

        {/* Center/Top - Float */}
        <div className="absolute top-1/4 right-1/4 w-48 h-48 animate-float opacity-40">
           <img src={images[2]} alt="" className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
        </div>

        {/* Bottom Left - Drift */}
        <div className="absolute bottom-1/3 left-20 w-56 h-56 animate-drift opacity-50" style={{ animationDuration: '25s' }}>
           <img src={images[3]} alt="" className="w-full h-full object-contain blur-[2px]" onError={(e) => e.currentTarget.style.display = 'none'} />
        </div>

      </div>
    </div>
  );
};

export default FloatingBackground;