const request = require('superagent');
const { Pool } = require('pg');
//const db = require('../src/server/models/elephantsql.js');

// was causing authentication errors with the connectionString for some reason
// needed the information added explicitly
const connectionString = 'postgres://sxxfhsmp:24uEPIYvk4WgTARJKU3CWztooRTxxlNV@ruby.db.elephantsql.com:5432/sxxfhsmp';

const db = new Pool({
  // user: <db username>,
  // password: <db password>,
  // host: <db host>,
  // database: <database name>,
  // port: <port>,

  // user: 'rdijnfia',
  // password: 'kOCId0HmwNJ8mOSTy6gk4Ij8a4nAAFz1',
  // host: 'ruby.db.elephantsql.com',
  // database: 'rdijnfia',
  // port: 5432,

  // user: 'sxxfhsmp',
  // password: '24uEPIYvk4WgTARJKU3CWztooRTxxlNV',
  // host: 'ruby.db.elephantsql.com',
  // port: 5432,
  connectionString: connectionString,
});

const baseUrl = 'https://pokeapi.co/api/v2/';
let currentID = 1;

request
  .get(`${baseUrl}pokemon?limit=1000`)
  .set('Accept', 'application/json')
  .then(async (res) => {
    res.body.results.map((pokemon) => {
      // THERE'S A WEIRD JUMP FROM 807 TO 10001
      if (currentID === 808) currentID = 10001;
      pokemon.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentID}.png`;
      currentID++;
      return pokemon;
    });


    const pokemonList = res.body.results;
    let stars = '*'

    for (let i = 0; i < pokemonList.length; i++) {
      if (i % 25 === 0) console.log(stars += "*")
      const { sprite, name } = pokemonList[i];
      const queryString = `INSERT INTO users (pic_url, username) VALUES ('${sprite}', '${name}')`;
      await db.query(queryString);
    }
    console.log('Pokemon added to database.');
  });
