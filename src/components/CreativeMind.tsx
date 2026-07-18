"use client";
import React, { useState, useEffect } from "react";
import { FiArrowUpRight } from "react-icons/fi";

const CreativeMind = () => {
  const [windowsWidth, setWindowsWidth] = useState(0);

  useEffect(() => {
    setWindowsWidth(window.innerWidth);
  }, []);

  const colorize = (el: HTMLElement) => {
    el.style.backgroundColor = 'black';
    setTimeout(() => {
      el.style.backgroundColor = 'transparent';
    }, 300);
  };

  const getBlocks = () => {
    if (windowsWidth === 0) return null;
    const blockSize = windowsWidth * 0.05;
    const nbOfBlocks = Math.ceil(1500 / blockSize); // Safe height to cover the section
    return [...Array(nbOfBlocks).keys()].map((_, index) => {
      return (
        <div 
          onMouseEnter={(e) => colorize(e.target as HTMLElement)} 
          key={index} 
          className="w-full h-[5vw] transition-colors duration-300"
          style={{ transitionDuration: '0s' }} // Remove transition on enter, let it fade out (handled by colorize)
        ></div>
      );
    });
  };

  return (
    <section id="insights" className="relative pt-24 md:pt-32 pb-44 md:pb-64 bg-white text-black flex justify-center items-center px-4 overflow-hidden">
      
      {/* Trailing Cursor Grid */}
      <div className="absolute inset-0 flex overflow-hidden z-0 pointer-events-auto opacity-10">
        {windowsWidth > 0 && [...Array(20).keys()].map((_, index) => (
          <div key={index} className="w-[5vw]">
            {getBlocks()}
          </div>
        ))}
      </div>

      <div className="max-w-[90rem] w-full text-center font-mono font-bold text-[2.5rem] md:text-[4.5rem] lg:text-[6.5rem] leading-[0.75] tracking-tighter relative z-10 pointer-events-none" style={{ wordSpacing: '-0.1em' }}>

        {/* Line 1 */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 md:gap-x-6 gap-y-2">
          <span>A <span className="font-signature lowercase">creative</span></span>
          <div className="hidden md:inline-flex w-16 md:w-28 lg:w-40 h-8 md:h-12 lg:h-16 rounded-full overflow-hidden relative shrink-0">
            <img src="/assets/img1.jpg" alt="creative" className="w-full h-full object-cover" />
          </div>
          <span>MIND</span>
        </div>

        {/* Line 2 */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 md:gap-x-6 gap-y-2 mt-2 md:mt-4 lg:mt-6">
          <span>KNOWS</span>
          <div className="hidden md:inline-flex w-16 md:w-28 lg:w-40 h-8 md:h-12 lg:h-16 rounded-full overflow-hidden relative shrink-0">
            <img src="/assets/img2.jpg" alt="knows" className="w-full h-full object-cover" />
          </div>
          <span>HOW TO DO</span>
        </div>

        {/* Line 3 */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 md:gap-x-6 gap-y-2 mt-2 md:mt-4 lg:mt-6">
          <span>THE</span>
          <div className="hidden md:flex w-8 md:w-12 lg:w-16 h-8 md:h-12 lg:h-16 rounded-full bg-[#a3e635] text-black justify-center items-center shrink-0">
            <FiArrowUpRight className="w-5 md:w-8 lg:w-10 h-5 md:h-8 lg:h-10" />
          </div>
          <span>RIGHT THING AT</span>
        </div>

        {/* Line 4 */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 md:gap-x-6 gap-y-2 mt-2 md:mt-4 lg:mt-6">
          <span>THE RIGHT PLACE <span className="font-signature lowercase">and</span></span>
        </div>

        {/* Line 5 */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 md:gap-x-6 gap-y-2 mt-2 md:mt-4 lg:mt-6">
          <span>AT THE</span>
          <div className="hidden md:inline-flex w-16 md:w-28 lg:w-40 h-8 md:h-12 lg:h-16 rounded-full overflow-hidden relative shrink-0">
            <img src="/assets/img3.jpg" alt="right time" className="w-full h-full object-cover" />
          </div>
          <span>RIGHT TIME</span>
        </div>

      </div>
    </section>
  );
};

export default CreativeMind;
