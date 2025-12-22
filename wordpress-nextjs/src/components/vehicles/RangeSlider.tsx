'use client';

import { useState, useEffect, useRef } from 'react';

interface RangeSliderProps {
    min: number;
    max: number;
    currentMin: number;
    currentMax: number;
    onChange: (min: number, max: number) => void;
    formatValue?: (value: number) => string;
}

export default function RangeSlider({ 
    min, 
    max, 
    currentMin, 
    currentMax, 
    onChange,
    formatValue = (value) => value.toString()
}: RangeSliderProps) {
    const [minValue, setMinValue] = useState(currentMin);
    const [maxValue, setMaxValue] = useState(currentMax);
    const minRef = useRef<HTMLInputElement>(null);
    const maxRef = useRef<HTMLInputElement>(null);
    const rangeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMinValue(currentMin);
        setMaxValue(currentMax);
    }, [currentMin, currentMax]);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), maxValue - 1);
        setMinValue(value);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), minValue + 1);
        setMaxValue(value);
    };

    const handleMouseUp = () => {
        onChange(minValue, maxValue);
    };

    const getPercent = (value: number) => {
        return ((value - min) / (max - min)) * 100;
    };

    return (
        <div className="range-slider">
            <div className="range-slider-track" ref={rangeRef}>
                <div 
                    className="range-slider-range"
                    style={{
                        left: `${getPercent(minValue)}%`,
                        width: `${getPercent(maxValue) - getPercent(minValue)}%`
                    }}
                />
            </div>
            
            <input
                type="range"
                ref={minRef}
                min={min}
                max={max}
                value={minValue}
                onChange={handleMinChange}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleMouseUp}
                className="range-slider-input range-slider-input-min"
            />
            
            <input
                type="range"
                ref={maxRef}
                min={min}
                max={max}
                value={maxValue}
                onChange={handleMaxChange}
                onMouseUp={handleMouseUp}
                onTouchEnd={handleMouseUp}
                className="range-slider-input range-slider-input-max"
            />
            
            <div className="range-slider-values">
                <span>{formatValue(minValue)}</span>
                <span>{formatValue(maxValue)}</span>
            </div>
        </div>
    );
}
