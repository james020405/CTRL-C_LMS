/**
 * Test Setup File
 * Configures the testing environment for React Testing Library
 */

import '@testing-library/jest-dom';

// Mock IntersectionObserver
class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

global.IntersectionObserver = IntersectionObserver;

// Mock ResizeObserver
class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
}

global.ResizeObserver = ResizeObserver;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => { },
    }),
});

// Mock WebGL context for Three.js
HTMLCanvasElement.prototype.getContext = function (type) {
    if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') {
        return {
            canvas: this,
            getExtension: () => null,
            getParameter: () => [],
            getShaderPrecisionFormat: () => ({ precision: 1 }),
            createShader: () => ({}),
            createProgram: () => ({}),
            attachShader: () => { },
            linkProgram: () => { },
            getProgramParameter: () => true,
            getShaderParameter: () => true,
            compileShader: () => { },
            shaderSource: () => { },
            useProgram: () => { },
            getAttribLocation: () => 0,
            getUniformLocation: () => ({}),
            bindBuffer: () => { },
            createBuffer: () => ({}),
            bufferData: () => { },
            enableVertexAttribArray: () => { },
            vertexAttribPointer: () => { },
            drawArrays: () => { },
            viewport: () => { },
            clearColor: () => { },
            clear: () => { },
            enable: () => { },
            disable: () => { },
            blendFunc: () => { },
            depthFunc: () => { },
            cullFace: () => { },
            frontFace: () => { },
            createTexture: () => ({}),
            bindTexture: () => { },
            texImage2D: () => { },
            texParameteri: () => { },
            activeTexture: () => { },
            uniform1i: () => { },
            uniform1f: () => { },
            uniform2f: () => { },
            uniform3f: () => { },
            uniform4f: () => { },
            uniformMatrix4fv: () => { },
        };
    }
    return null;
};
