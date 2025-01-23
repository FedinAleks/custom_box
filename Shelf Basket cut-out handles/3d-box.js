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
    camera.position.z = 20;

    // Налаштування рендера
    renderer = new THREE.WebGLRenderer({ antialias: true });
    const visualizationContainer = document.querySelector(".visualization");
    if (visualizationContainer) {
        renderer.setSize(visualizationContainer.clientWidth, visualizationContainer.clientHeight);
        visualizationContainer.appendChild(renderer.domElement);
    } else {
        console.error("Контейнер .visualization не знайдено.");
    }

    renderer.setClearColor(0xebebeb); // Встановлення білого фону

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

    // Додати обробник подій для зміни розміру вікна
    window.addEventListener("resize", () => {
        if (visualizationContainer) {
            renderer.setSize(visualizationContainer.clientWidth, visualizationContainer.clientHeight);
            camera.aspect = visualizationContainer.clientWidth / visualizationContainer.clientHeight;
            camera.updateProjectionMatrix();
        }
    });
}

// MAIN FUNCTION

function createBoxWithHandles(depth, height, width, withLid = false) {
    if (boxGroup) {
        scene.remove(boxGroup);
    }

    // Створення групи для коробки, кришки та ручок
    boxGroup = new THREE.Group();

    const cornerRadius = 1; // Радіус округлення кутів

    // Створення форми для коробки з округленням нижніх кутів
    const shape = new THREE.Shape();

    // Лівий нижній кут (округлення по осі Y)
    shape.moveTo(-width / 2, -height / 2 + cornerRadius);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + cornerRadius, -height / 2);

    // Нижня сторона
    shape.lineTo(width / 2 - cornerRadius, -height / 2);

    // Правий нижній кут (округлення по осі Y)
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + cornerRadius);

    // Права сторона
    shape.lineTo(width / 2, height / 2);

    // Верхня сторона
    shape.lineTo(-width / 2, height / 2);

    // Закриття форми
    shape.lineTo(-width / 2, -height / 2 + cornerRadius);

    // Екструзія форми для створення об'єму коробки
    const extrudeSettings = { depth: depth, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    geometry.center(); // Центрування геометрії коробки

    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    box = new THREE.Mesh(geometry, material);

    // Додавання контурів коробки
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);

    boxGroup.add(box); // Додати коробку до групи
    boxGroup.add(edgeLines); // Додати контури

    // Додавання кришки
    if (withLid === false) {
        const lidGroup = createLidWithWalls(width, depth, height);
        boxGroup.add(lidGroup);
    }

    // Додавання ручок
    addHandles(width, depth, height, boxGroup);

    scene.add(boxGroup);
}




// FUNCTION FOR LID


function createLidWithWalls(width, depth, height, wallThickness = 1) {
    // Група для кришки
    const lidGroup = new THREE.Group();

    // Основна площина кришки
    const lidGeometry = new THREE.BoxGeometry(width, wallThickness, depth);
    const lidMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const lidMesh = new THREE.Mesh(lidGeometry, lidMaterial);

    lidMesh.position.set(0, height / 2 + wallThickness / 30, 0); // Розташування кришки
    lidGroup.add(lidMesh);

    // Чорний контур для верхньої площини кришки
    const lidEdges = new THREE.EdgesGeometry(lidGeometry);
    const lidLine = new THREE.LineSegments(lidEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    lidLine.position.copy(lidMesh.position);
    lidGroup.add(lidLine);

    return lidGroup;
}


// FUNCTION FOR ADDING HANDLES

function addHandles(width, depth, height, boxGroup) {
    const handleMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Матеріал для контуру ручки
    const handleWidth = 3; // Ширина ручки
    const handleHeight = 1; // Товщина ручки
    const handleDepth = 0.1; // Глибина ручки
    const cornerRadius = 0.5; // Радіус закруглення кутів

    // Відстань ручок від верхньої частини коробки
    const handleYPosition = height * 0.15;

    // Створення форми з округленими кутами для ручки
    const shape = new THREE.Shape();
    shape.moveTo(-handleWidth / 2 + cornerRadius, -handleHeight / 2);
    shape.lineTo(handleWidth / 2 - cornerRadius, -handleHeight / 2);
    shape.quadraticCurveTo(handleWidth / 2, -handleHeight / 2, handleWidth / 2, -handleHeight / 2 + cornerRadius);
    shape.lineTo(handleWidth / 2, handleHeight / 2 - cornerRadius);
    shape.quadraticCurveTo(handleWidth / 2, handleHeight / 2, handleWidth / 2 - cornerRadius, handleHeight / 2);
    shape.lineTo(-handleWidth / 2 + cornerRadius, handleHeight / 2);
    shape.quadraticCurveTo(-handleWidth / 2, handleHeight / 2, -handleWidth / 2, handleHeight / 2 - cornerRadius);
    shape.lineTo(-handleWidth / 2, -handleHeight / 2 + cornerRadius);
    shape.quadraticCurveTo(-handleWidth / 2, -handleHeight / 2, -handleWidth / 2 + cornerRadius, -handleHeight / 2);

    // Створення геометрії для 2D-контурів
    const handleGeometry = new THREE.BufferGeometry().setFromPoints(shape.getPoints());

    // Ліва ручка (паралельна лівій стінці коробки)
    const handleLeft = new THREE.Line(handleGeometry, handleMaterial);
    handleLeft.position.set(-width / 2 - handleDepth / 2, handleYPosition, 0); // Розташування лівої ручки
    handleLeft.rotation.y = Math.PI / 2; // Обертання, щоб ручка була паралельна стінці
    boxGroup.add(handleLeft);

    // Права ручка (паралельна правій стінці коробки)
    const handleRight = new THREE.Line(handleGeometry, handleMaterial);
    handleRight.position.set(width / 2 + handleDepth / 2, handleYPosition, 0); // Розташування правої ручки
    handleRight.rotation.y = Math.PI / 2; // Обертання, щоб ручка була паралельна стінці
    boxGroup.add(handleRight);
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
        errorMessage.innerHTML = `<p>Помилка: введені значення виходять за межі допустимих.</p>`;
    } else {
        errorMessage.textContent = "";
        createBoxWithHandles(width, height, depth, true);
    }
}


let allowRotation = false; // Змінна для контролю обертання

function animate() {
    requestAnimationFrame(animate);

    if (allowRotation && boxGroup) {
        boxGroup.rotation.y += 0.01; // Обертання по осі Y
    }

    controls.update(); // Оновлення контролерів
    renderer.render(scene, camera); // Рендеринг сцени
}

// Запускаємо ініціалізацію
init();



/* PRICE */


// Функція для обчислення динамічного коефіцієнта
function calculateDynamicCoefficient(value) {
    let min_range, max_range, k_max, k_min;

    if (value >= 1000 && value <= 1500) {
        min_range = 1000; max_range = 1500; k_max = 0.037; k_min = 0.029;
    } else if (value >= 1501 && value <= 2000) {
        min_range = 1501; max_range = 2000; k_max = 0.029; k_min = 0.027;
    } else if (value >= 2001 && value <= 2500) {
        min_range = 2001; max_range = 2500; k_max = 0.027; k_min = 0.025;
    } else if (value >= 2501 && value <= 3000) {
        min_range = 2501; max_range = 3000; k_max = 0.025; k_min = 0.023;
    } else if (value >= 3001 && value <= 3500) {
        min_range = 3001; max_range = 3500; k_max = 0.023; k_min = 0.0195;
    } else if (value >= 3501 && value <= 5000) {
        min_range = 3501; max_range = 5000; k_max = 0.0195; k_min = 0.0068;
    } else if (value >= 5001 && value <= 29500) {
        min_range = 5001; max_range = 29500; k_max = 0.0195; k_min = 0.0068;
    } else {
        return "Значення поза діапазоном";
    }

    const range_width = max_range - min_range;
    const coefficient = k_max - (k_max - k_min) * (value - min_range) / range_width;
    
    // Розрахунок кінцевої ціни
    const result = coefficient * value;
    return result;
}

// Функція для обчислення ціни на основі розмірів
function calculatePrice(width, height, depth) {
    const volume = width * height * depth; // Обчислення об'єму коробки

    if (volume <= 1000) {
        return 37; // Ціна фіксована, якщо об'єм менший за 1000
    } else {
        const price = calculateDynamicCoefficient(volume);
        return price;
    }
}

// Функція для оновлення ціни на сторінці
function updatePrice() {
    const width = parseFloat(document.getElementById("width").value);
    const height = parseFloat(document.getElementById("height").value);
    const depth = parseFloat(document.getElementById("depth").value);

    const price = calculatePrice(width, height, depth);
    document.getElementById("price").textContent = `$${price.toFixed(2)}`; // Вивести ціну
}

// Додати слухачі подій для змін
document.getElementById("width").addEventListener("input", updatePrice);
document.getElementById("height").addEventListener("input", updatePrice);
document.getElementById("depth").addEventListener("input", updatePrice);
