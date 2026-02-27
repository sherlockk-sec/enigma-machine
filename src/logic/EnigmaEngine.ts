
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export interface SignalPath {
    input: string;
    plugboardIn: number;
    plugboardOut: number;
    rotorRightIn: number;
    rotorRightOut: number;
    rotorMiddleIn: number;
    rotorMiddleOut: number;
    rotorLeftIn: number;
    rotorLeftOut: number;
    reflectorIn: number;
    reflectorOut: number;
    rotorLeftInInverse: number;
    rotorLeftOutInverse: number;
    rotorMiddleInInverse: number;
    rotorMiddleOutInverse: number;
    rotorRightInInverse: number;
    rotorRightOutInverse: number;
    plugboardInInverse: number;
    plugboardOutInverse: number;
    output: string;
}

export class Rotor {
    wiring: string;
    notch: string;
    turnover: string; // The letter visible when notch is engaged (Royal flags)
    position: number = 0; // 0-25
    ringSetting: number = 0; // 0-25
    name: string;

    constructor(name: string, wiring: string, notch: string) {
        this.name = name;
        this.wiring = wiring;
        this.notch = notch;
        this.turnover = notch; // Simplified: notch position character
    }

    setPosition(char: string) {
        this.position = ALPHABET.indexOf(char);
    }

    getPosition(): string {
        return ALPHABET[this.position];
    }

    setRingSetting(setting: number) {
        this.ringSetting = setting;
    }

    atNotch(): boolean {
        return this.notch.includes(this.getPosition());
    }

    step() {
        this.position = (this.position + 1) % 26;
    }

    // Forward pass (Right -> Left)
    encipher(charIndex: number): number {
        const shift = this.position - this.ringSetting;
        const index = (charIndex + shift + 26) % 26;
        const wiringChar = this.wiring[index];
        const wiringIndex = ALPHABET.indexOf(wiringChar);
        return (wiringIndex - shift + 26) % 26;
    }

    // Inverse pass (Left -> Right)
    decipher(charIndex: number): number {
        const shift = this.position - this.ringSetting;
        const index = (charIndex + shift + 26) % 26;
        const wiringChar = ALPHABET[index];
        const wiringIndex = this.wiring.indexOf(wiringChar);
        return (wiringIndex - shift + 26) % 26;
    }
}

export class Reflector {
    wiring: string;
    name: string;

    constructor(name: string, wiring: string) {
        this.name = name;
        this.wiring = wiring;
    }

    reflect(charIndex: number): number {
        const wiringChar = this.wiring[charIndex];
        return ALPHABET.indexOf(wiringChar);
    }
}

export class Plugboard {
    connections: Map<string, string> = new Map();

    addConnection(char1: string, char2: string) {
        if (this.connections.has(char1) || this.connections.has(char2)) {
            throw new Error("Character already connected");
        }
        this.connections.set(char1, char2);
        this.connections.set(char2, char1);
    }

    swap(charIndex: number): number {
        const char = ALPHABET[charIndex];
        const swapped = this.connections.get(char) || char;
        return ALPHABET.indexOf(swapped);
    }

    getConnections(): Record<string, string> {
        const result: Record<string, string> = {};
        this.connections.forEach((v, k) => { result[k] = v; });
        return result;
    }

    clear() {
        this.connections.clear();
    }
}

export class EnigmaMachine {
    rotors: [Rotor, Rotor, Rotor]; // Left, Middle, Right
    reflector: Reflector;
    plugboard: Plugboard;

    constructor() {
        // Default configuration: Rotors I, II, III, Reflector B
        this.rotors = [
            new Rotor("I", "EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q"),
            new Rotor("II", "AJDKSIRUXBLHWTMCQGZNPYFVOE", "E"),
            new Rotor("III", "BDFHJLCPRTXVZNYEIWGAKMUSQO", "V"),
        ];
        this.reflector = new Reflector("B", "YRUHQSLDPXNGOKMIEBFZCWVJAT");
        this.plugboard = new Plugboard();
    }

    configure(rotors: [string, string, string], reflector: string, plugboardPairs: string[], ringSettings: [number, number, number], positions: [string, string, string]) {
        // Logic to re-instantiate rotors/reflector based on names would go here if we supported swapping rotor types.
        // For now, assuming fixed I, II, III for simplicity or passed in args.
        // But we can update positions and ring settings.

        this.rotors[0].setRingSetting(ringSettings[0]);
        this.rotors[1].setRingSetting(ringSettings[1]);
        this.rotors[2].setRingSetting(ringSettings[2]);

        this.rotors[0].setPosition(positions[0]);
        this.rotors[1].setPosition(positions[1]);
        this.rotors[2].setPosition(positions[2]);

        this.plugboard.clear();
        plugboardPairs.forEach(pair => this.plugboard.addConnection(pair[0], pair[1]));
    }

    pressKey(inputChar: string): SignalPath {
        const left = this.rotors[0];
        const middle = this.rotors[1];
        const right = this.rotors[2];

        // Double Stepping Mechanism
        const rightAtNotch = right.atNotch();
        const middleAtNotch = middle.atNotch();

        // Determine which rotors rotate
        const stepL = middleAtNotch; // If middle is at notch, it will turn over the left rotor
        const stepM = rightAtNotch || middleAtNotch; // Middle steps if right pushes it OR if it's currently at its own notch (double step)
        const stepR = true; // Right always steps

        if (stepL) left.step();
        if (stepM) middle.step();
        if (stepR) right.step();

        // Signal Path
        const inputIndex = ALPHABET.indexOf(inputChar);
        const pbOut = this.plugboard.swap(inputIndex);

        const rIn = right.encipher(pbOut);
        const mIn = middle.encipher(rIn);
        const lIn = left.encipher(mIn);

        const refOut = this.reflector.reflect(lIn);

        const lOut = left.decipher(refOut);
        const mOut = middle.decipher(lOut);
        const rOut = right.decipher(mOut);

        const pbInInverse = rOut; // Output from rotors into plugboard
        const outputIndex = this.plugboard.swap(pbInInverse);
        const outputChar = ALPHABET[outputIndex];

        return {
            input: inputChar,
            plugboardIn: inputIndex,
            plugboardOut: pbOut,
            rotorRightIn: pbOut,
            rotorRightOut: rIn,
            rotorMiddleIn: rIn,
            rotorMiddleOut: mIn,
            rotorLeftIn: mIn,
            rotorLeftOut: lIn,
            reflectorIn: lIn,
            reflectorOut: refOut,
            rotorLeftInInverse: refOut,
            rotorLeftOutInverse: lOut,
            rotorMiddleInInverse: lOut,
            rotorMiddleOutInverse: mOut,
            rotorRightInInverse: mOut,
            rotorRightOutInverse: rOut,
            plugboardInInverse: rOut,
            plugboardOutInverse: outputIndex,
            output: outputChar
        };
    }
}
