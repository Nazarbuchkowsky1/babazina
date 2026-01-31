// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);
if (typeof ScrollToPlugin !== 'undefined') {
    gsap.registerPlugin(ScrollToPlugin);
}

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Connect Lenis to ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);


// Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('navMenu');

if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navbar.classList.toggle('active');
        document.body.style.overflow = navbar.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on menu items
    const navMenuItems = document.querySelectorAll('.nav-menu-item');
    navMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navbar.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            lenis.scrollTo(target);

            // Close menu if open
            if (navbar && navbar.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navbar.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
});

// Courses functionality - GSAP ScrollTrigger Pin for stacking effect
function initCourses() {
    const cards = document.querySelectorAll('.course-sticky-card');
    const totalCards = cards.length;

    cards.forEach((card, index) => {
        // Create dimming overlay for each card
        const overlay = document.createElement('div');
        overlay.className = 'card-dim-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: black;
            opacity: 0;
            pointer-events: none;
            z-index: 100;
        `;
        card.appendChild(overlay);

        // Pin each card except the last one
        if (index < totalCards - 1) {
            const nextCard = cards[index + 1];

            ScrollTrigger.create({
                trigger: card,
                start: 'top top',
                endTrigger: nextCard,
                end: 'top top',
                pin: true,
                pinSpacing: false,
            });

            // Dimming effect - max 60% (opacity 0.6)
            gsap.to(overlay, {
                opacity: 0.6,
                ease: 'none',
                scrollTrigger: {
                    trigger: nextCard,
                    start: 'top bottom',
                    end: 'top top',
                    scrub: true,
                }
            });
        } else {
            // Last panel - pin it briefly to eat inertia scroll
            ScrollTrigger.create({
                trigger: card,
                start: 'top top',
                end: '+=20%', // Small buffer to eat scroll inertia
                pin: true,
                pinSpacing: false,
            });
        }

    });
}

// Helper for creating a procedural sharp circle sprite - Ultra Clarity
function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const center = 32;
    // Hard-edged circle instead of soft gradient for extreme clarity
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
}

// Helper for soft defined star texture
function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const center = 64;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, 48); // Більш сфокусоване ядро
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
}

// Particle Intro Effect - Cinematic Slap Apps Style
function initParticleIntro() {
    const container = document.getElementById('particleCanvasContainer');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 6000); // Збільшено far plane до 6000
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Покращена тональна карта
    renderer.toneMappingExposure = 1.15; // Ще спокійніше для елегантного вигляду
    container.appendChild(renderer.domElement);

    // ПОКРАЩЕНИЙ 3D ЗОРЯНИЙ ФОН - сферична дистрибуція, шари та варіативність розмірів
    const starTexture = createStarTexture();

    // Конфігурація шарів (кількість, діапазон розмірів, радіус сфери, прозорість, швидкість обертання)
    const starLayersConfig = [
        { count: 12000, sizeRange: [0.8, 1.6], radius: 2800, opacity: 0.5, speed: 0.00018 }, // Далекий фон
        { count: 6000, sizeRange: [1.8, 2.8], radius: 2000, opacity: 0.8, speed: 0.00012 }, // Середній план
        { count: 2000, sizeRange: [3.0, 4.5], radius: 1400, opacity: 1.0, speed: 0.00008 }  // Ближній план
    ];

    const starGroups = [];

    starLayersConfig.forEach(config => {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const sizes = [];

        for (let i = 0; i < config.count; i++) {
            const phi = Math.acos(-1 + (2 * Math.random()));
            const theta = Math.random() * Math.PI * 2;
            const r = config.radius * (0.8 + Math.random() * 0.4);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            // Виключаємо центр
            if (Math.abs(x) < 200 && Math.abs(y) < 200 && Math.abs(z) < 200) continue;

            positions.push(x, y, z);
            // Рандомний розмір у межах діапазону шару
            sizes.push(config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]));
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: starTexture },
                uOpacity: { value: config.opacity }
            },
            vertexShader: `
                attribute float size;
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * ${window.devicePixelRatio || 1.0};
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                uniform float uOpacity;
                void main() {
                    vec4 color = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor = vec4(1.0, 1.0, 1.0, uOpacity) * color;
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        points.rotation.x = Math.random() * Math.PI;
        points.rotation.y = Math.random() * Math.PI;
        points.userData = { rotationSpeed: config.speed };

        scene.add(points);
        starGroups.push(points);
    });

    const targetImage = '1821ecf0-4dfe-4391-89ae-a3180ee8b969.png';
    const img = new Image();

    img.onerror = () => {
        console.error('Помилка завантаження зображення:', targetImage);
    };

    img.onload = () => {
        console.log('Зображення завантажено успішно');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const sampleSize = 900; // Збільшено для кращої деталізації
        canvas.width = sampleSize;
        canvas.height = (img.height / img.width) * sampleSize;

        try {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            const positionsBody = [];
            const colorsBody = [];
            const positionsHeart = [];
            const colorsHeart = [];

            // Масиви для іскр (золоті пікселі поза серцем) - не використовуємо
            const sparkPositions = [];
            const sparkOriginalPositions = [];
            const sparkColors = [];
            const sparkVelocities = [];
            const sparkLife = [];

            // Статичне світіння - НЕ ВИКОРИСТОВУЄМО (не треба друге серце)
            const positionsGlowStatic = [];
            const colorsGlowStatic = [];

            // Статичне світіння ВИМКНЕНО - не треба друге серце

            // Нормалізовані межі серця - УЛЬТРА-ТОЧНІСТЬ (видаляємо зайве зверху і знизу)
            const heartRadNorm = 0.17;
            const heartCenterYNorm = 0.58;
            const heartBandTop = 0.40;        // опущено верхню межу (більше значення)
            const heartBandBottom = 0.65;     // піднято нижню межу (менше значення)
            const heartRadius = canvas.width * heartRadNorm;

            for (let y = 0; y < canvas.height; y++) {
                const yNormStep = y / canvas.height;
                // Уніфікована щільність для голови (крок 1 - піксель у піксель),
                // плечей та серця (крок 2)
                // Повна деталізація (крок 1) для всієї фігури до нижньої частини,
                // щоб уникнути горизонтальних ліній розділу
                const stepX = yNormStep < 0.8 ? 1 : (yNormStep < 0.9 ? 2 : 3);

                for (let x = 0; x < canvas.width; x += stepX) {
                    const index = (y * canvas.width + x) * 4;
                    const r = data[index] / 255;
                    const g = data[index + 1] / 255;
                    const b = data[index + 2] / 255;
                    const a = data[index + 3] / 255;

                    if (a < 0.05) continue; // пропустити повністю прозорі пікселі

                    const xNorm = x / canvas.width - 0.5;
                    const yNorm = y / canvas.height;

                    // ЗОЛОТО: Німб, прикраси, деталі серця
                    const isGold = (r > 0.4 && g > 0.3 && b < 0.35) && (r > b);

                    // Плавне зменшення пропуску: для волосся залишаємо деталі за яскравістю
                    const brightness = (r + g + b) / 3;
                    let finalSkip = 0;
                    if (yNorm < 0.65 && !isGold) {
                        // Плавна зміна щільності: від голови до тулуба без стрибків
                        const densityStart = 0.40;
                        const densityEnd = 0.65;
                        const densityFactor = Math.max(0, Math.min(1, (yNorm - densityStart) / (densityEnd - densityStart)));

                        // Базовий пропуск плавно зростає, але залишається невеликим для чіткості
                        const baseSkip = 0.3 + 0.3 * densityFactor;
                        finalSkip = brightness > 0.4 ? baseSkip * 0.5 : baseSkip;
                    }
                    if (finalSkip > 0 && Math.random() < finalSkip) continue;

                    // Плавний поріг для тіней (lerp)
                    const bThresh = 0.07 + (0.12 - 0.07) * Math.max(0, Math.min(1, (yNorm - 0.5) / 0.2));
                    if (brightness < bThresh) continue;

                    // Центрування
                    const posX = x - canvas.width / 2;
                    const posY = -(y - canvas.height / 2);

                    // ВИЗНАЧЕННЯ СЕРЦЯ (потрібно для posZ)
                    const isYInHeartBand = yNorm >= heartBandTop && yNorm <= heartBandBottom;
                    const dX = xNorm / heartRadNorm;
                    const dY = (yNorm - heartCenterYNorm) / (heartRadNorm * 1.5);
                    const heartDist = Math.sqrt(dX * dX + dY * dY);

                    // Більш широка маска для артерій та структури
                    const isWithinHeartMask = isYInHeartBand && (
                        heartDist < 0.52 || // Збільшено з 0.45 для повноти
                        (xNorm < -0.05 && yNorm < 0.52 && heartDist < 0.75)
                    );

                    // Залежність глибини: для серця менша глибина, щоб воно було цілісним
                    let posZ = (brightness - 0.5) * (isWithinHeartMask ? 130 : 200);
                    if (!isWithinHeartMask) {
                        posZ += (Math.random() - 0.5) * 30; // Шум тільки для тіла, серце - гладке
                    }

                    if (isWithinHeartMask) {
                        positionsHeart.push(posX, posY, posZ);
                        colorsHeart.push(r, g, b);
                    } else {
                        // М'яке змішування кольорів для усунення "лінії розділу" на плечах
                        const blendStart = 0.44;
                        const blendEnd = 0.64;
                        const blendMix = Math.max(0, Math.min(1, (yNorm - blendStart) / (blendEnd - blendStart)));

                        if (isGold) {
                            colorsBody.push(r, g, b);
                        } else {
                            // Плавне наростання стилізації
                            const sF = 1.0 + (2.0 - 1.0) * blendMix;
                            const mB = 0.12 + (0.35 - 0.12) * blendMix;

                            // Посилене приглушення для голови (damping), щоб білий був м'яким
                            const headBrightnessDamping = yNorm < 0.45 ? 0.58 : 1.0;

                            colorsBody.push(
                                Math.min(Math.max(r * sF * headBrightnessDamping, mB), 1),
                                Math.min(Math.max(g * sF * headBrightnessDamping, mB), 1),
                                Math.min(Math.max(b * sF * headBrightnessDamping, mB), 1)
                            );
                        }
                        positionsBody.push(posX, posY, posZ);
                    }
                }
            }

            const circleSprite = createCircleTexture();

            // Тіло
            const bodyGeometry = new THREE.BufferGeometry();
            bodyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsBody, 3));
            bodyGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsBody, 3));
            const bodyMaterial = new THREE.PointsMaterial({
                size: 2.6, // Значно зменшено для кришталевої чіткості
                map: circleSprite,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending, // Повертаємо Additive для світіння
                vertexColors: true,
                sizeAttenuation: true,
                depthWrite: false,
            });

            // Серце (Лівітує)
            const heartGeometry = new THREE.BufferGeometry();
            heartGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positionsHeart, 3));
            heartGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsHeart, 3));
            const heartMaterial = new THREE.PointsMaterial({
                size: 3.2, // Трохи більше, але все одно дуже чітке
                map: circleSprite,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending, // Залишаємо світіння для золота
                vertexColors: true,
                sizeAttenuation: true,
                depthWrite: false,
            });

            // Статичне світіння ВИМКНЕНО - не треба друге серце

            const bodyPoints = new THREE.Points(bodyGeometry, bodyMaterial);
            const heartPoints = new THREE.Points(heartGeometry, heartMaterial);

            // Іскри вимкнені - тільки серце має бути золотим
            const sparks = null;

            // Окрема група для серця для анімації левітації
            const heartGroup = new THREE.Group();
            heartGroup.add(heartPoints);

            const modelGroup = new THREE.Group();
            modelGroup.add(bodyPoints);
            modelGroup.add(heartGroup);
            scene.add(modelGroup);

            // Частинки світіння навколо серця - ВИМКНЕНО, тільки серце має бути золотим
            const glowParticles = null;

            // Responsive Scaling: Fit height perfectly
            camera.position.z = 1000;
            const updateLayout = () => {
                const vFOV = THREE.MathUtils.degToRad(camera.fov);
                const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
                // Perfect композиція: 90% of viewport height (збільшено з 75%)
                const scale = (visibleHeight * 0.90) / canvas.height;
                modelGroup.scale.set(scale, scale, scale);
                // Lift compositon slightly up for a balanced look
                modelGroup.position.y = -visibleHeight * 0.02;
            };
            updateLayout();

            function animate() {
                requestAnimationFrame(animate);
                const time = performance.now() * 0.001;

                // Тільки серце левітує - тіло залишається статичним
                // Акуратна пульсація
                heartMaterial.size = 3.2 + Math.sin(time * 3.5) * 0.4;
                // Легка левітація ТІЛЬКИ серця (вгору-вниз)
                heartGroup.position.y = Math.sin(time * 2.0) * 8.0; // Невелика амплітуда

                // Анімація фону - хаотичне обертання кожного шару
                if (starGroups && starGroups.length > 0) {
                    starGroups.forEach((group, index) => {
                        const speed = group.userData.rotationSpeed;
                        // Хаотичний рух по різних осях з різними напрямками
                        const dir = index % 2 === 0 ? 1 : -1;
                        group.rotation.y += speed * dir;
                        group.rotation.x += speed * 0.7 * -dir;
                        group.rotation.z += speed * 0.3 * dir;
                    });
                }

                // Анімація частинок світіння навколо серця
                if (glowParticles && glowParticles.geometry) {
                    const glowPosAttr = glowParticles.geometry.attributes.position;
                    const glowColorAttr = glowParticles.geometry.attributes.color;
                    const glowPosArr = glowPosAttr.array;
                    const glowColorArr = glowColorAttr.array;

                    for (let i = 0; i < glowParticlesCount; i++) {
                        const pIndex = i * 3;

                        // Оновлюємо життєвий цикл
                        glowParticlesLife[i] += 0.02; // Швидше для більш динамічного ефекту
                        if (glowParticlesLife[i] > 1.0) {
                            // Частинка "померла", відроджуємо біля серця з новою швидкістю
                            const ang = Math.random() * Math.PI * 2;
                            const rad = (canvas.width * heartRadNorm) * (0.15 + Math.random() * 0.1);
                            glowPosArr[pIndex] = Math.cos(ang) * rad;
                            glowPosArr[pIndex + 1] = Math.sin(ang) * rad;
                            glowPosArr[pIndex + 2] = (Math.random() - 0.5) * 25;

                            // Нова швидкість
                            const speedBase = 1.2 + Math.random() * 2.0;
                            const spreadAngle = ang + (Math.random() - 0.5) * 1.5;
                            glowParticlesVel[pIndex] = Math.cos(spreadAngle) * speedBase;
                            glowParticlesVel[pIndex + 1] = Math.sin(spreadAngle) * speedBase + (Math.random() * 1.0);
                            glowParticlesVel[pIndex + 2] = (Math.random() - 0.5) * 1.5;

                            glowParticlesLife[i] = 0;

                            // Повертаємо повну яскравість
                            glowColorArr[pIndex] = 1.0;
                            glowColorArr[pIndex + 1] = 0.84;
                            glowColorArr[pIndex + 2] = 0.0;
                        } else {
                            // Рухаємо частинку від серця
                            glowPosArr[pIndex] += glowParticlesVel[pIndex];
                            glowPosArr[pIndex + 1] += glowParticlesVel[pIndex + 1];
                            glowPosArr[pIndex + 2] += glowParticlesVel[pIndex + 2];

                            // Плавно зменшуємо яскравість (розчиняється)
                            const fade = 1.0 - glowParticlesLife[i];
                            glowColorArr[pIndex] = 1.0 * fade;
                            glowColorArr[pIndex + 1] = 0.84 * fade;
                            glowColorArr[pIndex + 2] = 0.0;
                        }
                    }

                    glowPosAttr.needsUpdate = true;
                    glowColorAttr.needsUpdate = true;
                }

                // Оновлюємо іскри (золоті пікселі поза серцем) - вимкнено
                if (false && sparks && sparks.geometry) {
                    const posAttr = sparks.geometry.attributes.position;
                    const colAttr = sparks.geometry.attributes.color;
                    const posArr = posAttr.array;
                    const colArr = colAttr.array;

                    for (let i = 0; i < sparkLife.length; i++) {
                        const idx = i * 3;
                        sparkLife[i] += 0.018; // Швидкість згасання іскр

                        if (sparkLife[i] > 1.0) {
                            // Відродження: повертаємо на вихідну позицію
                            posArr[idx] = sparkOriginalPositions[idx];
                            posArr[idx + 1] = sparkOriginalPositions[idx + 1];
                            posArr[idx + 2] = sparkOriginalPositions[idx + 2];
                            // Нова випадкова швидкість
                            const angle = Math.random() * Math.PI * 2;
                            const speed = 0.8 + Math.random() * 1.5;
                            sparkVelocities[idx] = Math.cos(angle) * speed;
                            sparkVelocities[idx + 1] = Math.sin(angle) * speed + (Math.random() * 0.5);
                            sparkVelocities[idx + 2] = (Math.random() - 0.5) * 1.5;
                            sparkLife[i] = 0;
                            // Повертаємо повну яскравість
                            colArr[idx] = 1.0;
                            colArr[idx + 1] = 0.84;
                            colArr[idx + 2] = 0.0;
                        } else {
                            // Рухаємо за швидкістю
                            posArr[idx] += sparkVelocities[idx];
                            posArr[idx + 1] += sparkVelocities[idx + 1];
                            posArr[idx + 2] += sparkVelocities[idx + 2];
                            // Додаємо випадковий дрейф, щоб частинки не летіли фронтом
                            const jitter = 0.04;
                            sparkVelocities[idx] += (Math.random() - 0.5) * jitter;
                            sparkVelocities[idx + 1] += (Math.random() - 0.5) * jitter;
                            sparkVelocities[idx + 2] += (Math.random() - 0.5) * jitter;
                            // Поступове згасання
                            const fade = 1.0 - sparkLife[i];
                            colArr[idx] = 1.0 * fade;
                            colArr[idx + 1] = 0.84 * fade;
                            colArr[idx + 2] = 0.0;
                        }
                    }

                    posAttr.needsUpdate = true;
                    colAttr.needsUpdate = true;
                }

                // stars.rotation.y += 0.0005; // Вимкнено додаткову ротацію
                renderer.render(scene, camera);
            }
            animate();

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                updateLayout();
            });

        } catch (e) {
            console.error('Particle Error:', e);
        }
    };

    img.src = targetImage;
}

// Statement section animation (Paper Tiger style)
function initStatementAnimation() {
    const statementTitle = document.querySelector('.statement-title');
    if (!statementTitle) return;

    // Set initial state
    gsap.set(statementTitle, {
        opacity: 0,
        y: 80,
        scale: 0.95
    });

    // Create ScrollTrigger for statement section
    ScrollTrigger.create({
        trigger: '.statement',
        start: 'top 80%',
        end: 'top 50%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
            gsap.to(statementTitle, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                ease: 'power3.out'
            });
        },
        onEnterBack: () => {
            gsap.to(statementTitle, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                ease: 'power3.out'
            });
        }
    });
}

// Testimonials Slider Logic
// Testimonials Slider Logic - Refined
function initTestimonialsSlider() {
    const track = document.querySelector('.testimonials-track');
    const cards = Array.from(document.querySelectorAll('.testimonial-card'));
    if (!track || cards.length === 0) return;

    let currentIndex = 0;
    let isTransitioning = false;

    function updateCards() {
        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next', 'prev-hidden', 'next-hidden');

            const total = cards.length;
            const diff = (index - currentIndex + total) % total;

            if (diff === 0) {
                card.classList.add('active');
            } else if (diff === 1) {
                card.classList.add('next');
            } else if (diff === total - 1) {
                card.classList.add('prev');
            } else if (diff > 1 && diff <= total / 2) {
                card.classList.add('next-hidden');
            } else {
                card.classList.add('prev-hidden');
            }
        });
    }

    function goToNext() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex = (currentIndex + 1) % cards.length;
        updateCards();
        setTimeout(() => isTransitioning = false, 800);
    }

    function goToPrev() {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCards();
        setTimeout(() => isTransitioning = false, 800);
    }

    // Initial state
    updateCards();

    // Event listeners with click position detection
    cards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            // If clicking on active card, determine direction based on click position
            if (card.classList.contains('active')) {
                const cardRect = card.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2;
                const clickX = e.clientX;

                // If click is on left side, go to previous
                // If click is on right side, go to next
                if (clickX < cardCenterX) {
                    goToPrev();
                } else {
                    goToNext();
                }
                return;
            }

            // If clicking on prev card, go to previous
            if (card.classList.contains('prev')) {
                goToPrev();
            }
            // If clicking on next card, go to next
            else if (card.classList.contains('next')) {
                goToNext();
            }
            // Fallback for hidden cards or direct jumps
            else {
                currentIndex = index;
                updateCards();
            }
        });
    });

    // Arrow button logic
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (prevBtn) prevBtn.addEventListener('click', goToPrev);
    if (nextBtn) nextBtn.addEventListener('click', goToNext);
}


function initFAQ() {
    const faqSection = document.querySelector('.faq-section');
    const faqTitleWrapper = document.querySelector('.faq-title-wrapper');
    const faqList = document.querySelector('.faq-list');
    const faqItems = document.querySelectorAll('.faq-item');

    if (!faqSection || !faqTitleWrapper || !faqList || faqItems.length === 0) return;

    // 1. Pin the FAQ title for the entire section
    ScrollTrigger.create({
        trigger: faqSection,
        start: "top top",
        end: "bottom bottom",
        pin: faqTitleWrapper,
        pinSpacing: false,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        pinType: 'fixed',
        invalidateOnRefresh: true
    });

    // 2. Pin the whole list once it reaches the bottom of the screen
    ScrollTrigger.create({
        trigger: faqList,
        start: "bottom bottom",
        endTrigger: faqSection,
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
        pinType: 'fixed',
        invalidateOnRefresh: true
    });

    // 3. Highlight items as they scroll (Reveal and stay white)
    faqItems.forEach((item, index) => {
        ScrollTrigger.create({
            trigger: item,
            start: "top 85%",
            onEnter: () => item.classList.add('active'),
            onEnterBack: () => item.classList.add('active'),
        });
    });

    // Ensure initial states are correct
    ScrollTrigger.refresh();
}

function initStatementAnimation() {
    const textElement = document.querySelector('[data-statement-text]');
    if (!textElement) return;

    const text = textElement.textContent;
    textElement.textContent = '';

    // Split text into characters
    const chars = text.split('').map(char => {
        const wrapper = document.createElement('span');
        wrapper.className = 'char-wrapper';
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = char === ' ' ? '\u00A0' : char;
        wrapper.appendChild(charSpan);
        textElement.appendChild(wrapper);
        return charSpan;
    });

    // Create the "wave from center" animation
    gsap.fromTo(chars,
        {
            y: "110%",
            opacity: 0
        },
        {
            y: "0%",
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: {
                amount: 0.6,
                from: "center"
            },
            scrollTrigger: {
                trigger: ".statement",
                start: "top 75%",
                toggleActions: "play none none reverse",
                // scrub: 0.5 // Optional: link to scroll position
            }
        }
    );
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initIntroAnimation();
    initParticleIntro();
    initCourses();
    initStatementAnimation();
    initTestimonialsSlider();
    initFAQ();
});

// Intro Animation - Percentage Counter з SVG прогрес-баром та спліт-екраном
// Cosmos Style Intro Animation
// Cosmos Style Intro Animation - Simplified
function initIntroAnimation() {
    const introScreen = document.getElementById('introLoadingScreen');
    const panelTop = document.getElementById('panelTop');
    const panelBottom = document.getElementById('panelBottom');
    const loaderPercent = document.querySelector('.loaderPercent');
    const numbersWr = document.querySelector('.preloader-numbers_wr');

    if (!introScreen || !panelTop || !panelBottom || !loaderPercent) {
        console.error('Missing elements for intro animation');
        return;
    }

    console.log('Intro animation starting');

    // Helper to format as 3-digit string (001, 010, 100)
    const formatNumber = (val) => String(Math.floor(val)).padStart(3, '0');

    const tl = gsap.timeline({
        onComplete: () => {
            introScreen.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Initial State - Ensure visibility
    document.body.style.overflow = 'hidden';
    gsap.set([panelTop, panelBottom], { y: '0%', opacity: 1 });
    if (numbersWr) {
        gsap.set(numbersWr, { scaleY: 1, opacity: 1 });
    }

    // 1. Counter Animation (Slower: 3.0s)
    const counterObj = { value: 0 };
    tl.to(counterObj, {
        value: 100,
        duration: 3.0,
        ease: "power2.inOut",
        onUpdate: () => {
            loaderPercent.innerText = formatNumber(counterObj.value);
        }
    });

    // 2. Snap Squeeze of the numbers
    if (numbersWr) {
        tl.to(numbersWr, {
            scaleY: 0,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
        });
    }

    // 3. Clean Split Reveal (NO delay, NO pre-blur gaps)
    tl.add(() => {
        panelTop.classList.add('reveal-active');
        panelBottom.classList.add('reveal-active');
    })
        .to(panelTop, {
            yPercent: -100,
            duration: 1.0,
            ease: "power4.inOut"
        })
        .to(panelBottom, {
            yPercent: 100,
            duration: 1.0,
            ease: "power4.inOut"
        }, "<")

    // 4. Pause after opening (Slightly shorter for better flow: 0.25s)
    tl.to({}, { duration: 0.25 });

    // 5. Sequential Hero Entrance (Smoother/Slower: 1.5s)
    // Academy of Spirituality starts first
    tl.fromTo('.hero-title', {
        y: -40,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power2.out"
    });

    // Description text starts appearing after title begins
    tl.fromTo('.hero-description', {
        y: 35,
        opacity: 0
    }, {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power2.out"
    }, "-=1.0");

    // Final cleanup
    tl.to(introScreen, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut"
    });
}

// Reinitialize on resize (only for hero if needed)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Hero resize handling if needed
    }, 250);
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navbar && navbar.classList.contains('active')) {
        menuToggle.classList.remove('active');
        navbar.classList.remove('active');
        document.body.style.overflow = '';
    }
});
