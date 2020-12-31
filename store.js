const path = require('path')
const _fs = require('fs')
const fs = _fs.promises

class KVStore {
	_store = path.join(__dirname, 'store-info')
	_init = false
	storeSize = 0
	_MAX_STORE_SIZE = this.GB(1)

	KB(num) {
		return num << 10
	}

	GB(num) {
		return num << 30
	}

	calculateFileNameFromKey(key) {
		return path.join(this._store, key)
	}

	async init(storePath) {
		if (typeof storePath === 'string' && storePath.length > 0) {
			// set the store path
			this._store = path.join(__dirname, storePath)
		}
		// add check for folder here
		try {
			await fs.mkdir(this._store)
		} catch (error) {
			// complain that folder exists
			console.warn('Folder exists')
			require('child_process').execSync(`rm -rf "${this._store}"`)
			await fs.mkdir(this._store)
		}

		this._init = true
	}

	async create(key, value, ttl = null) {
		if (!this._init) {
			throw new Error(
				'Instance not initialized/await-ed with store. Call await store.init() first'
			)
		}

		if (ttl !== null && (isNaN(ttl) || ttl < 0)) {
			throw new Error('TTL must be a valid whole number')
		}

		// validate key
		if (typeof key !== 'string' || key.length > 32) {
			throw new Error('Key should be a string with a maxlength of 32')
		}

		// validate value
		if (!value || typeof value !== 'object') {
			throw new Error('Value should be a JSON serializable object')
		}

		// calculate filename with key where you'll find the data
		const filename = this.calculateFileNameFromKey(key)

		// check if file exists
		let fileExists = false
		try {
			await fs.access(filename, _fs.constants.R_OK)
			fileExists = true
		} catch (error) {
			// ok
		}

		if (fileExists) {
			throw new Error(`The key ${key} already exists in the store`)
		}

		// calculate TTL
		const expiry = ttl === null ? -1 : Date.now() + ttl * 1000

		// Check for 1GB limit
		const payload = JSON.stringify({
			_raw: value,
			expiry
		})

		if (payload.length > this.KB(16)) {
			throw new Error('Payload can be at max 16KB')
		}

		if (payload.length + this.storeSize > this._MAX_STORE_SIZE) {
			throw new Error('Store can be only 1GB max')
		}

		this.storeSize += payload.length
		// write to file
		await fs.writeFile(filename, payload)

		return true
	}

	async read(key) {
		if (!this._init) {
			throw new Error(
				'Instance not initialized/await-ed with store. Call await store.init() first'
			)
		}

		// validate key
		if (typeof key !== 'string' || key.length > 32) {
			throw new Error('Key should be a string with a maxlength of 32')
		}

		// calculate filename with key where you'll find the data
		const filename = this.calculateFileNameFromKey(key)

		try {
			const file = await fs.readFile(filename, 'utf-8')
			const data = JSON.parse(file)
			if (data.expiry > 0 && data.expiry < Date.now()) {
				// cleanup of ttl expired file
				await this.del(key)
				throw new Error('Key does not exist')
			}
			return data._raw
		} catch (error) {
			throw new Error(`Key "${key}" does not exist`)
		}
	}

	async del(key) {
		if (!this._init) {
			throw new Error(
				'Instance not initialized/await-ed with store. Call await store.init() first'
			)
		}

		// validate key
		if (typeof key !== 'string' || key.length > 32) {
			throw new Error('Key should be a string with a maxlength of 32')
		}

		// calculate filename with key where you'll find the data
		const filename = this.calculateFileNameFromKey(key)
		try {
			const file = await fs.stat(filename)
			this.storeSize -= file.size
			await fs.unlink(filename)
			return true
		} catch (error) {
			throw new Error(`Key "${key}" does not exist`)
		}
	}

	_cleanup() {
		require('child_process').execSync(`rm -rf "${this._store}"`)
	}
}

module.exports = KVStore
