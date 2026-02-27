
import { EnigmaMachine } from './EnigmaEngine';

describe('EnigmaMachine Logic', () => {
    let machine: EnigmaMachine;

    beforeEach(() => {
        machine = new EnigmaMachine();
    });

    test('Standard Enigma I Encryption (I-II-III, Ref B, Rings A, Start AAA)', () => {
        // Default constructor uses I-II-III, Ref B.
        // We need to ensure rings and positions are set.
        machine.configure(
            ['I', 'II', 'III'],
            'B',
            [],
            [0, 0, 0], // Rings A-A-A (0 index)
            ['A', 'A', 'A'] // Start A-A-A
        );

        const input = "AAAAA";
        let output = "";

        for (const char of input) {
            output += machine.pressKey(char).output;
        }

        expect(output).toBe("BDZGO");
    });

    test('Double Stepping Anomaly', () => {
        // Setup specifically to trigger double stepping.
        // Rotor II (Middle) notch is E.
        // If we set Middle to 'D', next step moves it to 'E' (notch position).
        // Then next step moves E->F and triggers Left.
        // Wait, Enigma I:
        // Right Rotor III (Notch V).
        // Middle Rotor II (Notch E).

        // Let's set up:
        // Left: I
        // Middle: II (Pos E) -> At notch.
        // Right: III (Pos K) -> Far from notch.

        machine.configure(
            ['I', 'II', 'III'],
            'B',
            [],
            [0, 0, 0],
            ['A', 'E', 'K']
        );

        // Current: A E K
        // Press 1: Right steps K->L. Middle is at E (notch).
        // Does Middle step?
        // Enigma stepping happens BEFORE signal.
        // If Middle is at E:
        //   It is at notch. Double step applies.
        //   So Middle steps E->F.
        //   Left steps A->B.
        // Right steps K->L.
        // Positions should be: B F L.

        machine.pressKey('A');
        expect(machine.rotors[0].getPosition()).toBe('B');
        expect(machine.rotors[1].getPosition()).toBe('F');
        expect(machine.rotors[2].getPosition()).toBe('L');
    });

    test('Normal Stepping', () => {
        // Right Rotor III (Notch V).
        // Set Right to 'U'. Next step 'V' (at notch).
        // Positions: A A U
        machine.configure(
            ['I', 'II', 'III'],
            'B',
            [],
            [0, 0, 0],
            ['A', 'A', 'U']
        );

        // Press 1: U -> V. No turnover yet because U was not at notch.
        machine.pressKey('A');
        expect(machine.rotors[2].getPosition()).toBe('V');
        expect(machine.rotors[1].getPosition()).toBe('A');

        // Press 2: Right is at V (Notch). 
        // So Middle steps A->B. Right steps V->W.
        machine.pressKey('A');
        expect(machine.rotors[1].getPosition()).toBe('B');
        expect(machine.rotors[2].getPosition()).toBe('W');
    });
});
