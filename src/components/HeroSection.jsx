// src/components/HeroSection.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Sample images for the carousel (you can replace these with your actual images)
const CAROUSEL_IMAGES = [
    "https://images.unsplash.com/photo-1552667466-07770ae110d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1549060279-7e168fce7090?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
];

// Define teams with their colors
const TEAMS = {
    RED: { name: "Jesus our Saviour", color: "#FF0000" },
    BLUE: { name: "Jesus our Healer", color: "#0000FF" },
    YELLOW: { name: "Jesus The Holy Ghost Baptizer", color: "#FFD700" },
    PURPLE: { name: "Jesus our coming King", color: "#800080" }
};

export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const goToNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    };

    const goToPrevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
    };

    return (
        <div className="relative h-screen overflow-hidden">
            {/* Carousel */}
            <div className="relative h-full">
                {CAROUSEL_IMAGES.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                            index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${image})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center text-center px-2">
                <div className="text-white max-w-4xl mx-auto w-full">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent px-2">
                        Welcome to Sports Fiesta 4.0
                    </h1>
                    <p className="text-xl md:text-2xl lg:text-3xl mb-6 md:mb-8 font-light animate-fade-in-delay text-indigo-200">
                        All Winners
                    </p>
                    <div className="animate-fade-in-delay-2">
                        <Link
                            to="/register"
                            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>

            {/* Team badges section */}
            <div className="absolute bottom-16 md:bottom-20 left-0 right-0 px-2">
                <div className="flex justify-center space-x-2 md:space-x-4 lg:space-x-6">
                    {Object.keys(TEAMS).map((teamKey) => {
                        const team = TEAMS[teamKey];
                        return (
                            <div
                                key={teamKey}
                                className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-3 border border-white/20"
                                style={{ borderLeftColor: team.color, borderLeftWidth: "4px" }}
                            >
                                <div
                                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold mb-1 md:mb-2"
                                    style={{ backgroundColor: team.color }}
                                >
                                    {teamKey.charAt(0)}
                                </div>
                                <span className="text-xs text-white font-medium max-w-[70px] md:max-w-[80px] text-center leading-tight hidden sm:block">
                  {team.name}
                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation arrows */}
            <button
                onClick={goToPrevSlide}
                className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-indigo-800/50 text-white p-2 md:p-3 rounded-full hover:bg-indigo-700/70 transition-all z-10 backdrop-blur-sm"
                aria-label="Previous slide"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={goToNextSlide}
                className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-indigo-800/50 text-white p-2 md:p-3 rounded-full hover:bg-indigo-700/70 transition-all z-10 backdrop-blur-sm"
                aria-label="Next slide"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-24 md:bottom-28 left-0 right-0 flex justify-center space-x-2 z-10">
                {CAROUSEL_IMAGES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                            index === currentSlide ? "bg-white" : "bg-indigo-300"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>

            {/* Add custom animations */}
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 0.5s forwards;
          opacity: 0;
        }
        .animate-fade-in-delay-2 {
          animation: fadeIn 1s ease-out 1s forwards;
          opacity: 0;
        }
      `}</style>
        </div>
    );
}