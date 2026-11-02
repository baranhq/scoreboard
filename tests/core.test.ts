import {test} from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import {buttonColors,contrast,validColor} from '../lib/colors.ts';
import {defaultTimer,pausedTimer,remainingTime,resetTimer,isGamePaused,parseTimer} from '../lib/timer.ts';
import {newBoard,backup,parseBackup,parseBackupText} from '../lib/boards.ts';
import {encodeGame,decodeGame} from '../lib/sharing.ts';
import {writeBoards,loadBoards,loadOrCreateBoard} from '../store/database.ts';

test('custom colours maintain readable controls across RGB colour space',()=>{
 for(let r=0;r<=255;r+=17)for(let g=0;g<=255;g+=17)for(let b=0;b<=255;b+=17){
  const bg='#'+[r,g,b].map(n=>n.toString(16).padStart(2,'0')).join('');const c=buttonColors(bg);
  assert.ok(contrast(bg,c.primary)>=3,bg);assert.ok(contrast(c.primary,c.text)>=4.5,bg);
  assert.ok(contrast(bg,c.hover)>=3,bg);assert.ok(contrast(c.hover,c.text)>=4.5,bg);
  assert.ok(contrast(bg,c.secondaryText)>=4.5,bg);
 }
 assert.equal(validColor('red; background:url(https://example.org)'),false);
});
test('pause and disable stop the timer, re-enable restores its configured time',()=>{
 const running={...defaultTimer,enabled:true,startedAt:1000};const paused=pausedTimer(running,6000);
 assert.equal(remainingTime(paused,999999),295000);assert.equal(isGamePaused(paused),true);
 const disabled=resetTimer(paused,false);assert.equal(disabled.startedAt,null);assert.equal(disabled.remainingMs,300000);
 assert.equal(isGamePaused(resetTimer(disabled,true)),false);
 assert.throws(()=>parseTimer({...defaultTimer,durationMs:-1}));
});
test('backups and URL snapshots preserve customisation and treat markup as plain data',()=>{
 const board=newBoard('<img src=x onerror=alert(1)>','Takım');board.accent='#123456';board.icon='trophy';board.teams[0].color='#ffffff';board.teams[0].score=42;
 const restored=parseBackup(backup([board]))[0];assert.equal(restored.name,board.name);assert.equal(restored.teams[0].score,42);assert.equal(restored.icon,'trophy');assert.notEqual(restored.id,board.id);
 const shared=decodeGame(encodeGame(board));assert.equal(shared.sourceId,board.id);assert.equal(shared.board.accent,'#123456');
 assert.throws(()=>decodeGame('../malicious'));assert.throws(()=>parseBackup(backup([{...board,accent:'javascript:alert(1)'}])));
 assert.throws(()=>parseBackup({...backup([board]),boards:[{...board,icon:'not-an-icon'}]}));
 assert.throws(()=>parseBackupText('['.repeat(40)+'0'+']'.repeat(40)));
 assert.throws(()=>parseBackup({...backup([board]),boards:Array(1001).fill(board)}));
 assert.throws(()=>parseBackup({...backup([board]),boards:[{...board,teams:Array(201).fill(board.teams[0])}]}));
});
test('IndexedDB initialisation is atomic and updates do not duplicate or erase other boards',async()=>{
 const [a,b]=await Promise.all([loadOrCreateBoard(()=>newBoard('First','Team')),loadOrCreateBoard(()=>newBoard('Other','Team'))]);
 assert.equal(a[0].id,b[0].id);const first=a[0];const second=newBoard('Second','Отбор');await writeBoards([second]);
 await writeBoards([{...first,name:'Renamed',teams:first.teams.map(t=>({...t,score:7}))}]);
 const stored=await loadBoards();assert.equal(stored.length,2);assert.equal(stored.find(b=>b.id===first.id)?.teams[0].score,7);
 await writeBoards([],second.id);assert.equal((await loadBoards()).length,1);
});

test('star reminder respects first visits, a week away, dismissals and GitHub clicks',async()=>{
 const {shouldShowStar,readStarPreference,WEEK}=await import('../lib/star-prompt.ts');const now=2*WEEK;
 assert.equal(shouldShowStar({},now),true);assert.equal(shouldShowStar({lastVisit:now-1000},now),false);
 assert.equal(shouldShowStar({lastVisit:now-WEEK},now),true);assert.equal(shouldShowStar({dismissedUntil:now+WEEK},now),false);
 assert.equal(shouldShowStar({clicked:true},now+10*WEEK),false);assert.deepEqual(readStarPreference('broken'),{});
});

test('dates display day, month and year without changing stored timestamps',async()=>{
 const {europeanDateTime}=await import('../lib/dates.ts');const {policyDate}=await import('../lib/policy-document.ts');
 assert.equal(policyDate('2026-11-02','en'),'02.11.2026');
 assert.equal(europeanDateTime(new Date(2026,10,2,9,5).getTime()),'02.11.2026, 09:05');
});
