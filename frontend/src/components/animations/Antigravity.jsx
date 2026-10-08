import React, { useEffect, useRef } from "react";
import "./Antigravity.css";

/**
 * Antigravity Animation Component (React Bits compliant)
 * https://reactbits.dev/c/animations/antigravity
 * 
 * Interactive physics-based canvas with anti-gravity particle flow,
 * magnetic cursor attraction, wave ripples, and dynamic particle scaling.
 */
function Antigravity({
  count = 240,
  magnetRadius = 140,
  ringRadius = 120,
  waveSpeed = 0.6,
  waveAmplitude = 24,
  particleSize = 2.4,
  lerpSpeed = 0.08,
  color = "#8B3A3A",
  secondaryColor = "var(--color-cream)",
  autoAnimate = true,
  fieldStrength = 18,
  pulseSpeed = 2.5,
  particleShape = "capsule", // "capsule" | "circle" | "diamond"
  className = "",
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, targetX: -9999, targetY: -9999, active: false });
  const animFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Initialize particles
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.4 - Math.random() * 0.9, // Anti-gravity upward bias
        size: (Math.random() * 0.7 + 0.6) * particleSize,
        alpha: Math.random() * 0.55 + 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: (Math.random() * 0.5 + 0.5) * waveSpeed,
        colorVariant: Math.random() > 0.4 ? color : secondaryColor,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016 * waveSpeed;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * lerpSpeed;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * lerpSpeed;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isMouseActive = mouseRef.current.active;

      for (let i = 0; i < count; i++) {
        const p = particles[i];

        // Base wave oscillation
        p.phase += p.speed * 0.05;
        const waveX = Math.sin(p.phase + time) * (waveAmplitude * 0.3);
        const waveY = Math.cos(p.phase * 0.8 + time) * (waveAmplitude * 0.4);

        // Anti-gravity upward movement
        p.y += p.vy;
        p.x += p.vx + waveX * 0.08;
        p.rotation += p.rotationSpeed;

        // Wrap around boundaries
        if (p.y < -30) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -30) p.x = width + 20;
        if (p.x > width + 30) p.x = -20;

        // Magnetic cursor & Antigravity field interaction
        let renderX = p.x;
        let renderY = p.y;
        let scaleMultiplier = 1;
        let glowStrength = 0;

        if (isMouseActive) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < magnetRadius && dist > 0.1) {
            const force = (1 - dist / magnetRadius) * (fieldStrength / 10);
            const angle = Math.atan2(dy, dx);

            // Ring formation & repulsive anti-gravity dispersion
            const ringOffset = Math.abs(dist - ringRadius) / ringRadius;
            const displacement = Math.sin(ringOffset * Math.PI) * force * 40;

            renderX += Math.cos(angle + Math.PI) * displacement;
            renderY += Math.sin(angle + Math.PI) * displacement - force * 15;

            scaleMultiplier = 1 + force * 0.8;
            glowStrength = force;
          }
        }

        // Draw particle
        ctx.save();
        ctx.translate(renderX, renderY);
        ctx.rotate(p.rotation);

        const currentSize = p.size * scaleMultiplier;
        const currentAlpha = Math.min(p.alpha + glowStrength * 0.4, 0.95);

        ctx.fillStyle = p.colorVariant;
        ctx.globalAlpha = currentAlpha;

        if (glowStrength > 0.2) {
          ctx.shadowColor = p.colorVariant;
          ctx.shadowBlur = glowStrength * 16;
        }

        if (particleShape === "capsule") {
          const length = currentSize * 2.8;
          ctx.beginPath();
          ctx.roundRect(-length / 2, -currentSize / 2, length, currentSize, currentSize / 2);
          ctx.fill();
        } else if (particleShape === "diamond") {
          ctx.beginPath();
          ctx.moveTo(0, -currentSize * 1.5);
          ctx.lineTo(currentSize, 0);
          ctx.lineTo(0, currentSize * 1.5);
          ctx.lineTo(-currentSize, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.targetX = -9999;
      mouseRef.current.targetY = -9999;
    };

    const targetEl = canvas.parentElement || canvas;
    targetEl.addEventListener("mousemove", handleMouseMove);
    targetEl.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", handleResize);
      targetEl.removeEventListener("mousemove", handleMouseMove);
      targetEl.removeEventListener("mouseleave", handleMouseLeave);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [
    count,
    magnetRadius,
    ringRadius,
    waveSpeed,
    waveAmplitude,
    particleSize,
    lerpSpeed,
    color,
    secondaryColor,
    autoAnimate,
    fieldStrength,
    pulseSpeed,
    particleShape,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`antigravity-canvas ${className}`}
      aria-hidden="true"
    />
  );
}

export default Antigravity;
