import React from 'react';

const SolarSystemAnimation: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
      <style>{`
        @keyframes move-stars {
          from { background-position-y: 0; }
          to { background-position-y: -1000px; }
        }
        .stars-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 200%; /* Taller to allow for scrolling */
          background-repeat: repeat;
          background-position: 0 0;
        }
        .stars-sm {
          background-image: radial-gradient(1px 1px at 50px 100px, white, transparent),
                              radial-gradient(1px 1px at 150px 250px, white, transparent),
                              radial-gradient(1px 1px at 300px 400px, #add8e6, transparent);
          background-size: 500px 500px;
          animation: move-stars 150s linear infinite;
        }
        .stars-md {
          background-image: radial-gradient(1.5px 1.5px at 100px 200px, white, transparent),
                              radial-gradient(1.5px 1.5px at 250px 50px, #add8e6, transparent),
                              radial-gradient(1.5px 1.5px at 400px 350px, white, transparent);
          background-size: 700px 700px;
          animation: move-stars 100s linear infinite;
        }
        .stars-lg {
          background-image: radial-gradient(2px 2px at 200px 150px, white, transparent),
                              radial-gradient(2px 2px at 500px 450px, #add8e6, transparent);
          background-size: 1000px 1000px;
          animation: move-stars 50s linear infinite;
        }
      `}</style>
      <div className="stars-bg stars-sm"></div>
      <div className="stars-bg stars-md"></div>
      <div className="stars-bg stars-lg"></div>
    </div>
  );
};

export default SolarSystemAnimation;