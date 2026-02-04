import { Autocomplete, TextField } from "@mui/material"
import { useStopsStore } from "../../../store/StopsStore";
import type { Stop } from "../../../types";
import { useState } from "react";
import { useSearchHistory } from "../../../hooks/useSearchHistory";

export const Search = () => {
    const { stops, selectStopById, getStopInfo } = useStopsStore();
    const [inputValue, setInputValue] = useState('');
    const [value, setValue] = useState<Stop | null>(null);
    
    const { history, addToHistory } = useSearchHistory('stop-search');

    const handleOnChange = async (id: string) => {
        try {
            await getStopInfo(id);
        } catch (error) {
            console.error(error);
        }
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
        <Autocomplete<Stop>
            value={value}
            options={stops}
            disablePortal
            openOnFocus={true}
            inputValue={inputValue}
            onInputChange={(_, value) => setInputValue(value)}
            getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.stop_name
            }
            filterOptions={() => 
                getFilteredOptions(inputValue, history, stops)
            }
            isOptionEqualToValue={(option, value) => option.stop_id === value.stop_id}
            onChange={(_, newValue) => {
                setValue(newValue);
                if (newValue) {
                    selectStopById(newValue.stop_id);
                    addToHistory(newValue); 
                    void handleOnChange(newValue.stop_id);
                }
            }}
            groupBy={(option) => {
                if (inputValue.length === 0 && history.length > 0) {
                    const isInHistory = history.some(
                        h => h.stop_id === option.stop_id
                    );
                    return isInHistory ? 'Ostatnie' : '';
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
                            backgroundColor: '#c8c8c8c0',
                            fontFamily: 'var(--font-family)',
                            borderRadius: 4,
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
                    placeholder="Wpisz stacje"
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
    );
};