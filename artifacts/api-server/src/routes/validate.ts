import { Router, type IRouter } from "express";
import dns from "node:dns/promises";
import net from "node:net";

const router: IRouter = Router();

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return true;
  const [a,b]=parts;
  return a===10 || a===127 || a===0 || (a===169&&b===254) || (a===172&&b>=16&&b<=31) || (a===192&&b===168);
}
function isPrivateIpv6(ip: string): boolean {
  const value=ip.toLowerCase();
  return value==="::" || value==="::1" || value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:");
}
async function isSafeRemoteUrl(raw: string): Promise<boolean> {
  try {
    const url=new URL(raw);
    if (url.protocol!=="http:" && url.protocol!=="https:") return false;
    const hostname=url.hostname.toLowerCase();
    if (hostname==="localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) return false;
    if (net.isIP(hostname)) return net.isIP(hostname)===4 ? !isPrivateIpv4(hostname) : !isPrivateIpv6(hostname);
    const addresses=await dns.lookup(hostname,{all:true,verbatim:true});
    return addresses.length>0 && addresses.every(({address})=>net.isIP(address)===4 ? !isPrivateIpv4(address) : !isPrivateIpv6(address));
  } catch { return false; }
}
function buildDefaultUrl(slot:number,tmdbId:string,type:"movie"|"tv",season=1,episode=1):string|null {
  const s=season,e=episode,id=tmdbId;
  switch(slot){
    case 0:return type==="movie"?`https://vidsrc.to/embed/movie/${id}`:`https://vidsrc.to/embed/tv/${id}/${s}/${e}`;
    case 1:return type==="movie"?`https://vidsrc.me/embed/movie?tmdb=${id}`:`https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`;
    case 2:return type==="movie"?`https://embed.su/embed/movie/${id}`:`https://embed.su/embed/tv/${id}/${s}/${e}`;
    case 3:return type==="movie"?`https://www.2embed.cc/embed/${id}`:`https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`;
    case 4:return type==="movie"?`https://embed.smashystream.com/playere.php?tmdb=${id}`:`https://embed.smashystream.com/playere.php?tmdb=${id}&type=tv&season=${s}&episode=${e}`;
    case 5:return type==="movie"?`https://vidsrc.cc/embed/movie/${id}`:`https://vidsrc.cc/embed/tv/${id}/${s}/${e}`;
    case 6:return type==="movie"?`https://vidsrc.xyz/embed/movie/${id}`:`https://vidsrc.xyz/embed/tv/${id}/${s}/${e}`;
    case 7:return type==="movie"?`https://autoembed.to/movie/tmdb/${id}`:`https://autoembed.to/tv/tmdb/${id}-${s}-${e}`;
    case 8:return type==="movie"?`https://movieapi.club/movie/${id}`:`https://movieapi.club/tv/${id}-${s}-${e}`;
    case 9:return type==="movie"?`https://player.videasy.net/movie/${id}`:`https://player.videasy.net/tv/${id}?season=${s}&episode=${e}`;
    default:return null;
  }
}
function resolveAdminTemplate(template:string,tmdbId:string,type:"movie"|"tv",season=1,episode=1){
  return template.replace(/\{id\}/g,tmdbId).replace(/\{type\}/g,type).replace(/\{season\}/g,String(season)).replace(/\{episode\}/g,String(episode));
}
const DEFAULT_NAMES=["VidSrc.to","VidSrc.me","Embed.su","2Embed","SmashyStream","VidSrc.cc","VidSrc.xyz","AutoEmbed","MovieAPI","Videasy"];

async function checkUrl(url:string,timeoutMs=3500){
  if(!(await isSafeRemoteUrl(url))) return false;
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const res=await fetch(url,{method:"HEAD",signal:controller.signal,redirect:"manual",headers:{"User-Agent":"Mozilla/5.0 StreamVault/1.0",Accept:"text/html,application/xhtml+xml,*/*"}});
    if(res.status===405){
      const retry=await fetch(url,{method:"GET",signal:controller.signal,redirect:"manual",headers:{"User-Agent":"Mozilla/5.0 StreamVault/1.0",Accept:"text/html,application/xhtml+xml,*/*"}});
      return retry.status>=200 && retry.status<400;
    }
    return res.status>=200 && res.status<400;
  }catch{return false}finally{clearTimeout(timer)}
}
router.get("/healthz",(_req,res)=>res.json({status:"ok"}));
router.post("/validate-servers",async(req,res)=>{
  const {tmdbId,type,season=1,episode=1,adminUrls=[]}=req.body??{};
  if(typeof tmdbId!=="string" || !tmdbId || (type!=="movie" && type!=="tv")) return void res.status(400).json({error:"tmdbId and type are required"});
  const urls=Array.isArray(adminUrls)?adminUrls.slice(0,10):[];
  const servers=await Promise.all(Array.from({length:10},async(_,i)=>{
    const template=typeof urls[i]==="string"?urls[i].trim():"";
    const url=template?resolveAdminTemplate(template,tmdbId,type,season,episode):buildDefaultUrl(i,tmdbId,type,season,episode);
    return {id:`D${i+1}`,name:template?`D${i+1} (custom)`:DEFAULT_NAMES[i],url,valid:!!url&&await checkUrl(url)};
  }));
  res.json({servers});
});
async function proxyUrl(raw:unknown,timeoutMs:number){
  if(typeof raw!=="string" || !(await isSafeRemoteUrl(raw))) throw new Error("Invalid or unsafe URL");
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{return await fetch(raw,{signal:controller.signal,redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 StreamVault/1.0",Accept:"text/html,application/xhtml+xml,application/x-mpegURL,*/*;q=0.8"}})}
  finally{clearTimeout(timer)}
}
router.get("/arabic-proxy",async(req,res)=>{try{const u=await proxyUrl(req.query.url,10000);res.status(u.status).setHeader("Content-Type",u.headers.get("content-type")||"text/html; charset=utf-8");res.send(await u.text())}catch{res.status(502).json({error:"Proxy request failed"})}});
router.get("/m3u-proxy",async(req,res)=>{try{const u=await proxyUrl(req.query.url,12000);res.status(u.status).setHeader("Content-Type","application/x-mpegURL");res.send(await u.text())}catch{res.status(502).json({error:"M3U proxy failed"})}});
export default router;
