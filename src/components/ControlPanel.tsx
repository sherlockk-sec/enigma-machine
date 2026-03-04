"use client";

import React from "react";
import { useEnigmaStore } from "../store/useEnigmaStore";
import { Settings, RefreshCw, Maximize2, Minimize2, Plug, Activity, Code2 } from "lucide-react";
import dynamic from "next/dynamic";

const PlugboardUI = dynamic(() => import("./PlugboardUI"), { ssr: false });

export default function ControlPanel() {
    const { explodedView, toggleExplodedView, reset, inputHistory, outputHistory, rotorPositions } = useEnigmaStore();
    const [showPlugboard, setShowPlugboard] = React.useState(false);

    return (
        <div className="relative">
            <div className="relative bg-[#050505]/70 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] text-white w-full max-w-sm flex flex-col gap-6">

                {/* Header Section */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <Activity className="text-yellow-500 animate-pulse" size={20} />
                        <div>
                            <h1 className="text-lg font-bold tracking-[0.2em] text-white/90 uppercase m-0 leading-none">
                                Enigma I
                            </h1>
                            <span className="text-[10px] text-yellow-500/70 uppercase tracking-widest block mt-1">
                                Secure Terminal
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowPlugboard(true)}
                            className="p-2 bg-white/5 border border-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-300"
                            title="Open 2D Plugboard"
                        >
                            <Plug size={16} />
                        </button>
                        <button
                            onClick={toggleExplodedView}
                            className={`p-2 rounded-lg transition-all duration-300 border ${explodedView ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                            title="Blueprint View"
                        >
                            {explodedView ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <button
                            onClick={reset}
                            className="p-2 bg-white/5 border border-white/5 text-gray-400 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
                            title="System Reset"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                {/* Rotor Positions Readout */}
                <div className="grid grid-cols-3 gap-3">
                    {rotorPositions.map((pos, i) => (
                        <div key={i} className="bg-black/40 relative overflow-hidden p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center group hover:border-yellow-500/30 transition-colors">
                            {/* Inner glow */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-[9px] text-white/30 uppercase tracking-widest font-semibold mb-1 relative z-10 w-full text-center border-b border-white/5 pb-1">RTR {['L', 'M', 'R'][i]}</span>
                            <span className="text-3xl font-mono font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] relative z-10">{pos}</span>
                        </div>
                    ))}
                </div>

                {/* Input / Output Data Streams */}
                <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-white/5 relative overflow-hidden">
                    {/* Scanline effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50 z-0" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                            <label className="text-[10px] text-white/50 font-semibold tracking-widest uppercase">Raw Input</label>
                        </div>
                        <div className="font-mono text-sm tracking-wider break-all text-white/70 min-h-[1.5rem] leading-relaxed">
                            {inputHistory || <span className="opacity-30">Awaiting transmission...</span>}
                        </div>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent relative z-10" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                            <label className="text-[10px] text-yellow-500/80 font-semibold tracking-widest uppercase">Encrypted Output</label>
                        </div>
                        <div className="font-mono text-sm tracking-wider break-all text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.4)] min-h-[1.5rem] leading-relaxed">
                            {outputHistory || <span className="opacity-30">Standing by...</span>}
                        </div>
                    </div>
                </div>

            </div>

            {showPlugboard && <PlugboardUI onClose={() => setShowPlugboard(false)} />}
        </div>
    );
}
