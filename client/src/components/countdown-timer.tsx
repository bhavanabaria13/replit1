import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Trophy, Zap, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  endTime: Date;
  onTimeExpired?: () => void;
}

// Sound utility functions
const playNotificationSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIcBDuH3/JTd1kCKT+rJwJGpV/k');
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Silent fail if audio blocked
  } catch (error) {
    // Silent fail if audio not supported
  }
};

const playUrgentSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRn4CAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVoCAAC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (error) {
    // Silent fail
  }
};

export function CountdownTimer({ endTime, onTimeExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });
  const [lastNotificationTime, setLastNotificationTime] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTimeMs = new Date(endTime).getTime();
      const difference = endTimeMs - now;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft(prev => {
          const newState = { hours, minutes, seconds, total: difference };
          
          // Sound notifications
          const currentTime = Date.now();
          if (currentTime - lastNotificationTime > 5000) { // Prevent spam
            if (hours === 0 && minutes === 10 && seconds === 0) {
              playUrgentSound();
              setLastNotificationTime(currentTime);
            } else if (hours === 0 && minutes === 5 && seconds === 0) {
              playUrgentSound();
              setLastNotificationTime(currentTime);
            } else if (hours === 0 && minutes === 1 && seconds === 0) {
              playUrgentSound();
              setLastNotificationTime(currentTime);
            } else if (hours === 0 && minutes === 0 && seconds <= 10 && seconds > 0) {
              playNotificationSound();
              setLastNotificationTime(currentTime);
            }
          }
          
          return newState;
        });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, total: 0 });
        playUrgentSound();
        if (onTimeExpired) {
          onTimeExpired();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onTimeExpired, lastNotificationTime]);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const getUrgencyColor = () => {
    if (timeLeft.total <= 0) return 'text-red-500';
    if (timeLeft.hours === 0 && timeLeft.minutes <= 10) return 'text-red-400';
    if (timeLeft.hours < 1) return 'text-orange-400';
    if (timeLeft.hours < 3) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const getBackgroundColor = () => {
    if (timeLeft.total <= 0) return 'bg-red-500/30 border-red-500 shadow-lg shadow-red-500/20';
    if (timeLeft.hours === 0 && timeLeft.minutes <= 10) return 'bg-red-500/20 border-red-500 animate-pulse shadow-lg shadow-red-500/20';
    if (timeLeft.hours < 1) return 'bg-orange-500/20 border-orange-500 shadow-lg shadow-orange-500/20';
    if (timeLeft.hours < 3) return 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20';
    return 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20';
  };

  const getIcon = () => {
    if (timeLeft.total <= 0) return <Trophy className="w-12 h-12 text-red-500 animate-bounce" />;
    if (timeLeft.hours === 0 && timeLeft.minutes <= 10) return <AlertTriangle className="w-10 h-10 text-red-400 animate-pulse" />;
    if (timeLeft.hours < 1) return <Zap className="w-8 h-8 text-orange-400" />;
    return <Clock className="w-8 h-8 text-emerald-400" />;
  };

  const getAnnouncementMessage = () => {
    if (timeLeft.total <= 0) return "🎉 LOTTERY DRAW IN PROGRESS! Winner being selected...";
    if (timeLeft.hours === 0 && timeLeft.minutes <= 1) return "⚡ FINAL MINUTE! Last chance to buy tickets!";
    if (timeLeft.hours === 0 && timeLeft.minutes <= 5) return "🔥 URGENT: Only 5 minutes left to participate!";
    if (timeLeft.hours === 0 && timeLeft.minutes <= 10) return "⏰ WARNING: Less than 10 minutes remaining!";
    if (timeLeft.hours < 1) return "🚨 Less than 1 hour left! Don't miss out!";
    return "⏳ Next Lottery Draw In";
  };

  if (timeLeft.total <= 0) {
    return (
      <Card className={`${getBackgroundColor()} border-4`}>
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            {getIcon()}
            <h3 className="text-2xl md:text-3xl font-bold text-red-500">LOTTERY DRAWING!</h3>
          </div>
          <p className="text-red-400 text-lg font-medium animate-pulse">
            🎉 The winner is being selected! Check back soon for results!
          </p>
          <div className="mt-4 text-red-300 text-sm">
            Winner announcement coming shortly...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${getBackgroundColor()} border-2 transition-all duration-500 ${timeLeft.hours === 0 && timeLeft.minutes <= 10 ? 'scale-105' : ''}`}>
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center justify-center space-x-3 mb-6">
          {getIcon()}
          <h3 className={`text-xl md:text-2xl font-bold ${getUrgencyColor()}`}>
            {getAnnouncementMessage()}
          </h3>
        </div>
        
        <div className="grid grid-cols-3 gap-6 text-center mb-6">
          <div className="space-y-2">
            <div className={`text-4xl md:text-6xl font-bold font-mono ${getUrgencyColor()} ${timeLeft.hours === 0 && timeLeft.minutes <= 10 ? 'animate-pulse' : ''}`}>
              {formatTime(timeLeft.hours)}
            </div>
            <div className="text-sm md:text-base text-slate-400 uppercase tracking-wide font-medium">Hours</div>
          </div>
          
          <div className="space-y-2">
            <div className={`text-4xl md:text-6xl font-bold font-mono ${getUrgencyColor()} ${timeLeft.hours === 0 && timeLeft.minutes <= 10 ? 'animate-pulse' : ''}`}>
              {formatTime(timeLeft.minutes)}
            </div>
            <div className="text-sm md:text-base text-slate-400 uppercase tracking-wide font-medium">Minutes</div>
          </div>
          
          <div className="space-y-2">
            <div className={`text-4xl md:text-6xl font-bold font-mono ${getUrgencyColor()} ${timeLeft.hours === 0 && timeLeft.minutes <= 10 ? 'animate-pulse' : ''}`}>
              {formatTime(timeLeft.seconds)}
            </div>
            <div className="text-sm md:text-base text-slate-400 uppercase tracking-wide font-medium">Seconds</div>
          </div>
        </div>

        {/* Urgency Messages */}
        {timeLeft.hours === 0 && timeLeft.minutes <= 10 && (
          <div className="text-center p-4 bg-red-600/20 rounded-lg border border-red-500/30 animate-pulse">
            <p className="text-red-300 font-bold text-lg">
              🚨 FINAL COUNTDOWN! Buy tickets NOW! 🚨
            </p>
          </div>
        )}
        
        {timeLeft.hours < 1 && timeLeft.minutes > 10 && (
          <div className="text-center p-3 bg-orange-600/20 rounded-lg border border-orange-500/30">
            <p className="text-orange-300 font-medium">
              🔥 Less than 1 hour remaining! Time is running out!
            </p>
          </div>
        )}

        {timeLeft.hours >= 1 && timeLeft.hours < 3 && (
          <div className="text-center p-3 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-300 font-medium">
              ⚡ Get your tickets before the rush!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}