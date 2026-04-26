// src/utils/ThreeUtils.ts
import * as THREE from 'three';

/**
 * Создаёт трубу (цилиндр) между двумя точками в 3D пространстве
 * @param p1 - Начальная точка
 * @param p2 - Конечная точка
 * @param radius - Радиус трубы
 * @param color - Цвет трубы (hex number или THREE.Color)
 * @returns Mesh - созданная труба или null
 */
export function createPipeBetweenPoints(
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    radius: number,
    color: number | THREE.Color = 0x888888
): THREE.Mesh | null {
    // Вычисляем расстояние между точками
    const direction = new THREE.Vector3().subVectors(p2, p1);
    const length = direction.length();
    
    if (length < 0.001) return null;
    
    // Создаём цилиндр
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 12);
    const material = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 });
    const cylinder = new THREE.Mesh(geometry, material);
    
    // Позиционируем посередине между точками
    const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    cylinder.position.copy(center);
    
    // Поворачиваем цилиндр в нужном направлении
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize()
    );
    cylinder.quaternion.copy(quaternion);
    
    return cylinder;
}

/**
 * Создаёт трубу между двумя точками с заданным сечением (прямоугольная труба)
 * @param p1 - Начальная точка
 * @param p2 - Конечная точка
 * @param width - Ширина трубы
 * @param height - Высота трубы
 * @param color - Цвет трубы
 * @returns Mesh - созданная труба или null
 */
export function createRectPipeBetweenPoints(
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    width: number,
    height: number,
    color: number | THREE.Color = 0x888888
): THREE.Mesh | null {
    const direction = new THREE.Vector3().subVectors(p2, p1);
    const length = direction.length();
    
    if (length < 0.001) return null;
    
    // Создаём прямоугольный параллелепипед
    const geometry = new THREE.BoxGeometry(width, length, height);
    const material = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 });
    const box = new THREE.Mesh(geometry, material);
    
    // Позиционируем посередине
    const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    box.position.copy(center);
    
    // Поворачиваем
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize()
    );
    box.quaternion.copy(quaternion);
    
    return box;
}

/**
 * Создаёт набор труб, соединяющих последовательность точек (ломаная линия)
 * @param points - Массив точек
 * @param radius - Радиус трубы
 * @param color - Цвет
 * @returns Массив Mesh
 */
export function createPipeThroughPoints(
    points: THREE.Vector3[],
    radius: number,
    color: number | THREE.Color = 0x888888
): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
        const pipe = createPipeBetweenPoints(points[i], points[i + 1], radius, color);
        if (pipe) meshes.push(pipe);
    }
    
    return meshes;
}

/**
 * Создаёт дугу (арку) из трубы
 * @param center - Центр арки
 * @param radius - Радиус арки
 * @param startAngle - Начальный угол (радианы)
 * @param endAngle - Конечный угол (радианы)
 * @param tubeRadius - Толщина трубы
 * @param segments - Количество сегментов
 * @param color - Цвет
 * @returns Массив Mesh
 */
export function createArcPipe(
    center: THREE.Vector3,
    radius: number,
    startAngle: number,
    endAngle: number,
    tubeRadius: number,
    segments: number = 20,
    color: number | THREE.Color = 0x888888
): THREE.Mesh[] {
    const points: THREE.Vector3[] = [];
    const angleStep = (endAngle - startAngle) / segments;
    
    for (let i = 0; i <= segments; i++) {
        const angle = startAngle + i * angleStep;
        const x = center.x + radius * Math.cos(angle);
        const z = center.z + radius * Math.sin(angle);
        points.push(new THREE.Vector3(x, center.y, z));
    }
    
    return createPipeThroughPoints(points, tubeRadius, color);
}

/**
 * Создаёт параболическую арку (для арочных навесов)
 * @param start - Начальная точка
 * @param end - Конечная точка
 * @param height - Высота арки в середине
 * @param tubeRadius - Толщина трубы
 * @param segments - Количество сегментов
 * @param color - Цвет
 * @returns Массив Mesh
 */
export function createParabolicArc(
    start: THREE.Vector3,
    end: THREE.Vector3,
    height: number,
    tubeRadius: number,
    segments: number = 20,
    color: number | THREE.Color = 0x888888
): THREE.Mesh[] {
    const points: THREE.Vector3[] = [];
    const width = end.x - start.x;
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = start.x + t * width;
        // Парабола: y = -4 * height * (x - centerX)^2 / width^2 + height
        const centerX = (start.x + end.x) / 2;
        const offsetX = x - centerX;
        const y = start.y + height * (1 - Math.pow(2 * t - 1, 2));
        points.push(new THREE.Vector3(x, y, start.z));
    }
    
    return createPipeThroughPoints(points, tubeRadius, color);
}

/**
 * Создаёт прямоугольную раму (периметр)
 * @param width - Ширина
 * @param depth - Глубина
 * @param y - Высота (Y координата)
 * @param pipeRadius - Толщина трубы
 * @param color - Цвет
 * @returns Массив Mesh
 */
export function createRectangularFrame(
    width: number,
    depth: number,
    y: number,
    pipeRadius: number,
    color: number | THREE.Color = 0x888888
): THREE.Mesh[] {
    const halfW = width / 2;
    const halfD = depth / 2;
    
    const corners = [
        new THREE.Vector3(-halfW, y, -halfD),
        new THREE.Vector3( halfW, y, -halfD),
        new THREE.Vector3( halfW, y,  halfD),
        new THREE.Vector3(-halfW, y,  halfD),
        new THREE.Vector3(-halfW, y, -halfD) // замыкаем
    ];
    
    return createPipeThroughPoints(corners, pipeRadius, color);
}

/**
 * Создаёт столб (стойку) с возможностью добавления оголовка и башмака
 * @param position - Позиция столба
 * @param height - Высота столба
 * @param width - Ширина столба
 * @param depth - Глубина столба
 * @param color - Цвет
 * @param withBasePlate - Добавить ли башмак (плиту внизу)
 * @param withCap - Добавить ли оголовок (плиту сверху)
 * @returns Массив Mesh
 */
export function createColumn(
    position: THREE.Vector3,
    height: number,
    width: number = 0.08,
    depth: number = 0.08,
    color: number | THREE.Color = 0x888888,
    withBasePlate: boolean = true,
    withCap: boolean = true
): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    const material = new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.3 });
    
    // Основное тело столба
    const columnGeo = new THREE.BoxGeometry(width, height, depth);
    const column = new THREE.Mesh(columnGeo, material);
    column.position.copy(position);
    column.position.y += height / 2;
    meshes.push(column);
    
    // Башмак (плита внизу)
    if (withBasePlate) {
        const plateGeo = new THREE.BoxGeometry(width * 1.8, 0.02, depth * 1.8);
        const plate = new THREE.Mesh(plateGeo, material);
        plate.position.copy(position);
        plate.position.y += 0.01;
        meshes.push(plate);
    }
    
    // Оголовок (плита сверху)
    if (withCap) {
        const capGeo = new THREE.BoxGeometry(width * 1.2, 0.02, depth * 1.2);
        const cap = new THREE.Mesh(capGeo, material);
        cap.position.copy(position);
        cap.position.y += height;
        meshes.push(cap);
    }
    
    return meshes;
}

/**
 * Создаёт сетку (обрешётку) из параллельных труб
 * @param start - Начальная точка
 * @param end - Конечная точка
 * @param count - Количество труб
 * @param pipeRadius - Толщина трубы
 * @param direction - Направление ('x' или 'z')
 * @param color - Цвет
 * @returns Массив Mesh
 */
export function createGrid(
    start: THREE.Vector3,
    end: THREE.Vector3,
    count: number,
    pipeRadius: number,
    direction: 'x' | 'z' = 'x',
    color: number | THREE.Color = 0x888888
): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    
    const step = direction === 'x' 
        ? (end.x - start.x) / (count - 1)
        : (end.z - start.z) / (count - 1);
    
    for (let i = 0; i < count; i++) {
        let p1: THREE.Vector3, p2: THREE.Vector3;
        
        if (direction === 'x') {
            const x = start.x + i * step;
            p1 = new THREE.Vector3(x, start.y, start.z);
            p2 = new THREE.Vector3(x, end.y, end.z);
        } else {
            const z = start.z + i * step;
            p1 = new THREE.Vector3(start.x, start.y, z);
            p2 = new THREE.Vector3(end.x, end.y, z);
        }
        
        const pipe = createPipeBetweenPoints(p1, p2, pipeRadius, color);
        if (pipe) meshes.push(pipe);
    }
    
    return meshes;
}