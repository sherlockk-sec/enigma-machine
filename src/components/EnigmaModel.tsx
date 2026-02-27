
"use client";

import React, { useRef } from "react";
import { useEnigmaStore } from "../store/useEnigmaStore";
import { Rotor3D } from "./Rotor3D";
import { Beam } from "./Beam";
import { Chassis } from "./Chassis";
import { Keyboard3D } from "./Keyboard3D";
import { Lampboard3D } from "./Lampboard3D";
import { Plugboard3D } from "./Plugboard3D";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ROTOR_WIDTH = 1.2;
const GAP = 0.2;
const EXPLODED_GAP = 2.0;

export const EnigmaModel: React.FC = () => {
    const { rotorPositions, explodedView, rotateRotor } = useEnigmaStore();
    const groupRef = useRef<THREE.Group>(null);

    // Animation state
    const currentGap = useRef(GAP);

    useFrame((state, delta) => {
        const targetGap = explodedView ? EXPLODED_GAP : GAP;
        currentGap.current = THREE.MathUtils.lerp(currentGap.current, targetGap, delta * 5);
    });

    const spacing = explodedView ? EXPLODED_GAP : GAP;
    const offset = ROTOR_WIDTH + spacing;

    // Model Positioning:
    // Rotors need to sit ABOVE the chassis.
    // Chassis top is roughly at Y=0.
    // Rotors are radius 1. So center should be Y=1.1 approx.
    const ROTOR_Y = 1.15;
    const ROTOR_Z = -1.5; // Back of the machine

    // Keyboard and Lampboard
    const LAMPBOARD_Z = 0.5;
    const KEYBOARD_Z = 2.5;

    return (
        <group ref={groupRef}>
            <Chassis />

            {/* Lampboard Group - Aligned with Chassis Lampboard Panel */}
            {/* Panel Pos: [0, 0.15, 0.5] Size Z=2 (Extents -0.5 to 1.5)
                Rows are at local Z: 0, 0.6, 1.2.
                If we put Group at Z=-0.1:
                Global Z: -0.1, 0.5, 1.1. All safely on panel (-0.5 to 1.5). */}
            <group position={[0, 0.26, -0.1]} rotation={[0.05, 0, 0]}>
                <Lampboard3D />
            </group>

            {/* Keyboard Group - Aligned with Chassis Keyboard Panel */}
            {/* Panel Pos: [0, 0.1, 2.2]
                Height 0.2 -> Top Surface roughly 0.1 + 0.1 = 0.2.
                We place components at 0.25 to float just above. */}
            <group position={[0, 0.25, 2.2]} rotation={[0.2, 0, 0]}>
                <Keyboard3D />
            </group>

            {/* Plugboard Removed as requested */}
            {/* <group position={[0, -1.2, 4.8]} rotation={[-0.2, 0, 0]}>
                 <Plugboard3D />
            </group> */}

            {/* Rotor Assembly Group */}
            {/* Metal Faceplate Pos: [0, 0.15, -1.5]
                Top Surface ~ 0.25.
                Rotors radius ~1.0. Axle at Y = 1.0 + 0.25 = 1.25. */}
            <group position={[0, 1.3, ROTOR_Z]}>
                {/* Reflector (Static Check) */}
                <group position={[-offset * 1.5 - ROTOR_WIDTH, 0, 0]}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        {/* Cylinder geom is Y-up. Z-rot 90 makes it X-aligned. Correct. 
                             Wait, if I remove rotation from Rotors, they are X-aligned.
                             This reflector mesh is already manually rotated.
                             I need to ensure they match.
                             Rotor3D has internal rotation.
                             The mesh here has internal rotation.
                             So I just need to NOT rotate the Rotor3D INSTANCE.
                          */}
                        <cylinderGeometry args={[1, 1, 0.5, 32]} />
                        <meshStandardMaterial color="#333" roughness={0.5} />
                    </mesh>
                </group>

                <Rotor3D
                    model="I"
                    char={rotorPositions[0]}
                    position={[-offset, 0, 0]}
                    rotation={[0, 0, 0]} // Fixed: No Z-rotation
                    showWiring={explodedView}
                    onRotate={(dir) => rotateRotor(0, dir)}
                />

                <Rotor3D
                    model="II"
                    char={rotorPositions[1]}
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]} // Fixed: No Z-rotation
                    showWiring={explodedView}
                    onRotate={(dir) => rotateRotor(1, dir)}
                />

                <Rotor3D
                    model="III"
                    char={rotorPositions[2]}
                    position={[offset, 0, 0]}
                    rotation={[0, 0, 0]} // Fixed: No Z-rotation
                    showWiring={explodedView}
                    onRotate={(dir) => rotateRotor(2, dir)}
                />

                <group position={[offset * 1.5 + ROTOR_WIDTH, 0, 0]}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[1, 1, 0.2, 32]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>
                </group>

                {/* Needles / Pointers (Indicates current letter) */}
                {/* User requested to clear the "A" fully.
                    Moved even further left to X = -0.55.
                    Tip X = -0.55 + 0.2 = -0.35.
                    Ring Start X = -0.2.
                    Gap > 0.15. Absolutely no overlap possible.
                 */}

                {/* Left Needle */}
                <group position={[-offset - 0.55, 0, 1.25]}>
                    <mesh rotation={[0, 0, -Math.PI / 2]}>
                        <coneGeometry args={[0.14, 0.4, 4]} />
                        <meshStandardMaterial color="#D90429" roughness={0.2} metalness={0.4} />
                    </mesh>
                </group>

                {/* Middle Needle */}
                <group position={[-0.55, 0, 1.25]}>
                    <mesh rotation={[0, 0, -Math.PI / 2]}>
                        <coneGeometry args={[0.14, 0.4, 4]} />
                        <meshStandardMaterial color="#D90429" roughness={0.2} metalness={0.4} />
                    </mesh>
                </group>

                {/* Right Needle */}
                <group position={[offset - 0.55, 0, 1.25]}>
                    <mesh rotation={[0, 0, -Math.PI / 2]}>
                        <coneGeometry args={[0.14, 0.4, 4]} />
                        <meshStandardMaterial color="#D90429" roughness={0.2} metalness={0.4} />
                    </mesh>
                </group>

                {/* <Beam /> */}
            </group>
        </group>
    );
};
