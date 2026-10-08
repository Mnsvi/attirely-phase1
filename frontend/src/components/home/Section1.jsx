import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./Section1.css";
import hangingSandals from "../../assets/images/hanging-sandals.png";
import hangingBlackShirt from "../../assets/images/hanging-black-shirt.png";

gsap.registerPlugin(ScrollTrigger);

function Section1() {
  const sectionRef = useRef(null);
  const leftGroupRef = useRef(null);
  const rightGroupRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left image + text
      gsap.fromTo(
        leftGroupRef.current,
        {
          x: -120,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Right image + text
      gsap.fromTo(
        rightGroupRef.current,
        {
          x: 120,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="showcase" className="showcase" aria-label="Editorial Showcase">
      <div className="showcase__header">
        <span className="showcase__tag">EDITORIAL CURATION</span>
        <h2 className="showcase__title">PRECISION DESIRE</h2>
      </div>

      <div className="showcase__content">
        {/* LEFT */}
        <div ref={leftGroupRef} className="showcase__group showcase__group--left">
          <div className="showcase__img-box">
            <img
              src={hangingSandals}
              alt="Curated Sandals and Footwear"
              className="showcase__img"
            />
          </div>

          <div className="showcase__caption showcase__caption--left">
            <span className="showcase__subcaption">THE INSPIRATION</span>
            <h1>You want it?</h1>
          </div>
        </div>

        <div className="showcase__divider-line">
          <div className="showcase__divider-dot" />
        </div>

        {/* RIGHT */}
        <div ref={rightGroupRef} className="showcase__group showcase__group--right">
          <div className="showcase__img-box">
            <img
              src={hangingBlackShirt}
              alt="Curated Silhouette Shirt"
              className="showcase__img"
            />
          </div>

          <div className="showcase__caption showcase__caption--right">
            <span className="showcase__subcaption">THE MATCH</span>
            <h1>You Got It.</h1>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Section1;
