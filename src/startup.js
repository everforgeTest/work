const HotPocket = require('hotpocket-nodejs-contract');
const ControllerRouter = require('./controller');
const { DBInitializer } = require('./Data.Deploy/initDB');

async function contract(ctx) {
  try {
    await DBInitializer.init();
  } catch (e) {
    console.error('DB init failed', e);
  }
//r3weret
  const router = new ControllerRouter();
  for (const user of ctx.users.list()) {
    for (const input of user.inputs) {
      const buf = await ctx.users.read(input);
      await router.handle(ctx, user, buf);
    }
  }
}

const hpc = new HotPocket.Contract();
hpc.init(contract);
