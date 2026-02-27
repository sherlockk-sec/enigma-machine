
"use client";

import React, { useState, useEffect } from "react";
import { Cylinder, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEnigmaStore } from "../store/useEnigmaStore";
import { ALPHABET } from "../logic/EnigmaEngine";
// import { useSpring, animated } from "@react-spring/three"; // No spring for now

// Layout for Enigma Keyboard (Standard QWERTZ)
const KEYS_ROW_1 = "QWERTZUIO".split("");
const KEYS_ROW_2 = "ASDFGHJK".split("");
const KEYS_ROW_3 = "PYXCVBNML".split("");

// Layout Config
const KEY_SPACING = 0.6;
const ROW_SPACING = 0.6;

interface KeyProps {
    char: string;
    position: [number, number, number];
    isPressed: boolean;
    onPress: (char: string) => void;
}

const Key: React.FC<KeyProps> = ({ char, position, isPressed, onPress }) => {
    // Depress animation (smooth)
    const [y, setY] = useState(0);

    // Animate Y position
    const targetY = isPressed ? -0.15 : 0;

    useFrame((state, delta) => {
        // Simple lerp animation
        const speed = isPressed ? 20 : 10; // Fast down, slower up
        const newY = THREE.MathUtils.lerp(y, targetY, delta * speed);
        if (Math.abs(newY - y) > 0.001) {
            setY(newY);
        }
    });

    return (
        <group position={[position[0], position[1] + y, position[2]]}>
            {/* Key Cap - Taller and lifted */}
            {/* args: [radiusTop, radiusBottom, height, segments] */}
            {/* Increased height to 0.3 for distinct protrusion */}
            <Cylinder
                args={[0.2, 0.25, 0.3, 32]}
                rotation={[0, 0, 0]}
                position={[0, 0.1, 0]} // Lifted up so bottom is at 0 roughly
                onClick={() => onPress(char)}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
            </Cylinder>

            {/* Metal Ring - Thicker base */}
            <Cylinder args={[0.28, 0.28, 0.05, 32]} rotation={[0, 0, 0]} position={[0, -0.05, 0]}>
                <meshStandardMaterial color="#888" roughness={0.4} metalness={0.8} />
            </Cylinder>

            {/* Letter - Raised to sit on new top surface */}
            <Text
                position={[0, 0.26, 0]} // Top of 0.3 height cylinder is at 0.1 + 0.15 = 0.25.
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.14}
                color="#eee"
                anchorX="center"
                anchorY="middle"
            >
                {char}
            </Text>
        </group>
    );
};

export const Keyboard3D: React.FC = () => {
    const { pressKey } = useEnigmaStore();
    const [pressedKey, setPressedKey] = useState<string | null>(null);

    // Audio Ref
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Use the new single-click sound file provided by user
        audioRef.current = new Audio("/typewriter_click_sound.m4a");
    }, []);

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.warn("Audio play failed", e));
        }
    };

    const handlePress = (char: string) => {
        if (pressedKey === char) return;

        setPressedKey(char);
        playSound(); // Play sound
        pressKey(char);
        setTimeout(() => setPressedKey(null), 150);
    };

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            if (ALPHABET.includes(key)) {
                handlePress(key);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    // Render Rows
    const renderRow = (keys: string[], rowIndex: number, offsetZ: number, offsetX: number) => {
        return keys.map((char, i) => {
            const x = (i * KEY_SPACING) - (keys.length * KEY_SPACING) / 2 + offsetX;
            const z = offsetZ;
            return (
                <Key
                    key={char}
                    char={char}
                    position={[x, 0, z]}
                    isPressed={pressedKey === char}
                    onPress={handlePress}
                />
            );
        });
    };

    return (
        <group>
            <group position={[0.3, 0, 0]}>
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
