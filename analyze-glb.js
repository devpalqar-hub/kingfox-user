const fs = require('fs');

function analyzeGLB(filePath) {
  const buffer = fs.readFileSync(filePath);
  const magic = buffer.toString('utf8', 0, 4);
  if (magic !== 'glTF') { console.log(filePath, '- NOT GLB'); return; }

  const chunkLength = buffer.readUInt32LE(12);
  const json = JSON.parse(buffer.toString('utf8', 20, 20 + chunkLength));

  console.log('\n=============================');
  console.log('FILE:', filePath);
  console.log('=============================');

  // Nodes with hierarchy
  console.log('\n[NODES]');
  (json.nodes || []).forEach((n, i) => {
    const hasMesh = n.mesh !== undefined;
    const children = n.children ? n.children.join(',') : 'none';
    const tx = n.translation ? n.translation.map(v => v.toFixed(3)).join(',') : '0,0,0';
    const sc = n.scale ? n.scale.map(v => v.toFixed(3)).join(',') : '1,1,1';
    const rot = n.rotation ? n.rotation.map(v => v.toFixed(3)).join(',') : '0,0,0,1';
    console.log(`  [${i}] name="${n.name||'unnamed'}" mesh=${n.mesh??'none'} children=[${children}] translation=[${tx}] scale=[${sc}] rotation=[${rot}]`);
  });

  // Meshes
  console.log('\n[MESHES]');
  (json.meshes || []).forEach((m, i) => {
    console.log(`  [${i}] name="${m.name||'unnamed'}" primitives=${m.primitives.length}`);
    m.primitives.forEach((p, pi) => {
      const acc = json.accessors[p.attributes.POSITION];
      if (acc) {
        const mn = acc.min ? acc.min.map(v=>v.toFixed(4)).join(',') : '?';
        const mx = acc.max ? acc.max.map(v=>v.toFixed(4)).join(',') : '?';
        const count = acc.count;
        console.log(`    prim[${pi}]: vertices=${count} min=[${mn}] max=[${mx}]`);
      }
    });
  });

  // Materials
  console.log('\n[MATERIALS]');
  (json.materials || []).forEach((m, i) => {
    console.log(`  [${i}] name="${m.name||'unnamed'}" alphaMode=${m.alphaMode||'OPAQUE'} doubleSided=${!!m.doubleSided}`);
  });

  // Scenes
  console.log('\n[SCENE root nodes]', json.scenes?.[0]?.nodes);
}

analyzeGLB('./public/models/shirt_baked.glb');
analyzeGLB('./public/models/hoodie.glb');
analyzeGLB('./public/models/LongSleeveTshirt.glb');