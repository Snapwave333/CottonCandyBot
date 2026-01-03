"use client";

import { useEffect, useRef } from 'react';

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Vertex Shader (Simple Full-screen Quad)
    const vsSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `;

    // Fragment Shader (Metaballs + Full RGB Cycle)
    const fsSource = `
      precision mediump float;
      
      uniform vec2 uResolution;
      uniform float uTime;

      // Color Palette - Dynamic
      // We will generate colors using HSV to RGB for full spectrum cycling

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      // Smooth Minimum
      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      // SDF for a Circle
      float sdCircle(vec2 p, float r) {
        return length(p) - r;
      }

      void main() {
        // Multi-Directional Wind Physics (Turbulence)
        // Layering sine waves to create chaotic drift from different directions
        float t = uTime;
        
        // Primary flow (East-ish)
        float windX = sin(t * 0.1) * 0.2 + cos(t * 0.05) * 0.1; 
        
        // Secondary flow (North/South variance)
        float windY = cos(t * 0.15) * 0.15 + sin(t * 0.25) * 0.05;
        
        // Turbulence/Gusts (Fast, small variations)
        float turbulence = sin(t * 0.5 + gl_FragCoord.x * 0.01) * 0.02;
        
        vec2 windOffset = vec2(windX + turbulence, windY - turbulence);
        
        // Apply wind to UVs
        vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
        vec2 moving_uv = uv - windOffset;
        
        // Blobs now move relative to the wind
        float t_anim = uTime * 0.2;
        
        // Repelling Blob (The "Small" one that pushes others)
        // Moves faster and unpredictably
        vec2 posRepel = vec2(sin(uTime * 0.7) * 1.5, cos(uTime * 0.6) * 1.0);
        float dRepel = sdCircle(moving_uv - posRepel, 0.5); // Radius 0.5 (Smaller)
        
        // Calculate Repulsion Field (Domain Warping)
        // Pushes the coordinate space of other blobs away from posRepel
        vec2 dirToRepel = moving_uv - posRepel;
        float distToRepel = length(dirToRepel);
        vec2 repelForce = normalize(dirToRepel) * exp(-distToRepel * 3.0) * 0.5; // Strength 0.5
        
        // Apply repulsion to the coordinates used for the other blobs
        vec2 warped_uv = moving_uv - repelForce;

        // The "Others" (Being repelled)
        vec2 pos1 = vec2(sin(t_anim * 0.8) * 0.8, cos(t_anim * 0.6) * 0.5);
        vec2 pos2 = vec2(sin(t_anim * 0.5 + 2.0) * 0.9, cos(t_anim * 0.7 + 1.0) * 0.6);
        vec2 pos3 = vec2(cos(t_anim * 0.3 + 4.0) * 0.6, sin(t_anim * 0.4 + 2.0) * 0.8);

        // Blobs - Radius reduced by 0.5x as requested
        // Using warped_uv creates the illusion they are pushed away
        float d1 = sdCircle(warped_uv - pos1, 1.2);
        float d2 = sdCircle(warped_uv - pos2, 1.05);
        float d3 = sdCircle(warped_uv - pos3, 0.9);

        // Melt - Reduced smoothing slightly for smaller blobs
        float d = smin(d1, d2, 0.6);
        d = smin(d, d3, 0.6);
        
        // Blend the Repulsor in, but maybe with less smoothing so it feels harder/distinct?
        // Actually, blending it makes it look like it's interacting.
        // Let's keep it smin but with the UNWARPED distance (dRepel) so it doesn't push itself.
        d = smin(d, dRepel, 0.3); // Tighter blend for the small one

        // Dynamic Color Cycling
        // Extremely slow rotation over 480 seconds (2x slower than previous 240s)
        float hue = fract(uTime * 0.00625); 
        
        // Base color (Deep solid black/colored void)
        // Saturation 1.0, Value extraordinarily low to keep it dark but colored
        vec3 baseColor = hsv2rgb(vec3(hue, 1.0, 0.02)); 
        
        // Blob color (Deep RICH Solid Colors - NO WHITE)
        // Saturation 1.0 (Full Color), Value 0.5 (Rich/Deep, not bright/pastel)
        vec3 blobHue = hsv2rgb(vec3(fract(hue + 0.05 + length(uv)*0.05), 1.0, 0.5));

        vec3 col = baseColor;
        
        // Mix blobs
        if (d < 0.1) {
            float val = smoothstep(0.1, -0.1, d);
            // Solid blend, no additive brightness
            col = mix(col, blobHue, val); 
        }

        // Ambient Glow - Reduced reach, deep color only
        col += blobHue * exp(-d * 4.0) * 0.05;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // Shader Compilation Helper
    function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return;

    // Shader Program
    const shaderProgram = gl.createProgram();
    if (!shaderProgram) return;
    
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return;
    }

    // Buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0,  1.0,
       1.0,  1.0,
      -1.0, -1.0,
       1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Uniform Locations
    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
        time: gl.getUniformLocation(shaderProgram, 'uTime'),
      },
    };

    // Render Loop
    let startTime = performance.now();
    let animationFrameId: number;

    function render() {
      if (!gl || !canvas) return; // Safety check inside loop

      // Resize handling for retina displays etc.
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(programInfo.program);

      // Bind Position
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      // Set Uniforms
      gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
      gl.uniform1f(programInfo.uniformLocations.time, (performance.now() - startTime) * 0.001);

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="z-[-1] fixed inset-0">
       <canvas ref={canvasRef} className="block w-full h-full" />
       {/* Frosted Layer */}
       <div className="absolute inset-0 backdrop-blur-[30px] w-full h-full pointer-events-none" /> 
    </div>
  );
}
