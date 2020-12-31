const KVStore = require('./store')
const fs = require('fs')
const path = require('path')
const { test, expect } = require('@jest/globals')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

describe('Store tests', () => {
	let store = null

	beforeEach(() => {
		store = new KVStore()
	})

	afterEach(() => {
		store._cleanup()
	})

	test('Default store works', async () => {
		await store.init()
		fs.statSync(path.join(__dirname, 'store-info'))
	})

	test('Custom store works', async () => {
		await store.init('my-custom-store')
		fs.statSync(path.join(__dirname, 'my-custom-store'))
	})

	test('Create operation should not fail on new key', async () => {
		await store.init()
		await store.create('key1', { myObj: 1 })
	})

	test('Create operation should fail on duplicate key', async () => {
		await store.init()
		await store.create('key1', { myObj: 1 })
		let fail = false
		try {
			await store.create('key1', { myObj: 1 })
		} catch (error) {
			fail = true
			// ok
		}

		if (!fail) {
			throw new Error('Test should have failed')
		}
	})

	test('Key should be 32 characters max', async () => {
		await store.init()
		try {
			await store.create('123456789123456789123456789123456', { test: 1 })
		} catch (error) {
			expect(error.message === 'Key should be a string with a maxlength of 32').toBe.true
		}
	})

	test('Read operation should work fine', async () => {
		await store.init()
		await store.create('key1', { myObj: 1 })
		const res = await store.read('key1')
		expect(res.myObj === 1).toBe.true
	})

	test('Read operation should fail with 1 second TTL', async () => {
		await store.init()
		await store.create('key1', { myObj: 1 }, 1)
		const res = await store.read('key1')
		expect(res.myObj === 1).toBe.true
		await sleep(1000)

		let fail = false

		try {
			await store.read('key1')
		} catch (error) {
			// ok
			fail = true
		}

		if (!fail) {
			throw new Error('Test should have failed')
		}
	})

	test('Delete operation should work on existing key', async () => {
		await store.init()
		await store.create('key1', { myObj: 1 }, 1)
		await store.read('key1')
		await store.del('key1')

		let fail = false

		try {
			await store.read('key1')
		} catch (error) {
			// ok
			fail = true
		}

		if (!fail) {
			throw new Error('Test should have failed')
		}
	})

	test('Delete operation should not work on non-existing key', async () => {
		await store.init()
		let fail = false
		try {
			await store.del('key1')
		} catch (error) {
			// ok
			fail = true
		}

		if (!fail) {
			throw new Error('Test should have failed')
		}
	})

	test('Store should honor the max size', async () => {
		await store.init()
		store._MAX_STORE_SIZE = 0
		let fail = false
		try {
			await store.create('key1', { something: 1 })
		} catch (error) {
			// ok
			expect(error.message.includes('Store can be only')).toBe.true
			fail = true
		}

		if (!fail) {
			throw new Error('Test should have failed')
		}
	})
})
