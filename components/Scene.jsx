"use client";

import { Canvas } from "@react-three/fiber";
import { fragment, vertex } from "./shader";
import { useState, useEffect } from "react";
import * as THREE from "three";

function ShaderPlane() {
  const [texture, setTexture] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(
      "/images/vonalogo-noblur.png",
      (loadedTexture) => {
        if (isMounted) {
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

  return (
    <mesh>
      <planeGeometry args={[2, 2, 32, 32]} />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{
          uTexture: { value: texture },
        }}
      />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas camera={{ fov: 35 }}>
      <ShaderPlane />
    </Canvas>
  );
}
