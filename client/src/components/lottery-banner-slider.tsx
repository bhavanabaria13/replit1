import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Coins, Clock, Users, Zap, Target } from "lucide-react";

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  cta: string;
}

const slides: BannerSlide[] = [
  {
    id: 1,
    title: "Win Big Today!",
    subtitle: "0.1 SCAI Prize Pool",
    description: "Join the ultimate crypto lottery with real blockchain prizes",
    icon: <Trophy className="w-8 h-8 text-white" />,
    gradient: "gradient-bg-primary",
    glow: "glow-green",
    cta: "Buy Tickets Now",
  },
  {
    id: 2,
    title: "Only 0.01 SCAI",
    subtitle: "Affordable Entry",
    description: "Low cost, high rewards. Get your lucky ticket today!",
    icon: <Coins className="w-8 h-8 text-white" />,
    gradient: "gradient-bg-secondary",
    glow: "glow-blue",
    cta: "Start Playing",
  },
  {
    id: 3,
    title: "24 Hour Draws",
    subtitle: "Daily Winners",
    description: "New lottery round every day with guaranteed winners",
    icon: <Clock className="w-8 h-8 text-white" />,
    gradient: "gradient-bg-accent",
    glow: "glow-purple",
    cta: "Join Now",
  },
  {
    id: 4,
    title: "Decentralized",
    subtitle: "100% Fair",
    description: "Smart contract ensures transparent and fair lottery draws",
    icon: <Zap className="w-8 h-8 text-white" />,
    gradient: "gradient-bg-primary",
    glow: "glow-green",
    cta: "Learn More",
  },
];

export function LotteryBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const current = slides[currentSlide];

  return (
    <div className="relative w-full max-w-6xl mx-auto mb-16">
      <Card
        className={`${current.gradient} ${current.glow} border-0 overflow-hidden transition-all duration-1000 glass-card`}
      >
        <CardContent className="p-0">
          <div className="relative h-72 md:h-96 flex items-center">
            {/* Professional Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-6 right-6">
                <Users className="w-40 h-40 text-white/30" />
              </div>
              <div className="absolute bottom-6 left-6">
                <Target className="w-32 h-32 text-white/30" />
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-96 h-96 border border-white/10 rounded-full" />
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-between w-full px-8 md:px-12">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {current.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">
                      {current.title}
                    </h2>
                    <p className="text-xl md:text-2xl text-white/90 font-medium">
                      {current.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-lg text-white/80 mb-6 max-w-md">
                  {current.description}
                </p>

                <Button
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300 font-medium px-8 py-3"
                  onClick={() =>
                    document
                      .getElementById("ticket-grid")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  {current.cta}
                </Button>
              </div>

              {/* Decorative Elements */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white" />
                    </div>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/30 rounded-full animate-bounce" />
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-white/40 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slide Navigation Dots */}
      <div className="flex items-center justify-center space-x-3 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-green-500 w-8"
                : "bg-slate-600 hover:bg-slate-500"
            }`}
          />
        ))}

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="ml-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
        >
          {isPlaying ? (
            <div className="w-3 h-3">
              <div className="flex space-x-1">
                <div className="w-1 h-3 bg-white rounded" />
                <div className="w-1 h-3 bg-white rounded" />
              </div>
            </div>
          ) : (
            <div className="w-3 h-3 border-l-4 border-l-white border-y-2 border-y-transparent" />
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 w-full bg-slate-700 rounded-full h-1 overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-1000 ease-linear"
          style={{
            width: isPlaying
              ? "100%"
              : `${((currentSlide + 1) / slides.length) * 100}%`,
            animation: isPlaying ? "progress 4s linear infinite" : "none",
          }}
        />
      </div>
    </div>
  );
}
