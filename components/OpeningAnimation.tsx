import React, { useEffect, useState } from 'react';

interface OpeningAnimationProps {
  onAnimationEnd: () => void;
}

const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onAnimationEnd }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeOutStartTime = 4000; // Start fading out after 4 seconds
    const animationEndTime = 4800;  // Animation finishes after 4.8 seconds

    const startFadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, fadeOutStartTime);

    const endAnimationTimer = setTimeout(() => {
      onAnimationEnd();
    }, animationEndTime);

    return () => {
      clearTimeout(startFadeOutTimer);
      clearTimeout(endAnimationTimer);
    };
  }, [onAnimationEnd]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
      aria-label="Loading application animation"
      role="status"
    >
      <style>{`
        .animation-container {
          position: relative;
          width: 300px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .star {
          position: absolute;
          width: 60px;
          height: 60px;
          background: radial-gradient(ellipse at center, #fff, #ffdcb1 60%, #f59e0b 100%);
          border-radius: 50%;
          box-shadow: 
            0 0 20px 10px #fff,
            0 0 40px 20px #f59e0b,
            0 0 80px 40px #e11d4820;
          opacity: 0;
          animation: 
            star-appear 2s ease-out forwards,
            star-dim 2s 1.5s ease-in-out forwards;
        }

        .planet {
          position: absolute;
          width: 15px;
          height: 15px;
          background-color: #0c0a09; /* Almost black */
          border-radius: 50%;
          opacity: 0;
          animation: planet-transit 2s 1.5s ease-in-out forwards;
        }

        .title {
          position: absolute;
          bottom: 20px;
          font-size: 1.875rem; /* 30px */
          font-weight: bold;
          color: #fff;
          text-shadow: 0 0 8px #f59e0b;
          opacity: 0;
          letter-spacing: 0.1em;
          animation: title-appear 1.5s 2.8s ease-out forwards;
        }

        @keyframes star-appear {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes star-dim {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(0.85); }
        }

        @keyframes planet-transit {
          0% { transform: translateX(-150px) scale(0.9); opacity: 1; }
          50% { transform: translateX(0px) scale(1); }
          100% { transform: translateX(150px) scale(1.1); opacity: 1; }
        }

        @keyframes title-appear {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="animation-container">
        <div className="star"></div>
        <div className="planet"></div>
        <h1 className="title">Exoplanet Detector</h1>
      </div>
    </div>
  );
};

export default OpeningAnimation;