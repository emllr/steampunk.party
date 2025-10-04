"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * Orrery Constructor
 * - Build and animate planetary gear systems
 * - Accurate gear ratios for real solar system
 * - Drag-and-drop assembly with brass/copper materials
 * - Time control and astronomical calculations
 */

// Planetary data with orbital periods in Earth days
const PLANETS = {
  mercury: { name: "Mercury", period: 87.97, radius: 0.4, color: "#8B7355", teeth: 88 },
  venus: { name: "Venus", period: 224.70, radius: 0.7, color: "#FFA500", teeth: 225 },
  earth: { name: "Earth", period: 365.26, radius: 0.8, color: "#4169E1", teeth: 365 },
  mars: { name: "Mars", period: 686.98, radius: 0.6, color: "#CD5C5C", teeth: 687 },
  jupiter: { name: "Jupiter", period: 4332.59, radius: 1.4, color: "#DAA520", teeth: 217 }, // Reduced by factor of 20
  saturn: { name: "Saturn", period: 10759.22, radius: 1.2, color: "#F4A460", teeth: 269 }, // Reduced by factor of 40
} as const;

type PlanetKey = keyof typeof PLANETS;

interface GearSystem {
  planet: PlanetKey;
  x: number;
  y: number;
  rotation: number;
  connected: PlanetKey[];
  isDriver?: boolean;
}

export function OrreryConstructorPanel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const gearsRef = useRef<Map<PlanetKey, THREE.Group>>(new Map());
  const frameRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetKey | null>(null);
  const [systems, setSystems] = useState<GearSystem[]>([
    { planet: "earth", x: 0, y: 0, rotation: 0, connected: ["venus"], isDriver: true },
    { planet: "venus", x: -2.5, y: 0, rotation: 0, connected: ["earth", "mercury"] },
    { planet: "mercury", x: -4.5, y: 0, rotation: 0, connected: ["venus"] },
  ]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814); // Deep space blue-black
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2.1;
    controlsRef.current = controls;

    // Create starfield
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      // Random position in sphere
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() - 0.5) * 2);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Star colors - mostly white with some blue/yellow tints
      const colorType = Math.random();
      if (colorType < 0.7) {
        // White star
        colors[i3] = colors[i3 + 1] = colors[i3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (colorType < 0.85) {
        // Blue star
        colors[i3] = 0.7;
        colors[i3 + 1] = 0.8;
        colors[i3 + 2] = 1.0;
      } else {
        // Yellow star
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.9;
        colors[i3 + 2] = 0.7;
      }
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Lighting adjusted for space scene
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Dimmer ambient
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // Brighter direct light (sun)
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    // Add a subtle rim light
    const rimLight = new THREE.DirectionalLight(0x4444ff, 0.3);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    // Base platform - darker with brass accents
    const platformGeometry = new THREE.CylinderGeometry(12, 12, 0.5, 64);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.3,
      envMapIntensity: 0.5,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -0.25;
    platform.receiveShadow = true;
    scene.add(platform);

    // Decorative brass rim
    const rimGeometry = new THREE.TorusGeometry(12, 0.3, 8, 64);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xb8860b,
      emissiveIntensity: 0.1,
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0;
    scene.add(rim);
    
    // Add some decorative details to the platform
    const detailCount = 12;
    for (let i = 0; i < detailCount; i++) {
      const angle = (i / detailCount) * Math.PI * 2;
      const studGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const studMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8860b,
        metalness: 0.95,
        roughness: 0.05,
        emissive: 0xb8860b,
        emissiveIntensity: 0.05,
      });
      const stud = new THREE.Mesh(studGeometry, studMaterial);
      stud.position.set(
        Math.cos(angle) * 11.5,
        0,
        Math.sin(angle) * 11.5
      );
      scene.add(stud);
    }

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Create gear mesh
  const createGear = useCallback((planet: PlanetKey) => {
    const data = PLANETS[planet];
    const group = new THREE.Group();

    // Gear geometry
    const teeth = data.teeth;
    const module = 0.02;
    const pitchRadius = (teeth * module) / 2;
    const outerRadius = pitchRadius + module;
    const innerRadius = pitchRadius - module;

    const shape = new THREE.Shape();
    const toothAngle = (Math.PI * 2) / teeth;

    for (let i = 0; i < teeth; i++) {
      const angle = i * toothAngle;

      // Tooth profile (simplified involute)
      const x1 = Math.cos(angle - toothAngle * 0.25) * innerRadius;
      const y1 = Math.sin(angle - toothAngle * 0.25) * innerRadius;
      const x2 = Math.cos(angle - toothAngle * 0.1) * outerRadius;
      const y2 = Math.sin(angle - toothAngle * 0.1) * outerRadius;
      const x3 = Math.cos(angle + toothAngle * 0.1) * outerRadius;
      const y3 = Math.sin(angle + toothAngle * 0.1) * outerRadius;
      const x4 = Math.cos(angle + toothAngle * 0.25) * innerRadius;
      const y4 = Math.sin(angle + toothAngle * 0.25) * innerRadius;

      if (i === 0) {
        shape.moveTo(x1, y1);
      } else {
        shape.lineTo(x1, y1);
      }
      shape.lineTo(x2, y2);
      shape.lineTo(x3, y3);
      shape.lineTo(x4, y4);
    }
    shape.closePath();

    // Extrude settings - reduced depth for flatter gear
    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    // CRITICAL: Rotate geometry to lay flat
    geometry.rotateX(Math.PI / 2);

    // Brass material with subtle glow
    const material = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      metalness: 0.85,
      roughness: 0.25,
      envMapIntensity: 0.5,
      emissive: 0xb8860b,
      emissiveIntensity: 0.05,
    });

    const gear = new THREE.Mesh(geometry, material);
    gear.castShadow = true;
    gear.receiveShadow = true;
    gear.position.y = 0.5; // Lift gear above platform
    group.add(gear);

    // Support post (axle)
    const postHeight = 0.8;
    const postGeometry = new THREE.CylinderGeometry(innerRadius * 0.15, innerRadius * 0.15, postHeight, 16);
    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = postHeight / 2;
    post.castShadow = true;
    group.add(post);

    // Center hub on top of gear
    const hubGeometry = new THREE.CylinderGeometry(innerRadius * 0.25, innerRadius * 0.3, 0.15, 32);
    const hubMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a5a5a,
      metalness: 0.9,
      roughness: 0.1,
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.position.y = 0.6;
    group.add(hub);

    // Orbital arm container (rotates with gear)
    const armContainer = new THREE.Group();
    armContainer.position.y = 0.7; // Above the gear

    // Arm connecting planet to gear
    const armLength = pitchRadius * 1.2;
    const armGeometry = new THREE.BoxGeometry(armLength, 0.05, 0.1);
    const armMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b6914,
      metalness: 0.7,
      roughness: 0.3,
    });
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.position.x = armLength / 2;
    armContainer.add(arm);

    // Planet holder at end of arm
    const holderGeometry = new THREE.CylinderGeometry(data.radius * 0.3, data.radius * 0.4, 0.2, 16);
    const holderMaterial = new THREE.MeshStandardMaterial({
      color: 0x6a6a6a,
      metalness: 0.8,
      roughness: 0.2,
    });
    const holder = new THREE.Mesh(holderGeometry, holderMaterial);
    holder.position.set(armLength, 0, 0);
    armContainer.add(holder);

    // Planet sphere on vertical rod
    const rodGeometry = new THREE.CylinderGeometry(0.02, 0.02, data.radius * 2, 8);
    const rodMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const rod = new THREE.Mesh(rodGeometry, rodMaterial);
    rod.position.set(armLength, data.radius, 0);
    armContainer.add(rod);

    const planetGeometry = new THREE.SphereGeometry(data.radius * 0.4, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(data.color),
      metalness: 0.3,
      roughness: 0.7,
      emissive: new THREE.Color(data.color),
      emissiveIntensity: 0.1,
    });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.position.set(armLength, data.radius * 2, 0);
    planetMesh.castShadow = true;
    
    // Store reference for orbit updates
    planetMesh.userData = { armLength, planetData: data };
    armContainer.add(planetMesh);
    
    // Name the arm container for easy access
    armContainer.name = 'armContainer';
    group.add(armContainer);

    // Orbital ring (optional visual guide)
    if (showOrbits) {
      const orbitGeometry = new THREE.RingGeometry(armLength - 0.05, armLength + 0.05, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: data.color,
        opacity: 0.3,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbitRing.rotation.x = -Math.PI / 2;
      orbitRing.position.y = 0.71;
      orbitRing.name = 'orbitRing';
      group.add(orbitRing);
    }
    
    // Label (optional)
    if (showLabels) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 64;
      
      context.fillStyle = 'rgba(20, 20, 30, 0.8)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.strokeStyle = '#b8860b';
      context.lineWidth = 2;
      context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
      
      context.font = 'bold 32px serif';
      context.fillStyle = '#f0d090';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(data.name, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const labelMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
      });
      const label = new THREE.Sprite(labelMaterial);
      label.scale.set(2, 0.5, 1);
      label.position.y = 2.5;
      label.name = 'label';
      group.add(label);
    }

    return group;
  }, [showOrbits, showLabels]);

  // Update gear positions and create meshes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing gears and connections
    gearsRef.current.forEach(gear => {
      sceneRef.current!.remove(gear);
    });
    gearsRef.current.clear();
    
    // Remove old connection lines
    const oldConnections = sceneRef.current.children.filter(child => child.name === 'connection');
    oldConnections.forEach(conn => sceneRef.current!.remove(conn));

    // Create new gears
    systems.forEach(system => {
      const gear = createGear(system.planet);
      gear.position.set(system.x, 0, system.y);
      gear.rotation.y = system.rotation;
      
      // Add selection highlight if selected
      if (selectedPlanet === system.planet) {
        const highlightGeometry = new THREE.RingGeometry(
          PLANETS[system.planet].teeth * 0.02, 
          PLANETS[system.planet].teeth * 0.022, 
          64
        );
        const highlightMaterial = new THREE.MeshBasicMaterial({
          color: 0xffd700,
          opacity: 0.6,
          transparent: true,
          side: THREE.DoubleSide,
        });
        const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlight.rotation.x = -Math.PI / 2;
        highlight.position.y = 0.51;
        gear.add(highlight);
      }
      
      sceneRef.current!.add(gear);
      gearsRef.current.set(system.planet, gear);
    });

    // Add subtle connection lines between meshing gears
    systems.forEach(system => {
      system.connected.forEach(connectedPlanet => {
        const connectedSystem = systems.find(s => s.planet === connectedPlanet);
        if (!connectedSystem) return;
        
        // Only draw once (from alphabetically first planet)
        if (system.planet < connectedPlanet) {
          // Connection line
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(system.x, 0.55, system.y),
            new THREE.Vector3(connectedSystem.x, 0.55, connectedSystem.y),
          ]);
          const material = new THREE.LineBasicMaterial({ 
            color: 0xb8860b, 
            linewidth: 1,
            opacity: 0.4,
            transparent: true
          });
          const line = new THREE.Line(geometry, material);
          line.name = 'connection';
          sceneRef.current!.add(line);
        }
      });
    });
  }, [systems, createGear, selectedPlanet]);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    let animationId: number;
    let lastTime = Date.now();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Update controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Rotate gears based on planetary periods
      if (isPlaying) {
        systems.forEach(system => {
          const gear = gearsRef.current.get(system.planet);
          if (!gear) return;

          const planetData = PLANETS[system.planet];
          const rotationSpeed = (2 * Math.PI) / planetData.period * speed * delta * 10;

          if (system.isDriver) {
            // Driver gear rotates forward
            gear.rotation.y += rotationSpeed;
            system.rotation = gear.rotation.y;
          }

          // Rotate the arm container with the gear
          const armContainer = gear.getObjectByName('armContainer');
          if (armContainer) {
            armContainer.rotation.y = gear.rotation.y;
          }

          // Update orbital ring visibility
          const orbitRing = gear.getObjectByName('orbitRing');
          if (orbitRing) {
            orbitRing.visible = showOrbits;
          }
          
          // Update label visibility
          const label = gear.getObjectByName('label');
          if (label) {
            label.visible = showLabels;
          }
        });

        // Propagate rotation through connected gears
        const rotated = new Set<PlanetKey>();
        const toProcess: PlanetKey[] = [];
        
        // Start with driver gears
        systems.forEach(s => {
          if (s.isDriver) {
            rotated.add(s.planet);
            toProcess.push(s.planet);
          }
        });
        
        // Process connected gears
        while (toProcess.length > 0) {
          const current = toProcess.shift()!;
          const currentSystem = systems.find(s => s.planet === current)!;
          const currentGear = gearsRef.current.get(current)!;
          const currentData = PLANETS[current];
          
          currentSystem.connected.forEach(connectedPlanet => {
            if (!rotated.has(connectedPlanet)) {
              const connectedSystem = systems.find(s => s.planet === connectedPlanet);
              const connectedGear = gearsRef.current.get(connectedPlanet);
              
              if (connectedSystem && connectedGear) {
                const connectedData = PLANETS[connectedPlanet];
                const ratio = currentData.teeth / connectedData.teeth;
                
                // Connected gears rotate in opposite direction
                connectedGear.rotation.y = -currentGear.rotation.y * ratio;
                connectedSystem.rotation = connectedGear.rotation.y;
                
                // Update arm rotation
                const armContainer = connectedGear.getObjectByName('armContainer');
                if (armContainer) {
                  armContainer.rotation.y = connectedGear.rotation.y;
                }
                
                rotated.add(connectedPlanet);
                toProcess.push(connectedPlanet);
              }
            }
          });
        }

        // Update date based on Earth's rotation
        const earthSystem = systems.find(s => s.planet === "earth");
        if (earthSystem) {
          const daysPassed = (earthSystem.rotation / (2 * Math.PI)) * PLANETS.earth.period;
          const newDate = new Date(Date.now() + daysPassed * 24 * 60 * 60 * 1000);
          setCurrentDate(newDate);
        }
      }

      // Render
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, speed, systems]);

  // Add new planet to system
  const addPlanet = (planet: PlanetKey) => {
    // Find a good position that doesn't overlap
    let x = 0;
    let y = 0;
    let found = false;
    
    // Try to position next to an existing gear if possible
    if (systems.length > 0) {
      const lastSystem = systems[systems.length - 1];
      const lastRadius = (PLANETS[lastSystem.planet].teeth * 0.02) / 2;
      const newRadius = (PLANETS[planet].teeth * 0.02) / 2;
      const distance = lastRadius + newRadius + 0.1; // Small gap between gears
      
      // Try different angles to find an empty spot
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        x = lastSystem.x + Math.cos(angle) * distance;
        y = lastSystem.y + Math.sin(angle) * distance;
        
        // Check if this position overlaps with any existing gear
        const overlaps = systems.some(s => {
          const dx = s.x - x;
          const dy = s.y - y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const r1 = (PLANETS[s.planet].teeth * 0.02) / 2;
          const r2 = newRadius;
          return d < (r1 + r2 + 0.05);
        });
        
        if (!overlaps) {
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      // Fallback to random position
      x = Math.random() * 6 - 3;
      y = Math.random() * 6 - 3;
    }
    
    const newSystem: GearSystem = {
      planet,
      x,
      y,
      rotation: 0,
      connected: [],
    };
    setSystems([...systems, newSystem]);
    setSelectedPlanet(planet);
  };

  // Remove planet from system
  const removePlanet = (planet: PlanetKey) => {
    setSystems(systems.filter(s => s.planet !== planet));
    // Remove connections
    setSystems(prev => prev.map(s => ({
      ...s,
      connected: s.connected.filter(c => c !== planet)
    })));
    if (selectedPlanet === planet) {
      setSelectedPlanet(null);
    }
  };

  // Toggle connection between planets
  const toggleConnection = (planet1: PlanetKey, planet2: PlanetKey) => {
    setSystems(prev => {
      const system1 = prev.find(s => s.planet === planet1);
      const system2 = prev.find(s => s.planet === planet2);
      if (!system1 || !system2) return prev;
      
      const isConnected = system1.connected.includes(planet2);
      
      if (!isConnected) {
        // When connecting, check if we need to reposition for proper meshing
        const r1 = (PLANETS[planet1].teeth * 0.02) / 2;
        const r2 = (PLANETS[planet2].teeth * 0.02) / 2;
        const requiredDistance = r1 + r2;
        
        const dx = system2.x - system1.x;
        const dy = system2.y - system1.y;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        
        // If gears are too far apart or too close, offer to reposition
        if (Math.abs(currentDistance - requiredDistance) > 0.1) {
          const angle = Math.atan2(dy, dx);
          const newX = system1.x + Math.cos(angle) * requiredDistance;
          const newY = system1.y + Math.sin(angle) * requiredDistance;
          
          // Check if new position would overlap with other gears
          const wouldOverlap = prev.some(s => {
            if (s.planet === planet1 || s.planet === planet2) return false;
            const dist = Math.sqrt((s.x - newX) ** 2 + (s.y - newY) ** 2);
            const radius = (PLANETS[s.planet].teeth * 0.02) / 2;
            return dist < (radius + r2 + 0.1);
          });
          
          if (!wouldOverlap) {
            // Auto-reposition the second gear for proper meshing
            return prev.map(s => {
              if (s.planet === planet1) {
                return { ...s, connected: [...s.connected, planet2] };
              }
              if (s.planet === planet2) {
                return { ...s, x: newX, y: newY, connected: [...s.connected, planet1] };
              }
              return s;
            });
          }
        }
      }
      
      // Default connection toggle
      return prev.map(s => {
        if (s.planet === planet1) {
          const connected = isConnected
            ? s.connected.filter(c => c !== planet2)
            : [...s.connected, planet2];
          return { ...s, connected };
        }
        if (s.planet === planet2) {
          const connected = isConnected
            ? s.connected.filter(c => c !== planet1)
            : [...s.connected, planet1];
          return { ...s, connected };
        }
        return s;
      });
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="mt-2 text-sm text-bronze-800/90">
        Build planetary gear systems with accurate ratios. Drag to connect gears and watch the celestial mechanics in action.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-4">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Time Controls */}
          <div className="rounded-xl border border-bronze-700/30 bg-gradient-to-br from-bronze-50/80 to-bronze-100/60 p-4 shadow-[inset_0_0_12px_rgba(0,0,0,0.08)]">
            <h3 className="text-sm font-medium text-bronze-800 mb-3">Time Control</h3>
            <div className="space-y-3">
              <button
                className={`w-full btn ${isPlaying ? 'bg-bronze-600/20' : ''}`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <div>
                <label className="block text-xs font-medium text-bronze-700">Speed</label>
                <input
                  type="range"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="mt-1 w-full accent-bronze-600"
                />
                <div className="mt-1 text-xs text-bronze-600">{speed.toFixed(1)}× speed</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-bronze-700">Current Date</div>
                <div className="text-sm font-medium text-bronze-900">{formatDate(currentDate)}</div>
              </div>
            </div>
          </div>

          {/* Planet Library */}
          <div className="rounded-xl border border-bronze-700/30 bg-gradient-to-br from-bronze-50/80 to-bronze-100/60 p-4 shadow-[inset_0_0_12px_rgba(0,0,0,0.08)]">
            <h3 className="text-sm font-medium text-bronze-800 mb-3">Planets</h3>
            <div className="space-y-2">
              {Object.entries(PLANETS).map(([key, data]) => {
                const isInSystem = systems.some(s => s.planet === key);
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 rounded-lg border border-bronze-700/20 bg-bronze-50/50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="text-xs font-medium text-bronze-800">{data.name}</span>
                    </div>
                    <button
                      className="btn text-xs px-2 py-1"
                      onClick={() => isInSystem ? removePlanet(key as PlanetKey) : addPlanet(key as PlanetKey)}
                    >
                      {isInSystem ? 'Remove' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* View Options */}
          <div className="rounded-xl border border-bronze-700/30 bg-gradient-to-br from-bronze-50/80 to-bronze-100/60 p-4 shadow-[inset_0_0_12px_rgba(0,0,0,0.08)]">
            <h3 className="text-sm font-medium text-bronze-800 mb-3">View Options</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-bronze-700">
                <input
                  type="checkbox"
                  checked={showOrbits}
                  onChange={(e) => setShowOrbits(e.target.checked)}
                  className="accent-bronze-600"
                />
                Show Orbital Paths
              </label>
              <label className="flex items-center gap-2 text-xs text-bronze-700">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="accent-bronze-600"
                />
                Show Labels
              </label>
            </div>
          </div>
        </div>

        {/* 3D View */}
        <div className="lg:col-span-3">
          <div
            ref={mountRef}
            className="w-full h-[500px] rounded-xl border border-bronze-700/30 bg-gradient-to-br from-amber-50/20 to-amber-100/10"
            style={{ touchAction: 'none' }}
          />

          {/* Connection Controls */}
          {selectedPlanet && (
            <div className="mt-4 p-4 rounded-xl border border-bronze-700/30 bg-gradient-to-br from-bronze-50/80 to-bronze-100/60">
              <h4 className="text-sm font-medium text-bronze-800 mb-2">
                Connect {PLANETS[selectedPlanet].name} to:
              </h4>
              <div className="flex flex-wrap gap-2">
                {systems
                  .filter(s => s.planet !== selectedPlanet)
                  .map(system => {
                    const isConnected = systems
                      .find(s => s.planet === selectedPlanet)
                      ?.connected.includes(system.planet);
                    return (
                      <button
                        key={system.planet}
                        className={`btn text-xs px-3 py-1 ${isConnected ? 'bg-bronze-600/20' : ''}`}
                        onClick={() => toggleConnection(selectedPlanet, system.planet)}
                      >
                        {PLANETS[system.planet].name}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Gear Ratios Info */}
          <div className="mt-4 p-4 rounded-xl border border-bronze-700/30 bg-gradient-to-br from-bronze-50/80 to-bronze-100/60">
            <h4 className="text-sm font-medium text-bronze-800 mb-2">Gear Ratios</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {systems.map(system => (
                <div key={system.planet} className="space-y-1">
                  <div className="font-medium text-bronze-900">{PLANETS[system.planet].name}</div>
                  <div className="text-bronze-700">Teeth: {PLANETS[system.planet].teeth}</div>
                  <div className="text-bronze-700">Period: {PLANETS[system.planet].period.toFixed(2)} days</div>
                  {system.connected.length > 0 && (
                    <div className="text-bronze-600">
                      Connected: {system.connected.map(p => PLANETS[p].name).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrreryConstructorPanel;
