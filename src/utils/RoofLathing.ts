// src/utils/RoofLathing.ts
import * as THREE from 'three';
import { createPipeBetweenPoints, createPipeThroughPoints } from './ThreeUtils';

export interface LathingParams {
    width: number;
    length: number;
    height: number;
    roofHeight: number;
    step: number;
    tubeRadius: number;
    color: number;
    roofType: 'flat' | 'arched' | 'gable';
}

/**
 * Создаёт обрешётку для плоской крыши
 */
export function createFlatLathing(params: LathingParams): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    const rows = Math.ceil(params.length / params.step) + 1;
    const y = params.height + params.roofHeight;
    
    for (let i = 0; i < rows; i++) {
        const t = i / (rows - 1);
        const z = -params.length / 2 + t * params.length;
        
        const pipe = createPipeBetweenPoints(
            new THREE.Vector3(-params.width / 2, y, z),
            new THREE.Vector3(params.width / 2, y, z),
            params.tubeRadius,
            params.color
        );
        if (pipe) meshes.push(pipe);
    }
    
    return meshes;
}

/**
 * Создаёт обрешётку для арочной крыши
 * Трубы идут ВДОЛЬ длины навеса (по оси Z) и изгибаются по форме арки
 */
export function createArchedLathing(params: LathingParams): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    // Количество труб обрешетки вдоль ширины (поперек)
    const rows = Math.ceil(params.width / params.step) + 1;
    
    for (let i = 0; i < rows; i++) {
        const t = i / (rows - 1);
        const x = -params.width / 2 + t * params.width;
        
        // Вычисляем Y для этой позиции X на арке
        const yOnArch = params.height + params.roofHeight * (1 - Math.pow(2 * t - 1, 2));
        
        // Создаём трубу от начала до конца длины навеса
        const pipe = createPipeBetweenPoints(
            new THREE.Vector3(x, yOnArch, -params.length / 2),
            new THREE.Vector3(x, yOnArch, params.length / 2),
            params.tubeRadius,
            params.color
        );
        if (pipe) meshes.push(pipe);
    }
    
    return meshes;
}

/**
 * Создаёт обрешётку для двускатной крыши
 */
export function createGableLathing(params: LathingParams): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    const rows = Math.ceil(params.width / params.step) + 1;
    const ridgeHeight = params.height + params.roofHeight;
    const eaveHeight = params.height;
    
    for (let i = 0; i < rows; i++) {
        const t = i / (rows - 1);
        const x = -params.width / 2 + t * params.width;
        
        // Треугольная форма двускатной крыши
        const absX = Math.abs(x);
        const y = ridgeHeight - (ridgeHeight - eaveHeight) * (absX * 2 / params.width);
        
        const pipe = createPipeBetweenPoints(
            new THREE.Vector3(x, y, -params.length / 2),
            new THREE.Vector3(x, y, params.length / 2),
            params.tubeRadius,
            params.color
        );
        if (pipe) meshes.push(pipe);
    }
    
    return meshes;
}