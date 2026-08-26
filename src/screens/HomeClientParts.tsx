"use client";

import { useEffect, useState } from "react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const HERO_IMAGES = [
  "/images/articulos-promocionales-personalizados-empresa.jpg",
  "/images/banner-img-10.jpg"
];

export function HeroSlider() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 20000); // 20 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {HERO_IMAGES.map((src, index) => (
        <OptimizedImage 
          key={src}
          src={src}
          alt={`Banner hero promocional ${index + 1}`}
          fill
          priority={index === 0}
          containerClassName={`absolute inset-0 z-0 transition-opacity duration-1000 ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
    </>
  );
}

export function HomeRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/inicio');
    }
  }, [user, loading, router]);

  return null;
}
