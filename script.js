document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D Glass Tilt Effect for cards
    VanillaTilt.init(document.querySelectorAll(".glass-card, .stat-box"), {
        max: 20,          // Increased tilt angle
        speed: 300,       // Faster tilt response
        glare: true,
        "max-glare": 0.5, // Brighter glare
        scale: 1.05       // Pop out more
    });

    // Interactive Liquid Background Orb
    const interactiveOrb = document.querySelector('.interactive-orb');
    if (interactiveOrb) {
        window.addEventListener('mousemove', (e) => {
            // Use requestAnimationFrame for smooth 60fps rendering
            requestAnimationFrame(() => {
                interactiveOrb.style.top = `${e.clientY}px`;
                interactiveOrb.style.left = `${e.clientX}px`;
            });
        });
    }

    // Typing Effect for subtitle
    const typingText = document.querySelector('.typing-text');
    const roles = ["Management Student", "Ketua Umum KSPM", "Funded Trader", "AI Enthusiast"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentRole = roles[roleIndex];

        let textToShow = '';
        if (isDeleting) {
            textToShow = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textToShow = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        typingText.innerHTML = `${textToShow} & <span class="highlight-blue">Si Paling Gemini</span><span class="cursor">|</span>`;

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500; // Pause before new word
        }

        setTimeout(typeEffect, typeSpeed);
    }

    // Start typing effect after a short delay
    setTimeout(typeEffect, 1000);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Staggered Scroll Reveal ---
    // Group cards by their parent container so they cascade left-to-right
    const revealContainers = document.querySelectorAll('.traits-grid, .ideas-grid, .vision-points');
    const standaloneReveals = document.querySelectorAll('.section-header, .about-profile, .main-vision, .subtitle');

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    };

    // Observer for individual items (cards inside containers)
    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    // Observer for containers: when container enters view, stagger-reveal all children
    const containerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const children = entry.target.querySelectorAll('.glass-card');
            children.forEach((child, index) => {
                // Stagger each card by 150ms
                setTimeout(() => {
                    child.classList.add('revealed');
                }, index * 150);
            });
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    // Set up cards inside grid containers for staggered reveal
    revealContainers.forEach(container => {
        const cards = container.querySelectorAll('.glass-card');
        cards.forEach(card => {
            card.classList.add('reveal-item');
        });
        containerObserver.observe(container);
    });

    // Set up standalone elements for simple reveal
    standaloneReveals.forEach(el => {
        el.classList.add('reveal-item');
        cardObserver.observe(el);
    });

    // Inject reveal CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .reveal-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .reveal-item.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        .cursor {
            animation: blink 1s infinite;
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // --- Navbar Transparency Transition on Scroll ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        // Start transparent
        navbar.classList.add('navbar-top');

        const scrollThreshold = 80; // px before switching to frosted
        window.addEventListener('scroll', () => {
            if (window.scrollY > scrollThreshold) {
                navbar.classList.remove('navbar-top');
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.add('navbar-top');
                navbar.classList.remove('navbar-scrolled');
            }
        }, { passive: true });
    }

    // --- Hero 3D Object (Three.js) ---
    const canvas3D = document.getElementById('hero-3d');
    if (canvas3D && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, canvas3D.clientWidth / canvas3D.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer with transparent background
        const renderer = new THREE.WebGLRenderer({ canvas: canvas3D, alpha: true, antialias: true });
        renderer.setSize(canvas3D.clientWidth, canvas3D.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        // Glass Material
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.05,
            transmission: 0.9, // glass-like transparency
            ior: 1.5,
            thickness: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        // Object (Crystal/AI Node shape)
        const geometry = new THREE.IcosahedronGeometry(1.2, 0); // Low poly diamond/crystal
        const crystal = new THREE.Mesh(geometry, glassMaterial);

        // Inner glowing core
        const innerGeo = new THREE.IcosahedronGeometry(0.5, 1);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0x3286ff, wireframe: true });
        const core = new THREE.Mesh(innerGeo, innerMat);

        const group = new THREE.Group();
        group.add(crystal);
        group.add(core);
        scene.add(group);

        // Lights matching Google colors
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const light1 = new THREE.PointLight(0x3286ff, 5, 20); // Blue
        light1.position.set(2, 2, 2);
        scene.add(light1);

        const light2 = new THREE.PointLight(0xea4335, 5, 20); // Red
        light2.position.set(-2, -2, 2);
        scene.add(light2);

        const light3 = new THREE.PointLight(0xfbbc05, 3, 20); // Yellow
        light3.position.set(0, 3, -2);
        scene.add(light3);

        // Mouse Interaction
        let mouseX = 0;
        let mouseY = 0;
        const heroGraphic = document.querySelector('.hero-graphic');
        heroGraphic.addEventListener('mousemove', (e) => {
            const rect = heroGraphic.getBoundingClientRect();
            // Normalize mouse coordinates to -1 to 1
            mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        });

        // Handle Resize
        window.addEventListener('resize', () => {
            if (canvas3D.clientWidth === 0) return;
            camera.aspect = canvas3D.clientWidth / canvas3D.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas3D.clientWidth, canvas3D.clientHeight);
        });

        // Animation Loop
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            // Auto rotation + float (speeds up slightly based on mouse distance)
            const mouseDistance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
            const dynamicSpeed = 0.005 + (mouseDistance * 0.015);

            crystal.rotation.x += dynamicSpeed;
            crystal.rotation.y += dynamicSpeed * 2;
            core.rotation.x -= dynamicSpeed * 2;
            core.rotation.y -= dynamicSpeed * 3;
            group.position.y = Math.sin(time) * 0.2; // Float up and down

            // Mouse parallax (smooth but noticeably reactive)
            group.rotation.x += (mouseY * 1.2 - group.rotation.x) * 0.15;
            group.rotation.y += (mouseX * 1.2 - group.rotation.y) * 0.15;

            renderer.render(scene, camera);
        }
        animate();
    }
});
