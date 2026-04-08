const { connect, assertEqual, assertSuccessResponse, readRequest, submitInput } = require('../test-utils');

async function run() {
  console.log('UserTest starting...');
  const { client } = await connect(['wss://localhost:8081']);

  // Initial list
  let res = await readRequest(client, { Service: 'User', Action: 'GetAll' });
  assertSuccessResponse(res);
  const initialCount = (res.success || []).length;

  // Create
  await submitInput(client, { Service: 'User', Action: 'Create', data: { name: 'Alice', email: 'alice@example.com' } });

  // List and find new user
  res = await readRequest(client, { Service: 'User', Action: 'GetAll' });
  assertSuccessResponse(res);
  const afterCreate = res.success;
  if (afterCreate.length !== initialCount + 1) throw new Error('Create did not increase count');
  const created = afterCreate[afterCreate.length - 1];

  // Get by id
  res = await readRequest(client, { Service: 'User', Action: 'Get', data: { id: created.id } });
  assertSuccessResponse(res);
  assertEqual(res.success.name, 'Alice', 'User name after create');

  // Update
  await submitInput(client, { Service: 'User', Action: 'Update', data: { id: created.id, name: 'Alice Liddell' } });

  // Verify update
  res = await readRequest(client, { Service: 'User', Action: 'Get', data: { id: created.id } });
  assertSuccessResponse(res);
  assertEqual(res.success.name, 'Alice Liddell', 'User name after update');

  // Delete
  await submitInput(client, { Service: 'User', Action: 'Delete', data: { id: created.id } });

  // Verify delete
  res = await readRequest(client, { Service: 'User', Action: 'GetAll' });
  assertSuccessResponse(res);
  if ((res.success || []).length !== initialCount) throw new Error('Delete did not decrease count');

  console.log('UserTest passed.');
}

module.exports = { run };
