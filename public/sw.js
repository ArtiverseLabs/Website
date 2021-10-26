const CacheName = 'artiverso';
const CachedList = new Set();

const prepare = async () => {
	var keys = await caches.keys();
	if (keys.length > 0) {
		keys.forEach(async key => {
			var cacheStorage = await caches.open(key);
			var cacheKeys = await cacheStorage.keys();
			cacheKeys.forEach(req => {
				var url = req.url;
				if (!!url.match(/index\.html?$/i) || !!url.match(/(\\|\/)$/)) return;
				CachedList.add(url);
			});
		});
	}
};
prepare();

const cacheResource = async (req, res) => {
	var cache = await caches.open(CacheName);
	await cache.put(req, res);
};

self.addEventListener('install', evt => {
	console.log('ArtiWorker: SW Installed');
	evt.waitUntil(async () => {
		await caches.delete(CacheName);
		console.log('ArtiWorker: Cache Refreshed');
	});
});
self.addEventListener('fetch', evt => {
	if (evt.request.method !== 'GET') return;

	var url = evt.request.url;
	if (url.indexOf(self.location.origin) < 0) return;
	if (url.indexOf('localhost') >= 0 || url.indexOf('127.0.0.1') >= 0) return;

	var isResource = !!url.match(/(\/|\\)$/) || !!url.match(/\.(ico|png|ttf|eot|svg|woff|woff2|css|json|map|html)$/i);
	if (!isResource) {
		let match = !!url.match(/\.js$/i);
		if (match) {
			isResource = !url.match(/\bsw\.js$/i);
		}
	}
	if (!isResource) return;

	var fullpath = evt.request.url.replace(self.location.origin, '');
	if (!CachedList.has(fullpath)) caches.open(CacheName).then(cache => {
		cache.add(fullpath);
		if (!fullpath.match(/index\.html?$/i) && !fullpath.match(/(\\|\/)$/)) CachedList.add(fullpath);
	});
	evt.respondWith(caches.match(evt.request).then(cache => {
		if (cache) {
			return cache;
		}

		var remote = fetch(evt.request).then(res => {
			cacheResource(evt.request, res.clone()).then(() => {
				console.log('ArtiWorker: CacheUpaded - ' + evt.request.url);
			});
			return res;
		}).catch(e => {
			console.error('ArtiWorker: Fetch Failed - ' + evt.request.url);
			console.error(e);
		});

		return remote;
	}));
});