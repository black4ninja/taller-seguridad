const request = require('supertest');
const { createApp } = require('../../app');
const { resetDb } = require('../../src/db/init');

function freshApp() {
  resetDb();
  try { require('../../src/middlewares/rateLimit').reset(); } catch (_) {}
  return createApp();
}

async function loginAs(agent, username, password) {
  const res = await agent.post('/auth/login').type('form').send({ username, password });
  return res;
}

function makeAgent(app) {
  return request.agent(app);
}

module.exports = { freshApp, loginAs, makeAgent, request };
