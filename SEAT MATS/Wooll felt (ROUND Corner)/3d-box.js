let scene, camera, renderer, controls;
    let pillow; // 3D геометрія подушки
    let pillowGroup; // Група для подушки

    const limits = {
        width: { min: 9, max: 25 },
        height: { min: 9, max: 25 },
    };

    let isUserInteracting = false;

    // Ініціалізація сцени
    function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        const visualizationContainer = document.querySelector(".visualization");
        if (visualizationContainer) {
            renderer.setSize(visualizationContainer.clientWidth, visualizationContainer.clientHeight);
            visualizationContainer.appendChild(renderer.domElement);
        }

        renderer.setClearColor(0xebebeb);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(10, 10, 10).normalize();
        scene.add(light);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        createPillow(15, 15, 1); // Початкове заокруглення 1

        controls.addEventListener('start', () => isUserInteracting = true);
        controls.addEventListener('end', () => isUserInteracting = false);

        animate();

        window.addEventListener("resize", () => {
            if (visualizationContainer) {
                renderer.setSize(visualizationContainer.clientWidth, visualizationContainer.clientHeight);
                camera.aspect = visualizationContainer.clientWidth / visualizationContainer.clientHeight;
                camera.updateProjectionMatrix();
            }
        });

        // Додайте слухач на зміни заокруглення
        const roundnessInput = document.getElementById("roundness");
        roundnessInput.addEventListener("input", (event) => {
            const roundness = parseFloat(event.target.value);
            const width = parseFloat(document.getElementById("width").value);
            const height = parseFloat(document.getElementById("height").value);
            updatePillowSize(width, height, roundness);
        });
    }

    // Функція для створення подушки
    // Функція для створення подушки
function createPillow(width, height, roundness) {
    if (pillowGroup) {
        scene.remove(pillowGroup); // Видаляємо стару групу
    }

    pillowGroup = new THREE.Group();

    // Створення геометрії для подушки з заокругленими кутами
    const geometry = new THREE.BoxGeometry(width, height, 1, Math.max(8, Math.round(roundness * 8)), Math.max(8, Math.round(roundness * 8)), 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xfffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });

    // Створення Mesh для подушки
    pillow = new THREE.Mesh(geometry, material);

    // Додавання контурів подушки
    const edges = new THREE.EdgesGeometry(pillow.geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);

    pillowGroup.add(pillow);
    pillowGroup.add(edgeLines);

    scene.add(pillowGroup);
}

// Оновлення розміру подушки
function updatePillowSize() {
    const width = parseFloat(document.getElementById("width").value);
    const height = parseFloat(document.getElementById("height").value);
    const roundness = parseFloat(document.getElementById("roundness").value);

    const errorMessage = document.getElementById("error-message");

    if (width < limits.width.min || width > limits.width.max || height < limits.height.min || height > limits.height.max) {
        errorMessage.innerHTML = `<p>Помилка: введені значення виходять за межі допустимих.</p>`;
    } else {
        errorMessage.textContent = "";
        createPillow(width, height, roundness);
    }
}


    // Функція для анімації
    let allowRotation = false;

    function animate() {
        requestAnimationFrame(animate);

        if (allowRotation && pillowGroup) {
            pillowGroup.rotation.y += 0.01; // Обертання
        }

        controls.update(); // Оновлення контролерів
        renderer.render(scene, camera); // Рендеринг сцени
    }

    init();