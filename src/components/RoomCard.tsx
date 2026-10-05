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
      className={`group relative cursor-pointer rounded-2xl p-3 sm:p-4 transition-all duration-200 border ${
        isSelected
          ? 'bg-white dark:bg-slate-900 border-emerald-600 dark:border-emerald-500 shadow-md ring-2 ring-emerald-600/10'
          : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 border-stone-200 dark:border-slate-800 hover:border-stone-300 dark:hover:border-slate-700 hover:shadow-sm'
      }`}
    >
      <div className="flex flex-row items-start sm:items-center gap-3 sm:gap-4">
        {/* Room Thumbnail */}
        <div className="relative w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden bg-stone-100 dark:bg-slate-800 flex-shrink-0">
          <img
            src={room.image}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {bookingCountToday > 0 && (
            <div className="absolute top-1 left-1 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-stone-900/85 dark:bg-slate-950/85 backdrop-blur-sm text-white text-[9px] sm:text-[11px] font-medium">
              {bookingCountToday} คิว
            </div>
          )}
        </div>

        {/* Room Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <h3 className="font-semibold text-stone-900 dark:text-white text-sm sm:text-base group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors truncate">
              {room.name}
            </h3>
            {isSelected && (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">กำลังเลือก</span>
              </span>
            )}
          </div>

          <p className="text-[11px] sm:text-xs text-stone-500 dark:text-slate-400 line-clamp-1 mb-2">
            {room.description}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-stone-600 dark:text-slate-300 mb-2 sm:mb-2.5">
            <span className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
              <Users className="w-3 h-3 text-stone-500 dark:text-slate-400" />
              {room.capacity} ท่าน
            </span>
            <span className="flex items-center gap-1 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md truncate max-w-[120px] sm:max-w-none">
              <MapPin className="w-3 h-3 text-stone-500 dark:text-slate-400 flex-shrink-0" />
              <span className="truncate">{room.location}</span>
            </span>
          </div>

          {/* Amenities tags */}
          <div className="hidden sm:flex flex-wrap gap-1.5">
            {room.amenities.map((item, idx) => (
              <span
                key={idx}
                className="text-[10px] sm:text-[11px] text-stone-600 dark:text-slate-300 bg-stone-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-md"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Select Action Button */}
        <div className="self-center flex-shrink-0">
          <button
            className={`flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition-all ${
              isSelected
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-200 hover:bg-stone-200 dark:hover:bg-slate-700'
            }`}
          >
            <span className="hidden xs:inline">{isSelected ? 'เลือกอยู่' : 'เลือก'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
