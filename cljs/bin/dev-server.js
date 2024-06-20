const { spawn } = require('child_process');
const { promises: fs } = require('fs');
const PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-adapter-http'))
  .plugin(require('pouchdb-adapter-leveldb'))
  .plugin(require('pouchdb-replication'))
  .plugin(require('pouchdb-load'));
const fetch = require('node-fetch');

async function startPouchServer() {
  await fs.mkdir('db', { recursive: true });

  const child = spawn(
    require.resolve('pouchdb-server/bin/pouchdb-server'),
    ['-p', '6984'], {
      cwd: 'db'
    }
  );

  child.stdout.on('data', (data) => {
    console.log(data.toString('utf-8'));
  });

  child.stderr.on('data', (data) => {
    console.error(data.toString('utf-8'));
  });

  // wait for pouchdb-server to start up
  let count = 0;
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const response = await fetch('http://localhost:6984');
      const json = await response.json();
      if (json.version) {
        break;
      }
    } catch (e) {
      console.log('Waiting for http://localhost:6984 to be up...');
      if (++count === 10) {
        console.log(e.stack);
        throw new Error('cannot connect to pouchdb-server');
      }
    }
  }
}

async function loadData() {
  const monstersDB = new PouchDB('http://localhost:6984/monsters');
  const descriptionsDB = new PouchDB('http://localhost:6984/descriptions');
  const evolutionsDB = new PouchDB('http://localhost:6984/evolutions');
  const typesDB = new PouchDB('http://localhost:6984/types');
  const movesDB = new PouchDB('http://localhost:6984/moves');
  const monsterMovesDB = new PouchDB('http://localhost:6984/monster-moves');
  const monstersSupplementalDB = new PouchDB('http://localhost:6984/monsters-supplemental');

  const loadPromises = [
    monstersDB.load(await fs.readFile('src/assets/skim-monsters.txt', 'utf-8')),
    descriptionsDB.load(await fs.readFile('src/assets/descriptions.txt', 'utf-8')),
    evolutionsDB.load(await fs.readFile('src/assets/evolutions.txt', 'utf-8')),
    typesDB.load(await fs.readFile('src/assets/types.txt', 'utf-8')),
    movesDB.load(await fs.readFile('src/assets/moves.txt', 'utf-8')),
    monsterMovesDB.load(await fs.readFile('src/assets/monster-moves.txt', 'utf-8')),
    monstersSupplementalDB.load(await fs.readFile('src/assets/monsters-supplemental.txt', 'utf-8'))
  ];

  for (const promise of loadPromises) {
    await promise;
  }

  console.log('Data loaded into PouchDB');
}

async function doIt() {
  await startPouchServer();

  // wait for pouch server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  await loadData();

  console.log('PouchDB server started and data loaded');
}

doIt().catch(err => console.error(err));

process.on('unhandledRejection', err => {
  console.error(err.stack);
});
