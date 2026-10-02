// Vercel entry point. `npm run build` compiles src/ to dist/ before this runs.
const { createServer } = require('../dist/serverless');

// Built once per instance, then reused for every request.
let server;

module.exports = async (req, res) => {
  server ??= createServer();
  const app = await server;
  return app(req, res);
};
