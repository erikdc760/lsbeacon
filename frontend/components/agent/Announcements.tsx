
import React, { useState } from 'react';
import { UserRole } from '../../types';

interface AnnouncementsProps {
  role: UserRole;
}

interface Slide {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  link?: string;
  background?: string;
}

const Announcements: React.FC<AnnouncementsProps> = ({ role }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      title: 'Monthly Sales Contest - New Rewards!',
      content: 'We are introducing new rewards for the top 5 agents this month. The grand prize is a corporate trip to Vegas! Keep dialing and hitting those goals.',
      background: 'https://images.unsplash.com/photo-1547032175-7fc8c7bd15b3?auto=format&fit=crop&q=80&w=2070',
      link: 'https://example.com/contest-details'
    },
    {
      id: '2',
      title: 'Platform Maintenance Schedule',
      content: 'Beacon will be undergoing brief maintenance this Sunday from 2 AM to 4 AM EST. Dialer services will be offline during this period.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
      background: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070'
    },
    {
      id: '3',
      title: 'New Lead Batch Available',
      content: 'A fresh batch of Facebook leads has been distributed to the Pain Tracker. Team leads, please review your team assignment flows.',
      background: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2015'
    }
  ]);

  const canEdit = role === UserRole.COMPANY_OWNER || role === UserRole.SUPER_ADMIN;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn font-display">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 gap-2">
        <div>
          <h1 className="text-lg lg:text-xl font-black text-white uppercase tracking-tighter">Announcements</h1>
          <p className="text-zinc-500 text-[8px] lg:text-[9px] uppercase tracking-[0.2em] mt-0.5">Strategic Briefing & Field Updates</p>
        </div>
        {canEdit && (
          <button className="bg-[#D4AF37] text-black text-[9px] uppercase font-black tracking-widest px-4 py-2 hover:bg-white transition-colors">
            Edit Slides
          </button>
        )}
      </div>

      <div className="relative aspect-video w-full max-h-[400px] bg-zinc-950 border border-zinc-900 overflow-hidden shadow-2xl">
        {/* Navigation Buttons */}
        <button 
          onClick={prevSlide}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-1.5 lg:p-2 bg-black/50 hover:bg-[#D4AF37] text-white hover:text-black transition-all border border-white/10 hover:border-[#D4AF37]"
          aria-label="Previous Slide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-1.5 lg:p-2 bg-black/50 hover:bg-[#D4AF37] text-white hover:text-black transition-all border border-white/10 hover:border-[#D4AF37]"
          aria-label="Next Slide"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        {/* Background Image/Overlay */}
        <div className="absolute inset-0 z-0">
          {slides[currentSlide].background ? (
            <img 
              src={slides[currentSlide].background} 
              className="w-full h-full object-cover opacity-30 grayscale"
              alt="Background"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900 opacity-30"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        {/* Slide Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 lg:p-12 text-center">
          <div className="max-w-2xl w-full">
            <h2 className="text-2xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-6 drop-shadow-2xl">
              {slides[currentSlide].title}
            </h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mb-8 shadow-[0_0_15px_#D4AF37]"></div>
            
            {slides[currentSlide].videoUrl ? (
              <div className="aspect-video w-full max-w-2xl mx-auto mb-8 bg-black border border-zinc-800">
                <iframe 
                  src={slides[currentSlide].videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <p className="text-zinc-300 text-sm lg:text-lg leading-relaxed mb-8 drop-shadow-lg">
                {slides[currentSlide].content}
              </p>
            )}

            {slides[currentSlide].link && (
              <a 
                href={slides[currentSlide].link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-black text-[10px] font-black uppercase tracking-widest px-8 py-3 hover:bg-[#D4AF37] transition-all"
              >
                Learn More
              </a>
            )}
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1 transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-zinc-700'}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
