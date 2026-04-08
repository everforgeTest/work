const UserTest = require('./TestCases/UserTest');

(async () => {
  try {
    await UserTest.run();
    console.log('All tests passed.');
  } catch (e) {
    console.error('Tests failed:', e);
    process.exit(1);
  }
})();
