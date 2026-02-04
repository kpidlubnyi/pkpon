import { Autocomplete, TextField } from "@mui/material";
import { useStopsStore } from "../../store/StopsStore";
import type { Stop } from "../../types";
import { useRef, useState } from "react";
import css from './RouteSearch.module.css';
import SwapIcon from '../../assets/icons/swap.svg?react';
import CalenderIcon from '../../assets/icons/calender.svg?react';
import { DatePickerComponent, type DatePickerRef } from "../DatePicker/DatePicker";
import { parseDateTimeString } from "../../utils/DateTimeParser";
import { useSearchHistory } from "../../hooks/useSearchHistory";

interface RouteSearchProps {
  onRouteSearch?: (from: Stop, to: Stop, date?: string, time?: string) => void;
}

export const RouteSearch = ({ onRouteSearch }: RouteSearchProps) => {
  const { stops } = useStopsStore();
  const datePickerRef = useRef<DatePickerRef>(null);
  
  const [fromInputValue, setFromInputValue] = useState('');
  const [fromValue, setFromValue] = useState<Stop | null>(null);
  
  const [toInputValue, setToInputValue] = useState('');
  const [toValue, setToValue] = useState<Stop | null>(null);

  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null);

  const fromHistory = useSearchHistory('from');
  const toHistory = useSearchHistory('to');

  const handleSearch = () => {
    if (fromValue && toValue) {
      const { date, time } = parseDateTimeString(selectedDateTime);
      onRouteSearch?.(fromValue, toValue, date ?? undefined, time ?? undefined);
    }
  };

  const handleSwap = () => {
    const tempValue = fromValue;
    const tempInputValue = fromInputValue;
    
    setFromValue(toValue);
    setFromInputValue(toInputValue);
    setToValue(tempValue);
    setToInputValue(tempInputValue);
  };

  const handleCalendarClick = () => {
    datePickerRef.current?.openPicker();
  };

  const handleDateTimeChange = (dateTime: string | null) => {
    setSelectedDateTime(dateTime);
  };

  const getFilteredOptions = (
    inputValue: string,
    history: Stop[],
    allStops: Stop[]
  ): Stop[] => {
    if (inputValue.length === 0) {
      return history;
    }
    
    const filtered = allStops.filter(stop =>
      stop.stop_name.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    return filtered;
  };

  return (
    <div className={css['route-search-container']}>
      <Autocomplete<Stop>
        value={fromValue}
        options={stops}
        disablePortal
        openOnFocus={true}
        inputValue={fromInputValue}
        onInputChange={(_, value) => setFromInputValue(value)}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.stop_name
        }
        filterOptions={() => 
          getFilteredOptions(fromInputValue, fromHistory.history, stops)
        }
        isOptionEqualToValue={(option, value) => option.stop_id === value.stop_id}
        onChange={(_, newValue) => {
          setFromValue(newValue);
          if (newValue) {
            fromHistory.addToHistory(newValue);
          }
        }}
        groupBy={(option) => {
          if (fromInputValue.length === 0 && fromHistory.history.length > 0) {
            const isInHistory = fromHistory.history.some(
              h => h.stop_id === option.stop_id
            );
            return isInHistory ? 'Ostatnio wyszukiwane' : '';
          }
          return '';
        }}
        sx={{
          height: 45,
          width: 240,
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          backgroundColor: '#d2cfcf76',
          borderRadius: 26,
        }}
        slotProps={{
          paper: {
            sx: {
              fontFamily: 'var(--font-family)',
              fontSize: 14,
              borderRadius: 7,
              backgroundColor: '#eeeeee',
              width: 239,
              maxHeight: 'none',
              overflow: 'visible'
            },
          },
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [-7, 3],
                },
              },
              {
                name: 'preventOverflow',
                enabled: false,
              },
            ],
            sx: {
              '& .MuiAutocomplete-listbox': {
                borderRadius: 7,
                maxHeight: '400px',
                overflowY: 'scroll',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              },
              '& .MuiAutocomplete-groupLabel': {
                fontFamily: 'var(--font-family)',
                fontSize: 11,
                fontWeight: 600,
                color: '#666',
                backgroundColor: '#eeeeee',
                position: 'sticky',
                top: 0,
                px: 2,
                py: 0.3,
                lineHeight: 1.4,
              },
              '& .MuiAutocomplete-option': {
                fontFamily: 'var(--font-family)',
                backgroundColor: '#c8c8c8c0',
                borderRadius: 6,
                mx: 1,
                my: 0.5,
                px: 2,
                fontSize: 14,
                transition: 'background-color 0.2s ease-out',
                '&:hover, &.Mui-focused': {
                  backgroundColor: '#79b3f38b'
                }
              },
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Skąd..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'var(--font-family)',
                fontSize: 14,
                borderRadius: 26,
                backgroundColor: '#eeeeeea7',
                height: 34,
                top: 5,
                left: 8,
                width: 224,
                px: 1,
              },
              '& fieldset': {
                border: 'none',
              },
            }}
          />
        )}
      />

      <button
        className={css['swap-button']}
        onClick={handleSwap}
        aria-label="switch"
        disabled={!fromValue && !toValue}
      >
        <SwapIcon width={16} height={16} />
      </button>

      <Autocomplete<Stop>
        value={toValue}
        options={stops}
        disablePortal
        openOnFocus={true}
        inputValue={toInputValue}
        onInputChange={(_, value) => setToInputValue(value)}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.stop_name
        }
        filterOptions={() => 
          getFilteredOptions(toInputValue, toHistory.history, stops)
        }
        isOptionEqualToValue={(option, value) => option.stop_id === value.stop_id}
        onChange={(_, newValue) => {
          setToValue(newValue);
          if (newValue) {
            toHistory.addToHistory(newValue);
          }
        }}
        groupBy={(option) => {
          if (toInputValue.length === 0 && toHistory.history.length > 0) {
            const isInHistory = toHistory.history.some(
              h => h.stop_id === option.stop_id
            );
            return isInHistory ? 'Ostatnio wyszukiwane' : '';
          }
          return '';
        }}
        sx={{
          height: 45,
          width: 240,
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          backgroundColor: '#d2cfcf76',
          borderRadius: 26,
        }}
        slotProps={{
          paper: {
            sx: {
              fontFamily: 'var(--font-family)',
              fontSize: 14,
              borderRadius: 7,
              backgroundColor: '#eeeeee',
              width: 239,
              maxHeight: 'none',
              overflow: 'visible'
            },
          },
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [-7, 3],
                },
              },
              {
                name: 'preventOverflow',
                enabled: false,
              },
            ],
            sx: {
              '& .MuiAutocomplete-listbox': {
                borderRadius: 7,
                maxHeight: '400px',
                overflowY: 'scroll',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              },
              '& .MuiAutocomplete-groupLabel': {
                fontFamily: 'var(--font-family)',
                fontSize: 11,
                fontWeight: 600,
                color: '#666',
                backgroundColor: '#eeeeee',
                position: 'sticky',
                top: 0,
                px: 2,
                py: 0.3,
                lineHeight: 1.4, 
              },
              '& .MuiAutocomplete-option': {
                fontFamily: 'var(--font-family)',
                backgroundColor: '#c8c8c8c0',
                borderRadius: 6,
                mx: 1,
                my: 0.5,
                px: 2,
                fontSize: 14,
                transition: 'background-color 0.2s ease-out',
                '&:hover, &.Mui-focused': {
                  backgroundColor: '#79b3f38b'
                }
              },
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Dokąd..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontFamily: 'var(--font-family)',
                fontSize: 14,
                borderRadius: 26,
                backgroundColor: '#eeeeeea7',
                height: 34,
                top: 5,
                left: 8,
                width: 224,
                px: 1,
              },
              '& fieldset': {
                border: 'none',
              },
            }}
          />
        )}
      />

      <div className={css['date-picker-wrapper']}>
        <div style={{ position: "absolute", top: 0, left: 0, opacity: 0, pointerEvents: 'none' }}>
          <DatePickerComponent
            ref={datePickerRef}
            onDateTimeChange={handleDateTimeChange}
          />
        </div>
        <button
          className={`${css['calendar-button']} ${selectedDateTime ? css['active'] : ''}`}
          onClick={handleCalendarClick}
          aria-label="Wybierz datę i czas"
        >
          <CalenderIcon width={20} height={20} />
        </button>
      </div>

      <button
        className={css['search-button']}
        onClick={handleSearch}
        disabled={!fromValue || !toValue}
      >
        Szukaj
      </button>
    </div>
  );
};