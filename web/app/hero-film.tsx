'use client';

import {useEffect, useRef} from 'react';

/** Decorative film only; the existing hero composition stays in place. */
export function HeroFilm() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let disposed = false;
    let frame = 0;
    let restart: ReturnType<typeof setTimeout> | undefined;
    const allowed = () => !disposed && visible && !document.hidden && !motion.matches;
    const fade = () => {
      const {currentTime, duration} = video;
      const opacity = Number.isFinite(duration)
        ? Math.max(0, Math.min(1, currentTime / .5, (duration - currentTime) / .5))
        : 0;
      video.style.opacity = String(opacity);
      if (!video.paused && allowed()) frame = requestAnimationFrame(fade);
    };
    const play = () => {
      if (!allowed()) return;
      // Delay the media request until motion is allowed and the hero is visible.
      if (!video.getAttribute('src')) video.src = '/video/groundwork-creek.mp4';
      void video.play().then(() => {
        if (!allowed()) { video.pause(); return; }
        cancelAnimationFrame(frame);
        fade();
      }).catch(() => { video.style.opacity = '0'; });
    };
    const sync = () => {
      clearTimeout(restart);
      cancelAnimationFrame(frame);
      if (allowed()) play();
      else {
        video.pause();
        if (motion.matches) video.style.opacity = '0';
      }
    };
    const ended = () => {
      video.style.opacity = '0';
      cancelAnimationFrame(frame);
      restart = setTimeout(() => {
        video.currentTime = 0;
        play();
      }, 100);
    };
    const failed = () => { video.style.opacity = '0'; cancelAnimationFrame(frame); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    video.addEventListener('ended', ended);
    video.addEventListener('error', failed);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    return () => {
      disposed = true;
      observer.disconnect();
      clearTimeout(restart);
      cancelAnimationFrame(frame);
      video.pause();
      video.removeEventListener('ended', ended);
      video.removeEventListener('error', failed);
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener('change', sync);
    };
  }, []);

  return <div className="hero-film" aria-hidden="true">
    <video ref={ref} muted playsInline preload="none" tabIndex={-1} />
    <div className="hero-film-shade" />
  </div>;
}
