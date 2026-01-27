import { Autocomplete, TextField } from "@mui/material";
import { useStopsStore } from "../../store/StopsStore";
import type { Stop } from "../../types";
import { useState } from "react";
import css from './RouteSearch.module.css';
import SwapIcon from '../../assets/icons/swap.svg?react';

interface RouteSearchProps {
  onRouteSearch?: (from: Stop, to: Stop) => void;
}

export const RouteSearch = ({ onRouteSearch }: RouteSearchProps) => {
  const { stops } = useStopsStore();
  
  const [fromInputValue, setFromInputValue] = useState('');
  const [fromValue, setFromValue] = useState<Stop | null>(null);
  
  const [toInputValue, setToInputValue] = useState('');
  const [toValue, setToValue] = useState<Stop | null>(null);

  const handleSearch = () => {
    if (fromValue && toValue) {
      onRouteSearch?.(fromValue, toValue);
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

  return (
    <div className={css['route-search-container']}>
      <Autocomplete<Stop>
        value={fromValue}
        options={stops}
        disablePortal
        openOnFocus={false}
        inputValue={fromInputValue}
        onInputChange={(_, value) => setFromInputValue(value)}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.stop_name
        }
        filterOptions={(options) =>
          fromInputValue.length === 0
            ? []
            : options.filter(o =>
                o.stop_name.toLowerCase().includes(fromInputValue.toLowerCase())
              )
        }
        isOptionEqualToValue={(option, value) => option.stop_id === value.stop_id}
        onChange={(_, newValue) => {
          setFromValue(newValue);
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
              '& .MuiAutocomplete-option': {
                fontFamily: 'var(--font-family)',
                backgroundColor: '#c8c8c8c0',
                borderRadius: 4,
                mx: 1,
                my: 0.5,
                px: 2,
                fontSize: 14,
                transition: 'background-color 0.2s ease-out',
                '&:hover': {
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
        aria-label="Zamień miejscami"
        disabled={!fromValue && !toValue}
      >
        <SwapIcon width={16} height={16} />
      </button>

      <Autocomplete<Stop>
        value={toValue}
        options={stops}
        disablePortal
        openOnFocus={false}
        inputValue={toInputValue}
        onInputChange={(_, value) => setToInputValue(value)}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.stop_name
        }
        filterOptions={(options) =>
          toInputValue.length === 0
            ? []
            : options.filter(o =>
                o.stop_name.toLowerCase().includes(toInputValue.toLowerCase())
              )
        }
        isOptionEqualToValue={(option, value) => option.stop_id === value.stop_id}
        onChange={(_, newValue) => {
          setToValue(newValue);
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
              '& .MuiAutocomplete-option': {
                fontFamily: 'var(--font-family)',
                backgroundColor: '#c8c8c8c0',
                borderRadius: 4,
                mx: 1,
                my: 0.5,
                px: 2,
                fontSize: 14,
                transition: 'background-color 0.2s ease-out',
                '&:hover': {
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