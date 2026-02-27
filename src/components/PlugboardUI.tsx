
"use client";

import React, { useState } from "react";
import { useEnigmaStore } from "../store/useEnigmaStore";
import { X, Plug } from "lucide-react";
import { ALPHABET } from "../logic/EnigmaEngine";
import clsx from "clsx";

interface PlugboardUIProps {
    onClose: () => void;
}

export default function PlugboardUI({ onClose }: PlugboardUIProps) {
    const { machine, addPlug, clearPlugs } = useEnigmaStore();
    const [selected, setSelected] = useState<string | null>(null);

    // Get current connections
    // We need a helper to read connections from machine.plugboard
    // The store doesn't expose plugboard state reactively in a simple map, 
    // but we can read it from machine instance since we force update on change.
    const connections = machine.plugboard.getConnections();

    const handleLeafClick = (char: string) => {
        // If selected is same, deselect
        if (selected === char) {
            setSelected(null);
            return;
        }

        // If char already connected, maybe remove connection?
        // Current logic: addPlug adds connection. 
        // If char is connected to X, and we click char, what happens?
        // Simplification: Clear entire plugboard to reset specific plugs? 
        // Or just valid pair selection.

        if (connections[char]) {
            // Already connected. Maybe warn or ignore?
            // Ideally remove plug. But logic doesn't support remove single plug yet easily without exposed method.
            // Let's assume user must Clear All if they want to change (MVP).
            return;
        }

        if (selected) {
            // Connect selected and char
            addPlug(selected, char);
            setSelected(null);
        } else {
            setSelected(char);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-yellow-500/30 rounded-2xl p-6 max-w-2xl w-full shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
                        <Plug /> Plugboard Configuration
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                        <X />
                    </button>
                </div>

                <div className="grid grid-cols-9 gap-4 mb-8">
                    {ALPHABET.split("").map(char => {
                        const isConnected = !!connections[char];
                        const isSelected = selected === char;
                        const target = connections[char];

                        return (
                            <div key={char} className="flex flex-col items-center gap-1">
                                <button
                                    onClick={() => handleLeafClick(char)}
                                    className={clsx(
                                        "w-12 h-12 rounded-full font-bold border-2 transition-all relative",
                                        isSelected ? "bg-yellow-500 text-black border-yellow-300 scale-110" :
                                            isConnected ? "bg-slate-700 text-yellow-200 border-yellow-700" :
                                                "bg-slate-800 text-gray-400 border-slate-600 hover:border-gray-400"
                                    )}
                                >
                                    {char}
                                    {isConnected && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-600 text-[10px] flex items-center justify-center rounded-full text-white">
                                            {target}
                                        </span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-400">
                    <div>
                        Select two letters to connect them. <br />
                        Existing connections are marked.
                    </div>
                    <button
                        onClick={clearPlugs}
                        className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/50 rounded hover:bg-red-500/30"
                    >
                        Clear All Cables
                    </button>
                </div>
            </div>
        </div>
    );
}
