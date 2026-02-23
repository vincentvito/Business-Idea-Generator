"use client";

import { useState, useEffect } from "react";

const BUSINESS_TYPES = [
  "Restaurant",
  "Coffee Shop",
  "Bakery",
  "Craft Brewery",
  "Food Truck",
  "Juice Bar",
  "Pizzeria",
  "Ice Cream Shop",
  "Catering Service",
  "Ghost Kitchen",
];

const CYCLE_INTERVAL = 2500;
const TRANSITION_DURATION = 400;

export function RotatingText() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % BUSINESS_TYPES.length);
        setIsTransitioning(false);
      }, TRANSITION_DURATION);
    }, CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-flex min-w-[200px] sm:min-w-[260px] lg:min-w-[340px] overflow-hidden">
      <span
        className={`inline-block transition-all duration-400 ${
          isTransitioning
            ? "opacity-0 -translate-y-2"
            : "opacity-100 translate-y-0"
        }`}
      >
        {BUSINESS_TYPES[currentIndex]}
      </span>
    </span>
  );
}
