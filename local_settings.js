var config = {

  static_path: 'static',

  listen_port: 3000,

  git: {
    dir: 'ships'
  },

  github: {
    id: 'bba70812257735390d7a',
    secret: '2efad22faba7d1c0986e50c928299753563f8d83'
  },

  redis: {
    host: 'localhost',
    port: 6379
  },

  db: {
    db: 'spaceships',
    host: 'localhost'
    //port: 27017,  // optional, default: 27017
    //username: 'admin', // optional
    //password: 'secret', // optional
    //collection: 'mySessions' // optional, default: sessions
  },

  // session secret - change this
  secret: 'ziifos7moiwe1eeghee4sha3uut3doh6eW9zaiquahshooTeh7'
};

module.exports = config;
