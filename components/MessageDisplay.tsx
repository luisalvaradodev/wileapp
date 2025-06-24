import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X as CloseIcon } from 'lucide-react';

// Definición de tipos para el mensaje y las props del componente
interface MessageObject {
  type: 'success' | 'error' | 'warning' | 'info' | string; // string para el caso default
  text: string;
  title?: string; // Título opcional
}

interface MessageDisplayProps {
  message: MessageObject | null; // Permitir null para "no mensaje"
  duration?: number; // Duración en ms antes de auto-cerrarse
  showDismissButton?: boolean; // Mostrar botón de cierre manual
  onClose?: () => void; // Callback cuando el mensaje se cierra
  className?: string; // Para estilos adicionales desde el padre
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({
  message,
  duration = 5000,
  showDismissButton = true,
  onClose,
  className = '',
}) => {
  const [internalMessage, setInternalMessage] = useState<MessageObject | null>(null);
  const [isShowing, setIsShowing] = useState(false); // Controla la animación de entrada/salida
  const [isMounted, setIsMounted] = useState(false); // Controla si el componente está en el DOM

  // Efecto para manejar el mensaje entrante
  useEffect(() => {
    if (message && message.text) {
      setInternalMessage(message);
      setIsMounted(true); // Montar el componente
      // Pequeño delay para permitir que el componente se monte antes de animar la entrada
      const mountTimer = setTimeout(() => {
        setIsShowing(true); // Iniciar animación de entrada
      }, 50); // 50ms es usualmente suficiente

      return () => clearTimeout(mountTimer);
    } else {
      // Si el mensaje se vuelve null o vacío, iniciar animación de salida
      setIsShowing(false);
    }
  }, [message]);

  const handleClose = useCallback(() => {
    setIsShowing(false); // Iniciar animación de salida
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Efecto para el auto-cierre
  useEffect(() => {
    let autoCloseTimer: NodeJS.Timeout;
    if (isShowing && internalMessage && duration > 0) {
      autoCloseTimer = setTimeout(() => {
        handleClose();
      }, duration);
    }
    return () => clearTimeout(autoCloseTimer);
  }, [isShowing, internalMessage, duration, handleClose]);

  // Efecto para desmontar el componente después de la animación de salida
  useEffect(() => {
    let unmountTimer: NodeJS.Timeout;
    if (!isShowing && isMounted) {
      // Esperar que la animación de salida termine antes de desmontar
      unmountTimer = setTimeout(() => {
        setIsMounted(false);
        setInternalMessage(null); // Limpiar el mensaje interno
      }, 300); // Debe coincidir con la duración de la transición CSS
    }
    return () => clearTimeout(unmountTimer);
  }, [isShowing, isMounted]);


  if (!isMounted || !internalMessage) return null;

  let bgColor, textColor, borderColor, IconComponent, iconColor;

  switch (internalMessage.type) {
    case 'success':
      bgColor = 'bg-green-50 dark:bg-green-900/60';
      textColor = 'text-green-700 dark:text-green-200';
      borderColor = 'border-green-500 dark:border-green-600';
      IconComponent = CheckCircle2;
      iconColor = 'text-green-500 dark:text-green-400';
      break;
    case 'error':
      bgColor = 'bg-red-50 dark:bg-red-900/60';
      textColor = 'text-red-700 dark:text-red-200';
      borderColor = 'border-red-500 dark:border-red-600';
      IconComponent = XCircle;
      iconColor = 'text-red-500 dark:text-red-400';
      break;
    case 'warning':
      bgColor = 'bg-amber-50 dark:bg-amber-900/60'; // Usando amber para warning
      textColor = 'text-amber-700 dark:text-amber-200';
      borderColor = 'border-amber-500 dark:border-amber-600';
      IconComponent = AlertTriangle;
      iconColor = 'text-amber-500 dark:text-amber-400';
      break;
    default: // 'info' y cualquier otro caso
      bgColor = 'bg-sky-50 dark:bg-sky-900/60'; // Usando sky para info
      textColor = 'text-sky-700 dark:text-sky-200';
      borderColor = 'border-sky-500 dark:border-sky-600';
      IconComponent = Info;
      iconColor = 'text-sky-500 dark:text-sky-400';
      break;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`w-full max-w-md p-4 rounded-lg shadow-xl border-l-4
                  ${bgColor} ${borderColor} ${className}
                  transition-all duration-300 ease-in-out transform
                  ${isShowing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <IconComponent size={22} className={iconColor} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          {internalMessage.title && (
            <h3 className={`text-sm font-semibold ${textColor} mb-1`}>
              {internalMessage.title}
            </h3>
          )}
          <p className={`text-sm ${textColor}`}>
            {internalMessage.text}
          </p>
        </div>
        {showDismissButton && (
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className={`p-1 rounded-md ${bgColor} hover:bg-opacity-80 dark:hover:bg-opacity-60
                          focus:outline-none focus:ring-2 focus:ring-offset-2 
                          ${ 
                            internalMessage.type === 'success' ? 'focus:ring-offset-green-50 dark:focus:ring-offset-green-900/60 focus:ring-green-600 dark:focus:ring-green-500' :
                            internalMessage.type === 'error'   ? 'focus:ring-offset-red-50 dark:focus:ring-offset-red-900/60 focus:ring-red-600 dark:focus:ring-red-500' :
                            internalMessage.type === 'warning' ? 'focus:ring-offset-amber-50 dark:focus:ring-offset-amber-900/60 focus:ring-amber-600 dark:focus:ring-amber-500' :
                                                                 'focus:ring-offset-sky-50 dark:focus:ring-offset-sky-900/60 focus:ring-sky-600 dark:focus:ring-sky-500'
                          }
                        `}
              aria-label="Cerrar notificación"
            >
              <CloseIcon size={18} className={textColor} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

