'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const community=require('../dist/street-community.js');
const source=fs.readFileSync(require.resolve('../gemini-modules/game.js'),'utf8');
const start=source.indexOf('function restoreCityReports('),end=source.indexOf('function closestNamedRoad(',start);
assert.ok(start>=0&&end>start);
const {restoreCityReports,cityReportCandidate}=new Function(source.slice(start,end)+';return {restoreCityReports,cityReportCandidate};')();

test('relato retrospectivo depende de um evento da agenda de um dia já encerrado',()=>{
 assert.equal(cityReportCandidate(community.EVENTS,1,'damiao',[],[]),null);
 const report=cityReportCandidate(community.EVENTS,2,'damiao',[],[]);
 assert.equal(report.event.id,'fitas-de-bom-dia');
 assert.equal(report.day,1);
 assert.equal(report.source,'ouvido');
 assert.equal(cityReportCandidate(community.EVENTS,2,'bia',[],[]),null);
});

test('um encontro presenciado não é reclassificado como história ouvida',()=>{
 assert.equal(cityReportCandidate(community.EVENTS,2,'damiao',['fitas-de-bom-dia'],[]),null);
 const first=cityReportCandidate(community.EVENTS,2,'damiao',[],[]);
 assert.equal(cityReportCandidate(community.EVENTS,2,'damiao',[],[{id:first.event.id,day:first.day}]),null);
});

test('o dia e a fonte persistem sem permitir encontros fictícios inventados',()=>{
 const restored=restoreCityReports([
  {id:'fitas-de-bom-dia',day:1,from:'damiao',source:'ouvido'},
  {id:'fitas-de-bom-dia',day:1,from:'damiao'},
  {id:'fitas-de-bom-dia',day:2,from:'damiao'},
  {id:'inventado',day:1,from:'bia'},
  {id:'caderno-compartilhado',day:3,from:'bia'},
  {id:'bilhete-de-volta',day:7,from:'bia'}
 ],5,community.EVENTS);
 assert.deepEqual(restored,[
  {id:'fitas-de-bom-dia',day:1,from:'damiao',source:'ouvido'},
  {id:'caderno-compartilhado',day:3,from:'bia',source:'ouvido'}
 ]);
 assert.deepEqual(restoreCityReports(null,8,community.EVENTS),[]);
});

test('a agenda semanal permite relatos diferentes conforme os dias passam',()=>{
 const t=cityReportCandidate(community.EVENTS,7,'damiao',[],[]);
 assert.equal(t.event.id,'recado-da-feira');
 assert.equal(t.day,6);
 const bia=cityReportCandidate(community.EVENTS,8,'bia',[],[]);
 assert.equal(bia.event.id,'bilhete-de-volta');
 assert.equal(bia.day,7);
 assert.match(source,/Você soube por um relato, não presenciou/);
 assert.match(source,/Presenciou: /);
 assert.match(source,/Ouviu: /);
});
