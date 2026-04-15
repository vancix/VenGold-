import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 8);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'default',
  failIfMajorPerformanceCaveat: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const root = document.getElementById('root') ?? document.body;
root.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.5;

// Lighting
const ambientLight = new THREE.AmbientLight(0x331111, 0.5);
ambientLight.name = 'ambientLight';
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xff4400, 3, 20);
pointLight1.position.set(2, 3, 4);
pointLight1.name = 'pointLight1';
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff0044, 3, 20);
pointLight2.position.set(-2, -1, 4);
pointLight2.name = 'pointLight2';
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xff6600, 2, 15);
pointLight3.position.set(0, 2, -3);
pointLight3.name = 'pointLight3';
scene.add(pointLight3);

// === CREATE 3D HEART ===
function createHeartShape() {
  const shape = new THREE.Shape();
  const x = 0, y = 0;
  shape.moveTo(x, y + 0.5);
  shape.bezierCurveTo(x, y + 0.5, x - 0.5, y + 1.5, x - 1.5, y + 1.5);
  shape.bezierCurveTo(x - 3, y + 1.5, x - 3, y, x - 3, y);
  shape.bezierCurveTo(x - 3, y - 1, x - 2, y - 2.2, x, y - 3.5);
  shape.bezierCurveTo(x + 2, y - 2.2, x + 3, y - 1, x + 3, y);
  shape.bezierCurveTo(x + 3, y, x + 3, y + 1.5, x + 1.5, y + 1.5);
  shape.bezierCurveTo(x + 0.5, y + 1.5, x, y + 0.5, x, y + 0.5);
  return shape;
}

const heartShape = createHeartShape();
const extrudeSettings = {
  depth: 1.2,
  bevelEnabled: true,
  bevelSegments: 12,
  steps: 2,
  bevelSize: 0.3,
  bevelThickness: 0.3,
  curveSegments: 32
};

const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
heartGeometry.center();

const heartMaterial = new THREE.MeshStandardMaterial({
  color: 0xcc0022,
  roughness: 0.25,
  metalness: 0.6,
  emissive: 0x440000,
  emissiveIntensity: 0.4,
  side: THREE.DoubleSide
});

const heart = new THREE.Mesh(heartGeometry, heartMaterial);
heart.name = 'heart';
heart.scale.set(0.65, 0.65, 0.65);
heart.position.y = 0.5;
scene.add(heart);

// Glow heart (slightly larger, transparent)
const glowMaterial = new THREE.MeshStandardMaterial({
  color: 0xff2200,
  emissive: 0xff4400,
  emissiveIntensity: 0.6,
  transparent: true,
  opacity: 0.12,
  side: THREE.DoubleSide
});
const heartGlow = new THREE.Mesh(heartGeometry, glowMaterial);
heartGlow.name = 'heartGlow';
heartGlow.scale.set(0.7, 0.7, 0.7);
heartGlow.position.y = 0.5;
scene.add(heartGlow);

// === FIRE PARTICLE SYSTEM ===
const fireParticleCount = 1200;
const fireGeometry = new THREE.BufferGeometry();
const firePositions = new Float32Array(fireParticleCount * 3);
const fireSizes = new Float32Array(fireParticleCount);
const fireColors = new Float32Array(fireParticleCount * 3);
const fireLifetimes = new Float32Array(fireParticleCount);
const fireVelocities = new Float32Array(fireParticleCount * 3);
const firePhases = new Float32Array(fireParticleCount);

function initFireParticle(i) {
  const angle = Math.random() * Math.PI * 2;
  const heartT = Math.random();
  // Distribute around heart surface
  const r = 1.2 + Math.random() * 0.8;
  const hx = Math.sin(angle) * r * 0.65;
  const hy = (Math.cos(angle) * r * 0.5 + (Math.random() - 0.3) * 1.5) * 0.65 + 0.5;
  const hz = (Math.random() - 0.5) * 1.0;

  firePositions[i * 3] = hx;
  firePositions[i * 3 + 1] = hy;
  firePositions[i * 3 + 2] = hz;

  fireVelocities[i * 3] = (Math.random() - 0.5) * 0.3;
  fireVelocities[i * 3 + 1] = 1.5 + Math.random() * 2.5;
  fireVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

  fireSizes[i] = 15 + Math.random() * 35;
  fireLifetimes[i] = Math.random();
  firePhases[i] = Math.random() * Math.PI * 2;

  const colorChoice = Math.random();
  if (colorChoice < 0.3) {
    fireColors[i * 3] = 1.0; fireColors[i * 3 + 1] = 0.85; fireColors[i * 3 + 2] = 0.2;
  } else if (colorChoice < 0.6) {
    fireColors[i * 3] = 1.0; fireColors[i * 3 + 1] = 0.4; fireColors[i * 3 + 2] = 0.0;
  } else if (colorChoice < 0.85) {
    fireColors[i * 3] = 1.0; fireColors[i * 3 + 1] = 0.15; fireColors[i * 3 + 2] = 0.0;
  } else {
    fireColors[i * 3] = 1.0; fireColors[i * 3 + 1] = 0.95; fireColors[i * 3 + 2] = 0.7;
  }
}

for (let i = 0; i < fireParticleCount; i++) {
  initFireParticle(i);
}

fireGeometry.setAttribute('position', new THREE.BufferAttribute(firePositions, 3));
fireGeometry.setAttribute('size', new THREE.BufferAttribute(fireSizes, 1));
fireGeometry.setAttribute('color', new THREE.BufferAttribute(fireColors, 3));

const fireVertexShader = `
  attribute float size;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = min(size * (300.0 / -mvPosition.z), 64.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fireFragmentShader = `
  varying vec3 vColor;
  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    alpha *= alpha;
    gl_FragColor = vec4(vColor, alpha * 0.7);
  }
`;

const fireMaterial = new THREE.ShaderMaterial({
  vertexShader: fireVertexShader,
  fragmentShader: fireFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  vertexColors: true
});

const fireParticles = new THREE.Points(fireGeometry, fireMaterial);
fireParticles.name = 'fireParticles';
scene.add(fireParticles);

// === EMBER PARTICLES ===
const emberCount = 200;
const emberGeometry = new THREE.BufferGeometry();
const emberPositions = new Float32Array(emberCount * 3);
const emberSizes = new Float32Array(emberCount);
const emberColors = new Float32Array(emberCount * 3);
const emberVelocities = new Float32Array(emberCount * 3);
const emberLifetimes = new Float32Array(emberCount);

function initEmber(i) {
  emberPositions[i * 3] = (Math.random() - 0.5) * 3;
  emberPositions[i * 3 + 1] = Math.random() * 4 - 1;
  emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 2;
  emberVelocities[i * 3] = (Math.random() - 0.5) * 0.5;
  emberVelocities[i * 3 + 1] = 0.5 + Math.random() * 1.5;
  emberVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  emberSizes[i] = 3 + Math.random() * 8;
  emberLifetimes[i] = Math.random();
  const r = 0.8 + Math.random() * 0.2;
  emberColors[i * 3] = r;
  emberColors[i * 3 + 1] = 0.2 + Math.random() * 0.5;
  emberColors[i * 3 + 2] = 0.0;
}

for (let i = 0; i < emberCount; i++) initEmber(i);

emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
emberGeometry.setAttribute('size', new THREE.BufferAttribute(emberSizes, 1));
emberGeometry.setAttribute('color', new THREE.BufferAttribute(emberColors, 3));

const emberParticles = new THREE.Points(emberGeometry, new THREE.ShaderMaterial({
  vertexShader: fireVertexShader,
  fragmentShader: fireFragmentShader,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  vertexColors: true
}));
emberParticles.name = 'emberParticles';
scene.add(emberParticles);

// === 3D TEXT ===
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', function (font) {
  const textGeo = new TextGeometry('I Love You Hairat', {
    font: font,
    size: 0.38,
    depth: 0.15,
    curveSegments: 16,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 8
  });
  textGeo.center();

  const textMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    emissive: 0xff6600,
    emissiveIntensity: 0.6,
    metalness: 0.8,
    roughness: 0.2
  });

  const textMesh = new THREE.Mesh(textGeo, textMaterial);
  textMesh.name = 'loveText';
  textMesh.position.y = -2.8;
  textMesh.position.z = 0.5;
  scene.add(textMesh);

  // Text glow
  const textGlowMat = new THREE.MeshStandardMaterial({
    color: 0xff4400,
    emissive: 0xff4400,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.15
  });
  const textGlow = new THREE.Mesh(textGeo, textGlowMat);
  textGlow.name = 'loveTextGlow';
  textGlow.position.copy(textMesh.position);
  textGlow.scale.set(1.06, 1.06, 1.06);
  scene.add(textGlow);
});

// === ANIMATION ===
const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();
  const delta = clock.getDelta() || 0.016;

  // Pulse heart
  const pulse = 1.0 + Math.sin(elapsed * 3) * 0.06;
  heart.scale.set(0.65 * pulse, 0.65 * pulse, 0.65 * pulse);
  heartGlow.scale.set(0.7 * pulse, 0.7 * pulse, 0.7 * pulse);

  // Heart independent rotation & float
  heart.rotation.y = Math.sin(elapsed * 0.8) * 0.3;
  heart.rotation.z = Math.sin(elapsed * 0.6) * 0.08;
  heart.position.y = 0.5 + Math.sin(elapsed * 1.2) * 0.15;
  heartGlow.rotation.copy(heart.rotation);
  heartGlow.position.y = heart.position.y;

  // Emissive flicker
  const flicker = 0.3 + Math.sin(elapsed * 8) * 0.15 + Math.sin(elapsed * 13) * 0.1;
  heartMaterial.emissiveIntensity = flicker;

  // Animate fire particles
  const posArr = fireGeometry.attributes.position.array;
  const sizeArr = fireGeometry.attributes.size.array;
  const colArr = fireGeometry.attributes.color.array;

  for (let i = 0; i < fireParticleCount; i++) {
    fireLifetimes[i] += 0.008 + Math.random() * 0.005;

    if (fireLifetimes[i] >= 1.0) {
      initFireParticle(i);
      fireLifetimes[i] = 0;
    }

    const life = fireLifetimes[i];
    posArr[i * 3] += fireVelocities[i * 3] * 0.008;
    posArr[i * 3 + 1] += fireVelocities[i * 3 + 1] * 0.012;
    posArr[i * 3 + 2] += fireVelocities[i * 3 + 2] * 0.008;

    // Flicker
    posArr[i * 3] += Math.sin(elapsed * 10 + firePhases[i]) * 0.01;

    // Fade out
    const fadeOut = 1.0 - life;
    sizeArr[i] = (15 + Math.random() * 35) * fadeOut;

    // Color shift to darker as rising
    colArr[i * 3 + 1] *= (0.97 + Math.random() * 0.02);
  }

  fireGeometry.attributes.position.needsUpdate = true;
  fireGeometry.attributes.size.needsUpdate = true;
  fireGeometry.attributes.color.needsUpdate = true;

  // Animate embers
  const ePos = emberGeometry.attributes.position.array;
  for (let i = 0; i < emberCount; i++) {
    emberLifetimes[i] += 0.003 + Math.random() * 0.003;
    if (emberLifetimes[i] >= 1.0) {
      initEmber(i);
      emberLifetimes[i] = 0;
    }
    ePos[i * 3] += emberVelocities[i * 3] * 0.005 + Math.sin(elapsed * 3 + i) * 0.003;
    ePos[i * 3 + 1] += emberVelocities[i * 3 + 1] * 0.008;
    ePos[i * 3 + 2] += emberVelocities[i * 3 + 2] * 0.005;
  }
  emberGeometry.attributes.position.needsUpdate = true;

  // Animate lights
  pointLight1.intensity = 3 + Math.sin(elapsed * 6) * 1.5;
  pointLight2.intensity = 3 + Math.cos(elapsed * 7) * 1.5;
  pointLight3.intensity = 2 + Math.sin(elapsed * 5) * 1.0;

  // Animate text — independent movement from heart
  const textMesh = scene.getObjectByName('loveText');
  if (textMesh) {
    textMesh.position.y = -2.8 + Math.sin(elapsed * 2.0) * 0.2;
    textMesh.position.x = Math.sin(elapsed * 0.7) * 0.3;
    textMesh.rotation.y = Math.sin(elapsed * 1.0) * 0.15;
    textMesh.rotation.x = Math.sin(elapsed * 0.5) * 0.05;
    textMesh.material.emissiveIntensity = 0.4 + Math.sin(elapsed * 4) * 0.3;
  }
  const textGlow = scene.getObjectByName('loveTextGlow');
  if (textGlow) {
    textGlow.position.y = -2.8 + Math.sin(elapsed * 2.0) * 0.2;
    textGlow.position.x = Math.sin(elapsed * 0.7) * 0.3;
    textGlow.rotation.y = Math.sin(elapsed * 1.0) * 0.15;
    textGlow.rotation.x = Math.sin(elapsed * 0.5) * 0.05;
    textGlow.material.opacity = 0.1 + Math.sin(elapsed * 4) * 0.08;
  }

  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});