"use client";
import React, { useState } from "react";
import { Calendar, Clock, Trash2 } from "lucide-react";
import { NotificationFormData, EnumItem } from "../types/types";
import DropdownSelector from "@/app/components/ui/DropdownSelector";

interface SetFrequencyTabProps {
  formData: NotificationFormData;
  updateFormData: (data: Partial<NotificationFormData>) => void;
  frequencies: EnumItem[];
  daysOfWeek: EnumItem[];
}

const SetFrequencyTab: React.FC<SetFrequencyTabProps> = ({
  formData,
  updateFormData,
  frequencies,
  daysOfWeek,
}) => {
  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = useState(false);
  const [selectedDayForTime, setSelectedDayForTime] = useState<string>("");
  const [timeInputMode, setTimeInputMode] = useState<"repeat" | "new">("new");

  const isOnce = formData.frequencyType === "ONE_TIME";
  const isDaily = formData.frequencyType === "DAILY";
  const isWeekly = formData.frequencyType === "WEEKLY";
  const isCustom = formData.frequencyType === "CUSTOM";

  const handleDayToggle = (dayId: string) => {
    const currentDays = [...formData.selectedDays];
    if (currentDays.includes(dayId)) {
      updateFormData({
        selectedDays: currentDays.filter((id) => id !== dayId),
      });

      if (formData.customSchedule[dayId]) {
        const newSchedule = { ...formData.customSchedule };
        delete newSchedule[dayId];
        updateFormData({ customSchedule: newSchedule });
      }
    } else {
      updateFormData({ selectedDays: [...currentDays, dayId] });
    }
  };

  const handleAddTimeToDay = (dayId: string, time: string) => {
    const newSchedule = { ...formData.customSchedule };
    if (!newSchedule[dayId]) {
      newSchedule[dayId] = [];
    }
    newSchedule[dayId].push(time);
    updateFormData({ customSchedule: newSchedule });
  };

  const handleRemoveTimeFromDay = (dayId: string, timeIndex: number) => {
    const newSchedule = { ...formData.customSchedule };
    newSchedule[dayId].splice(timeIndex, 1);
    if (newSchedule[dayId].length === 0) {
      delete newSchedule[dayId];
    }
    updateFormData({ customSchedule: newSchedule });
  };

  const getDayName = (dayId: string) => {
    return daysOfWeek.find((d) => d.id === dayId)?.value || "";
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
          <span className="text-red-500">*</span> Frequency Type
        </label>
        <DropdownSelector
          label=""
          options={frequencies.map((f) => f.value)}
          selected={formData.frequencyType}
          placeholder="Choose Notification Frequency"
          open={frequencyDropdownOpen}
          toggleOpen={() => setFrequencyDropdownOpen(!frequencyDropdownOpen)}
          onSelect={(value) => {
            const selected = frequencies.find((f) => f.value === value);
            if (selected) {
              updateFormData({
                frequencyType: selected.value,
                frequencyTypeId: selected.id,
                selectedDays: [],
                customSchedule: {},
                startDate: "",
                endDate: "",
                notificationTime: "",
              });
            }
          }}
        />
      </div>

      {!formData.frequencyType && (
        <div className="text-center py-8 text-[#899193] text-[12px]">
          Please select a frequency type to continue
        </div>
      )}

      {/* Once Frequency */}
      {isOnce && (
        <div className="space-y-4">
          <div className="text-[10px] text-[#899193] italic">
            (Start date & time should be at-least 30 min. before schedule)
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
                <span className="text-red-500">*</span> Select Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    updateFormData({ startDate: e.target.value })
                  }
                  className="w-full px-4 py-2 pr-10 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
                <span className="text-red-500">*</span> Select Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.notificationTime}
                  onChange={(e) =>
                    updateFormData({ notificationTime: e.target.value })
                  }
                  className="w-full px-4 py-2 pr-10 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Frequency */}
      {isDaily && (
        <div className="space-y-4">
          <div className="text-[10px] text-[#899193] italic">
            (Start date & time should be at-least 30 min. before schedule)
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
                <span className="text-red-500">*</span> Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    updateFormData({ startDate: e.target.value })
                  }
                  placeholder="Choose Start Date"
                  className="w-full px-4 py-2 pr-10 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder:text-[#B0B6B8] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData({ endDate: e.target.value })}
                  placeholder="Choose End Date"
                  className="w-full px-4 py-2 pr-10 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder:text-[#B0B6B8] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
              <span className="text-red-500">*</span> Select Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.notificationTime}
                onChange={(e) =>
                  updateFormData({ notificationTime: e.target.value })
                }
                className="w-full px-4 py-2 pr-10 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
              <span className="text-red-500">*</span> Select Days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleDayToggle(day.id)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                    formData.selectedDays.includes(day.id)
                      ? "bg-[#4A5558] text-white"
                      : "bg-white text-[#161D1F] border border-[#E5E8E9] hover:border-[#0088B1]"
                  }`}
                >
                  {day.value.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Frequency */}
      {isWeekly && (
        <div className="space-y-4">
          <div className="text-[10px] text-[#899193] italic">
            (Start date & time should be at-least 30 min. before schedule)
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
                <span className="text-red-500">*</span> Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    updateFormData({ startDate: e.target.value })
                  }
                  placeholder="Choose Start Date"
                  className="w-full px-4 py-2 pr-10 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder:text-[#B0B6B8] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData({ endDate: e.target.value })}
                  placeholder="Choose End Date"
                  className="w-full px-4 py-2 pr-10 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder:text-[#B0B6B8] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
              <span className="text-red-500">*</span> Select Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={formData.notificationTime}
                onChange={(e) =>
                  updateFormData({ notificationTime: e.target.value })
                }
                className="w-full px-4 py-2 pr-10 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
              <span className="text-red-500">*</span> Select Days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleDayToggle(day.id)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                    formData.selectedDays.includes(day.id)
                      ? "bg-[#4A5558] text-white"
                      : "bg-white text-[#161D1F] border border-[#E5E8E9] hover:border-[#0088B1]"
                  }`}
                >
                  {day.value.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Custom Frequency */}
      {isCustom && (
        <div className="space-y-4">
          <div className="text-[10px] text-[#899193] italic">
            (Start date & time should be at-least 30 min. before schedule)
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
                <span className="text-red-500">*</span> Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    updateFormData({ startDate: e.target.value })
                  }
                  placeholder="Choose Start Date"
                  className="w-full px-4 py-2 pr-10 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder:text-[#B0B6B8] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData({ endDate: e.target.value })}
                  placeholder="Choose End Date"
                  className="w-full px-4 py-2 pr-10 border border-[#E5E8E9] rounded-lg text-[12px] text-[#161D1F] placeholder:text-[#B0B6B8] focus:border-[#0088B1] focus:outline-none focus:ring-1 focus:ring-[#0088B1]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#161D1F] mb-2">
              <span className="text-red-500">*</span> Select Days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleDayToggle(day.id)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                    formData.selectedDays.includes(day.id)
                      ? "bg-[#4A5558] text-white"
                      : "bg-white text-[#161D1F] border border-[#E5E8E9] hover:border-[#0088B1]"
                  }`}
                >
                  {day.value.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {formData.selectedDays.length > 0 && (
            <div className="bg-[#F5F5F5] rounded-lg p-4 space-y-3">
              <div className="text-[12px] font-medium text-[#161D1F] mb-3">
                Set Custom Times for Selected Days
              </div>
              <div className="space-y-2">
                {formData.selectedDays.map((dayId) => (
                  <div key={dayId}>
                    {selectedDayForTime !== dayId && (
                      <button
                        onClick={() => setSelectedDayForTime(dayId)}
                        className="text-[12px] text-[#0088B1] hover:underline"
                      >
                        + Add time for {getDayName(dayId)}
                      </button>
                    )}

                    {selectedDayForTime === dayId && (
                      <div className="space-y-2 bg-white p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={timeInputMode === "repeat"}
                              onChange={() => setTimeInputMode("repeat")}
                              className="w-4 h-4 text-[#0088B1]"
                            />
                            <span className="text-[10px] text-[#161D1F]">
                              Repeat timing from previous day
                            </span>
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              checked={timeInputMode === "new"}
                              onChange={() => setTimeInputMode("new")}
                              className="w-4 h-4 text-[#0088B1]"
                            />
                            <span className="text-[10px] text-[#161D1F]">
                              Set a new time
                            </span>
                          </label>
                        </div>

                        {timeInputMode === "new" && (
                          <div className="flex gap-2">
                            <input
                              type="time"
                              onBlur={(e) => {
                                if (e.target.value) {
                                  handleAddTimeToDay(dayId, e.target.value);
                                  e.target.value = "";
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-[#E5E8E9] rounded-lg text-[12px]"
                            />
                          </div>
                        )}
                        <button
                          onClick={() => setSelectedDayForTime("")}
                          className="text-[10px] text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {formData.customSchedule[dayId]?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-[10px] font-medium text-[#161D1F]">
                          {getDayName(dayId)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.customSchedule[dayId].map((time, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 bg-white px-3 py-1 rounded border border-[#E5E8E9]"
                            >
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] text-[#161D1F]">
                                {time}
                              </span>
                              <button
                                onClick={() =>
                                  handleRemoveTimeFromDay(dayId, idx)
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SetFrequencyTab;
