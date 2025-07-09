'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { Clock, MapPin, Calendar } from 'lucide-react';

interface PrayerTime {
  name: string;
  time: string;
}

interface PrayerTimeSchedulingProps {
  selectedDate?: Date;
  selectedTime?: string;
  onTimeSelect?: (time: string) => void;
  location?: string;
  className?: string;
}

// Sample prayer times for Sydney, Australia (MSA location)
const getSydneyPrayerTimes = (date: Date): PrayerTime[] => {
  // This would typically come from an API like Al-Adhan
  // For now, using approximate times for Sydney
  return [
    { name: 'Fajr', time: '04:30' },
    { name: 'Dhuhr', time: '12:15' },
    { name: 'Asr', time: '15:45' },
    { name: 'Maghrib', time: '18:30' },
    { name: 'Isha', time: '20:00' }
  ];
};

const isPrayerTime = (time: string, prayerTimes: PrayerTime[]): PrayerTime | null => {
  const timeMinutes = timeToMinutes(time);
  
  for (const prayer of prayerTimes) {
    const prayerMinutes = timeToMinutes(prayer.time);
    // Check if within 30 minutes before or after prayer time
    if (Math.abs(timeMinutes - prayerMinutes) <= 30) {
      return prayer;
    }
  }
  return null;
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

const getSuggestedTimes = (prayerTimes: PrayerTime[]): string[] => {
  const suggestions: string[] = [];
  
  prayerTimes.forEach((prayer, index) => {
    const prayerMinutes = timeToMinutes(prayer.time);
    
    // Add time 1 hour after prayer
    suggestions.push(minutesToTime(prayerMinutes + 60));
    
    // Add time 30 minutes before next prayer (if exists)
    if (index < prayerTimes.length - 1) {
      const nextPrayerMinutes = timeToMinutes(prayerTimes[index + 1].time);
      suggestions.push(minutesToTime(nextPrayerMinutes - 30));
    }
  });
  
  return suggestions.filter((time, index, arr) => arr.indexOf(time) === index).sort();
};

export const PrayerTimeScheduling: React.FC<PrayerTimeSchedulingProps> = ({
  selectedDate = new Date(),
  selectedTime = '',
  onTimeSelect,
  location = 'Sydney, NSW',
  className = ''
}) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [conflictingPrayer, setConflictingPrayer] = useState<PrayerTime | null>(null);
  const [suggestedTimes, setSuggestedTimes] = useState<string[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    const times = getSydneyPrayerTimes(selectedDate);
    setPrayerTimes(times);
    setSuggestedTimes(getSuggestedTimes(times));
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime && prayerTimes.length > 0) {
      const conflict = isPrayerTime(selectedTime, prayerTimes);
      setConflictingPrayer(conflict);
      
      if (conflict) {
        addToast({
          title: 'Prayer Time Conflict',
          description: `The selected time conflicts with ${conflict.name} prayer. Consider choosing a different time.`,
          type: 'warning',
          duration: 6000
        });
      }
    }
  }, [selectedTime, prayerTimes, addToast]);

  const handleTimeSelect = (time: string) => {
    onTimeSelect?.(time);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Prayer Times Display */}
      <div className="bg-msa-light-sage/20 rounded-lg p-4 border border-msa-light-sage">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-msa-brand" />
          <h3 className="font-semibold text-msa-charcoal">Prayer Times</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-2 text-sm">
          {prayerTimes.map((prayer) => (
            <div 
              key={prayer.name}
              className={`text-center p-2 rounded border ${
                conflictingPrayer?.name === prayer.name 
                  ? 'bg-warning/20 border-warning text-warning-foreground' 
                  : 'bg-msa-soft-white border-msa-light-sage'
              }`}
            >
              <div className="font-medium text-msa-brand">{prayer.name}</div>
              <div className="text-msa-charcoal">{prayer.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Conflict Warning */}
      {conflictingPrayer && (
        <div className="bg-warning/10 border border-warning rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 text-warning mt-0.5">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-warning-foreground">
                Time Conflicts with {conflictingPrayer.name} Prayer
              </h4>
              <p className="text-sm text-warning-foreground/80 mt-1">
                The selected time may interfere with prayer obligations. Consider choosing a time that allows adequate preparation and reflection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Suggested Times */}
      <div className="space-y-3">
        <h4 className="font-medium text-msa-charcoal flex items-center gap-2">
          <Calendar className="h-4 w-4 text-msa-brand" />
          Recommended Times
          <span className="text-xs text-muted-foreground">(Considering prayer schedule)</span>
        </h4>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {suggestedTimes.map((time) => {
            const isSelected = selectedTime === time;
            const isConflicting = isPrayerTime(time, prayerTimes);
            
            return (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`
                  p-2 rounded border text-sm font-medium transition-all duration-200
                  ${isSelected 
                    ? 'bg-msa-brand text-white border-msa-brand' 
                    : isConflicting
                    ? 'bg-warning/10 border-warning text-warning-foreground hover:bg-warning/20'
                    : 'bg-msa-soft-white border-msa-light-sage text-msa-charcoal hover:bg-msa-light-sage/30'
                  }
                `}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>

      {/* Islamic Note */}
      <div className="text-xs text-muted-foreground bg-msa-cream/50 rounded p-3 border-l-4 border-msa-golden">
        <p className="mb-1">
          <span className="font-medium text-msa-brand">Islamic Consideration:</span> 
          Event scheduling respects prayer times to maintain spiritual obligations.
        </p>
        <p className="arabic-text text-msa-brand">
          الصلاة خير من النوم - Prayer is better than sleep
        </p>
      </div>
    </div>
  );
};

export default PrayerTimeScheduling;