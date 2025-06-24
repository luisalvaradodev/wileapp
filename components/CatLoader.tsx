import React, { useState, useEffect } from 'react';

interface CatLoaderProps {
  onLoadComplete: () => void;
}

export const CatLoader: React.FC<CatLoaderProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentCat, setCurrentCat] = useState(0);
  const [loadingText, setLoadingText] = useState('');

  const cats = ['🐱', '😸', '😺', '😻', '🙀', '😹', '😾', '😿', '🐈', '🐈‍⬛'];
  const loadingTexts = [
    'Preparando helados...',
    'Cargando gatitos...',
    'Organizando inventario...',
    'Calculando ganancias...',
    'Activando superpoderes...',
    'Calibrando máquina de helados...',
    'Consultando con los gatitos...',
    'Mezclando ingredientes mágicos...',
    'Preparando tu experiencia...',
    '¡Ya casi está listo!'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onLoadComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  useEffect(() => {
    const catInterval = setInterval(() => {
      setCurrentCat(prev => (prev + 1) % cats.length);
    }, 300);

    return () => clearInterval(catInterval);
  }, []);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setLoadingText(loadingTexts[Math.floor(Math.random() * loadingTexts.length)]);
    }, 800);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 dark:from-pink-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-4xl animate-bounce opacity-20">🍦</div>
        <div className="absolute top-20 right-20 text-3xl animate-pulse opacity-30" style={{ animationDelay: '1s' }}>🎈</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-spin opacity-20" style={{ animationDelay: '2s', animationDuration: '3s' }}>✨</div>
        <div className="absolute bottom-10 right-10 text-4xl animate-bounce opacity-25" style={{ animationDelay: '0.5s' }}>🌟</div>
        <div className="absolute top-1/2 left-10 text-3xl animate-pulse opacity-20" style={{ animationDelay: '1.5s' }}>🎊</div>
        <div className="absolute top-1/3 right-10 text-4xl animate-bounce opacity-30" style={{ animationDelay: '2.5s' }}>🎉</div>
      </div>

      <div className="relative z-10 text-center px-4">
        {/* Main cat animation */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-8xl md:text-9xl animate-bounce mb-4">
              {cats[currentCat]}
            </div>
            <div className="absolute -top-2 -right-2 text-2xl animate-spin">
              ✨
            </div>
            <div className="absolute -bottom-2 -left-2 text-xl animate-pulse">
              ⭐
            </div>
          </div>
        </div>

        {/* Brand */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Wile Emprendimientos
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium">
            Gestión de helados con amor 💖
          </p>
        </div>

        {/* Loading text */}
        <div className="mb-8">
          <p className="text-base md:text-lg text-gray-700 dark:text-gray-200 animate-pulse">
            {loadingText}
          </p>
        </div>

        {/* Progress bar */}
        <div className="max-w-xs mx-auto mb-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
            {progress}%
          </p>
        </div>

        {/* Decorative cats */}
        <div className="flex justify-center space-x-4 opacity-60">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="text-2xl animate-bounce"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '1s'
              }}
            >
              🐾
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};