import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import type { Dayjs } from 'dayjs';
import { forwardRef, useImperativeHandle, useState } from 'react';
import dayjs from 'dayjs';

interface DatePickerProps {
  onDateTimeChange?: (dateTime: string | null) => void;
}

export interface DatePickerRef {
  openPicker: () => void;
}

export const DatePickerComponent = forwardRef<DatePickerRef, DatePickerProps>(
  ({ onDateTimeChange }, ref) => {
    const [value, setValue] = useState<Dayjs | null>(null);
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      openPicker: () => setOpen(true),
    }));

    const handleDateTimeChange = (newValue: Dayjs | null) => {
      setValue(newValue);
      onDateTimeChange?.(newValue ? newValue.format('YYYY-MM-DD HH:mm:ss') : null);
    };

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          value={value}
          onChange={handleDateTimeChange}
          ampm={false}
          format={value ? 'DD.MM HH:mm' : 'Wybierz datę i czas'}
          minDateTime={dayjs()} // Блокуємо минулі дати та час
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
        />
      </LocalizationProvider>
    );
  }
);

DatePickerComponent.displayName = 'DatePickerComponent';