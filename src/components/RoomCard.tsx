'use client';

import React from 'react';
import { Users, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';
import { Room } from '@/lib/types';

interface RoomCardProps {
  room: Room;
  isSelected: boolean;
  onSelect: (room: Room) => void;
  bookingCountToday: number;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isSelected,
  onSelect,
  bookingCountToday,
}) => {
  return (
    <div
      onClick={() => onSelect(room)}
      className={`group relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border ${
        isSelected
          ? 'bg-white dark:bg-slate-900 border-emerald-600 dark:border-emerald-500 shadow-md ring-2 ring-emerald-600/10'
          : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border-stone-200 dark:border-slate-800 hover:border-stone-300 dark:hover:border-slate-700 hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Room Thumbnail */}
        <div className="relative w-full sm:w-28 h-24 rounded-xl overflow-hidden bg-stone-100 dark:bg-slate-800 flex-shrink-0">
          <img
            src={room.image}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {bookingCountToday > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-stone-900/80 dark:bg-slate-950/80 backdrop-blur-sm text-white text-[11px] font-medium">
              วันนี้มี {bookingCountToday} คิว
            </div>
          )}
        </div>

        {/* Room Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-stone-900 dark:text-white text-base group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors truncate">
              {room.name}
            </h3>
            {isSelected && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                กำลังเลือก
              </span>
            )}
          </div>

          <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-1 mb-2.5">
            {room.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 dark:text-slate-300 mb-3">
            <span className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              <Users className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
              รองรับ {room.capacity} ท่าน
            </span>
            <span className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-stone-500 dark:text-slate-400" />
              {room.location}
            </span>
          </div>

          {/* Amenities tags */}
          <div className="flex flex-wrap gap-1.5">
            {room.amenities.map((item, idx) => (
              <span
                key={idx}
                className="text-[11px] text-stone-600 dark:text-slate-300 bg-stone-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Select Action Button */}
        <div className="self-end sm:self-center">
          <button
            className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              isSelected
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-200 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{isSelected ? 'เลือกอยู่' : 'เลือกห้องนี้'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
