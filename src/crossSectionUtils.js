// crossSectionUtils.js
import * as THREE from 'three';

// Funkce pro kontrolu průsečíku hrany s rovinou
function checkEdge(v1, v2, plane, intersectionPoints) {
    const epsilon = 1e-6; // Tolerance pro floating-point čísla
    const d1 = plane.distanceToPoint(v1);
    const d2 = plane.distanceToPoint(v2);
    
    const d1IsZero = Math.abs(d1) < epsilon;
    const d2IsZero = Math.abs(d2) < epsilon;
    
    // Pokud oba body leží na rovině, použijeme oba jako průsečíky
    if (d1IsZero && d2IsZero) {
        intersectionPoints.push(v1.clone(), v2.clone());
        return;
    }
    
    // Pokud jeden bod leží na rovině
    if (d1IsZero) {
        intersectionPoints.push(v1.clone());
        return;
    }
    
    if (d2IsZero) {
        intersectionPoints.push(v2.clone());
        return;
    }
    
    // Hrana protíná rovinu, pokud body leží na opačných stranách
    if ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) {
        const t = d1 / (d1 - d2);
        const intersection = new THREE.Vector3().lerpVectors(v1, v2, t);
        intersectionPoints.push(intersection);
    }
}

// Funkce pro vytvoření průřezových čar
function createCrossSectionLines(mesh, plane, crossSectionColor) {
    const lines = [];
    const geometry = mesh.geometry;
    
    if (!geometry || !geometry.attributes.position) {
        return null;
    }
    
    const position = geometry.attributes.position;
    const indices = geometry.index ? geometry.index.array : null;
    
    // Získání všech vrcholů s aplikací world transformace
    const vertices = [];
    for (let i = 0; i < position.count; i++) {
        vertices.push(new THREE.Vector3(
            position.getX(i),
            position.getY(i),
            position.getZ(i)
        ).applyMatrix4(mesh.matrixWorld));
    }
    
    const triangleCount = indices ? indices.length / 3 : vertices.length / 3;
    
    // Pro každý trojúhelník najdeme průsečíky s rovinou
    for (let i = 0; i < triangleCount; i++) {
        const i0 = indices ? indices[i * 3] : i * 3;
        const i1 = indices ? indices[i * 3 + 1] : i * 3 + 1;
        const i2 = indices ? indices[i * 3 + 2] : i * 3 + 2;
        
        const v0 = vertices[i0];
        const v1 = vertices[i1];
        const v2 = vertices[i2];
        
        const intersectionPoints = [];
        
        // Kontrola každé hrany trojúhelníku
        checkEdge(v0, v1, plane, intersectionPoints);
        checkEdge(v1, v2, plane, intersectionPoints);
        checkEdge(v2, v0, plane, intersectionPoints);
        
        // Odstraníme duplicitní body (pokud vrchol leží na rovině, může být přidán vícekrát)
        const uniquePoints = [];
        const epsilon = 1e-6;
        
        for (const point of intersectionPoints) {
            const isDuplicate = uniquePoints.some(p => 
                p.distanceToSquared(point) < epsilon * epsilon
            );
            if (!isDuplicate) {
                uniquePoints.push(point);
            }
        }
        
        // Pokud máme alespoň 2 unikátní průsečíky, vytvoříme čáru
        if (uniquePoints.length >= 2) {
            // Použijeme první dva body (pro trojúhelník by měly být max 2 po deduplikaci)
            lines.push(uniquePoints[0], uniquePoints[1]);
        }
    }
    
    if (lines.length === 0) {
        return null;
    }
    
    // Vytvoření LineSegments
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(lines);
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(crossSectionColor),
        linewidth: 2 
    });
    return new THREE.LineSegments(lineGeometry, lineMaterial);
}

// Funkce pro aktualizaci průřezových čar
export function updateCrossSectionLines(scene, currentCrossSectionLines, viewProp, meshObjects) {
    // Odstraníme staré čáry
    if (currentCrossSectionLines) {
        scene.remove(currentCrossSectionLines);
        currentCrossSectionLines.geometry.dispose();
        currentCrossSectionLines.material.dispose();
    }
    
    if (!viewProp.showCrossSection) {
        return null;
    }
    
    // Vytvoříme rovinu podle výběru
    let planeNormal, planeConstant;
    
    switch (viewProp.crossSectionPlane) {
        case 'XY':
            planeNormal = new THREE.Vector3(0, 0, 1);
            planeConstant = -viewProp.crossSectionPos;
            break;
        case 'XZ':
            planeNormal = new THREE.Vector3(0, 1, 0);
            planeConstant = -viewProp.crossSectionPos;
            break;
        case 'YZ':
            planeNormal = new THREE.Vector3(1, 0, 0);
            planeConstant = -viewProp.crossSectionPos;
            break;
    }
    
    const plane = new THREE.Plane(planeNormal, planeConstant);
    
    // Projdeme všechny meshe ve scéně
    const allLines = [];
    
    meshObjects.forEach(obj => {
        obj.traverse((child) => {
            if (child.isMesh && child.visible) {
                const lines = createCrossSectionLines(child, plane, viewProp.crossSectionColor);
                if (lines && lines.geometry.attributes.position.count > 0) {
                    allLines.push(lines);
                }
            }
        });
    });
    
    // Spojíme všechny čáry do jednoho objektu
    if (allLines.length > 0) {
        const combinedGeometry = new THREE.BufferGeometry();
        const positions = [];
        
        allLines.forEach(lineObj => {
            const pos = lineObj.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
            }
            lineObj.geometry.dispose();
            lineObj.material.dispose();
        });
        
        combinedGeometry.setAttribute('position', 
            new THREE.Float32BufferAttribute(positions, 3));
        
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: new THREE.Color(viewProp.crossSectionColor),
            linewidth: 2 
        });
        
        const newCrossSectionLines = new THREE.LineSegments(combinedGeometry, lineMaterial);
        scene.add(newCrossSectionLines);
        return newCrossSectionLines;
    }
    
    return null;
}
