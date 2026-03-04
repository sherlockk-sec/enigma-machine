
"use client";

import React, { useState } from "react";
import { useEnigmaStore } from "../store/useEnigmaStore";
import { X, Plug } from "lucide-react";

const KEYS_ROW_1 = "QWERTZUIO".split("");
const KEYS_ROW_2 = "ASDFGHJK".split("");
const KEYS_ROW_3 = "PYXCVBNML".split("");

const PAIR_COLORS = [
    "#ef4444", // red-500
    "#3b82f6", // blue-500
    "#10b981", // green-500
    "#f59e0b", // amber-500
    "#a855f7", // purple-500
    "#ec4899", // pink-500
    "#14b8a6", // teal-500
    "#f97316", // orange-500
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
    "#f43f5e"  // rose-500
];

interface PlugboardUIProps {
    onClose: () => void;
}

export default function PlugboardUI({ onClose }: PlugboardUIProps) {
    // depend on plugboardVersion to instantly re-render when plugs change
    const { machine, addPlug, removePlug, clearPlugs, plugboardVersion } = useEnigmaStore();
    const [selected, setSelected] = useState<string | null>(null);

    // Reconstruct connection mappings and pairs
    const { connections, pairs } = React.useMemo(() => {
        const cons = machine.plugboard.getConnections();
        const uniquePairs: [string, string][] = [];
        const seen = new Set<string>();

        Object.entries(cons).forEach(([k, v]) => {
            if (!seen.has(k) && !seen.has(v)) {
                uniquePairs.push([k, v].sort() as [string, string]);
                seen.add(k);
                seen.add(v);
            }
        });

        // Sort deterministically to keep colors stable
        uniquePairs.sort((a, b) => a[0].localeCompare(b[0]));
        return { connections: cons, pairs: uniquePairs };
    }, [machine, plugboardVersion]);

    const getPairColor = (char: string) => {
        const index = pairs.findIndex(p => p[0] === char || p[1] === char);
        return index !== -1 ? PAIR_COLORS[index % PAIR_COLORS.length] : undefined;
    };

    const handleSocketClick = (char: string) => {
        if (selected === char) {
            setSelected(null);
            return;
        }

        if (connections[char]) {
            removePlug(char);
            if (selected === char) setSelected(null);
            return;
        }

        if (selected) {
            addPlug(selected, char);
            setSelected(null);
        } else {
            setSelected(char);
        }
    };

    const renderRow = (keys: string[]) => {
        return (
            <div className="flex justify-center gap-4 mb-6">
                {keys.map(char => {
                    const isConnected = !!connections[char];
                    const isSelected = selected === char;
                    const color = getPairColor(char);
                    const target = connections[char];

                    return (
                        <div key={char} className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => handleSocketClick(char)}
                                style={{
                                    backgroundColor: isConnected ? `${color}40` : isSelected ? '#eab308' : '#1e293b',
                                    borderColor: isConnected ? color : isSelected ? '#fef08a' : '#334155',
                                    color: isSelected ? '#000' : isConnected ? color : '#94a3b8',
                                    boxShadow: isConnected ? `0 0 15px ${color}40` : 'none'
                                }}
                                className={`w-14 h-14 rounded-full font-mono text-xl font-bold border-2 transition-all relative
                                    ${!isConnected && !isSelected ? 'hover:border-gray-400' : ''}
                                    ${isSelected ? 'scale-110' : ''}
                                `}
                            >
                                {char}
                                {isConnected && (
                                    <span
                                        style={{ backgroundColor: color }}
                                        className="absolute -top-2 -right-2 w-5 h-5 text-[10px] flex items-center justify-center rounded-full text-black font-bold border border-black/50"
                                    >
                                        {target}
                                    </span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1219] border border-white/10 rounded-3xl p-8 max-w-4xl w-full shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden">
                {/* Decorative background grids */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />

                <div className="flex justify-between items-center mb-10 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                            <Plug size={24} className="text-gray-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Steckerbrett</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Plugboard Matrix Configuration</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="relative z-10 py-8 bg-black/40 rounded-2xl border border-white/5 mb-8">
                    {renderRow(KEYS_ROW_1)}
                    {renderRow(KEYS_ROW_2)}
                    {renderRow(KEYS_ROW_3)}
                </div>

                <div className="flex justify-between items-center text-sm relative z-10 border-t border-white/10 pt-6">
                    <div className="text-gray-400 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        <p>Select two letters to draw a fiber-optic link. Click any active socket to disconnect.</p>
                    </div>
                    <button
                        onClick={clearPlugs}
                        className="px-6 py-3 font-semibold bg-red-500/10 text-red-400 tracking-widest uppercase border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-all"
                    >
                        Clear Matrix
                    </button>
                </div>
            </div>
        </div>
    );
}
