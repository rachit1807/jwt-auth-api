const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');
const pool = process.env.DATABASE_URL ? new Pool({connectionString:process.env.DATABASE_URL}) : null;
const file = path.join(process.env.DATA_DIR || '.data', 'users.json');
let users = [], queue = Promise.resolve();
async function init() {
 if(pool) await pool.query('CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY, email TEXT UNIQUE NOT NULL, data JSONB NOT NULL)');
 else { await fs.mkdir(path.dirname(file), {recursive:true}); try{ users=JSON.parse(await fs.readFile(file,'utf8')); }catch(e){if(e.code!=='ENOENT')throw e;} }
}
async function find(email) {if(pool)return (await pool.query('SELECT data FROM users WHERE email=$1',[email])).rows[0]?.data; return users.find(u=>u.email===email);}
async function byId(id) {if(pool)return (await pool.query('SELECT data FROM users WHERE id=$1',[id])).rows[0]?.data; return users.find(u=>u.id===id);}
async function save(user,create=false) {
 if(pool){if(create)await pool.query('INSERT INTO users(id,email,data) VALUES($1,$2,$3)',[user.id,user.email,user]);else await pool.query('UPDATE users SET data=$2 WHERE id=$1',[user.id,user]);return;}
 const operation=queue.then(async()=>{if(create&&users.some(u=>u.email===user.email)){const e=new Error('Email already registered');e.code='23505';throw e;} const index=users.findIndex(u=>u.id===user.id);if(index<0)users.push(user);else users[index]=user;await fs.writeFile(file+'.tmp',JSON.stringify(users));await fs.rename(file+'.tmp',file);}); queue=operation.catch(()=>{});return operation;
}
module.exports={init,find,byId,save,pool};
