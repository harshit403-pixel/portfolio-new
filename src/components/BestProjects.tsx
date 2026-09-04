"use client";
import React, { useRef, useEffect } from "react";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import WorkImage from "./WorkImage";
import "./styles/Work.css";
import gsap from "gsap";

import { ScrollToPlugin } from "gsap/ScrollToPlugin";

const PROJECTS = [
  {
    name: "LinksHub",
    category: "Full-Stack Web Application",
    tools: "React, Vite, Express, MongoDB, Cloudinary, Gemini API",
    image: "/images/LinksHub.png",
    link: "https://linkshub.onrender.com/",
  },
  {
    name: "DevHub",
    category: "Developer Platform",
    tools: "React, Vite, Node.js, Express, MongoDB",
    image: "/images/DevHub.png",
    link: "https://devhub-lemon.vercel.app/",
  },
  {
    name: "RipVscode",
    category: "Code Editor Clone",
    tools: "React, Monaco Editor, JavaScript, UI Engineering",
    image: "/images/RipVscode.png",
    link: "https://rip-vscode.vercel.app/",
  },
  {
    name: "Bidding Wars",
    category: "Real-Time Auction Platform",
    tools: "React, Node.js, Express, MongoDB, Socket.IO",
    image: "/images/Whatsapp.png",
    link: "https://bidding-wars-skkn.onrender.com/",
  },
];

const BestProjects = () => {

  
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
gsap.registerPlugin(ScrollTrigger);


  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();

  gsap.to(window, {
    duration: 1.5,
    scrollTo: {
      y: "#contact",
      offsetY: 20, // adjust if you have a fixed navbar
    },
    ease: "power3.inOut",
  });
};

  useEffect(() => {
    // Title fade-in animation (runs once on scroll)
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 90%",
          },
        }
      );
    }

    // Horizontal scroll
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1025px)", () => {
      let translateX = 0;

      function setTranslateX() {
        const box = document.getElementsByClassName("work-box");
        const container = document.querySelector(".work-container");
        if (!container || box.length === 0) return;
        const rectLeft = container.getBoundingClientRect().left;
        const rect = box[0].getBoundingClientRect();
        const parentWidth = box[0].parentElement!.getBoundingClientRect().width;
        let padding =
          parseInt(window.getComputedStyle(box[0]).padding) / 2;
        translateX =
          rect.width * box.length - (rectLeft + parentWidth) + padding;
      }

      setTranslateX();

      let timeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".work-section",
          start: "top top",
          end: `+=${translateX}`,
          scrub: true,
          pin: true,
          id: "work",
        },
      });

      timeline.to(".work-flex", {
        x: -translateX,
        ease: "none",
      });

      return () => {
        timeline.kill();
        ScrollTrigger.getById("work")?.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="work-section" id="work" >
      <div className="work-container section-container">
        <h2
          ref={titleRef}
          className="font-mono font-bold text-[60px] md:text-[110px] lg:text-[100px] leading-[0.75] tracking-tighter text-black m-0 p-0 text-center mt-[40px] lg:mt-[60px] mb-[30px] lg:mb-[50px]"
          style={{ wordSpacing: '-0.1em' }}
        >
          FEAT <span className="font-signature lowercase text-[#a374ff]">Works</span>
        </h2>

        <div className="work-flex">
          {PROJECTS.map((project, index) => (
            <div className="work-box" key={index}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>

                  <div>
                    <h4>{project.name}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage
                image={project.image}
                alt={project.name}
                link={project.link}
                index={index}
              />
            </div>
          ))}
          {/* Let's Connect */}
          <div className="work-box work-connect-box">
            <div className="connect-content">
              <h3 className="font-mono text-black">Let&apos;s <span className="font-signature lowercase text-[#a374ff]">Connect!</span></h3>
              <p>Interested in working together or just want to say hi?</p>
              <a
  href="#contact"
  onClick={scrollToContact}
  className="connect-btn"
>
  Get in Touch
</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestProjects;

