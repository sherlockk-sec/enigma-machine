
"use client";

import React from "react";
import { Box, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

// Materials
const woodMaterial = new THREE.MeshStandardMaterial({
    color: "#5C4033", // Darker, richer wood (Dark Brown)
    roughness: 0.5,
    metalness: 0.05,
});

const metalPlateMaterial = new THREE.MeshStandardMaterial({
    color: "#555555", // Lighter grey
    roughness: 0.5,
    metalness: 0.5,
});

const plugboardPanelMaterial = new THREE.MeshStandardMaterial({
    color: "#333333", // Dark Grey
    roughness: 0.5,
    metalness: 0.2,
});

export const Chassis: React.FC = () => {
    return (
        <group>
            {/* 1. Main Wooden Box */}
            {/* Dimensions approx: Width 28cm (assume 6 units), Depth 34cm (assume 8 units), Height 10cm (assume 2 units) */}
            <RoundedBox args={[7, 2, 8]} radius={0.1} smoothness={4} position={[0, -1.1, 0]}>
                <meshStandardMaterial {...woodMaterial} />
            </RoundedBox>

            {/* 2. Metal Faceplate (Rotor area) */}
            <Box args={[6.5, 0.2, 4]} position={[0, 0.15, -1.5]}>
                <meshStandardMaterial {...metalPlateMaterial} />
            </Box>

            {/* 3. Keyboard Base (Bakelite Panel) */}
            {/* Reduced depth to prevent overlap with Lampboard. 
                Old: Center 2.2, Depth 3 (0.7 to 3.7). Overlapped Lampboard (ends 1.5).
                New: Center 2.7, Depth 2.2 (1.6 to 3.8). Clean gap. */}
            <Box args={[6.5, 0.2, 2.2]} position={[0, 0.1, 2.7]} rotation={[0.2, 0, 0]}>
                <meshStandardMaterial color="#333" roughness={0.3} metalness={0.1} />
            </Box>

            {/* 4. Lampboard Base (Bakelite Panel) */}
            <Box args={[6.5, 0.2, 2]} position={[0, 0.15, 0.5]} rotation={[0.05, 0, 0]}>
                <meshStandardMaterial color="#333" roughness={0.3} metalness={0.1} />
            </Box>

            {/* Hinges / Latches Details (Primitive) */}
            <Box args={[0.2, 0.5, 0.1]} position={[3.5, 0, -2]}>
                <meshStandardMaterial color="#888" metalness={0.8} />
            </Box>
            <Box args={[0.2, 0.5, 0.1]} position={[-3.5, 0, -2]}>
                <meshStandardMaterial color="#888" metalness={0.8} />
            </Box>
        </group>
    );
};
