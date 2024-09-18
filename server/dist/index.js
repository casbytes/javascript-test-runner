var H=Object.defineProperty;var l=(e,t)=>H(e,"name",{value:t,configurable:!0});import{serve as U}from"@hono/node-server";import"dotenv/config";import p from"tiny-invariant";import n from"node:path";import i from"fs-extra";import{Hono as q}from"hono";import{HTTPException as L}from"hono/http-exception";import*as C from"tar";import{simpleGit as b}from"simple-git";import{spawn as A}from"node:child_process";const D=n.resolve(process.cwd(),"testspace"),K={baseDir:D,binary:"git",trimmed:!1},I=b(K);async function P(e,t={}){return new Promise(r=>{const s=A(e,{shell:!0,...t});let a="",c="";s.stdout&&s.stdout.on("data",m=>{a+=m.toString()}),s.stderr&&s.stderr.on("data",m=>{c+=m.toString()}),s.on("exit",m=>{r({stdout:a,stderr:c,code:m})}),s.on("error",m=>{r({stdout:a,stderr:m.message,code:null})})})}l(P,"exec");async function F(e,t){await i.ensureDir(t),await I.cwd(t),await I.clone(e,t,{"--depth":1})}l(F,"cloneRepo");async function G(e,t,r){await i.ensureFile(r),await C.create({gzip:!0,file:r,cwd:n.dirname(e)},[n.basename(e),n.basename(t)])}l(G,"createTar");async function M(e,t){await i.ensureDir(t),await C.extract({file:e,cwd:t})}l(M,"extractTar");async function z(e,t,r){const s=`npx eslint . --config=${e} -f json -o ${r}`;return P(s,{cwd:t})}l(z,"runLinter");async function B(e,t,r,s){const a=`npx vitest --run --environment=${t} --config=${e} --reporter=json --outputFile=${s}`;return P(a,{cwd:r})}l(B,"runTests");function J(...e){e.forEach(async t=>{i.existsSync(t)&&await i.remove(t)})}l(J,"cleanUp");const j=new q;j.post("/:githubUsername",async e=>{const t=e.req.param("githubUsername"),r=e.req.query("checkpointRepo"),s=e.req.query("checkpointPath"),a=e.req.header("X-Test-Env");p(r,"Repo name is required"),p(t,"Username is required"),p(s,"Checkpoint path is required"),p(a,"Test environment is required");const c=n.join(process.cwd(),"testspace"),N=`https://github.com/${`${t}/${r}`}.git`,f=`${t}-${r}`,E=n.join(c,`${f}.temp`),d=n.join(c,`${f}.tar.gz`),R=n.join(E,s),u=n.join(c,f),O=n.join(R,"src"),$=n.join(R,"__tests__"),v=n.join(c,"eslint.config.mjs"),x=n.join(c,"vitest.config.ts"),T=n.join(u,"lint-results.json"),w=n.join(u,"test-results.json");try{await F(N,E),await G(O,$,d),await M(d,u);const{stderr:o}=await z(v,u,T),{stderr:_}=await B(x,a,u,w);let S=null,g=null,h=null;return(o||_)&&(S=o||_),i.existsSync(T)&&(g=await i.readJson(T)),i.existsSync(w)&&(h=await i.readJson(w)),e.json({lintResults:g,testResults:h,error:S})}catch(o){throw new L(500,{message:o instanceof Error?o.message:"Internal Server Error"})}finally{try{J(E,d,u)}catch(o){console.error(`Cleanup error: ${o instanceof Error?o.message:o}`)}}});const y=Number(process.env.PORT)??8080;console.log(`Server is running on port ${y}`),U({fetch:j.fetch,port:y});
