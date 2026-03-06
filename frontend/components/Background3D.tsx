'use client';

import React, { ErrorInfo } from 'react';
import { Canvas } from '@react-three/fiber';
import AnimatedParticles from './AnimatedParticles';

class WebGLErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.warn('WebGL Context Error caught by boundary:', error);
    }

    render() {
        if (this.state.hasError) {
            // Fallback plain gradient if WebGL fails
            return <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] to-[#12121a]"></div>;
        }
        return this.props.children;
    }
}

export default function Background3D() {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#0a0a0f]">
            <WebGLErrorBoundary>
                <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
                    <AnimatedParticles />
                </Canvas>
            </WebGLErrorBoundary>
        </div>
    );
}
