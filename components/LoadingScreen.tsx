import React from 'react';
// import YourAppLogo from '../assets/logo.svg'; // Ejemplo: Importa tu logo

export const LoadingScreen: React.FC = () => {
  // Para la animación de las barras, podemos definirla aquí o en un CSS global.
  // Por simplicidad y para que sea autocontenido, usaré un <style> tag.
  // En un proyecto real, esto iría en tu archivo CSS/SCSS principal.
  const animationStyles = `
    @keyframes wave {
      0%, 40%, 100% {
        transform: scaleY(0.4);
      }
      20% {
        transform: scaleY(1.0);
      }
    }
    .wave-bar {
      animation: wave 1.2s infinite ease-in-out;
    }
    .wave-bar:nth-child(1) { animation-delay: -0.4s; }
    .wave-bar:nth-child(2) { animation-delay: -0.3s; }
    .wave-bar:nth-child(3) { animation-delay: -0.2s; }
    .wave-bar:nth-child(4) { animation-delay: -0.1s; }
  `;

  return (
    <>
      <style>{animationStyles}</style>
      <div 
        className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-gray-900 flex flex-col items-center justify-center p-6 font-sans transition-colors duration-300"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="mb-8 text-center">
          {/* Espacio para el Logo - Descomenta y ajusta si tienes uno */}
          {/* <img src={YourAppLogo} alt="Logo de la Aplicación" className="w-24 h-24 mx-auto mb-4 opacity-90" /> */}
          {/* O un placeholder si no hay logo */}
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 dark:from-sky-400 dark:to-indigo-500 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-1">
            Iniciando Aplicación
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Un momento, por favor...
          </p>
        </div>

        {/* Animación de Barras de Carga */}
        <div className="flex items-center justify-center space-x-1.5 h-12">
          <div className="wave-bar h-10 w-2 bg-sky-500 dark:bg-sky-400 rounded-full"></div>
          <div className="wave-bar h-10 w-2 bg-sky-500 dark:bg-sky-400 rounded-full"></div>
          <div className="wave-bar h-10 w-2 bg-sky-500 dark:bg-sky-400 rounded-full"></div>
          <div className="wave-bar h-10 w-2 bg-sky-500 dark:bg-sky-400 rounded-full"></div>
          <div className="wave-bar h-10 w-2 bg-sky-500 dark:bg-sky-400 rounded-full"></div>
        </div>
        
        <div className="mt-8 text-center" role="status">
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300 animate-pulse">
            Cargando componentes esenciales...
          </p>
        </div>

        <p className="absolute bottom-6 text-xs text-slate-400 dark:text-slate-600">
          &copy; {new Date().getFullYear()} La tienda del Blumer
        </p>
      </div>
    </>
  );
};