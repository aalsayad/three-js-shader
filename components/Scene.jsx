"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { fragment, vertex } from "./shader";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

function ShaderPlane() {
  const [texture, setTexture] = useState(null);
  const [loading, setLoading] = useState(true);
  const actualMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const lerpedMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const { size } = useThree();
  const shaderRef = useRef();
  const [time, setTime] = useState(0);

  // Track actual mouse position
  useEffect(() => {
    const handleMouseMove = (event) => {
      // Convert mouse position to UV coordinates (0 to 1)
      actualMouse.current.x = event.clientX / size.width;
      actualMouse.current.y = 1 - event.clientY / size.height; // Flip Y to match UV coords
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [size]);

  // Update uniforms & lerp mouse position every frame
  useFrame(() => {
    if (shaderRef.current) {
      // Apply lerp to mouse position
      // Keep the faster 0.25 factor for better responsiveness
      lerpedMouse.current.x +=
        (actualMouse.current.x - lerpedMouse.current.x) * 0.25;
      lerpedMouse.current.y +=
        (actualMouse.current.y - lerpedMouse.current.y) * 0.25;

      // Update the shader with the lerped position
      shaderRef.current.uniforms.uMouse.value = lerpedMouse.current;
    }
  });

  useEffect(() => {
    let isMounted = true;
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
      "/images/vonalogo-noblur.png",
      (loadedTexture) => {
        if (isMounted) {
          // Ensure texture parameters are set correctly
          loadedTexture.minFilter = THREE.LinearFilter;
          loadedTexture.magFilter = THREE.LinearFilter;
          setTexture(loadedTexture);
          setLoading(false);
        }
      },
      undefined,
      (error) => {
        console.error("Error loading texture", error);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return null;

  // Calculate aspect ratio
  const imageAspect = texture.image.width / texture.image.height;
  const canvasAspect = size.width / size.height;

  let planeWidth, planeHeight;
  if (canvasAspect > imageAspect) {
    planeHeight = 1.8;
    planeWidth = planeHeight * imageAspect;
  } else {
    planeWidth = 1.8;
    planeHeight = planeWidth / imageAspect;
  }

  return (
    <mesh>
      <planeGeometry args={[planeWidth, planeHeight, 50, 50]} />{" "}
      {/* Reduced subdivisions for better performance */}
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{
          uTexture: { value: texture },
          uMouse: { value: lerpedMouse.current },
          uStrength: { value: 0.25 }, // Controls bulge strength
          uRadius: { value: 0.3 }, // Controls bulge radius
          uBlurIntensity: { value: 5.0 }, // Blur intensity - adjust as needed
        }}
        transparent={true}
      />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 1.5], fov: 50 }}>
      {/* <color attach="background" args={["#f0f0f0"]} /> */}
      <ShaderPlane />
    </Canvas>
  );
}
