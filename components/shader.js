// This file has our special coloring instructions
export const vertex = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv; // Pass the UV coordinates to the fragment shader
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragment = `
  uniform sampler2D uTexture; // This will be our image!
  varying vec2 vUv;
  
  void main() {
    // Get the color from our image at this exact spot
    vec4 textureColor = texture2D(uTexture, vUv);
    gl_FragColor = textureColor;
  }
`;
