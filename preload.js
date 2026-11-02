import path from './vendor/path-browserify-esm/index.esm.js';
import { FileSystem } from './noname/library/fs/index.js';
import { installLegacyFileSystemAPI } from './noname/library/fs/legacy.js';

// Static hosting adapter: packaged assets are fetched; personal runtime files stay in this browser.
export default async function preload({lib, game}) {
 const manifest = await fetch('./files.json').then(r => r.json());
 const prefix = 'diy-sgs-file:';
 const normalize = name => {
  const result = path.posix.normalize(String(name).replaceAll('\\', '/')).replace(/^\.\//, '').replace(/^\//, '');
  if (result === '..' || result.startsWith('../')) throw Error('Invalid file path');
  return result === '.' ? '' : result;
 };
 const stored = name => localStorage.getItem(prefix + name);
 const adapter = {
  async read(name) {
   name = normalize(name);
   const data = stored(name);
   if (data !== null) return Uint8Array.from(atob(data), c => c.charCodeAt(0));
   if (!(name in manifest)) throw Error('File not found: ' + name);
   const response = await fetch(new URL(name, location.origin + '/'));
   if (!response.ok) throw Error('Cannot read: ' + name);
   return new Uint8Array(await response.arrayBuffer());
  },
  async write(name, data) {
   name = normalize(name);
   let raw = '';
   for (const b of data) raw += String.fromCharCode(b);
   localStorage.setItem(prefix + name, btoa(raw));
  },
  async stat(name) {
   name = normalize(name);
   const data = stored(name);
   if (data !== null) return {type:'file', size:atob(data).length};
   if (name in manifest) return {type:'file', size:manifest[name]};
   if (!name || Object.keys(manifest).some(p => p.startsWith(name + '/'))) return {type:'directory'};
   return null;
  },
  async list(name) {
   name = normalize(name);const base = name ? name + '/' : '';
   const entries = new Map();
   const names = [...Object.keys(manifest), ...Object.keys(localStorage).filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length))];
   for (const p of names) if (p.startsWith(base)) {
    const tail=p.slice(base.length), part=tail.split('/')[0];
    if (part) entries.set(part,{name:part,type:tail.includes('/')?'directory':'file'});
   }
   return [...entries.values()];
  },
  async createDir() {},
  async remove(name) { localStorage.removeItem(prefix + normalize(name)); },
  async open(name, options={}) {
   let offset=0, bytes;
   try { bytes=await this.read(name); } catch(error) { if(!options.create&&!options.createNew)throw error;bytes=new Uint8Array(); }
   if(options.truncate) bytes=new Uint8Array();
   if(options.append) offset=bytes.length;
   return {
    async read(buffer) {const n=Math.min(buffer.length,bytes.length-offset);buffer.set(bytes.subarray(offset,offset+n));offset+=n;return n;},
    async write(buffer) {const next=new Uint8Array(Math.max(bytes.length,offset+buffer.length));next.set(bytes);next.set(buffer,offset);bytes=next;offset+=buffer.length;await adapter.write(name,bytes);return buffer.length;},
    async seek(position) {offset=position;return offset;},
    async stat() {return {type:'file',size:bytes.length};},
    async close() {},
   };
  },
 };
 lib.path=path;
 lib.fs=new FileSystem(adapter);
 installLegacyFileSystemAPI(game,lib.fs);
 game.export=(data,name='noname')=>{
  const blob=typeof data==='string'?new Blob([data],{type:'text/plain'}):data;
  const link=document.createElement('a');link.download=name;link.href=URL.createObjectURL(blob);link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),1000);
 };
 game.open=url=>window.open(url,'_blank','noopener');
 game.exit=()=>{window.onbeforeunload=null;};
}
