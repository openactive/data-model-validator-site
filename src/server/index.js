import server from './server';

// set the port of our application
// process.env.PORT lets the port be set by Heroku
const port = process.env.PORT || 8080;

server.createServer(port, () => console.log(`Listening on port ${port}!`)); // eslint-disable-line no-console
