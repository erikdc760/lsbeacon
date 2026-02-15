
import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { apiFetch } from '../../api/client';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editSlide, setEditSlide] = useState<Slide | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await apiFetch('/api/owner/announcements');
      if (Array.isArray(data) && data.length > 0) {
        // Map backend snake_case to frontend camelCase if necessary, assuming backend returns matching fields or handled in controller
        setSlides(data.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          videoUrl: item.video_url || item.videoUrl,
          link: item.link,
          background: item.background
        })));
      } else {
        // Fallback default
        setSlides([
            {
              id: '1',
              title: 'Monthly Sales Contest - New Rewards!',
              content: 'We are introducing new rewards for the top 5 agents this month. The grand prize is a corporate trip to Vegas! Keep dialing and hitting those goals.',
              background: 'https://images.unsplash.com/photo-1547032175-7fc8c7bd15b3?auto=format&fit=crop&q=80&w=2070',
              link: 'https://example.com/contest-details'
            }
        ]);
      }
    } catch (error) {
       console.error("Failed to fetch announcements", error);
    } finally {
       setLoading(false);
    }
  };

  const canEdit = role === UserRole.COMPANY_OWNER || role === UserRole.SUPER_ADMIN;

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleEdit = () => {
    if (slides[currentSlide]) {
        setEditSlide({ ...slides[currentSlide] });
        setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (editSlide) {
      try {
        const updatedSlide = await apiFetch(`/api/owner/announcements/${editSlide.id}`, {
          method: 'PUT',
          body: JSON.stringify(editSlide)
        });
        
        const newSlides = [...slides];
        // Update local state with returned data
        const index = newSlides.findIndex(s => s.id === editSlide.id);
        if (index !== -1) {
            newSlides[index] = {
                id: updatedSlide.id,
                title: updatedSlide.title,
                content: updatedSlide.content,
                videoUrl: updatedSlide.video_url || updatedSlide.videoUrl,
                link: updatedSlide.link,
                background: updatedSlide.background
            };
            setSlides(newSlides);
        }
        setIsEditing(false);
        setEditSlide(null);
      } catch (error) {
        console.error("Failed to save announcement", error);
      }
    }
  };

  const handleAddSlide = async () => {
    const newSlideData = {
      title: 'New Strategic Slide',
      content: 'Enter field intelligence here...',
      background: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072'
    };
    
    try {
        const addedSlide = await apiFetch('/api/owner/announcements', {
            method: 'POST',
            body: JSON.stringify(newSlideData)
        });
        
        const newSlide: Slide = {
          id: addedSlide.id,
          title: addedSlide.title,
          content: addedSlide.content,
          videoUrl: addedSlide.video_url || addedSlide.videoUrl,
          link: addedSlide.link,
          background: addedSlide.background
        };
        setSlides(prev => [...prev, newSlide]);
        setCurrentSlide(slides.length); // point to new slide
    } catch (error) {
        console.error("Failed to add announcement", error);
    }
  };

  if (loading) return <div className="p-8 text-zinc-500 uppercase tracking-widest text-[10px] animate-pulse">Initializing Strategic Briefing...</div>;

  if (slides.length === 0) {
    return (
      <div className="p-12 border border-zinc-900 bg-zinc-950 text-center">
        <p className="text-zinc-500 uppercase tracking-widest text-xs">No active announcements discovered.</p>
        {canEdit && (
          <button 
            onClick={handleAddSlide}
            className="mt-4 bg-[#D4AF37] text-black text-[10px] uppercase font-black tracking-widest px-6 py-3 hover:bg-white transition-colors"
          >
            Create Initial Briefing
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn font-display">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-10 gap-4">
        <div>
          <h1 className="text-xl lg:text-3xl font-black text-white uppercase tracking-tighter">Announcements</h1>
          <p className="text-zinc-500 text-[10px] lg:text-xs uppercase tracking-[0.2em] mt-1">Strategic Briefing & Field Updates</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button 
              onClick={handleAddSlide}
              className="bg-zinc-900 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] uppercase font-black tracking-widest px-6 py-3 hover:bg-[#D4AF37] hover:text-black transition-all"
            >
              Add Slide
            </button>
            <button 
              onClick={handleEdit}
              className="bg-[#D4AF37] text-black text-[10px] uppercase font-black tracking-widest px-6 py-3 hover:bg-white transition-colors"
            >
              Edit Current
            </button>
          </div>
        )}
      </div>

      <div className="relative aspect-video w-full bg-zinc-950 border border-zinc-900 overflow-hidden shadow-2xl">
        {/* Navigation Buttons */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 lg:p-4 bg-black/50 hover:bg-[#D4AF37] text-white hover:text-black transition-all border border-white/10 hover:border-[#D4AF37]"
          aria-label="Previous Slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 lg:p-4 bg-black/50 hover:bg-[#D4AF37] text-white hover:text-black transition-all border border-white/10 hover:border-[#D4AF37]"
          aria-label="Next Slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
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
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 lg:p-16 text-center">
          <div className="max-w-3xl w-full">
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

        {/* Editor Modal/Overlay */}
        {isEditing && editSlide && (
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl p-8 lg:p-12 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-black text-[#D4AF37] uppercase tracking-widest mb-8">Edit Strategic Intelligence</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Slide Title</label>
                  <input 
                    className="w-full bg-zinc-900 border border-zinc-800 text-white p-4 uppercase font-black text-sm tracking-widest outline-none focus:border-[#D4AF37]/50"
                    value={editSlide.title}
                    onChange={(e) => setEditSlide({ ...editSlide, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Intelligence Briefing (Content)</label>
                  <textarea 
                    className="w-full bg-zinc-900 border border-zinc-900 text-zinc-300 p-4 text-sm leading-relaxed outline-none focus:border-[#D4AF37]/50 min-h-[150px]"
                    value={editSlide.content}
                    onChange={(e) => setEditSlide({ ...editSlide, content: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Video Embed URL</label>
                    <input 
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 p-4 text-xs outline-none focus:border-[#D4AF37]/50"
                      placeholder="https://www.youtube.com/embed/..."
                      value={editSlide.videoUrl || ''}
                      onChange={(e) => setEditSlide({ ...editSlide, videoUrl: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Background Image URL</label>
                    <input 
                      className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 p-4 text-xs outline-none focus:border-[#D4AF37]/50"
                      placeholder="https://images.unsplash.com/..."
                      value={editSlide.background || ''}
                      onChange={(e) => setEditSlide({ ...editSlide, background: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Strategic Link (Optional)</label>
                  <input 
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 p-4 text-xs outline-none focus:border-[#D4AF37]/50"
                    value={editSlide.link || ''}
                    onChange={(e) => setEditSlide({ ...editSlide, link: e.target.value })}
                  />
                </div>
                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-[#D4AF37] text-black font-black text-[10px] uppercase tracking-widest py-4 hover:bg-white transition-all"
                  >
                    Authorize Changes
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-zinc-800 text-white font-black text-[10px] uppercase tracking-widest py-4 hover:bg-zinc-700 transition-all"
                  >
                    Abort Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
