
"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Cylinder } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";
import { ALPHABET } from "../logic/EnigmaEngine";

interface Rotor3DProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    char: string;
    model: string;
    showWiring?: boolean;
    onRotate?: (direction: 1 | -1) => void;
}

const bakeliteMaterial = new THREE.MeshStandardMaterial({
    color: "#1a1a1a",
    roughness: 0.1, // Shiny bakelite
    metalness: 0.1,
});

const brassMaterial = new THREE.MeshStandardMaterial({
    color: "#D4AF37", // Gold/Brass
    roughness: 0.3,   // Shinier
    metalness: 0.8,   // More metallic
});

export const Rotor3D: React.FC<Rotor3DProps> = ({
    position,
    rotation = [0, 0, 0],
    char,
    model,
    showWiring,
    onRotate,
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);
    const triggered = useRef(false);

    // Drag Gesture
    const bindGesture = useDrag(({ active, movement: [mx, my] }) => {
        if (active && Math.abs(my) > 20) {
            if (!triggered.current) {
                onRotate?.(my > 0 ? -1 : 1);
                triggered.current = true;
            }
        } else {
            triggered.current = false;
        }
    });

    const charIndex = ALPHABET.indexOf(char);
    const anglePerChar = (Math.PI * 2) / 26;
    const targetRotationX = charIndex * anglePerChar;

    // Generate Dynamic Texture for Alphabet Ring
    const alphaTexture = useMemo(() => {
        if (typeof document === 'undefined') return null;

        const canvas = document.createElement('canvas');
        const width = 2048;
        const height = 128; // Aspect ratio fits the ring side (Circumference ~6.28 vs Height 0.4 -> 15:1 ratio)
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Background (White Enamel)
        ctx.fillStyle = '#eeeeee';
        ctx.fillRect(0, 0, width, height);

        // Text Settings
        // We need 26 letters spread across width
        const step = width / 26;
        ctx.font = 'bold 80px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#111111';

        // Draw Letters
        // Note: Cylinder texture maps u=0 to start. We assume standard wrapping.
        // To match the logical index, we might need to reverse or offset.
        // Standard map: A..Z
        for (let i = 0; i < 26; i++) {
            const letter = ALPHABET[i];

            // x center for this letter
            // We shift by half a step to center it in its slot
            const x = i * step + (step / 2);
            const y = height / 2;

            ctx.save();
            ctx.translate(x, y);
            // Rotate +90 degrees (Math.PI / 2) to flip text 180 degrees relative to previous -90.
            // This fixes the "Upside Down" issue when texture is not mirrored.
            ctx.rotate(Math.PI / 2);
            ctx.fillText(letter, 0, 0);
            ctx.restore();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        // Reset to standard mapping (No flip) to fix lateral inversion.
        // We will adjust rotation in the canvas drawing if needed.

        // Ensure wrapping is enabled so the texture repeats correctly around the cylinder
        // and our offset works without clamping.
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        // Shift texture to align the letter with the pointer (which is at angle 0/front)
        // 1 full turn = 1.0. 26 letters. 1 letter = 1/26.
        // We want to shift by half a letter = 0.5/26.
        texture.offset.x = 0.5 / 26;

        return texture;

    }, []);

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={new THREE.Euler(...rotation)}
            {...bindGesture()}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            {/* Main Rotor Group - Rotates based on character selection */}
            {/* Note: targetRotationX rotates the whole group. */}
            <group rotation={[targetRotationX, 0, 0]}>

                {/* 1. Thumb Scallops (The finger grip) - Left Side */}
                <group position={[-0.3, 0, 0]}>
                    <Cylinder args={[1.2, 1.2, 0.3, 26]} rotation={[0, 0, Math.PI / 2]}>
                        <meshStandardMaterial {...brassMaterial} color={hovered ? "#d4af37" : "#b5a642"} />
                    </Cylinder>
                </group>

                {/* 2. Alphabet Ring (White Enamel background) - Center */}
                <group position={[0, 0, 0]}>
                    <Cylinder args={[1.0, 1.0, 0.4, 64]} rotation={[0, 0, Math.PI / 2]}>
                        {/* Use generated texture map */}
                        <meshStandardMaterial
                            color="#ffffff"
                            map={alphaTexture}
                            roughness={0.2}
                            metalness={0.1}
                        />
                    </Cylinder>
                </group>

                {/* 3. Bakelite Core (Right side) */}
                <group position={[0.3, 0, 0]}>
                    <Cylinder args={[0.9, 0.9, 0.3, 32]} rotation={[0, 0, Math.PI / 2]}>
                        <meshStandardMaterial {...bakeliteMaterial} transparent opacity={showWiring ? 0.2 : 1.0} />
                    </Cylinder>
                </group>

                {/* 4. Notched Ring (Visual logic ring) - Far Right */}
                <group position={[0.46, 0, 0]}>
                    <Cylinder args={[0.95, 0.95, 0.05, 32]} rotation={[0, 0, Math.PI / 2]}>
                        <meshStandardMaterial {...brassMaterial} />
                    </Cylinder>
                </group>
            </group>

            {/* Axle/Spindle */}
            <Cylinder args={[0.1, 0.1, 1.5, 16]} rotation={[0, 0, Math.PI / 2]}>
                <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
            </Cylinder>

        </group>
    );
};
