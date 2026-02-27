"use client";

import React from "react";
import { useEnigmaStore } from "../store/useEnigmaStore";
import { Settings, RefreshCw, Maximize2, Minimize2, Plug } from "lucide-react";
import dynamic from "next/dynamic";

const PlugboardUI = dynamic(() => import("./PlugboardUI"), { ssr: false });

export default function ControlPanel() {
    const { explodedView, toggleExplodedView, reset, inputHistory, outputHistory, rotorPositions } = useEnigmaStore();
    const [showPlugboard, setShowPlugboard] = React.useState(false);

    return (
        <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold tracking-widest text-yellow-500">ENIGMA I</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowPlugboard(true)}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        title="Open Plugboard"
                    >
                        <Plug size={20} />
                    </button>
                    <button
                        onClick={toggleExplodedView}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                        title="Toggle Exploded View"
                    >
                        {explodedView ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button
                        onClick={reset}
                        className="p-2 bg-white/10 rounded-lg hover:bg-red-500/50 transition-colors"
                        title="Reset Machine"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                {rotorPositions.map((pos, i) => (
                    <div key={i} className="bg-slate-800 p-2 rounded border border-white/20">
                        <span className="text-xs text-gray-400 block">ROTOR {['L', 'M', 'R'][i]}</span>
                        <span className="text-2xl font-mono font-bold text-yellow-400">{pos}</span>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <div>
                    <label className="text-xs text-gray-400 uppercase">Input</label>
                    <div className="font-mono text-sm break-all h-8 overflow-hidden text-gray-300">
                        {inputHistory || "Type to start..."}
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-400 uppercase">Output (Cipher)</label>
                    <div className="font-mono text-sm break-all h-8 overflow-hidden text-yellow-300">
                        {outputHistory || "Waiting..."}
                    </div>
                </div>
            </div>
            {showPlugboard && <PlugboardUI onClose={() => setShowPlugboard(false)} />}
        </div>
    );
}
