// Ініціалізація змінних для сцени, камери та рендера
let scene, camera, renderer, controls;
let box; // 3D box geometry
let lid; // Geometry for the lid
let handles = []; // Array to hold the handle meshes
let boxGroup; // Group for the box, lid, and handles

const limits = {
    width: { min: 7.5, max: 31 },
    depth: { min: 7.5, max: 31 },
    height: { min: 3, max: 7.5 },
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
    light.position.set(8, 2.5, 10).normalize();
    scene.add(light);

    // Додавання контролерів для миші
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Створення початкової коробки
    createBoxWithHandles(8, 2.5, 10, true);

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

// Функція для створення коробки з контурами, ручками та кришкою
function createBoxWithHandles(width, height, depth, withLid = false) {
    // Видалення старої коробки, якщо вона існує
    if (boxGroup) {
        scene.remove(boxGroup);
    }

    // Створення групи для коробки, кришки та ручок
    boxGroup = new THREE.Group();

    const cornerRadius = 0; // Радіус округлення кутів

    // Створення форми для нижньої частини коробки
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2 + cornerRadius, -height / 2);
    shape.lineTo(width / 2 - cornerRadius, -height / 2);
    shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + cornerRadius);
    shape.lineTo(width / 2, height / 2 - cornerRadius);
    shape.lineTo(-width / 2, height / 2 - cornerRadius);
    shape.lineTo(-width / 2, -height / 2 + cornerRadius);
    shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + cornerRadius, -height / 2);

    // Екструзія форми для створення об'єму коробки
    const extrudeSettings = { depth: depth, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    geometry.center(); // Центрування геометрії коробки

    const material = new THREE.MeshBasicMaterial({ color: 0xfffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    box = new THREE.Mesh(geometry, material);

    // Додавання контурів коробки
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial);

    boxGroup.add(box); // Додати коробку до групи
    boxGroup.add(edgeLines); // Додати контури

    // Додавання кришки
    if (withLid ===  false) {
        const lidGroup = createLidWithWalls(depth, width, height);  // Міняємо на відповідні параметри
        boxGroup.add(lidGroup);
    }

    // Додавання ручок
    addHandles(width, depth, height, boxGroup);

    scene.add(boxGroup);
}

// FUNCTION FOR ADDING HANDLES

function addHandles(width, depth, height, boxGroup) {
    const handleMaterial = new THREE.LineBasicMaterial({ color: 0x000000 }); // Матеріал для контуру ручки
    const handleWidth = 6; // Ширина ручки
    const handleHeight = 0.5; // Товщина ручки
    const handleDepth = 0.1; // Глибина ручки
    const cornerRadius = 0.3; // Радіус закруглення кутів
    const circleRadius = 0.1; // Радіус маленьких вертикальних циліндрів
    const circleHeight = 0.1; // Висота маленьких вертикальних циліндрів

    // Відстань ручок від верхньої частини коробки
    const handleYPosition = height * 0.1;

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

    // Передня ручка (паралельна передній стінці коробки)
    const handleFront = new THREE.Line(handleGeometry, handleMaterial);
    handleFront.position.set(0, handleYPosition, depth / 2 + handleDepth / 2); // Розташування перед ручкою
    boxGroup.add(handleFront);

    // Задня ручка (паралельна задній стінці коробки)
    const handleBack = new THREE.Line(handleGeometry, handleMaterial);
    handleBack.position.set(0, handleYPosition, -depth / 2 - handleDepth / 2); // Розташування зад ручкою
    boxGroup.add(handleBack);

    // Створення маленьких вертикальних циліндрів для ручок
    const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    // Ліві циліндри
    const cylinderLeft = new THREE.Mesh(new THREE.CylinderGeometry(circleRadius, circleRadius, circleHeight, 32), cylinderMaterial);
    cylinderLeft.position.set(-handleWidth / 3 + circleRadius, handleYPosition, depth / 2 + handleDepth / 2);
    cylinderLeft.rotation.x = Math.PI / 2; // Оборот для вертикального положення
    boxGroup.add(cylinderLeft);

    // Праві циліндри
    const cylinderRight = new THREE.Mesh(new THREE.CylinderGeometry(circleRadius, circleRadius, circleHeight, 32), cylinderMaterial);
    cylinderRight.position.set(handleWidth / 3 - circleRadius, handleYPosition, depth / 2 + handleDepth / 2);
    cylinderRight.rotation.x = Math.PI / 2; // Оборот для вертикального положення
    boxGroup.add(cylinderRight);

    // Ліві циліндри для задньої ручки
    const cylinderLeftBack = new THREE.Mesh(new THREE.CylinderGeometry(circleRadius, circleRadius, circleHeight, 32), cylinderMaterial);
    cylinderLeftBack.position.set(-handleWidth / 3 + circleRadius, handleYPosition, -depth / 2 - handleDepth / 2);
    cylinderLeftBack.rotation.x = Math.PI / 2; // Оборот для вертикального положення
    boxGroup.add(cylinderLeftBack);

    // Праві циліндри для задньої ручки
    const cylinderRightBack = new THREE.Mesh(new THREE.CylinderGeometry(circleRadius, circleRadius, circleHeight, 32), cylinderMaterial);
    cylinderRightBack.position.set(handleWidth / 3 - circleRadius, handleYPosition, -depth / 2 - handleDepth / 2);
    cylinderRightBack.rotation.x = Math.PI / 2; // Оборот для вертикального положення
    boxGroup.add(cylinderRightBack);

    // Дублювання циліндрів для ручок

    // передній лівий циліндр (біля заокруглення)
    const cylinderBottomLeft = new THREE.Mesh(new THREE.CylinderGeometry(circleRadius, circleRadius, circleHeight, 32), cylinderMaterial);
    cylinderBottomLeft.position.set(-handleWidth / 2.15, handleYPosition, depth / 2 + handleDepth / 2);
    cylinderBottomLeft.rotation.x = Math.PI / 2; // Оборот для вертикального положення
    boxGroup.add(cylinderBottomLeft);

    // передній правий циліндр (біля заокруглення)
    const cylinderBottomRight = new THREE.Mesh(new THREE.CylinderGeometry(circleRadius, circleRadius, circleHeight, 32), cylinderMaterial);
    cylinderBottomRight.position.set(handleWidth / 2.15, handleYPosition, depth / 2 + handleDepth / 2);
    cylinderBottomRight.rotation.x = Math.PI / 2; // Оборот для вертикального положення
    boxGroup.add(cylinderBottomRight);

    // Ліві циліндри для задньої ручки (біля заокруглення)
    const cylinderLeftRoundBack = new THREE.Mesh(new THREE.CylinderGeometry(circleRadius, circleRadius, circleHeight, 32), cylinderMaterial);
    cylinderLeftRoundBack.position.set(-handleWidth / 2.15 + circleRadius, handleYPosition, -depth / 2 - handleDepth / 2);
    cylinderLeftRoundBack.rotation.x = Math.PI / 2; // Оборот для вертикального положення
    boxGroup.add(cylinderLeftRoundBack);

    // Праві циліндри для задньої ручки (біля заокруглення)
    const cylinderRightRoundBack = new THREE.Mesh(new THREE.CylinderGeometry(circleRadius, circleRadius, circleHeight, 32), cylinderMaterial);
    cylinderRightRoundBack.position.set(handleWidth / 2.15 - circleRadius, handleYPosition, -depth / 2 - handleDepth / 2);
    cylinderRightRoundBack.rotation.x = Math.PI / 2; // Оборот для вертикального положення
    boxGroup.add(cylinderRightRoundBack);
    }


// FUNCTION FOR LID

function createLidWithWalls( depth,width, height, wallThickness = 1) {
    // Група для кришки
    const lidGroup = new THREE.Group();

    // Основна площина кришки
    const lidGeometry = new THREE.BoxGeometry(width, wallThickness, depth);
    const lidMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const lidMesh = new THREE.Mesh(lidGeometry, lidMaterial);

    lidMesh.position.set(0, height / 2 + wallThickness / 40, 0); // Розташування кришки
    lidGroup.add(lidMesh);

    // Чорний контур для верхньої площини кришки
    const lidEdges = new THREE.EdgesGeometry(lidGeometry);
    const lidLine = new THREE.LineSegments(lidEdges, new THREE.LineBasicMaterial({ color: 0x000000 }));
    lidLine.position.copy(lidMesh.position);
    lidGroup.add(lidLine);

    return lidGroup;
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
