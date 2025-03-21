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
  uniform float uBlurIntensity;
  
  varying vec2 vUv;
  varying float vBulgeStrength;
  
  // Helper function for smoother gaussian weighting
  float gaussian(float x, float sigma) {
    return exp(-(x*x) / (2.0 * sigma * sigma));
  }
  
  void main() {
    if (vBulgeStrength > 0.01) {
      // Higher blur amount for more spread
      float blurAmount = vBulgeStrength * uBlurIntensity * 0.02;
      
      // Ultra-smooth gradient blur
      vec4 color = vec4(0.0);
      float totalWeight = 0.0;
      
      // Use many more samples in a circular pattern with spiral offset
      const int STEPS = 10;      // Radius steps
      const int SAMPLES = 12;   // Angular samples
      
      for (int s = 0; s < SAMPLES; s++) {
        float angle = float(s) * (3.14159 * 2.0 / float(SAMPLES));
        
        // Multiple radius steps with gaussian weighting
        for (int r = 1; r <= STEPS; r++) {
          // Progressive radius increase with spiral pattern
          float radiusScale = float(r) / float(STEPS);
          float radius = radiusScale * radiusScale * blurAmount;
          
          // Add slight spiral by offsetting angle based on radius
          float spiralAngle = angle + radiusScale * 0.5;
          vec2 offset = vec2(cos(spiralAngle), sin(spiralAngle)) * radius;
          
          // Gaussian weight falloff
          float sigma = 0.5;  // Controls falloff rate
          float weight = gaussian(radiusScale, sigma);
          
          vec4 sampleColor = texture2D(uTexture, vUv + offset);
          color += sampleColor * weight;
          totalWeight += weight;
        }
      }
      
      // Add center sample with high weight for clarity
      vec4 centerColor = texture2D(uTexture, vUv);
      float centerWeight = gaussian(0.0, 0.5) * 2.0; // Double weight for center
      color += centerColor * centerWeight;
      totalWeight += centerWeight;
      
      // Create super smooth transition
      float smoothBulge = smoothstep(0.0, 0.8, vBulgeStrength) * vBulgeStrength;
      
      // Apply final color with smooth transition
      gl_FragColor = mix(centerColor, color / totalWeight, smoothBulge);
    } else {
      // No blur outside the bulge area
      gl_FragColor = texture2D(uTexture, vUv);
    }
  }
`;
