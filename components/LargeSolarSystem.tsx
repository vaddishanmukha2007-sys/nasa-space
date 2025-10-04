import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const LargeSolarSystem: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const mount = mountRef.current;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 2000);
        camera.position.z = 10;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mount.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);
        
        const sunLight = new THREE.PointLight(0xffddaa, 2, 50);
        scene.add(sunLight);

        // Stars
        const starVertices = [];
        for (let i = 0; i < 20000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({ 
            color: 0xffffff, 
            size: 0.8,
            transparent: true,
            opacity: 0.8 
        });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
        
        // Sun
        const sunGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sun);
        
        // Sun Glow
        const textureLoader = new THREE.TextureLoader();
        const glowTexture = textureLoader.load('data:image/png;base64,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');
        const spriteMaterial = new THREE.SpriteMaterial({
            map: glowTexture,
            color: 0xffe066,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const sunGlow = new THREE.Sprite(spriteMaterial);
        sunGlow.scale.set(3, 3, 1);
        sun.add(sunGlow);

        // Planets
        const planets: { group: THREE.Object3D; speed: number }[] = [];
        const planetData = [
            { radius: 0.1, color: 0xaaaaaa, orbitRadius: 2.5, speed: 0.008 },
            { radius: 0.2, color: 0xaa8866, orbitRadius: 4.0, speed: 0.004 },
            { radius: 0.25, color: 0x6688aa, orbitRadius: 6.0, speed: 0.0025 },
            { radius: 0.15, color: 0xaa6666, orbitRadius: 7.5, speed: 0.0015 },
        ];

        planetData.forEach(data => {
            const planetGroup = new THREE.Object3D(); // Orbit pivot
            scene.add(planetGroup);
            
            planetGroup.rotation.x = (Math.random() - 0.5) * 0.2;
            planetGroup.rotation.z = (Math.random() - 0.5) * 0.2;

            const planetGeometry = new THREE.SphereGeometry(data.radius, 16, 16);
            const planetMaterial = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.9 });
            const planet = new THREE.Mesh(planetGeometry, planetMaterial);
            
            planet.position.x = data.orbitRadius;
            planetGroup.add(planet);
            
            planets.push({ group: planetGroup, speed: data.speed });
        });
        
        // Mouse listener for camera movement
        const mouse = new THREE.Vector2();
        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            stars.rotation.x += 0.0001;
            stars.rotation.y += 0.0002;

            // Animate planets
            planets.forEach(p => {
                p.group.rotation.y += p.speed;
            });
            
            // Camera parallax effect
            camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
            camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
            camera.lookAt(scene.position);
            
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            if (!mountRef.current) return;
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement);
            }
            scene.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        (object.material as THREE.Material).dispose();
                    }
                }
            });
            starGeometry.dispose();
            starMaterial.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 z-0 overflow-hidden bg-black" />;
};

export default LargeSolarSystem;