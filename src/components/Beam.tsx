
"use client";

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEnigmaStore } from "../store/useEnigmaStore";

const RADIUS = 1.15; // Increased radius to sit above new rotors

export const Beam: React.FC = () => {
    const { lastSignalPath, explodedView, rotorPositions } = useEnigmaStore();
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    // Pulse animation
    useFrame((state) => {
        if (materialRef.current) {
            // Pulse opacity or color intensity
            const t = state.clock.getElapsedTime();
            const pulse = 0.5 + Math.sin(t * 10) * 0.2;
            materialRef.current.opacity = 0.6 + pulse;
        }
    });

    const curve = useMemo(() => {
        if (!lastSignalPath) return null;

        const ROTOR_WIDTH = 1.2;
        const GAP = explodedView ? 2.0 : 0.2;
        const offset = ROTOR_WIDTH + GAP;

        const y = RADIUS;

        // Positions
        const posEntry = offset * 1.5 + ROTOR_WIDTH;
        const posR = offset;
        const posM = 0;
        const posL = -offset;
        const posRef = -offset * 1.5 - ROTOR_WIDTH;

        const points = [];

        // Start (Keyboard area) - Adjusted to be less extreme
        points.push(new THREE.Vector3(0, -1, 4));

        // Entry Wheel
        points.push(new THREE.Vector3(posEntry, y, 0));

        // Rotor R
        points.push(new THREE.Vector3(posR + ROTOR_WIDTH / 2, y, 0));
        points.push(new THREE.Vector3(posR - ROTOR_WIDTH / 2, y, 0));

        // Rotor M
        points.push(new THREE.Vector3(posM + ROTOR_WIDTH / 2, y, 0));
        points.push(new THREE.Vector3(posM - ROTOR_WIDTH / 2, y, 0));

        // Rotor L
        points.push(new THREE.Vector3(posL + ROTOR_WIDTH / 2, y, 0));
        points.push(new THREE.Vector3(posL - ROTOR_WIDTH / 2, y, 0));

        // Reflector
        points.push(new THREE.Vector3(posRef, y, 0));

        // Return path (slightly offset in Z)
        const zRet = 0.5;
        points.push(new THREE.Vector3(posRef, y, zRet));
        points.push(new THREE.Vector3(posL - ROTOR_WIDTH / 2, y, zRet));
        points.push(new THREE.Vector3(posL + ROTOR_WIDTH / 2, y, zRet));
        points.push(new THREE.Vector3(posM - ROTOR_WIDTH / 2, y, zRet));
        points.push(new THREE.Vector3(posM + ROTOR_WIDTH / 2, y, zRet));
        points.push(new THREE.Vector3(posR - ROTOR_WIDTH / 2, y, zRet));
        points.push(new THREE.Vector3(posR + ROTOR_WIDTH / 2, y, zRet));
        points.push(new THREE.Vector3(posEntry, y, zRet));

        // End (Lampboard)
        points.push(new THREE.Vector3(0, -2, 5));

        return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2);
    }, [lastSignalPath, explodedView, rotorPositions]);

    if (!curve) return null;

    return (
        <mesh>
            <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
            <meshBasicMaterial
                ref={materialRef}
                color={[2, 2, 0]} // High intensity yellow for Bloom
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};
