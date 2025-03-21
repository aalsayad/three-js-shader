// This file has our special coloring instructions
export const vertex = `
  uniform vec2 uMouse;
  uniform float uStrength;
  uniform float uRadius;
  
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    
    // Create a copy of the position that we can modify
    vec3 pos = position;
    
    // Calculate distance from vertex to mouse position in UV space
    float dist = distance(uv, uMouse);
    
    // Create bulge effect based on distance
    if (dist < uRadius) {
      float bulgeAmount = 1.0 - (dist / uRadius);
      // Apply smooth falloff
      bulgeAmount = smoothstep(0.0, 1.0, bulgeAmount);
      
      // Edge protection - reduce bulge near edges of the plane
      // Calculate distance from edge (0 at edge, 1 at center)
      vec2 edgeDist = min(uv, 1.0 - uv) * 2.0; // Range 0-1
      float edgeFactor = min(edgeDist.x, edgeDist.y);
      
      // Apply edge factor - reduces bulge near edges
      bulgeAmount *= smoothstep(0.0, 0.3, edgeFactor);
      
      // Push the vertex outward along its normal
      pos += normal * bulgeAmount * uStrength;
    }
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const fragment = `
  uniform sampler2D uTexture;
  
  varying vec2 vUv;
  
  void main() {
    // Simply use the UV coordinates directly
    vec4 texColor = texture2D(uTexture, vUv);
    gl_FragColor = texColor;
  }
`;
