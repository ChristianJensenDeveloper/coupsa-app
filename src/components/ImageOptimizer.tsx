import React, { useState, useRef, useCallback } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function ImageOptimizer({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  fallbackSrc,
  onLoad,
  onError
}: ImageOptimizerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  const observerRef = useCallback((node: HTMLImageElement) => {
    if (node && !priority) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: '50px',
          threshold: 0.1
        }
      );
      observer.observe(node);
      return () => observer.disconnect();
    }
  }, [priority]);

  // Optimize image URL based on device and requirements
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    // If it's an Unsplash URL, add optimization parameters
    if (originalSrc.includes('images.unsplash.com')) {
      const url = new URL(originalSrc);
      
      // Add format optimization
      url.searchParams.set('fm', 'webp');
      
      // Add quality
      url.searchParams.set('q', quality.toString());
      
      // Add dimensions if provided
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      
      // Add fit parameter for better cropping
      url.searchParams.set('fit', 'crop');
      
      // Add auto optimization
      url.searchParams.set('auto', 'format,compress');
      
      return url.toString();
    }
    
    // For other sources, return as-is or implement other optimization logic
    return originalSrc;
  }, [quality, width, height]);

  // Generate blur placeholder
  const generateBlurPlaceholder = useCallback(() => {
    if (blurDataURL) return blurDataURL;
    
    // Generate a simple blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a simple gradient
      const gradient = ctx.createLinearGradient(0, 0, 10, 10);
      gradient.addColorStop(0, '#e2e8f0');
      gradient.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 10, 10);
      
      return canvas.toDataURL();
    }
    
    return '';
  }, [blurDataURL]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Don't render anything if not in view and not priority
  if (!isInView && !priority) {
    return (
      <div
        ref={observerRef}
        className={`bg-slate-200 dark:bg-slate-700 animate-pulse ${className}`}
        style={{ width, height }}
      />
    );
  }

  const optimizedSrc = getOptimizedSrc(src);
  const shouldShowPlaceholder = placeholder === 'blur' && !isLoaded && !hasError;
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Blur placeholder */}
      {shouldShowPlaceholder && (
        <img
          src={generateBlurPlaceholder()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <ImageWithFallback
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          contentVisibility: 'auto',
          containIntrinsicSize: width && height ? `${width}px ${height}px` : 'auto'
        }}
      />
      
      {/* Loading state */}
      {!isLoaded && !hasError && placeholder === 'empty' && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for preloading images
export function useImagePreloader() {
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback(async (sources: string[]) => {
    try {
      await Promise.all(sources.map(preloadImage));
      console.log('All images preloaded successfully');
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }, [preloadImage]);

  return { preloadImage, preloadImages };
}