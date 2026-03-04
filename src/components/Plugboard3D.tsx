
"use client";

import React, { useState, useMemo } from "react";
import { Text } from "@react-three/drei";
import { useEnigmaStore } from "../store/useEnigmaStore";
import * as THREE from "three";

const KEYS_ROW_1 = "QWERTZUIO".split("");
const KEYS_ROW_2 = "ASDFGHJK".split("");
const KEYS_ROW_3 = "PYXCVBNML".split("");

const KEY_SPACING = 0.6;
const ROW_SPACING = 0.6;

// --- Global Geometries and Materials (Instant Rendering, Zero Memory Leak) ---
const holeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16);
const ringGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16);
const plugGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.3, 16);
const hitboxGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);

const darkMat = new THREE.MeshStandardMaterial({ color: "#000" });
const activeHoleMat = new THREE.MeshStandardMaterial({ color: "#111" });
const plugMat = new THREE.MeshStandardMaterial({ color: "#111", roughness: 0.7 });
const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
const metalMat = new THREE.MeshStandardMaterial({ color: "#888", metalness: 0.8 });
const selectedMat = new THREE.MeshStandardMaterial({ color: "#FFA500", emissive: "#FFA500", emissiveIntensity: 0.5 });
const connectedMat = new THREE.MeshStandardMaterial({ color: "#4CAF50", emissive: "#4CAF50", emissiveIntensity: 0.2 });


// Helper to calculate the 3D position of a socket hole
const getSocketPosition = (char: string): [number, number, number] => {
    let rowIndex = -1;
    let colIndex = -1;
    let keys = KEYS_ROW_1;
    let offsetX = 0.3;

    if (KEYS_ROW_1.includes(char)) { rowIndex = 0; colIndex = KEYS_ROW_1.indexOf(char); keys = KEYS_ROW_1; offsetX = 0.3; }
    else if (KEYS_ROW_2.includes(char)) { rowIndex = 1; colIndex = KEYS_ROW_2.indexOf(char); keys = KEYS_ROW_2; offsetX = 0.6; }
    else if (KEYS_ROW_3.includes(char)) { rowIndex = 2; colIndex = KEYS_ROW_3.indexOf(char); keys = KEYS_ROW_3; offsetX = 0.3; }

    const x = (colIndex * KEY_SPACING) - (keys.length * KEY_SPACING) / 2 + offsetX;
    const y = 0.3 - rowIndex * ROW_SPACING; // Lowered from 0.5 to prevent protruding top edge

    return [x, y, 0];
};

// --- Solid 3D Cable ---
const Cable: React.FC<{ start: THREE.Vector3; end: THREE.Vector3; color: THREE.Color }> = React.memo(({ start, end, color }) => {
    const curve = useMemo(() => {
        const midX = (start.x + end.x) / 2;
        const midY = Math.min(start.y, end.y) - 1.2; // Droop down
        const midZ = Math.max(start.z, end.z) + 0.8; // Bulge outwards

        return new THREE.QuadraticBezierCurve3(
            start,
            new THREE.Vector3(midX, midY, midZ),
            end
        );
    }, [start, end]);

    return (
        <mesh>
            <tubeGeometry args={[curve, 24, 0.05, 8, false]} />
            <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
        </mesh>
    );
});
Cable.displayName = "Cable";

interface SocketProps {
    char: string;
    position: [number, number, number];
    isSelected: boolean;
    isConnected: boolean;
    onClick: () => void;
}

const Socket: React.FC<SocketProps> = React.memo(({ char, position, isSelected, isConnected, onClick }) => {
    // Dynamic materials based on state
    const ringMat = isSelected ? selectedMat : isConnected ? connectedMat : metalMat;
    const holeMat = isConnected ? activeHoleMat : darkMat;

    return (
        <group position={position}>
            {/* Optimized Text label that caches SDF properly */}
            <Text
                position={[0, 0.22, 0]}
                fontSize={0.15}
                color="#e0e0e0"
                anchorX="center"
                anchorY="middle"
                characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ" // Forces caching
            >
                {char}
            </Text>

            {/* Top Hole (Interactive Area) */}
            <group
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                onPointerOver={(e) => { document.body.style.cursor = 'pointer'; }}
                onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
            >
                {/* Invisible hit box for easier clicking */}
                <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={hitboxGeo} material={hitboxMat} />

                {/* Visible Hole 1 */}
                <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={holeGeo} material={holeMat} />

                {/* Visible Ring 1 */}
                <mesh position={[0, 0.05, 0.05]} rotation={[Math.PI / 2, 0, 0]} geometry={ringGeo} material={ringMat} />

                {/* Visible Hole 2 */}
                <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]} geometry={holeGeo} material={holeMat} />

                {/* Visible Ring 2 */}
                <mesh position={[0, -0.15, 0.05]} rotation={[Math.PI / 2, 0, 0]} geometry={ringGeo} material={ringMat} />

                {/* Physical Plug Body inserted if connected */}
                {isConnected && (
                    <mesh position={[0, -0.05, 0.15]} rotation={[Math.PI / 2, 0, 0]} geometry={plugGeo} material={plugMat} />
                )}
            </group>
        </group>
    );
});
Socket.displayName = "Socket";

export const Plugboard3D: React.FC = () => {
    const { machine, addPlug, removePlug } = useEnigmaStore();
    const [selectedChar, setSelectedChar] = useState<string | null>(null);

    // Pre-load the plug sound effect
    const plugSound = useMemo(() => {
        if (typeof window !== 'undefined') {
            const audio = new Audio('/sounds/plug_in.mp3');
            audio.volume = 0.5;
            return audio;
        }
        return null;
    }, []);

    // Extract current connections from EnigmaEngine's internal plugboard Map
    const connectionsMap = (machine.plugboard as any).connections as Map<string, string>;

    // Convert Map to an array of unique pairs to draw cables
    const cables: [string, string][] = [];
    const seen = new Set<string>();
    connectionsMap.forEach((val, key) => {
        if (!seen.has(key) && !seen.has(val)) {
            cables.push([key, val]);
            seen.add(key);
            seen.add(val);
        }
    });

    const handleSocketClick = (char: string) => {
        if (connectionsMap.has(char)) {
            removePlug(char);
            if (selectedChar === char) setSelectedChar(null);
            return;
        }

        if (!selectedChar) {
            setSelectedChar(char);
        } else {
            if (selectedChar === char) {
                setSelectedChar(null);
            } else {
                addPlug(selectedChar, char);
                setSelectedChar(null);

                // Play sound when connection is made
                if (plugSound) {
                    plugSound.currentTime = 0;
                    plugSound.play().catch(e => console.warn("Audio playback prevented:", e));
                }
            }
        }
    };

    const renderRow = (keys: string[]) => {
        return keys.map((char) => {
            const pos = getSocketPosition(char);
            return (
                <Socket
                    key={char}
                    char={char}
                    position={pos}
                    isSelected={selectedChar === char}
                    isConnected={connectionsMap.has(char)}
                    onClick={() => handleSocketClick(char)}
                />
            );
        });
    };

    return (
        <group>
            {renderRow(KEYS_ROW_1)}
            {renderRow(KEYS_ROW_2)}
            {renderRow(KEYS_ROW_3)}

            {/* Render Cables */}
            {cables.map(([char1, char2], index) => {
                const pos1 = getSocketPosition(char1);
                const pos2 = getSocketPosition(char2);

                // Add plug body offset to Z so cable comes out of the plug
                const p1 = new THREE.Vector3(pos1[0], pos1[1], pos1[2] + 0.3);
                const p2 = new THREE.Vector3(pos2[0], pos2[1], pos2[2] + 0.3);

                // Randomize cable color slightly per connection for realism
                const hue = (index * 137.5) % 360;
                const color = new THREE.Color(`hsl(${hue}, 40%, 30%)`);

                return (
                    <Cable key={`${char1}-${char2}`} start={p1} end={p2} color={color} />
                );
            })}
        </group>
    );
};
