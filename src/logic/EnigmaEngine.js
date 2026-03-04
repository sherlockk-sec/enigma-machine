"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnigmaMachine = exports.Plugboard = exports.Reflector = exports.Rotor = exports.ALPHABET = void 0;
exports.ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var Rotor = /** @class */ (function () {
    function Rotor(name, wiring, notch) {
        this.position = 0; // 0-25
        this.ringSetting = 0; // 0-25
        this.name = name;
        this.wiring = wiring;
        this.notch = notch;
        this.turnover = notch; // Simplified: notch position character
    }
    Rotor.prototype.setPosition = function (char) {
        this.position = exports.ALPHABET.indexOf(char);
    };
    Rotor.prototype.getPosition = function () {
        return exports.ALPHABET[this.position];
    };
    Rotor.prototype.setRingSetting = function (setting) {
        this.ringSetting = setting;
    };
    Rotor.prototype.atNotch = function () {
        return this.notch.includes(this.getPosition());
    };
    Rotor.prototype.step = function () {
        this.position = (this.position + 1) % 26;
    };
    // Forward pass (Right -> Left)
    Rotor.prototype.encipher = function (charIndex) {
        var shift = this.position - this.ringSetting;
        var index = (charIndex + shift + 26) % 26;
        var wiringChar = this.wiring[index];
        var wiringIndex = exports.ALPHABET.indexOf(wiringChar);
        return (wiringIndex - shift + 26) % 26;
    };
    // Inverse pass (Left -> Right)
    Rotor.prototype.decipher = function (charIndex) {
        var shift = this.position - this.ringSetting;
        var index = (charIndex + shift + 26) % 26;
        var wiringChar = exports.ALPHABET[index];
        var wiringIndex = this.wiring.indexOf(wiringChar);
        return (wiringIndex - shift + 26) % 26;
    };
    return Rotor;
}());
exports.Rotor = Rotor;
var Reflector = /** @class */ (function () {
    function Reflector(name, wiring) {
        this.name = name;
        this.wiring = wiring;
    }
    Reflector.prototype.reflect = function (charIndex) {
        var wiringChar = this.wiring[charIndex];
        return exports.ALPHABET.indexOf(wiringChar);
    };
    return Reflector;
}());
exports.Reflector = Reflector;
var Plugboard = /** @class */ (function () {
    function Plugboard() {
        this.connections = new Map();
    }
    Plugboard.prototype.addConnection = function (char1, char2) {
        if (this.connections.has(char1) || this.connections.has(char2)) {
            throw new Error("Character already connected");
        }
        this.connections.set(char1, char2);
        this.connections.set(char2, char1);
    };
    Plugboard.prototype.swap = function (charIndex) {
        var char = exports.ALPHABET[charIndex];
        var swapped = this.connections.get(char) || char;
        return exports.ALPHABET.indexOf(swapped);
    };
    Plugboard.prototype.getConnections = function () {
        var result = {};
        this.connections.forEach(function (v, k) { result[k] = v; });
        return result;
    };
    Plugboard.prototype.clear = function () {
        this.connections.clear();
    };
    return Plugboard;
}());
exports.Plugboard = Plugboard;
var EnigmaMachine = /** @class */ (function () {
    function EnigmaMachine() {
        // Default configuration: Rotors I, II, III, Reflector B
        this.rotors = [
            new Rotor("I", "EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q"),
            new Rotor("II", "AJDKSIRUXBLHWTMCQGZNPYFVOE", "E"),
            new Rotor("III", "BDFHJLCPRTXVZNYEIWGAKMUSQO", "V"),
        ];
        this.reflector = new Reflector("B", "YRUHQSLDPXNGOKMIEBFZCWVJAT");
        this.plugboard = new Plugboard();
    }
    EnigmaMachine.prototype.configure = function (rotors, reflector, plugboardPairs, ringSettings, positions) {
        // Logic to re-instantiate rotors/reflector based on names would go here if we supported swapping rotor types.
        // For now, assuming fixed I, II, III for simplicity or passed in args.
        // But we can update positions and ring settings.
        var _this = this;
        this.rotors[0].setRingSetting(ringSettings[0]);
        this.rotors[1].setRingSetting(ringSettings[1]);
        this.rotors[2].setRingSetting(ringSettings[2]);
        this.rotors[0].setPosition(positions[0]);
        this.rotors[1].setPosition(positions[1]);
        this.rotors[2].setPosition(positions[2]);
        this.plugboard.clear();
        plugboardPairs.forEach(function (pair) { return _this.plugboard.addConnection(pair[0], pair[1]); });
    };
    EnigmaMachine.prototype.pressKey = function (inputChar) {
        var left = this.rotors[0];
        var middle = this.rotors[1];
        var right = this.rotors[2];
        // Double Stepping Mechanism
        var rightAtNotch = right.atNotch();
        var middleAtNotch = middle.atNotch();
        // Determine which rotors rotate
        var stepL = middleAtNotch; // If middle is at notch, it will turn over the left rotor
        var stepM = rightAtNotch || middleAtNotch; // Middle steps if right pushes it OR if it's currently at its own notch (double step)
        var stepR = true; // Right always steps
        if (stepL)
            left.step();
        if (stepM)
            middle.step();
        if (stepR)
            right.step();
        // Signal Path
        var inputIndex = exports.ALPHABET.indexOf(inputChar);
        var pbOut = this.plugboard.swap(inputIndex);
        var rIn = right.encipher(pbOut);
        var mIn = middle.encipher(rIn);
        var lIn = left.encipher(mIn);
        var refOut = this.reflector.reflect(lIn);
        var lOut = left.decipher(refOut);
        var mOut = middle.decipher(lOut);
        var rOut = right.decipher(mOut);
        var pbInInverse = rOut; // Output from rotors into plugboard
        var outputIndex = this.plugboard.swap(pbInInverse);
        var outputChar = exports.ALPHABET[outputIndex];
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
    };
    return EnigmaMachine;
}());
exports.EnigmaMachine = EnigmaMachine;
