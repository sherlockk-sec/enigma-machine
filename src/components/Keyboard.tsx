
"use client";

import React, { useEffect } from "react";
import { useEnigmaStore } from "../store/useEnigmaStore";
import clsx from "clsx";

const KEYS = [
    "QWERTZUIO",
    "ASDFGHJK",
    "PYXCVBNML"
]; // Enigma Keyboard Layout (German QWERTZ usually, but standard Typewriter was QWERTZuiop... Enigma had specific layout? QWERTZUIO, ASDFGHJK, PYXCVBNML is typical for Enigma I lampboard layout, or QWERTZUIO ASDFGHJK PYXCVBNML)
// Enigma I keyboard was QWERTZUIO ASDFGHJK PYXCVBNML.
// Wait, standard is QWERTZUIO ASDFGHJK PYXCVBNML.
// Let's use QWERTY for user familiarity? No, historical accuracy requested. But user said "QWERTZ...".
// Actually, standard Enigma keyboard row 1: QWERTZUIO, row 2: ASDFGHJK, row 3: PYXCVBNML.
// Wait, P is on bottom row? Let me check.
// Standard Enigma I: QWERTZUIO / ASDFGHJK / PYXCVBNML. Yes.

export default function Keyboard() {
    const { pressKey, lastSignalPath } = useEnigmaStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            if (/^[A-Z]$/.test(key)) {
                pressKey(key);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [pressKey]);

    return (
        <div className="flex flex-col gap-2 items-center bg-black/50 p-4 rounded-xl backdrop-blur-sm border border-white/10">
            {KEYS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2">
                    {row.split("").map((char) => {
                        const isInput = lastSignalPath?.input === char;
                        const isOutput = lastSignalPath?.output === char;

                        return (
                            <button
                                key={char}
                                onMouseDown={() => pressKey(char)}
                                className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all border-2",
                                    // Lampboard logic: Output lights up (Yellow/Gold glow). Input key behaves like mechanical key (pressed down).
                                    isOutput
                                        ? "bg-yellow-500 text-black border-yellow-300 shadow-[0_0_15px_rgba(255,215,0,0.8)] scale-110 z-10"
                                        : "bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-700",
                                    isInput && "translate-y-1 bg-gray-600"
                                )}
                            >
                                {char}
                            </button>
                        );
                    })}
                </div>
            ))}
            <div className="mt-2 text-xs text-gray-500 uppercase tracking-widest">Lampboard</div>
        </div>
    );
}
