const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const BUILD_JS_DIR = path.join(__dirname, 'build', 'static', 'js');

function getJsFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) {
        console.error(`❌ Directory not found: ${dir}`);
        return results;
    }
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getJsFiles(file));
        } else if (file.endsWith('.js') && !file.endsWith('.map')) {
            results.push(file);
        }
    });
    return results;
}

// Функция для определения, содержит ли файл Three.js код
function isThreeJsFile(content) {
    const threeKeywords = [
        'THREE', 'WebGLRenderer', 'Scene', 'PerspectiveCamera',
        'OrbitControls', 'GLTFLoader', 'BoxGeometry', 'MeshStandardMaterial',
        'renderer', 'scene', 'camera', 'frame', 'geometry', 'material'
    ];
    return threeKeywords.some(keyword => content.includes(keyword));
}

console.log('🔒 Starting Obfuscation of build/static/js...');

try {
    const files = getJsFiles(BUILD_JS_DIR);
    
    if (files.length === 0) {
        console.warn('⚠️ No JS files found to obfuscate.');
        process.exit(0);
    }

    files.forEach(filePath => {
        const code = fs.readFileSync(filePath, 'utf8');
        const isThreeJs = isThreeJsFile(code);
        
        // РАЗНЫЕ НАСТРОЙКИ для Three.js и обычного кода
        const obfuscationOptions = isThreeJs ? {
            // Щадящие настройки для Three.js
            compact: true,
            controlFlowFlattening: false,  // ОТКЛЮЧАЕМ для Three.js
            deadCodeInjection: false,      // ОТКЛЮЧАЕМ
            debugProtection: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: false,   // ОТКЛЮЧАЕМ
            simplify: true,
            stringArray: false,            // ГЛАВНОЕ: ОТКЛЮЧАЕМ массив строк
            rotateStringArray: false,
            selfDefending: true,
            splitStrings: false,
            transformObjectKeys: false,    // ГЛАВНОЕ: НЕ трогаем ключи объектов
            unicodeEscapeSequence: false,
            // Сохраняем важные имена
            reservedNames: [
                'frame', 'material', 'geometry', 'position', 'scale', 
                'rotation', 'matrix', 'scene', 'camera', 'renderer',
                'controls', 'animate', 'update', 'render', 'add', 'remove',
                'children', 'parent', 'userData', 'name', 'uuid'
            ],
            // Сохраняем важные строки
            reservedStrings: [
                'frame', 'material', 'geometry', 'position', 'scale',
                'rotation', 'matrix'
            ]
        } : {
            // Агрессивные настройки для обычного кода
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            debugProtection: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: true,
            simplify: true,
            stringArray: true,
            rotateStringArray: true,
            selfDefending: true,
            splitStrings: true,
            stringArrayThreshold: 0.75,
            transformObjectKeys: true,
            unicodeEscapeSequence: false
        };
        
        // Для всех файлов - базовая защита без ломки Three.js
        const safeOptions = {
            compact: true,
            controlFlowFlattening: false,
            deadCodeInjection: false,
            debugProtection: false,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: false,
            simplify: true,
            stringArray: false,
            rotateStringArray: false,
            selfDefending: true,
            splitStrings: false,
            transformObjectKeys: false,
            unicodeEscapeSequence: false,
            // Сохраняем все возможные имена, нужные Three.js
            reservedNames: [
                'frame', 'material', 'geometry', 'position', 'scale',
                'rotation', 'matrix', 'scene', 'camera', 'renderer',
                'controls', 'animate', 'update', 'render', 'add', 'remove',
                'children', 'parent', 'userData', 'name', 'uuid',
                'castShadow', 'receiveShadow', 'shadowMap', 'map',
                'color', 'emissive', 'roughness', 'metalness',
                'normalMap', 'bumpMap', 'displacementMap',
                'transparent', 'opacity', 'blending', 'side',
                'wireframe', 'visible', 'frustumCulled',
                'matrixAutoUpdate', 'matrixWorld', 'modelViewMatrix',
                'projectionMatrix', 'normalMatrix', 'viewMatrix'
            ]
        };
        
        // ИСПОЛЬЗУЕМ БЕЗОПАСНЫЕ НАСТРОЙКИ для всех файлов
        const obfuscationResult = JavaScriptObfuscator.obfuscate(code, safeOptions);
        
        fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode(), 'utf8');
        
        const fileType = isThreeJs ? 'Three.js' : 'regular';
        console.log(`✅ Obfuscated (${fileType}): ${path.basename(filePath)}`);
    });

    // Удаляем Source Maps
    const deleteMapFiles = (dir) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                deleteMapFiles(filePath);
            } else if (file.endsWith('.map')) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Deleted source map: ${file}`);
            }
        });
    };
    
    deleteMapFiles(BUILD_JS_DIR);
    
    const BUILD_CSS_DIR = path.join(__dirname, 'build', 'static', 'css');
    deleteMapFiles(BUILD_CSS_DIR);
    
    // Дополнительно: создаем файл .htaccess для запрета доступа к исходникам (если используете Apache)
    const htaccessPath = path.join(__dirname, 'build', '.htaccess');
    if (fs.existsSync(htaccessPath)) {
        fs.appendFileSync(htaccessPath, '\n# Protect source files\n<FilesMatch "\\.(map|js\\.map|css\\.map)$">\n    Order allow,deny\n    Deny from all\n</FilesMatch>\n');
        console.log('✅ Updated .htaccess');
    }
    
    console.log('🎉 Obfuscation completed successfully!');
    console.log('⚠️ Three.js code was processed with SAFE settings to prevent runtime errors');
    
} catch (error) {
    console.error('❌ Error during obfuscation:', error);
    process.exit(1);
}