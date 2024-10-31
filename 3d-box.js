// Ініціалізація змінних для сцени, камери та рендера
let scene, camera, renderer, controls;
let box; // 3D box geometry
let lid; // Geometry for the lid
let handles = []; // Array to hold the handle meshes
let boxGroup; // Group for the box, lid, and handles

const limits = {
    width: { min: 7.5, max: 20 },
    depth: { min: 7.5, max: 31 },
    height: { min: 6.5, max: 31 },
};

let isUserInteracting = false; // Flag to check if the user is interacting

// Ініціалізація сцени
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Налаштування рендера
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff); // Встановлення білого фону
    document.body.appendChild(renderer.domElement);

    // Додавання освітлення
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10).normalize();
    scene.add(light);

    // Додавання контролерів для миші
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Створення початкової коробки
    createBoxWithHandles(10, 10, 10, true);

    // Додавання слухачів подій для взаємодії
    controls.addEventListener('start', () => isUserInteracting = true); // Коли починається взаємодія
    controls.addEventListener('end', () => isUserInteracting = false); // Коли взаємодія закінчується

    // Запуск анімації
    animate();
}

// Функція для створення коробки з контурами, ручками та кришкою
function createBoxWithHandles(width, height, depth, withLid = false) {
    // Видалення старої коробки, якщо вона існує
    if (boxGroup) {
        scene.remove(boxGroup);
    }

    // Створення групи для коробки, кришки та ручок
    boxGroup = new THREE.Group();

    // Створення геометрії коробки
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    box = new THREE.LineSegments(edges, material);
    boxGroup.add(box); // Додати коробку до групи

    // Додавання кришки, якщо потрібно
    if (withLid) {
        const lidGeometry = new THREE.PlaneGeometry(width, depth);
        const lidEdges = new THREE.EdgesGeometry(lidGeometry);
        const lidMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        lid = new THREE.LineSegments(lidEdges, lidMaterial);

        // Позиціонування кришки на верхній частині коробки
        lid.position.y = height / 2;
        lid.rotation.x = Math.PI / 2;
        boxGroup.add(lid); // Додати кришку до групи
    }

    // Додавання ручок
    addHandles(width, height, boxGroup);

    // Додати групу до сцени
    scene.add(boxGroup);
}

// Функція для додавання ручок (лише з боків)
function addHandles(width, height, boxGroup) {
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const handleRadius = 0.2; // Radius of the handle
    const handleHeight = 1; // Height of the handle

    // Створення геометрії для ручки (циліндр)
    const handleGeometry = new THREE.CylinderGeometry(handleRadius, handleRadius, handleHeight, 16);

    // Ручки з обох боків (ліво, право)
    const handleLeft = new THREE.Mesh(handleGeometry, handleMaterial);
    handleLeft.position.set(-width / 2 - handleRadius, 0, 0);
    handleLeft.rotation.z = Math.PI / 2; // Rotate to horizontal position
    boxGroup.add(handleLeft);
    handles.push(handleLeft); // Add to handles array

    const handleRight = new THREE.Mesh(handleGeometry, handleMaterial);
    handleRight.position.set(width / 2 + handleRadius, 0, 0);
    handleRight.rotation.z = Math.PI / 2; // Rotate to horizontal position
    boxGroup.add(handleRight);
    handles.push(handleRight); // Add to handles array
}

// Функція для оновлення розмірів коробки
function updateBoxDimensions() {
    const widthInput = document.getElementById("width");
    const depthInput = document.getElementById("depth");
    const heightInput = document.getElementById("height");
    const errorMessage = document.getElementById("error-message");

    let width = parseFloat(widthInput.value);
    let depth = parseFloat(depthInput.value);
    let height = parseFloat(heightInput.value);

    // Перевірка розмірів
    let widthValid = width >= limits.width.min && width <= limits.width.max;
    let depthValid = depth >= limits.depth.min && depth <= limits.depth.max;
    let heightValid = height >= limits.height.min && height <= limits.height.max;

    if (!widthValid || !depthValid || !heightValid) {
        errorMessage.innerHTML = `
            <p>Помилка: введені значення виходять за межі допустимих.</p>
            <p>Допустимі розміри:</p>
            <ul>
                <li>Ширина (Width): ${limits.width.min} - ${limits.width.max}</li>
                <li>Глибина (Depth): ${limits.depth.min} - ${limits.depth.max}</li>
                <li>Висота (Height): ${limits.height.min} - ${limits.height.max}</li>
            </ul>
        `;
    } else {
        errorMessage.textContent = "";
        createBoxWithHandles(width, height, depth, true); // Оновлення коробки з новими розмірами
    }
}

// Функція анімації для обертання коробки
function animate() {
    requestAnimationFrame(animate);

    if (!isUserInteracting) {
        // Обертання коробки на 360 градусів
        if (boxGroup) {
            boxGroup.rotation.y += 0.01; // Обертання по осі Y
        }
    }

    controls.update(); // Оновлення контролерів
    renderer.render(scene, camera);
}

// Виклик функції ініціалізації
init();
