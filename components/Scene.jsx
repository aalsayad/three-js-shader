"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { fragment, vertex } from "./shader";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

function ShaderPlane() {
  const [texture, setTexture] = useState(null);
  const [loading, setLoading] = useState(true);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5)); // Default to center
  const { size, viewport } = useThree();
  const shaderRef = useRef();
  const camera = useThree((state) => state.camera);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (event) => {
      // Convert mouse position to UV coordinates (0 to 1)
      mouse.current.x = event.clientX / size.width;
      mouse.current.y = 1 - event.clientY / size.height; // Flip Y to match UV coords
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [size]);

  // Update uniforms every frame
  useFrame(() => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uMouse.value = mouse.current;
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
          loadedTexture.needsUpdate = true;

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

    // Adjust camera to ensure we see the full scene
    // This is needed because we're using an orthographic-like setup
    camera.position.z = 1;
    camera.updateProjectionMatrix();

    return () => {
      isMounted = false;
    };
  }, [camera]);

  if (loading) return null;

  return (
    <mesh>
      {/* Scale down the plane to 90% of the view size to leave room for bulging */}
      <planeGeometry args={[1.8, 1.8, 64, 64]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{
          uTexture: { value: texture },
          uMouse: { value: mouse.current },
          uStrength: { value: 0.2 }, // Reduced strength for less extreme bulging
          uRadius: { value: 0.2 },
          uTextureAspect: { value: texture.image.width / texture.image.height },
          uViewportAspect: { value: size.width / size.height },
        }}
        transparent={true}
      />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{
        position: [0, 0, 1],
        near: 0.1,
        far: 1000,
        fov: 60,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <ShaderPlane />
    </Canvas>
  );
}
