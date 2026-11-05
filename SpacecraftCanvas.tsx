/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CelestialBody } from '../types';

interface SpacecraftCanvasProps {
  viewMode: 'spacecraft' | 'orbit';
  targetBody: CelestialBody;
  explodedAmount: number; // 0 to 1
  orbitProgress?: number; // 0 to 1
  inEclipse?: boolean;
  selectedComponentHighlight?: string | null;
  onSelectComponent?: (name: string) => void;
  className?: string;
}

export const SpacecraftCanvas: React.FC<SpacecraftCanvasProps> = ({
  viewMode,
  targetBody,
  explodedAmount,
  orbitProgress = 0,
  inEclipse = false,
  selectedComponentHighlight,
  onSelectComponent,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Store mutable state in refs to decouple 60fps render loop from React state
  const propsRef = useRef({
    viewMode,
    targetBody,
    explodedAmount,
    orbitProgress,
    inEclipse,
    selectedComponentHighlight,
    onSelectComponent
  });

  useEffect(() => {
    propsRef.current = {
      viewMode,
      targetBody,
      explodedAmount,
      orbitProgress,
      inEclipse,
      selectedComponentHighlight,
      onSelectComponent
    };
  }, [viewMode, targetBody, explodedAmount, orbitProgress, inEclipse, selectedComponentHighlight, onSelectComponent]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(renderer.domElement);

    // 3. Scene & Camera setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040814, 0.008);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5.5, 3.8, 6.2);

    // Studio Environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig
    const sunLight = new THREE.DirectionalLight(0xfff6e6, 3.2);
    sunLight.position.set(12, 10, 8);
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x090d16, 0.8);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-10, -5, -8);
    scene.add(rimLight);

    // 5. Procedural Materials
    // Procedural Gold Foil (MLI) Texture
    const createMliTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#b47814';
      ctx.fillRect(0, 0, 256, 256);

      // Crumpled foil pattern
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = Math.random() * 25 + 5;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, 'rgba(255, 230, 140, 0.35)');
        grad.addColorStop(1, 'rgba(100, 60, 5, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // Procedural Solar Panel Cells
    const createSolarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#0a1638';
      ctx.fillRect(0, 0, 256, 256);

      // Grid lines
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      for (let x = 0; x <= 256; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
      }
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1;
      for (let y = 0; y <= 256; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const mliTex = createMliTexture();
    const solarTex = createSolarTexture();

    const goldMliMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      map: mliTex,
      roughness: 0.35,
      metalness: 0.85
    });

    const darkAlloyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.7
    });

    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.25,
      metalness: 0.9
    });

    const solarPanelMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: solarTex,
      roughness: 0.2,
      metalness: 0.5
    });

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: isSoftwareGl ? 0 : 0.8,
      roughness: 0.1,
      ior: 1.5,
      transparent: true,
      opacity: 0.85
    });

    // 6. Build Composite 3D Spacecraft Group (10+ parts)
    const spacecraftGroup = new THREE.Group();
    scene.add(spacecraftGroup);

    // Part 1: Central Avionics Bus (Hexagonal Prism)
    const busGeo = new THREE.CylinderGeometry(0.85, 0.95, 1.8, 6);
    const busMesh = new THREE.Mesh(busGeo, goldMliMat);
    busMesh.name = 'Bus Chassis & Avionics';
    spacecraftGroup.add(busMesh);

    // Part 2: Structural Ribs & Trusses
    const trussGeo = new THREE.RingGeometry(0.85, 0.98, 6);
    const trussMesh1 = new THREE.Mesh(trussGeo, darkAlloyMat);
    trussMesh1.rotation.x = Math.PI / 2;
    trussMesh1.position.y = 0.85;
    spacecraftGroup.add(trussMesh1);

    const trussMesh2 = trussMesh1.clone();
    trussMesh2.position.y = -0.85;
    spacecraftGroup.add(trussMesh2);

    // Part 3 & 4: Dual Articulated Solar Panels (Left and Right)
    const solarGroupLeft = new THREE.Group();
    solarGroupLeft.name = 'Port Solar Array';
    const solarGroupRight = new THREE.Group();
    solarGroupRight.name = 'Starboard Solar Array';

    const panelWingGeo = new THREE.BoxGeometry(2.4, 0.04, 0.9);

    const wingMeshL = new THREE.Mesh(panelWingGeo, solarPanelMat);
    wingMeshL.position.x = -1.6;
    solarGroupLeft.add(wingMeshL);

    // Boom arm
    const boomGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8);
    const boomL = new THREE.Mesh(boomGeo, titaniumMat);
    boomL.rotation.z = Math.PI / 2;
    boomL.position.x = -0.4;
    solarGroupLeft.add(boomL);

    const wingMeshR = new THREE.Mesh(panelWingGeo, solarPanelMat);
    wingMeshR.position.x = 1.6;
    solarGroupRight.add(wingMeshR);

    const boomR = boomL.clone();
    boomR.position.x = 0.4;
    solarGroupRight.add(boomR);

    solarGroupLeft.position.set(-0.85, 0.2, 0);
    solarGroupRight.position.set(0.85, 0.2, 0);

    spacecraftGroup.add(solarGroupLeft);
    spacecraftGroup.add(solarGroupRight);

    // Part 5: High-Gain Parabolic Dish Antenna
    const dishGroup = new THREE.Group();
    dishGroup.name = 'High-Gain Dish Antenna';

    const dishPoints: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      const x = u * 0.85;
      const y = Math.pow(u, 2) * 0.35;
      dishPoints.push(new THREE.Vector2(x, y));
    }
    const dishGeo = new THREE.LatheGeometry(dishPoints, 24);
    const dishMesh = new THREE.Mesh(dishGeo, titaniumMat);
    dishMesh.rotation.x = -Math.PI / 2;
    dishGroup.add(dishMesh);

    // Feed horn
    const hornGeo = new THREE.ConeGeometry(0.12, 0.35, 12);
    const hornMesh = new THREE.Mesh(hornGeo, darkAlloyMat);
    hornMesh.position.z = 0.5;
    hornMesh.rotation.x = Math.PI / 2;
    dishGroup.add(hornMesh);

    // Struts to horn
    const strutGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.7);
    const strut1 = new THREE.Mesh(strutGeo, darkAlloyMat);
    strut1.position.set(0.3, 0, 0.25);
    strut1.rotation.y = Math.PI / 4;
    strut1.rotation.x = Math.PI / 6;
    dishGroup.add(strut1);

    dishGroup.position.set(0, 0.3, 1.15);
    dishGroup.rotation.x = 0.3;
    spacecraftGroup.add(dishGroup);

    // Part 6: Primary Optical Science Camera Telescope
    const payloadDeck = new THREE.Group();
    payloadDeck.name = 'Science Instrument Deck';

    const telescopeBaffle = new THREE.CylinderGeometry(0.28, 0.32, 0.9, 16);
    const teleMesh = new THREE.Mesh(telescopeBaffle, darkAlloyMat);
    teleMesh.position.set(0.25, 1.25, 0.1);
    payloadDeck.add(teleMesh);

    const lensGeo = new THREE.CircleGeometry(0.26, 16);
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.rotation.x = -Math.PI / 2;
    lensMesh.position.set(0.25, 1.71, 0.1);
    payloadDeck.add(lensMesh);

    // Spectrometer box
    const specBox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), titaniumMat);
    specBox.position.set(-0.35, 1.05, 0.2);
    payloadDeck.add(specBox);

    spacecraftGroup.add(payloadDeck);

    // Part 7: Magnetometer Deployable Boom
    const magBoomGroup = new THREE.Group();
    magBoomGroup.name = 'Magnetometer Boom';
    const magRod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.2), titaniumMat);
    magRod.position.set(0, -0.2, -1.3);
    magRod.rotation.x = -Math.PI / 3;
    magBoomGroup.add(magRod);

    const magSensor = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), darkAlloyMat);
    magSensor.position.set(0, 0.75, -2.25);
    magBoomGroup.add(magSensor);
    spacecraftGroup.add(magBoomGroup);

    // Part 8: Propulsion Apogee Engine Nozzle
    const engineGroup = new THREE.Group();
    engineGroup.name = 'Apogee Propulsion Engine';

    const nozzlePoints: THREE.Vector2[] = [
      new THREE.Vector2(0.12, 0),
      new THREE.Vector2(0.18, -0.15),
      new THREE.Vector2(0.38, -0.65)
    ];
    const nozzleGeo = new THREE.LatheGeometry(nozzlePoints, 20);
    const nozzleMesh = new THREE.Mesh(nozzleGeo, darkAlloyMat);
    nozzleMesh.position.y = -0.95;
    engineGroup.add(nozzleMesh);

    // 4 Corner RCS Thruster pods
    const rcsPodGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const rcsPositions = [
      [-0.75, -0.7, 0.75],
      [0.75, -0.7, 0.75],
      [-0.75, -0.7, -0.75],
      [0.75, -0.7, -0.75]
    ];
    rcsPositions.forEach(([x, y, z]) => {
      const pod = new THREE.Mesh(rcsPodGeo, titaniumMat);
      pod.position.set(x, y, z);
      engineGroup.add(pod);
    });

    spacecraftGroup.add(engineGroup);

    // 7. Planet & Celestial Orbit Visualization Group
    const orbitWorldGroup = new THREE.Group();
    scene.add(orbitWorldGroup);

    // Procedural Planet
    const planetRadius = 4.2;
    const planetGeo = new THREE.SphereGeometry(planetRadius, 48, 48);

    // Planet texture generator based on target body
    const createPlanetTexture = (body: CelestialBody) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      if (body === 'Earth') {
        // Deep blue oceans with continents and cloud wisps
        ctx.fillStyle = '#0f2952';
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = '#15803d'; // green lands
        for (let i = 0; i < 24; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 512, 50 + Math.random() * 156, 35 + Math.random() * 45, 0, Math.PI * 2);
          ctx.fill();
        }
        // White cloud bands
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 15; i++) {
          ctx.fillRect(0, Math.random() * 256, 512, 12 + Math.random() * 18);
        }
      } else if (body === 'Moon') {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = '#334155';
        for (let i = 0; i < 60; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 256, 10 + Math.random() * 30, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (body === 'Mars') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 0, 512, 256);
        ctx.fillStyle = '#78350f';
        for (let i = 0; i < 30; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 256, 25 + Math.random() * 50, 0, Math.PI * 2);
          ctx.fill();
        }
        // Polar ice caps
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 512, 25);
        ctx.fillRect(0, 230, 512, 26);
      } else if (body === 'Europa') {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = '#991b1b'; // Reddish-brown fracture lines
        ctx.lineWidth = 3;
        for (let i = 0; i < 25; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * 512, Math.random() * 256);
          ctx.bezierCurveTo(
            Math.random() * 512, Math.random() * 256,
            Math.random() * 512, Math.random() * 256,
            Math.random() * 512, Math.random() * 256
          );
          ctx.stroke();
        }
      } else {
        // Deep space starfield
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, 512, 256);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    let currentPlanetTex = createPlanetTexture(targetBody);
    const planetMat = new THREE.MeshStandardMaterial({
      map: currentPlanetTex,
      roughness: 0.8,
      metalness: 0.1
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetMesh.position.set(0, 0, -8);
    orbitWorldGroup.add(planetMesh);

    // Atmosphere Glow Rim
    const atmosGeo = new THREE.SphereGeometry(planetRadius * 1.035, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: targetBody === 'Mars' ? 0xf97316 : 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    atmosMesh.position.copy(planetMesh.position);
    orbitWorldGroup.add(atmosMesh);

    // Orbit Path Spline Ring
    const orbitRingPoints: THREE.Vector3[] = [];
    const orbitRadiusA = 7.5;
    const orbitRadiusB = 6.2;
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      orbitRingPoints.push(new THREE.Vector3(
        Math.cos(theta) * orbitRadiusA,
        Math.sin(theta) * 1.2,
        Math.sin(theta) * orbitRadiusB - 8
      ));
    }
    const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(orbitRingPoints);
    const orbitLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65
    });
    const orbitLine = new THREE.Line(orbitLineGeo, orbitLineMat);
    orbitWorldGroup.add(orbitLine);

    // Deep Space Starfield Dust Particles
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 120;
      starPositions[i + 1] = (Math.random() - 0.5) * 120;
      starPositions[i + 2] = (Math.random() - 0.5) * 120;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.45,
      transparent: true,
      opacity: 0.7
    });
    const starParticles = new THREE.Points(starGeo, starMat);
    scene.add(starParticles);

    // 8. User Interaction (OrbitControls-like drag rotation)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0.25;
    let targetRotationY = -0.55;
    let currentRotationX = targetRotationX;
    let currentRotationY = targetRotationY;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotationY += dx * 0.008;
      targetRotationX += dy * 0.008;
      targetRotationX = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, targetRotationX));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 9. Animation & Render Loop
    let frameId = 0;
    let lastTime = performance.now();
    let currentExplode = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 60);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const props = propsRef.current;

      // Update Planet Texture if target body changed
      if (props.targetBody !== targetBody) {
        currentPlanetTex.dispose();
        currentPlanetTex = createPlanetTexture(props.targetBody);
        planetMat.map = currentPlanetTex;
        planetMat.needsUpdate = true;
      }

      // Smooth camera damping for manual rotation
      const dampK = 8.0;
      currentRotationX += (targetRotationX - currentRotationX) * (1 - Math.exp(-dampK * dt));
      currentRotationY += (targetRotationY - currentRotationY) * (1 - Math.exp(-dampK * dt));

      // Exploded View smoothing
      const targetExplode = props.explodedAmount;
      currentExplode += (targetExplode - currentExplode) * (1 - Math.exp(-6.0 * dt));

      // Apply Exploded separations to spacecraft parts
      solarGroupLeft.position.x = -0.85 - (currentExplode * 1.6);
      solarGroupRight.position.x = 0.85 + (currentExplode * 1.6);
      dishGroup.position.z = 1.15 + (currentExplode * 1.3);
      payloadDeck.position.y = (currentExplode * 1.1);
      engineGroup.position.y = -(currentExplode * 1.2);
      magBoomGroup.position.z = -(currentExplode * 1.4);

      // Handle View Modes
      if (props.viewMode === 'spacecraft') {
        orbitWorldGroup.visible = false;
        spacecraftGroup.visible = true;

        // Auto slow turntable spin if not dragging
        if (!isDragging) {
          targetRotationY += 0.15 * dt;
        }

        // Camera positioning for spacecraft inspection
        const radius = 5.8;
        camera.position.x = Math.sin(currentRotationY) * Math.cos(currentRotationX) * radius;
        camera.position.y = Math.sin(currentRotationX) * radius;
        camera.position.z = Math.cos(currentRotationY) * Math.cos(currentRotationX) * radius;
        camera.lookAt(0, 0, 0);

      } else {
        // Orbit View
        orbitWorldGroup.visible = true;
        spacecraftGroup.visible = true;

        // Rotate planet slowly
        planetMesh.rotation.y += 0.05 * dt;

        // Position spacecraft on orbit path
        const theta = props.orbitProgress * Math.PI * 2;
        const scX = Math.cos(theta) * orbitRadiusA;
        const scY = Math.sin(theta) * 1.2;
        const scZ = Math.sin(theta) * orbitRadiusB - 8;

        spacecraftGroup.position.set(scX, scY, scZ);
        spacecraftGroup.scale.set(0.45, 0.45, 0.45);
        spacecraftGroup.rotation.y = theta + Math.PI / 2;

        // Eclipse lighting dimming
        if (props.inEclipse) {
          sunLight.intensity = THREE.MathUtils.damp(sunLight.intensity, 0.2, 5, dt);
        } else {
          sunLight.intensity = THREE.MathUtils.damp(sunLight.intensity, 3.2, 5, dt);
        }

        // Camera tracks the spacecraft from orbital perspective
        camera.position.set(scX + 4.5, scY + 3.2, scZ + 5.5);
        camera.lookAt(scX, scY, scZ);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      renderer.dispose();
      mliTex.dispose();
      solarTex.dispose();
      currentPlanetTex.dispose();
      if (dom.parentElement) {
        dom.parentElement.removeChild(dom);
      }
    };
  }, [targetBody]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      data-testid="spacecraft-canvas"
    />
  );
};
