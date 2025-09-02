'use client';

import { useState, useRef, useEffect } from 'react';

interface OptimizedVideoBackgroundProps {
  videoSrc: string;
  posterImage: string;
  mobileImage?: string;
  children: React.ReactNode;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  quality?: 'high' | 'medium' | 'low';
}

export default function OptimizedVideoBackground({
  videoSrc,
  posterImage,
  mobileImage,
  children,
  className = '',
  autoPlay = true,
  muted = true,
  loop = true,
  quality = 'medium'
}: OptimizedVideoBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().catch(console.warn);
        } else if (videoRef.current) {
          videoRef.current.pause();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Device and connection detection
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    // Type-safe connection detection
    const nav = navigator as Navigator & {
      connection?: { effectiveType: string };
      mozConnection?: { effectiveType: string };
      webkitConnection?: { effectiveType: string };
    };
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const isSlowConnection = connection?.effectiveType && 
      ['slow-2g', '2g', '3g'].includes(connection.effectiveType);
    const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isMobile || isSlowConnection || prefersReducedData || prefersReducedMotion) {
      setShowVideo(false);
    } else {
      setShowVideo(true);
    }
  }, []);

  const handleVideoLoad = () => {
    setIsLoaded(true);
  };

  const handleVideoError = () => {
    setShowVideo(false);
  };

  // Get video quality attributes
  const getVideoAttributes = () => {
    const baseAttribs = {
      ref: videoRef,
      className: "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
      autoPlay: autoPlay && isIntersecting,
      muted,
      loop,
      playsInline: true,
      preload: quality === 'high' ? 'auto' : quality === 'medium' ? 'metadata' : 'none',
      poster: posterImage,
      controls: false,
      controlsList: "nodownload nofullscreen noremoteplayback",
      disablePictureInPicture: true,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
      onLoadedData: handleVideoLoad,
      onError: handleVideoError,
      style: {
        opacity: isLoaded ? 1 : 0,
        filter: 'brightness(0.4) contrast(1.1)',
      }
    };

    return baseAttribs;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ minHeight: '100vh' }}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-0" />

      {/* Video Background (Desktop Only) */}
      {showVideo && (
        <div className="absolute inset-0 z-10">
          <video
            {...getVideoAttributes()}
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={videoSrc} type="video/mp4" />
            {/* Fallback for unsupported browsers */}
            <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900" />
          </video>
        </div>
      )}

      {/* Mobile Background Image */}
      {(!showVideo || window.innerWidth < 768) && (
        <div 
          className="absolute inset-0 z-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${mobileImage || posterImage})`,
            filter: 'brightness(0.4) contrast(1.1)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Pattern Overlay for Texture */}
      <div 
        className="absolute inset-0 z-20 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,215,0,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Content */}
      <div className="relative z-30 h-full">
        {children}
      </div>

      {/* Loading State */}
      {showVideo && !isLoaded && (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Accessibility: Screen reader description */}
      <div className="sr-only">
        Fondo decorativo con video de presentación de EcuCondor
      </div>
    </div>
  );
}

// Performance-optimized video preloader component
export function VideoPreloader({ src, quality = 'low' }: { src: string; quality?: 'high' | 'medium' | 'low' }) {
  useEffect(() => {
    // Only preload if not on mobile and connection is good
    if (window.innerWidth >= 768 && !window.matchMedia('(prefers-reduced-data: reduce)').matches) {
      const video = document.createElement('video');
      video.preload = quality === 'high' ? 'auto' : 'metadata';
      video.src = src;
      video.load();
    }
  }, [src, quality]);

  return null;
}

// Hook for video performance monitoring
export function useVideoPerformance() {
  const [stats, setStats] = useState({
    loadTime: 0,
    canPlay: false,
    buffering: false,
    error: null as string | null,
  });

  const monitor = (videoElement: HTMLVideoElement) => {
    const startTime = performance.now();

    const handleLoadedData = () => {
      setStats(prev => ({
        ...prev,
        loadTime: performance.now() - startTime,
        canPlay: true,
      }));
    };

    const handleWaiting = () => {
      setStats(prev => ({ ...prev, buffering: true }));
    };

    const handleCanPlay = () => {
      setStats(prev => ({ ...prev, buffering: false, canPlay: true }));
    };

    const handleError = (e: Event) => {
      const error = (e.target as HTMLVideoElement).error;
      setStats(prev => ({
        ...prev,
        error: error?.message || 'Video load error',
        canPlay: false,
      }));
    };

    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('error', handleError);
    };
  };

  return { stats, monitor };
}