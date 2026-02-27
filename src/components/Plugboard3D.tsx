
"use client";

import React from "react";
import { Cylinder, Text } from "@react-three/drei";
import * as THREE from "three";

// Standard QWERTZ layout for Plugboard matches Keyboard usually?
// Actually Enigma Plugboard (Steckerbrett) is QWERTZ on the front panel.

const KEYS_ROW_1 = "QWERTZUIO".split("");
const KEYS_ROW_2 = "ASDFGHJK".split("");
const KEYS_ROW_3 = "PYXCVBNML".split("");

// Layout Config (Simulated front panel)
const KEY_SPACING = 0.6;
const ROW_SPACING = 0.6;

const Socket: React.FC<{ char: string; position: [number, number, number] }> = ({ char, position }) => {
    return (
        <group position={position}>
            {/* Label */}
            <Text
                position={[0, 0.1, -0.25]}
                rotation={[-Math.PI / 4, 0, 0]} // Angled up
                fontSize={0.12}
                color="#ccc"
                anchorX="center"
                anchorY="middle"
            >
                {char}
            </Text>

            {/* Socket Pair (Top/Bottom or Side/Side) - Enigma usually has two holes per letter */}
            {/* Hole 1 */}
            <Cylinder args={[0.08, 0.08, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <meshStandardMaterial color="#000" />
            </Cylinder>
            {/* Ring 1 */}
            <Cylinder args={[0.12, 0.12, 0.02, 16]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0.05]}>
                <meshStandardMaterial color="#888" metalness={0.8} />
            </Cylinder>

            {/* Hole 2 */}
            <Cylinder args={[0.08, 0.08, 0.1, 16]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
                <meshStandardMaterial color="#000" />
            </Cylinder>
            {/* Ring 2 */}
            <Cylinder args={[0.12, 0.12, 0.02, 16]} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.15, 0.05]}>
                <meshStandardMaterial color="#888" metalness={0.8} />
            </Cylinder>
        </group>
    );
};

export const Plugboard3D: React.FC = () => {

    // Render Rows
    const renderRow = (keys: string[], rowIndex: number, offsetZ: number, offsetX: number) => {
        return keys.map((char, i) => {
            const x = (i * KEY_SPACING) - (keys.length * KEY_SPACING) / 2 + offsetX;
            // Z maps to Y here because panel is vertical/sloped
            const y = -rowIndex * ROW_SPACING;
            return (
                <Socket
                    key={char}
                    char={char}
                    position={[x, y, 0]}
                />
            );
        });
    };

    return (
        <group>
            <group position={[0.3, 0.5, 0]}>
                {renderRow(KEYS_ROW_1, 0, 0, 0)}
            </group>
            <group position={[0.6, 0.5 - ROW_SPACING, 0]}>
                {renderRow(KEYS_ROW_2, 1, 0, 0)}
            </group>
            <group position={[0.3, 0.5 - ROW_SPACING * 2, 0]}>
                {renderRow(KEYS_ROW_3, 2, 0, 0)}
            </group>
        </group>
    );
};
