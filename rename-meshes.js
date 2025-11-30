/**
 * GLB Mesh Renamer Script
 * This script renames meshes in .glb files to proper English names
 */

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import * as fs from 'fs';
import * as path from 'path';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

// Define renaming rules for each model
const renamingRules = {
    'Engine.glb': {
        // Lithuanian to English mappings
        'galvos_dangtelis': 'valve_cover',
        'galvos dangtelis': 'valve_cover',
        'cilindro': 'cylinder',
        'starteris': 'starter',
        'generatorius': 'alternator',
        'variklis': 'engine_block',
        'karbiuratorius': 'carburetor',
        'oro_filtras': 'air_filter',
        'tepalo_siurblys': 'oil_pump',
        'vandens_siurblys': 'water_pump',
        'iskrova': 'spark_plug',
        'uzdegimo_rite': 'ignition_coil',
        // Add more as needed
    },
    'BRAKE.glb': {
        'stabdžiai': 'brake',
        'stabdziu': 'brake',
        'kaladele': 'brake_pad',
        'diskas': 'rotor',
        'cilindelis': 'caliper',
        'skysčio': 'fluid',
        // Add more
    },
    'Suspension.glb': {
        'pakaba': 'suspension',
        'amortizatorius': 'shock_absorber',
        'spyruokle': 'spring',
        'stabilizatorius': 'sway_bar',
        'svirtis': 'control_arm',
        'guolis': 'bearing',
        // Add more
    },
    'Steering.glg': {
        'vairas': 'steering_wheel',
        'vairo_kolonele': 'steering_column',
        'vairo_mechanizmas': 'steering_rack',
        'traukė': 'tie_rod',
        // Add more
    },
    'Transmission(No Anim).glb': {
        'pavarų_dėžė': 'transmission',
        'sankaba': 'clutch',
        'begis': 'gear',
        'ašis': 'shaft',
        // Add more
    },
    'Electrical.glb': {
        'baterija': 'battery',
        'sakotuve': 'fuse_box',
        'laidai': 'wiring',
        'lempa': 'lamp',
        // Add more
    }
};

// Generic name cleaner - converts any weird naming to readable English
function cleanMeshName(name, modelRules) {
    // First check specific rules for this model
    if (modelRules) {
        for (const [pattern, replacement] of Object.entries(modelRules)) {
            if (name.toLowerCase().includes(pattern.toLowerCase())) {
                return replacement;
            }
        }
    }

    // Generic cleanup
    let cleaned = name
        .replace(/Object_\d+/g, '')  // Remove Object_123
        .replace(/Mesh_\d+/g, '')    // Remove Mesh_123
        .replace(/\d{3,}/g, '')      // Remove long numbers
        .replace(/_primitive\d+/g, '') // Remove _primitive0
        .replace(/\.|\-/g, '_')      // Replace dots and dashes with underscores
        .replace(/_{2,}/g, '_')      // Replace multiple underscores with single
        .replace(/^_|_$/g, '')       // Remove leading/trailing underscores
        .toLowerCase()
        .trim();

    // If name is now empty or too generic, make it descriptive
    if (!cleaned || cleaned.length < 2 || /^(mesh|object|node)$/i.test(cleaned)) {
        return 'component';
    }

    return cleaned;
}

async function renameMeshesInModel(modelPath, outputPath, rules) {
    console.log(`\n🔧 Processing: ${path.basename(modelPath)}`);

    try {
        // Load the GLB file
        const document = await io.read(modelPath);

        const root = document.getRoot();
        const nodes = root.listNodes();

        let renamedCount = 0;
        const seenNames = new Map();

        console.log(`   Found ${nodes.length} nodes`);

        nodes.forEach((node, index) => {
            const oldName = node.getName() || `unnamed_${index}`;
            let newName = cleanMeshName(oldName, rules);

            // Ensure unique names
            if (seenNames.has(newName)) {
                const count = seenNames.get(newName);
                seenNames.set(newName, count + 1);
                newName = `${newName}_${count + 1}`;
            } else {
                seenNames.set(newName, 1);
            }

            if (oldName !== newName) {
                console.log(`   ✓ "${oldName}" → "${newName}"`);
                node.setName(newName);
                renamedCount++;
            }
        });

        // Also rename meshes
        const meshes = root.listMeshes();
        console.log(`   Found ${meshes.length} meshes`);

        meshes.forEach((mesh, index) => {
            const oldName = mesh.getName() || `mesh_${index}`;
            let newName = cleanMeshName(oldName, rules);

            if (seenNames.has(newName)) {
                const count = seenNames.get(newName);
                seenNames.set(newName, count + 1);
                newName = `${newName}_${count + 1}`;
            } else {
                seenNames.set(newName, 1);
            }

            if (oldName !== newName) {
                console.log(`   ✓ Mesh: "${oldName}" → "${newName}"`);
                mesh.setName(newName);
                renamedCount++;
            }
        });

        // Save the modified GLB
        await io.write(outputPath, document);

        console.log(`   ✅ Renamed ${renamedCount} items`);
        console.log(`   💾 Saved to: ${path.basename(outputPath)}`);

    } catch (error) {
        console.error(`   ❌ Error processing ${modelPath}:`, error.message);
    }
}

async function main() {
    const modelsDir = path.join(process.cwd(), 'public', 'models');
    const backupDir = path.join(modelsDir, 'backup');

    // Create backup directory
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log('🚀 GLB Mesh Renaming Tool\n');
    console.log(`📁 Models directory: ${modelsDir}`);
    console.log(`📁 Backup directory: ${backupDir}\n`);

    const modelFiles = [
        'Engine.glb',
        'BRAKE.glb',
        'Suspension.glb',
        'Steering.glb',
        'Transmission(No Anim).glb',
        'Electrical.glb'
    ];

    for (const modelFile of modelFiles) {
        const modelPath = path.join(modelsDir, modelFile);
        const backupPath = path.join(backupDir, modelFile);
        const outputPath = modelPath; // Overwrite original

        if (fs.existsSync(modelPath)) {
            // Backup original
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(modelPath, backupPath);
                console.log(`📦 Backed up original to: backup/${modelFile}`);
            }

            // Rename meshes
            const rules = renamingRules[modelFile] || {};
            await renameMeshesInModel(modelPath, outputPath, rules);
        } else {
            console.log(`⚠️  Model not found: ${modelFile}`);
        }
    }

    console.log('\n✨ All done! Models have been renamed and originals backed up.');
    console.log('   If something went wrong, restore from public/models/backup/\n');
}

main().catch(console.error);
