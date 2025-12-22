"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@workspace/ui/components/calendar";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  // Validate and normalize the date
  const validDate = React.useMemo(() => {
    if (!date) return undefined;
    // Handle Firestore Timestamp objects or invalid dates
    const dateObj = date instanceof Date ? date : new Date(date);
    return isNaN(dateObj.getTime()) ? undefined : dateObj;
  }, [date]);

  const formattedDate = React.useMemo(() => {
    if (!validDate) return null;
    try {
      return format(validDate, "PPP");
    } catch {
      return null;
    }
  }, [validDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal bg-card cursor-pointer",
            !validDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-card" align="start">
        <Calendar
          mode="single"
          selected={validDate}
          onSelect={onDateChange}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
