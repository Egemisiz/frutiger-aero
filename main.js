// --- DEĞİŞKENLER VE KURULUM ---
let scene, camera, renderer;
let player;
let crystals = [];
let score = 0, level = 1;
let keys = {};
let isGameRunning = false;
let playerVelocityY = 0;
let isGrounded = true;

function init3D() {
    const container = document.getElementById('webgl-container');

    // Sahne Kurulumu
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Aero Gökyüzü Mavisı
    scene.fog = new THREE.FogExp2(0xa0e0ff, 0.012);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Işıklandırma
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
    sunLight.position.set(60, 100, 60);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Zemin (Açık Parlak Çimen)
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x7cfc00, shininess: 40 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Cam Binalar
    createGlassArchitecture();

    // 3D Oyuncu Küresi (Aero Glass Orb)
    const playerGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const playerMat = new THREE.MeshPhongMaterial({ color: 0x00ffff, shininess: 100, transparent: true, opacity: 0.85 });
    player = new THREE.Mesh(playerGeo, playerMat);
    player.position.set(0, 1.2, 0);
    player.castShadow = true;
    scene.add(player);

    // Dönen 3D Cam Kristalleri Serpiştir
    spawnCrystals(15);

    // Kamera Pozisyonu
    camera.position.set(0, 5, 12);

    // Event Listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', (e) => keys[e.code] = true);
    document.addEventListener('keyup', (e) => keys[e.code] = false);

    setupUIEvents();
    animate();
}

// Frutiger Aero 3D Cam Binalar
function createGlassArchitecture() {
    const glassMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        shininess: 90,
        reflectivity: 0.9
    });

    for (let i = 0; i < 10; i++) {
        const height = 20 + Math.random() * 20;
        const geo = new THREE.CylinderGeometry(3, 4, height, 16);
        const building = new THREE.Mesh(geo, glassMat);
        
        const angle = (i / 10) * Math.PI * 2;
        const radius = 45 + Math.random() * 15;
        building.position.set(Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius);
        scene.add(building);
    }
}

// 3D Dönen Cam Kristalleri Oluştur
function spawnCrystals(count) {
    const crystalGeo = new THREE.OctahedronGeometry(1.2, 0);
    const crystalMat = new THREE.MeshPhongMaterial({ color: 0x00ffcc, shininess: 100, transparent: true, opacity: 0.9 });

    for (let i = 0; i < count; i++) {
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.set((Math.random() - 0.5) * 150, 1.8, (Math.random() - 0.5) * 150);
        scene.add(crystal);
        crystals.push(crystal);
    }
}

// OYUN DÖNGÜSÜ
function animate() {
    requestAnimationFrame(animate);

    if (isGameRunning) {
        const speed = 0.32;
        if (keys['KeyW'] || keys['ArrowUp']) player.position.z -= speed;
        if (keys['KeyS'] || keys['ArrowDown']) player.position.z += speed;
        if (keys['KeyA'] || keys['ArrowLeft']) player.position.x -= speed;
        if (keys['KeyD'] || keys['ArrowRight']) player.position.x += speed;

        // Zıplama & Fizik
        if (keys['Space'] && isGrounded) {
            playerVelocityY = 0.38;
            isGrounded = false;
        }

        player.position.y += playerVelocityY;
        if (!isGrounded) {
            playerVelocityY -= 0.018; // Yerçekimi
            if (player.position.y <= 1.2) {
                player.position.y = 1.2;
                playerVelocityY = 0;
                isGrounded = true;
            }
        }

        // Kamera Takibi
        camera.position.x = player.position.x;
        camera.position.z = player.position.z + 12;
        camera.position.y = player.position.y + 4;
        camera.lookAt(player.position);

        // Kristal Dönüşü ve Temas Kontrolü
        crystals.forEach((crystal, index) => {
            crystal.rotation.y += 0.04;
            
            const dist = player.position.distanceTo(crystal.position);
            if (dist < 2.2) {
                scene.remove(crystal);
                crystals.splice(index, 1);
                score += 10;
                document.getElementById('crystal-count').innerText = score;

                if (score % 50 === 0) {
                    level++;
                    document.getElementById('level-count').innerText = level;
                }

                spawnCrystals(1);
            }
        });
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Menü ve Buton Mantığı
function setupUIEvents() {
    document.getElementById('btn-play').addEventListener('click', () => {
        document.getElementById('ui-layer').style.display = 'none';
        isGameRunning = true;
    });

    const tabContent = document.getElementById('tab-content');

    document.getElementById('btn-shop').addEventListener('click', () => {
        tabContent.innerHTML = `
            <h3>🛒 AERO MAĞAZASI</h3>
            <p>Topladığınız kristallerle yeni ürünler açın:</p>
            <br>
            <p>• <b>Su Baloncuk Aurası:</b> 50 Kristal</p>
            <p>• <b>Parlak Cam Kanatlar:</b> 100 Kristal</p>
        `;
    });

    document.getElementById('btn-settings').addEventListener('click', () => {
        tabContent.innerHTML = `
            <h3>⚙ AYARLAR</h3>
            <p>• <b>Grafik Motoru:</b> Three.js WebGL</p>
            <p>• <b>Su & Işık Efektleri:</b> Açık</p>
            <p>• <b>Görünüm Modu:</b> Frutiger Aero Glass</p>
        `;
    });

    document.getElementById('btn-credits').addEventListener('click', () => {
        tabContent.innerHTML = `
            <h3>📜 EMEĞİ GEÇENLER</h3>
            <p>• <b>Tasarım & Konsept:</b> Frutiger Aero Estetiği</p>
            <p>• <b>Kodlama:</b> VS Code WebGL Project</p>
        `;
    });
}

// Çalıştır
window.onload = init3D;