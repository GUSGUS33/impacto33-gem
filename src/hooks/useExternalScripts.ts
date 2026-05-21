import { useEffect, useState } from 'react';

export const useExternalScripts = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!isLoaded && window.scrollY > 100) {
        setIsLoaded(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };

    const handleInteraction = () => {
      if (!isLoaded) {
        setIsLoaded(true);
        ['click', 'touchstart', 'mousemove'].forEach(event => 
          window.removeEventListener(event, handleInteraction)
        );
      }
    };

    // Trigger on scroll or interaction
    window.addEventListener('scroll', handleScroll);
    ['click', 'touchstart', 'mousemove'].forEach(event => 
      window.addEventListener(event, handleInteraction)
    );

    // Fallback: load after 4 seconds anyway
    const timer = setTimeout(() => setIsLoaded(true), 4000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      ['click', 'touchstart', 'mousemove'].forEach(event => 
        window.removeEventListener(event, handleInteraction)
      );
      clearTimeout(timer);
    };
  }, [isLoaded]);

  return isLoaded;
};
