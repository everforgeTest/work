const HotPocket = require('hotpocket-js-client');

async function connect(servers) {
  const userKeyPair = await HotPocket.generateKeys();
  const client = await HotPocket.createClient(servers, userKeyPair);
  if (!await client.connect()) throw new Error('Connection failed');
  return { client, userKeyPair };
}

function assertEqual(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`Assertion failed: ${msg} Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

function assertSuccessResponse(resp) {
  if (!resp || !resp.success) throw new Error(`Expected success response, got ${JSON.stringify(resp)}`);
}

function assertErrorResponse(resp) {
  if (!resp || !resp.error) throw new Error(`Expected error response, got ${JSON.stringify(resp)}`);
}

async function readRequest(client, payload) {
  const res = await client.submitContractReadRequest(JSON.stringify(payload));
  return JSON.parse(res.toString());
}

async function submitInput(client, payload) {
  await client.submitContractInput(JSON.stringify(payload));
}

module.exports = { connect, assertEqual, assertSuccessResponse, assertErrorResponse, readRequest, submitInput };
