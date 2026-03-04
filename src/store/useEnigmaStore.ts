
import { create } from 'zustand';
import { EnigmaMachine, SignalPath, ALPHABET } from '../logic/EnigmaEngine';

interface EnigmaState {
    machine: EnigmaMachine;
    rotorPositions: [string, string, string]; // Left, Middle, Right positions (visible chars)
    inputHistory: string;
    outputHistory: string;
    lastSignalPath: SignalPath | null;
    explodedView: boolean;
    plugboardVersion: number;

    // Actions
    pressKey: (char: string) => void;
    backspace: () => void;
    setRotorPosition: (index: 0 | 1 | 2, char: string) => void;
    rotateRotor: (index: 0 | 1 | 2, direction: 1 | -1) => void;
    addPlug: (char1: string, char2: string) => void;
    removePlug: (char: string) => void;
    clearPlugs: () => void;
    toggleExplodedView: () => void;
    reset: () => void;
}

export const useEnigmaStore = create<EnigmaState>((set, get) => {
    const initialMachine = new EnigmaMachine();

    // Initial state from machine
    const getPositions = (): [string, string, string] => [
        initialMachine.rotors[0].getPosition(),
        initialMachine.rotors[1].getPosition(),
        initialMachine.rotors[2].getPosition()
    ];

    return {
        machine: initialMachine,
        rotorPositions: getPositions(),
        inputHistory: "",
        outputHistory: "",
        lastSignalPath: null,
        explodedView: false,
        plugboardVersion: 0,

        pressKey: (char: string) => {
            const { machine, inputHistory, outputHistory } = get();
            const signal = machine.pressKey(char.toUpperCase());

            set({
                rotorPositions: [
                    machine.rotors[0].getPosition(),
                    machine.rotors[1].getPosition(),
                    machine.rotors[2].getPosition()
                ],
                inputHistory: inputHistory + char.toUpperCase(),
                outputHistory: outputHistory + signal.output,
                lastSignalPath: signal
            });
        },

        backspace: () => {
            const { inputHistory, outputHistory } = get();
            if (inputHistory.length === 0) return;
            set({
                inputHistory: inputHistory.slice(0, -1),
                outputHistory: outputHistory.slice(0, -1)
            });
        },

        setRotorPosition: (index, char) => {
            const { machine } = get();
            machine.rotors[index].setPosition(char);
            set({
                rotorPositions: [
                    machine.rotors[0].getPosition(),
                    machine.rotors[1].getPosition(),
                    machine.rotors[2].getPosition()
                ]
            });
        },

        rotateRotor: (index, direction) => {
            const { machine } = get();
            const currentPos = machine.rotors[index].getPosition(); // Character
            const currentIndex = ALPHABET.indexOf(currentPos);
            const newIndex = (currentIndex + direction + 26) % 26;
            const newChar = ALPHABET[newIndex];

            machine.rotors[index].setPosition(newChar);
            set({
                rotorPositions: [
                    machine.rotors[0].getPosition(),
                    machine.rotors[1].getPosition(),
                    machine.rotors[2].getPosition()
                ]
            });
        },

        addPlug: (char1, char2) => {
            const { machine, plugboardVersion } = get();
            try {
                machine.plugboard.addConnection(char1, char2);
                set({ machine, plugboardVersion: plugboardVersion + 1 });
            } catch (e) {
                console.warn(e);
            }
        },

        removePlug: (char) => {
            const { machine } = get();

            // Clone the entries so they survive the clear()
            const oldEntries = Array.from((machine.plugboard as any).connections.entries() as Iterable<[string, string]>);
            machine.plugboard.clear();

            oldEntries.forEach(([key, val]) => {
                if (key !== char && val !== char && !(machine.plugboard as any).connections.has(key)) {
                    machine.plugboard.addConnection(key, val);
                }
            });

            // Force React re-render by destructing and spreading state, or triggering shallow
            set({ machine, plugboardVersion: get().plugboardVersion + 1 });
        },

        clearPlugs: () => {
            const { machine, plugboardVersion } = get();
            machine.plugboard.clear();
            set({ machine, plugboardVersion: plugboardVersion + 1 });
        },

        toggleExplodedView: () => set((state) => ({ explodedView: !state.explodedView })),

        reset: () => {
            const newMachine = new EnigmaMachine(); // Re-instantiate to reset completely
            set({
                machine: newMachine,
                rotorPositions: [
                    newMachine.rotors[0].getPosition(),
                    newMachine.rotors[1].getPosition(),
                    newMachine.rotors[2].getPosition()
                ],
                inputHistory: "",
                outputHistory: "",
                lastSignalPath: null,
                plugboardVersion: 0
            });
        }
    };
});
