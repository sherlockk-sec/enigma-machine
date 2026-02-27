
"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
// import { EffectComposer, Bloom } from "@react-three/postprocessing"; // Disabled for debug
import { EnigmaModel } from "./EnigmaModel";

export default function Scene() {
    return (
        <div className="w-full h-screen bg-gray-950">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={40} />

                {/* Environment for reflections on metal/bakelite */}
                <Environment preset="city" />
                <ambientLight intensity={1.5} />
                <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow shadow-bias={-0.0001} />
                {/* Fill light for the front keyboard area */}
                <pointLight position={[-5, 5, 5]} intensity={5} distance={20} decay={2} />

                {/* Lifted model up from -1 to 0.5 to center it on screen */}
                <group position={[0, 0.5, 0]}>
                    <EnigmaModel />
                </group>

                {/* <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={20} blur={2} far={4} resolution={256} color="#000000" /> -- Disabled for debug */}

                <OrbitControls
                    makeDefault
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 2.2}
                    minDistance={4}
                    maxDistance={15}
                    enablePan={false}
                />
            </Canvas>
        </div>
    );
}
