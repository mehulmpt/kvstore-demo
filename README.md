## Very Simple KV Implementation

### Setup

1. Clone the repo (`git clone https://github.com/mehulmpt/kvstore-demo`)
2. Run `yarn` in the folder
3. Run `npx jest` to run test suite

### Test results

```
PASS  ./store.test.js
  Store tests
    ✓ Default store works (13 ms)
    ✓ Custom store works (13 ms)
    ✓ Create operation should not fail on new key (18 ms)
    ✓ Create operation should fail on duplicate key (15 ms)
    ✓ Key should be 32 characters max (14 ms)
    ✓ Read operation should work fine (20 ms)
    ✓ Read operation should fail with 1 second TTL (1018 ms)
    ✓ Delete operation should work on existing key (11 ms)
    ✓ Delete operation should not work on non-existing key (9 ms)
    ✓ Store should honor the max size (11 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        3.077 s
Ran all test suites.
```
