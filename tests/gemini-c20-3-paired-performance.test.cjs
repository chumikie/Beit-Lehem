'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'scripts/paired-performance.cjs'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/test.yml'),'utf8');

test('C20.3.5: paired temporary builds are from precise SHAs in the same runner',()=>{
 assert.match(source,/c208b809cc3c633a9458631bd0d80e3c504d57de/);
 assert.match(source,/git',\['worktree','add','--detach'/);
 assert.match(source,/\['A','B','B','A','B','A'\]/);
 assert.match(source,/baselineSha,optimizedSha/);
 assert.match(source,/window\.__pairRoad/);
 assert.match(source,/longTasks/);
 assert.match(workflow,/fetch-depth: 0/);
 assert.match(workflow,/node scripts\/paired-performance\.cjs/);
 assert.doesNotMatch(source,/git push|gh-pages|publicacao\/index\.html/);
});
