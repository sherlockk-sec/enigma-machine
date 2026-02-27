
"use client";

import React, { useMemo } from "react";
import { Cylinder, Text } from "@react-three/drei";
import { useEnigmaStore } from "../store/useEnigmaStore";
import * as THREE from "three";

// Layout for Enigma Lampboard (Standard QWERTZ)
const KEYS_ROW_1 = "QWERTZUIO".split("");
const KEYS_ROW_2 = "ASDFGHJK".split("");
const KEYS_ROW_3 = "PYXCVBNML".split("");

// Layout Config
const KEY_SPACING = 0.6;
const ROW_SPACING = 0.6;

interface LampProps {
    char: string;
    position: [number, number, number];
    active: boolean;
}

const Lamp: React.FC<LampProps> = ({ char, position, active }) => {
    return (
        <group position={position}>
            {/* Lamp Window / Bezel - Flat, no rotation */}
            <Cylinder args={[0.22, 0.22, 0.05, 32]} rotation={[0, 0, 0]}>
                <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
            </Cylinder>

            {/* The Lens (Glass) */}
            <Cylinder args={[0.18, 0.18, 0.06, 32]} rotation={[0, 0, 0]} position={[0, 0.01, 0]}>
                <meshStandardMaterial
                    color={active ? "#ffcc00" : "#333"}
                    emissive={active ? "#ffcc00" : "#000"}
                    emissiveIntensity={active ? 2 : 0}
                    roughness={0.1}
                    metalness={0.1}
                    transparent
                    opacity={0.9}
                />
            </Cylinder>

            {/* Letter - Flattened on top */}
            <Text
                position={[0, 0.05, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.15}
                color={active ? "#000" : "#888"}
                anchorX="center"
                anchorY="middle"
            >
                {char}
            </Text>
        </group>
    );
};

export const Lampboard3D: React.FC = () => {
    const { outputHistory } = useEnigmaStore();

    // Determine active lamp based on the last character added to history.
    const activeChar = outputHistory.length > 0 ? outputHistory[outputHistory.length - 1] : "";

    // Generate Rows
    const renderRow = (keys: string[], rowIndex: number, offsetZ: number, offsetX: number) => {
        return keys.map((char, i) => {
            const x = (i * KEY_SPACING) - (keys.length * KEY_SPACING) / 2 + offsetX;
            const z = offsetZ;
            return (
                <Lamp
                    key={char}
                    char={char}
                    position={[x, 0, z]}
                    active={activeChar === char}
                />
            );
        });
    };

    return (
        <group>
            <group position={[0.3, 0, 0]}> {/* Centering adjust */}
                {renderRow(KEYS_ROW_1, 0, 0, 0)}
            </group>
            <group position={[0.6, 0, ROW_SPACING]}>
                {renderRow(KEYS_ROW_2, 1, 0, 0)}
            </group>
            <group position={[0.3, 0, ROW_SPACING * 2]}>
                {renderRow(KEYS_ROW_3, 2, 0, 0)}
            </group>
        </group>
    );
};
