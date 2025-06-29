import React, { useState, useEffect, useMemo } from 'react';

interface CatLoaderProps {
  onLoadComplete: () => void;
}

export const CatLoader: React.FC<CatLoaderProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentCat, setCurrentCat] = useState(0);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  const cats = ['🐱', '😸', '😺', '😻', '🙀', '😹', '😾', '😿', '🐈', '🐈‍⬛'];
  const loadingTexts = [
    'Preparando helados mágicos...',
    'Cargando gatitos felices...',
    'Organizando inventario premium...',
    'Calculando ganancias épicas...',
    'Activando superpoderes felinos...',
    'Calibrando máquina de helados...',
    'Consultando con los gatitos expertos...',
    'Mezclando ingredientes secretos...',
    'Preparando tu experiencia única...',
    '¡Ya casi está todo listo!'
  ];

  // Fixed floating elements to prevent hydration mismatch
  const floatingElements = useMemo(() => [
    { emoji: '🍦', top: 15, left: 10, delay: 0, duration: 4 },
    { emoji: '🎈', top: 25, left: 85, delay: 1, duration: 5 },
    { emoji: '✨', top: 45, left: 5, delay: 2, duration: 3 },
    { emoji: '🌟', top: 65, left: 90, delay: 0.5, duration: 4.5 },
    { emoji: '🎊', top: 75, left: 15, delay: 1.5, duration: 3.5 },
    { emoji: '🎉', top: 35, left: 75, delay: 2.5, duration: 4 },
    { emoji: '💖', top: 55, left: 80, delay: 3, duration: 3 },
    { emoji: '🐾', top: 85, left: 25, delay: 3.5, duration: 5 },
    { emoji: '⭐', top: 20, left: 60, delay: 1.2, duration: 4.2 },
    { emoji: '🌈', top: 70, left: 65, delay: 2.8, duration: 3.8 }
  ], []);

  // Fixed particles to prevent hydration mismatch
  const particles = useMemo(() => 
    Array.from({ length: 15 }, (_, index) => ({
      id: index,
      top: (index * 7 + 10) % 90,
      left: (index * 11 + 5) % 95,
      delay: (index * 0.3) % 3,
      duration: 2 + (index % 3)
    })), []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(onLoadComplete, 1000);
          return 100;
        }
        return prev + 1.2;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onLoadComplete, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const catInterval = setInterval(() => {
      setCurrentCat(prev => (prev + 1) % cats.length);
    }, 500);

    return () => clearInterval(catInterval);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const textInterval = setInterval(() => {
      setLoadingTextIndex(prev => (prev + 1) % loadingTexts.length);
    }, 1500);

    return () => clearInterval(textInterval);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600">
        <div className="text-6xl sm:text-8xl animate-pulse">🐱</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Multi-layered animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-pink-400/30 via-purple-500/30 to-blue-500/30 animate-gradient-shift-reverse"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-400/20 via-pink-600/20 to-purple-500/20 animate-gradient-shift-slow"></div>
        
        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-white/5 to-black/10"></div>
      </div>

      {/* Floating background elements */}
      <div className="absolute inset-0">
        {floatingElements.map((element, index) => (
          <div
            key={index}
            className="absolute text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-20 sm:opacity-25 animate-float-complex filter drop-shadow-lg"
            style={{
              top: `${element.top}%`,
              left: `${element.left}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: `${element.duration}s`
            }}
          >
            {element.emoji}
          </div>
        ))}
        
        {/* Enhanced particle system */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 md:w-2 md:h-2 bg-white/40 rounded-full animate-twinkle-complex shadow-lg"
            style={{
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}

        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-2 border-white/20 rounded-full animate-spin-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 border-2 border-white/30 rotate-45 animate-pulse-slow"></div>
        <div className="absolute top-1/2 right-1/3 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-white/20 rounded-full animate-bounce-slow"></div>
      </div>

      {/* Main content - Optimized for desktop visibility */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 py-4 sm:py-8 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen">
        {/* Main cat with spectacular animations - Reduced desktop sizes */}
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="relative inline-block">
            {/* Main cat with enhanced effects - Better sizing for desktop */}
            <div 
              className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[8rem] transition-all duration-700 ${
                isComplete 
                  ? 'animate-completion-celebration scale-125 sm:scale-150' 
                  : 'animate-cat-morph'
              }`}
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.2))',
                textShadow: '0 0 30px rgba(255, 255, 255, 0.5)'
              }}
            >
              {cats[currentCat]}
            </div>
            
            {/* Orbiting magical elements - Adjusted for smaller cat */}
            <div className="absolute inset-0 animate-orbit">
              <div className="absolute -top-3 sm:-top-4 md:-top-6 lg:-top-8 left-1/2 transform -translate-x-1/2 text-lg sm:text-xl md:text-2xl lg:text-3xl animate-sparkle">✨</div>
              <div className="absolute top-1/2 -right-3 sm:-right-4 md:-right-6 lg:-right-8 transform -translate-y-1/2 text-base sm:text-lg md:text-xl lg:text-2xl animate-sparkle" style={{ animationDelay: '0.5s' }}>⭐</div>
              <div className="absolute -bottom-3 sm:-bottom-4 md:-bottom-6 lg:-bottom-8 left-1/2 transform -translate-x-1/2 text-lg sm:text-xl md:text-2xl lg:text-3xl animate-sparkle" style={{ animationDelay: '1s' }}>💫</div>
              <div className="absolute top-1/2 -left-3 sm:-left-4 md:-left-6 lg:-left-8 transform -translate-y-1/2 text-base sm:text-lg md:text-xl lg:text-2xl animate-sparkle" style={{ animationDelay: '1.5s' }}>🌟</div>
            </div>

            {/* Secondary orbit - Adjusted positioning */}
            <div className="absolute inset-0 animate-orbit-reverse">
              <div className="absolute -top-5 sm:-top-6 md:-top-8 lg:-top-10 right-1/4 text-sm sm:text-base md:text-lg lg:text-xl animate-pulse-glow">💖</div>
              <div className="absolute bottom-0 -right-5 sm:-right-6 md:-right-8 lg:-right-10 text-sm sm:text-base md:text-lg lg:text-xl animate-pulse-glow" style={{ animationDelay: '0.7s' }}>🎈</div>
              <div className="absolute -bottom-5 sm:-bottom-6 md:-bottom-8 lg:-bottom-10 left-1/4 text-sm sm:text-base md:text-lg lg:text-xl animate-pulse-glow" style={{ animationDelay: '1.4s' }}>🍦</div>
              <div className="absolute top-0 -left-5 sm:-left-6 md:-left-8 lg:-left-10 text-sm sm:text-base md:text-lg lg:text-xl animate-pulse-glow" style={{ animationDelay: '2.1s' }}>🎊</div>
            </div>

            {/* Multi-layered glow effects - Adjusted for smaller size */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400/50 via-purple-500/50 to-blue-400/50 rounded-full blur-xl sm:blur-2xl md:blur-3xl scale-125 sm:scale-150 lg:scale-[1.6] animate-glow-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 via-pink-400/30 to-blue-300/30 rounded-full blur-lg sm:blur-xl md:blur-2xl scale-110 sm:scale-125 lg:scale-[1.4] animate-glow-pulse-alt"></div>
              <div className="absolute inset-0 bg-white/15 rounded-full blur-md sm:blur-lg md:blur-xl scale-105 sm:scale-110 lg:scale-125 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced brand section - Reduced spacing */}
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 relative leading-tight">
            <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 bg-clip-text text-transparent animate-text-shimmer bg-300% filter drop-shadow-lg">
              Wile Emprendimientos
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 bg-clip-text text-transparent opacity-50 blur-sm animate-text-shimmer bg-300%" style={{ animationDelay: '0.5s' }}></div>
          </h1>
          
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl blur-sm"></div>
            <p className="relative text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white font-medium px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-sm border border-white/20 shadow-xl">
              Gestión de helados con amor 
              <span className="inline-block animate-heart-beat ml-2 text-lg sm:text-xl md:text-2xl lg:text-3xl">💖</span>
            </p>
          </div>
        </div>

        {/* Dynamic loading text with enhanced styling - Reduced spacing */}
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-md sm:blur-lg lg:blur-xl"></div>
            <div className="relative px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-3 md:py-4 lg:py-5 bg-white/10 backdrop-blur-md rounded-full border border-white/30 shadow-xl">
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white font-medium animate-text-fade leading-relaxed">
                {loadingTexts[loadingTextIndex]}
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-shimmer-wave"></div>
            </div>
          </div>
        </div>

        {/* Spectacular progress bar - Reduced spacing */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto mb-4 sm:mb-6 md:mb-8 lg:mb-10">
          <div className="relative">
            {/* Progress bar container with enhanced styling */}
            <div className="relative bg-white/20 backdrop-blur-sm rounded-full h-4 sm:h-5 md:h-6 lg:h-7 overflow-hidden shadow-xl border-2 border-white/30">
              <div 
                className="bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Multiple shimmer effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer-fast"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/40 to-transparent animate-shimmer-slow"></div>
                
                {/* Progress glow */}
                <div className="absolute right-0 top-0 w-2 sm:w-3 md:w-4 lg:w-5 h-full bg-white/80 blur-sm"></div>
                <div className="absolute right-0 top-0 w-1 sm:w-1.5 md:w-2 lg:w-2.5 h-full bg-white"></div>
              </div>
              
              {/* Progress bar glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/50 via-pink-400/50 to-blue-400/50 rounded-full blur-sm sm:blur-md lg:blur-lg -z-10 scale-110 lg:scale-125"></div>
            </div>
            
            {/* Enhanced progress percentage - Reduced spacing */}
            <div className="flex justify-center mt-3 sm:mt-4 md:mt-6 lg:mt-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full blur-sm"></div>
                <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 py-1 sm:py-1.5 md:py-2 lg:py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/40 shadow-lg">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white">
                    {Math.round(progress)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced dancing cat paws - Reduced spacing */}
        <div className="flex justify-center space-x-3 sm:space-x-4 md:space-x-6 lg:space-x-8 opacity-90">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl animate-paw-dance filter drop-shadow-md"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '2s'
              }}
            >
              🐾
            </div>
          ))}
        </div>

        {/* Completion celebration */}
        {isComplete && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl animate-celebration-explosion">
              🎉
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-blue-400/20 rounded-full animate-ping"></div>
          </div>
        )}
      </div>

      {/* Enhanced custom styles */}
      <style jsx>{`
        .bg-300% { background-size: 300% 300%; }
        .bg-radial-gradient { background: radial-gradient(circle at center, var(--tw-gradient-stops)); }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes gradient-shift-reverse {
          0%, 100% { background-position: 100% 50%; }
          50% { background-position: 0% 50%; }
        }
        
        @keyframes gradient-shift-slow {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
        
        @keyframes float-complex {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-20px) translateX(8px) rotate(3deg) scale(1.05); }
          50% { transform: translateY(-10px) translateX(-8px) rotate(-2deg) scale(0.95); }
          75% { transform: translateY(-15px) translateX(4px) rotate(1deg) scale(1.02); }
        }
        
        @keyframes twinkle-complex {
          0%, 100% { opacity: 0.2; transform: scale(1) rotate(0deg); }
          25% { opacity: 0.7; transform: scale(1.3) rotate(90deg); }
          50% { opacity: 1; transform: scale(1.8) rotate(180deg); }
          75% { opacity: 0.5; transform: scale(1.1) rotate(270deg); }
        }
        
        @keyframes cat-morph {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.08) rotate(1.5deg); }
          50% { transform: scale(1.03) rotate(-0.8deg); }
          75% { transform: scale(1.05) rotate(0.8deg); }
        }
        
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes orbit-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1.25); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        
        @keyframes glow-pulse-alt {
          0%, 100% { opacity: 0.3; transform: scale(1.1) rotate(0deg); }
          50% { opacity: 0.6; transform: scale(1.3) rotate(180deg); }
        }
        
        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes heart-beat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.15); }
          50% { transform: scale(1.08); }
          75% { transform: scale(1.12); }
        }
        
        @keyframes text-fade {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer-wave {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes shimmer-slow {
          0% { transform: translateX(-100%) skewX(15deg); }
          100% { transform: translateX(100%) skewX(15deg); }
        }
        
        @keyframes paw-dance {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-10px) rotate(-8deg) scale(1.05); }
          50% { transform: translateY(-5px) rotate(4deg) scale(0.98); }
          75% { transform: translateY(-8px) rotate(-4deg) scale(1.02); }
        }
        
        @keyframes completion-celebration {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(90deg); }
          50% { transform: scale(1.4) rotate(180deg); }
          75% { transform: scale(1.15) rotate(270deg); }
          100% { transform: scale(1.3) rotate(360deg); }
        }
        
        @keyframes celebration-explosion {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.8) rotate(180deg); opacity: 1; }
          100% { transform: scale(2.5) rotate(360deg); opacity: 0; }
        }
        
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        
        .animate-gradient-shift { animation: gradient-shift 8s ease infinite; }
        .animate-gradient-shift-reverse { animation: gradient-shift-reverse 10s ease infinite; }
        .animate-gradient-shift-slow { animation: gradient-shift-slow 12s ease infinite; }
        .animate-float-complex { animation: float-complex 5s ease-in-out infinite; }
        .animate-twinkle-complex { animation: twinkle-complex 2.5s ease-in-out infinite; }
        .animate-cat-morph { animation: cat-morph 2.5s ease-in-out infinite; }
        .animate-orbit { animation: orbit 10s linear infinite; }
        .animate-orbit-reverse { animation: orbit-reverse 12s linear infinite; }
        .animate-sparkle { animation: sparkle 1.8s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-glow-pulse { animation: glow-pulse 3.5s ease-in-out infinite; }
        .animate-glow-pulse-alt { animation: glow-pulse-alt 4s ease-in-out infinite; }
        .animate-text-shimmer { animation: text-shimmer 3.5s linear infinite; }
        .animate-heart-beat { animation: heart-beat 1.3s ease-in-out infinite; }
        .animate-text-fade { animation: text-fade 0.7s ease-out; }
        .animate-shimmer-wave { animation: shimmer-wave 2.5s infinite; }
        .animate-shimmer-fast { animation: shimmer-fast 1.2s infinite; }
        .animate-shimmer-slow { animation: shimmer-slow 2s infinite; }
        .animate-paw-dance { animation: paw-dance 1.8s ease-in-out infinite; }
        .animate-completion-celebration { animation: completion-celebration 1.8s ease-in-out infinite; }
        .animate-celebration-explosion { animation: celebration-explosion 0.9s ease-out; }
        .animate-spin-slow { animation: spin-slow 6s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 2.5s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 1.8s ease-in-out infinite; }

        /* Desktop-specific optimizations for better sizing */
        @media (min-width: 1024px) {
          .animate-glow-pulse { 
            animation-duration: 4s; 
          }
          .animate-glow-pulse-alt { 
            animation-duration: 5s; 
          }
          .animate-orbit { 
            animation-duration: 12s; 
          }
          .animate-orbit-reverse { 
            animation-duration: 15s; 
          }
        }

        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          .animate-float-complex { animation-duration: 4s; }
          .animate-orbit { animation-duration: 8s; }
          .animate-orbit-reverse { animation-duration: 10s; }
          .animate-glow-pulse { animation-duration: 3s; }
          .animate-glow-pulse-alt { animation-duration: 3.5s; }
        }
      `}</style>
    </div>
  );
};