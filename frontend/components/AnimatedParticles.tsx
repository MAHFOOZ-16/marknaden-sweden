'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const count = 2000;

function createParticles() {
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);

    const colorChoices = [
        new THREE.Color('#a29bfe'), // soft purple
        new THREE.Color('#ffffff'), // white
        new THREE.Color('#81ecec'), // soft cyan
        new THREE.Color('#ffeaa7'), // soft yellow
    ];

    for (let i = 0; i < count * 3; i += 3) {
        // Spread in a gentle, ambient cloud
        p[i] = (Math.random() - 0.5) * 30;
        p[i + 1] = (Math.random() - 0.5) * 30;
        p[i + 2] = (Math.random() - 0.5) * 30;

        const picked = colorChoices[Math.floor(Math.random() * colorChoices.length)];
        c[i] = picked.r;
        c[i + 1] = picked.g;
        c[i + 2] = picked.b;
    }
    return { positions: p, colors: c };
}

export default function AnimatedParticles() {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, colors } = useMemo(() => createParticles(), []);

    useFrame((state) => {
        if (pointsRef.current) {
            // Slower, calmer rotation
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                    count={count}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                    count={count}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                sizeAttenuation={true}
                vertexColors
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}
