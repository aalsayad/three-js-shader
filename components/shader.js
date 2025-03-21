// This file has our special coloring instructions
export const vertex = `
  uniform vec2 uMouse;
  uniform float uStrength;
  uniform float uRadius;
  
  varying vec2 vUv;
  varying float vBulgeStrength;
  
  void main() {
    vUv = uv;
    vBulgeStrength = 0.0;
    
    // Create a copy of the position that we can modify
    vec3 pos = position;
    
    // Calculate distance from vertex to mouse position in UV space
    float dist = distance(uv, uMouse);
    
    // Create bulge effect based on distance
    if (dist < uRadius) {
      float bulgeAmount = 1.0 - (dist / uRadius);
      // Apply smooth falloff
      bulgeAmount = smoothstep(0.0, 1.0, bulgeAmount); 
      
      // Push the vertex outward along its normal
      pos += normal * bulgeAmount * uStrength;
      
      // Pass bulge strength to fragment shader
      vBulgeStrength = bulgeAmount;
    }
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const fragment = `
  uniform sampler2D uTexture;
  
  varying vec2 vUv;
  varying float vBulgeStrength;
  
  void main() {
    // Simply display the texture without any blur effect
    gl_FragColor = texture2D(uTexture, vUv);
  }
`;
