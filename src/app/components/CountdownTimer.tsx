// File: app/components/CountdownTimer.tsx
"use client";

import { useState, useEffect } from 'react';

type TimeLeft = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

const calculateTimeLeft = (endTime: number): TimeLeft | null => {
    const difference = endTime - Date.now();
    if (difference <= 0) {
        return null;
    }
    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
    };
};

export const CountdownTimer = ({ endTime, onTimerEnd }: { endTime: number; onTimerEnd: () => void }) => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(endTime));

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft(endTime);
            setTimeLeft(newTimeLeft);
            if (newTimeLeft === null) {
                onTimerEnd();
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [endTime, onTimerEnd]);

    if (!timeLeft) {
        return <div className="text-red-500 font-bold">Poll has ended!</div>;
    }

    return (
        <div className="flex space-x-4 text-center">
            {Object.entries(timeLeft).map(([interval, value]) => (
                <div key={interval} className="flex flex-col">
                    <span className="text-2xl md:text-4xl font-bold text-indigo-600">{value}</span>
                    <span className="text-xs uppercase text-gray-500">{interval}</span>
                </div>
            ))}
        </div>
    );
};