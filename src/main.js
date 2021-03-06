import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Notification from '@/components/notification.vue';
import Mask from '@/components/mask.vue';
import { keccak, sha256 } from '@/assets/hash-wasm.js';
import '@/assets/abi.js';
import '@/assets/address.js';
import '@/assets/encrypt.js';
import '@/assets/lrucache.js';
import '@/assets/cachedDB.js';
import Web3 from 'web3';

if (!location.protocol.match(/https/i)) {
	if (!location.hostname.match(/^localhost$/i) && !location.hostname.match(/^192\./)) {
		location.href = location.href.replace(/^http:/i, 'https:');
	}
}

window.keccak = keccak;
window.sha256 = sha256;
window.Web3 = Web3;
window.mintStage = 1;

const extendJS = () => {
	const KeySet = [];
	(() => {
		for (let i = 0; i < 10; i ++) KeySet.push('' + i);
		for (let i = 65; i <= 90; i ++) KeySet.push(String.fromCharCode(i));
		for (let i = 97; i <= 122; i ++) KeySet.push(String.fromCharCode(i));
	}) ();
	String.random = (len) => {
		var rnd = "";
		for (let i = 0; i < len; i ++) {
			rnd += KeySet[Math.floor(KeySet.length * Math.random())];
		}
		return rnd;
	};
	String.blank = (len, block = ' ') => {
		var line = '';
		for (let i = 0; i < len; i ++) line += block;
		return line;
	};
	String.is = (str) => {
		if (str instanceof String) return true;
		if (typeof str === 'string') return true;
		return false;
	};

	window.wait = (delay=0) => new Promise(res => setTimeout(res, delay));

	localStorage.__proto__.get = function (key, def={}) {
		var item = this.getItem(key);
		if (!item) return def;
		try {
			item = JSON.parse(item);
		}
		catch (err) {
			return def;
		}
		return item;
	};
	localStorage.__proto__.set = function (key, value) {
		value = JSON.stringify(value);
		this.setItem(key, value);
	};
	localStorage.__proto__.getWithExpire = function (key, delay, def={}) {
		if (typeof delay !== 'number') {
			def = delay;
			delay = Infinity;
		}

		var item = this.getItem(key);
		if (!item) return def;
		try {
			item = JSON.parse(item);
		}
		catch (err) {
			return def;
		}

		var duration = Date.now() - (item.stamp || 0);
		if (duration > delay) {
			this.removeItem(key);
			return def;
		}
		return item.value;
	};
	localStorage.__proto__.setWithExpire = function (key, value) {
		value = {value, stamp: Date.now()};
		value = JSON.stringify(value);
		this.setItem(key, value);
	};

	const events = new Map();
	window.eventBus = {
		pub (name, ...message) {
			var bus = events.get(name);
			if (!bus) {
				return;
			}
			for (let cb of bus) {
				try {
					cb(...message);
				}
				catch (err) {
					console.error(err);
				}
			}
		},
		sub (name, callback) {
			var bus = events.get(name);
			if (!bus) {
				bus = new Set();
				events.set(name, bus);
			}
			if (callback instanceof Function) bus.add(callback);
		}
	};
};
const connectWebSocket = () => {
	var SocketQueue = new Set();;
	window.SocketChannel = {
		sendRequest (event, ...data) {
			console.warn('Socket isn\'t ready!');
			SocketQueue.add([event, ...data]);
		}
	};
	var socket = location.protocol + '//' + location.hostname;
	if (process.env.NODE_ENV === 'development') {
		socket += ':8001/';
	}
	else if (location.hostname === 'localhost' || location.hostname.indexOf('192.168') === 0) {
		socket += ':8001/';
	}
	else {
		socket += '/';
	}
	var script = document.createElement('script');
	script.type = "text/javascript";
	script.src = socket + "socket.io/socket.io.js";
	script.onload = () => {
		console.log('Socket Channel is ready!');
		window.SocketChannel = io.connect(socket);
		SocketChannel.sendRequest = (event, ...data) => {
			SocketChannel.emit('__message__', {event, data});
		};
		eventBus.pub('launch-socket', SocketChannel);

		SocketChannel.on('__message__', msg => {
			if (!msg.event) {
				console.error('Unknown information');
				console.log(msg);
			}
			else if (msg.event === "error") {
				console.error('Request "' + msg.target + '" error:\n' + msg.message);
			}
			else if (msg.event === 'reply') {
				eventBus.pub(msg.target, msg.message, 'reply');
			}
			else if (msg.event === 'notification') {
				eventBus.pub(msg.target, msg.message, 'notification');
			}
			else {
				console.log(msg);
			}
		});

		for (let task of SocketQueue) {
			SocketChannel.sendRequest(...task);
		}
		SocketQueue.clear();
		SocketQueue = null;
	};
	document.head.appendChild(script);
};
const registerWindowEvents = () => {
	var lastW = window.innerWidth, lastH = window.innerHeight;
	var timer = null;
	const onResize = () => {
		if (!!timer) clearTimeout(timer);
		timer = null;
		var w = window.innerWidth, h = window.innerHeight;
		if (w === lastW && h === lastH) return;
		lastW = w;
		lastH = h;
		eventBus.pub('page-resize', w, h);
	};
	window.addEventListener('resize', () => {
		if (!!timer) clearTimeout(timer);
		timer = setTimeout(onResize, 100);
	});

	window.addEventListener('scroll', evt => {
		var total = document.body.scrollHeight - window.innerHeight;
		var percent = 1;
		if (total > 0) {
			percent = window.scrollY / total;
		}
		eventBus.pub('page-scroll', percent, window.scrollY, total);
	});
};
const connectETH = () => {
	if (!window.ethereum) return;
	window.web3 = new Web3(ethereum);
};
const regSWorker = async () => {
	if (!navigator.serviceWorker) return;

	if (!!window.caches) {
		let keys = await caches.keys();
		if (keys.length > 0) {
			keys.forEach(async key => {
				var cacheStorage = await caches.open(key);
				var cacheKeys = await cacheStorage.keys();
				console.log('Application Cache ' + key + ': ' + cacheKeys.length);
			});
		}
	}

	try {
		let sws = await navigator.serviceWorker.getRegistrations();
		console.log('Service Worker: ' + sws.length);
		for (let sw of sws) {
			if (!!sw.waiting) {
				console.log('Artiverso: new service worker waiting');
			}
		}
	}
	catch (err) {
		console.error('find installed service worker failed: ' + err.message);
	}

	try {
		let reg = await navigator.serviceWorker.register('/sw.js');
		reg.onupdatefound = (evt) => {
			evt.target.update();
		};
		console.log('new service worker ' + (!!reg ? 'installed' : 'instal failed'));
	}
	catch (err) {
		console.error('install new service worker failed: ' + err.message);
	}
};
window.prepareDB = async (dbName, onUpdate) => {
	var cacheDB = new window.CachedDB(dbName, 1);
	cacheDB.onUpdate(() => {
		if (!!onUpdate) onUpdate(cacheDB);
		console.log(dbName + ': Updated');
	});
	cacheDB.onConnect(() => {
		console.log(dbName + ': Connected');
	});
	await cacheDB.connect();
	return cacheDB;
};

(() => {
	regSWorker();
	extendJS();
	connectWebSocket();
	registerWindowEvents();

	window.Artiverso = {};
	Artiverso.width = 100;
	Artiverso.height = 100;

	window.MyID = localStorage.get('myid', null);
	if (!MyID) {
		MyID = String.random(32);
		localStorage.set('myid', MyID);
	}

	eventBus.sub('page-dark-mode', (mode, shouldSave=true) => {
		if (mode) document.body.classList.add('dark-mode');
		else document.body.classList.remove('dark-mode');
		if (shouldSave) localStorage.set('page-dark-mode', mode);
	});
	eventBus.pub('page-dark-mode', localStorage.get('page-dark-mode', false), false);
	eventBus.sub('eth-change-user', (userId, chainId) => {
		window.ETHAddress = userId;
		window.ETHChainID = chainId;
		window.MyID = userId;
	});
	eventBus.sub('checkMerkleProof', msg => {
		var target, info = {}, address;
		if (!msg.success) {
			target = msg.target;
			notify({title: 'Check Merkle Proof Failed', message: msg.reason, type: 'error'});
			return;
		}
		else {
			target = msg.data.target;
			info.proof = msg.data.proof;
			address = msg.data.address;
		}
		Artiverso._checkMintStatus[target] = info;

		if (!!Artiverso._checkMintStatus.og && !!Artiverso._checkMintStatus.presale) {
			let result = {stage: 0, proof: [], address};
			if (Artiverso._checkMintStatus.og.proof.length > 0) {
				result.stage = 2;
				result.proof = Artiverso._checkMintStatus.og.proof;
			}
			else if (Artiverso._checkMintStatus.presale.proof.length > 0) {
				stage = 1;
				result.proof = Artiverso._checkMintStatus.presale.proof;
			}
			sessionStorage.setWithExpire('MyMintStatus', result);
			let reses = [...Artiverso._checkMintStatus._reses];
			Artiverso._checkMintStatus._reses = [];
			reses.forEach(res => res(result));
		}
	});

	connectETH();

	window.Artiverso.checkMintStage = () => new Promise(res => {
		if (!window.ETHAddress) {
			notify({title: 'Connect to MetaMask first please.'});
			return;
		}

		var stage = sessionStorage.getWithExpire('MyMintStatus', 1000 * 60, null);
		if (!!stage) {
			return res(stage);
		}

		Artiverso._checkMintStatus = Artiverso._checkMintStatus || {_reses: []};
		Artiverso._checkMintStatus._reses.push(res);
		SocketChannel.sendRequest('checkMerkleProof', 'og', window.ETHAddress);
		SocketChannel.sendRequest('checkMerkleProof', 'presale', window.ETHAddress);
	});
}) ();

createApp(App)
	.use(router)
	.use(Notification)
	.use(Mask)
	.mount('#app');