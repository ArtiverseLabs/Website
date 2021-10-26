<template>
	<div class="container">
		<h1>{{title}}</h1>
		<div class="title">MerkleTree Root:</div>
		<div class="content longtext">{{root}}</div>
		<div class="title">Input you address(ENS is avaialbe, but may take more time):</div>
		<div class="content"><input ref="leafNode" type="text" @keydown.enter="checkNode" :value="eth"></div>
		<div class="content"><button @click="checkNode">check</button></div>
		<div class="title" v-if="checked&&address.length>0">Your <strong>REAL</strong> ETH address:</div>
		<div class="content longtext" v-if="checked">{{address}}</div>
		<div class="title" v-if="checked&&proof.length===0">You're <strong>NOT</strong> in the list.</div>
		<div class="title" v-if="checked&&proof.length>0">Your MerkleTree Proof:</div>
		<div class="content longtext proof" v-for="line in proof">{{line}}</div>
		<h1>Member List</h1>
		<div class="content" v-if="list.length===0">No Member now...</div>
		<div class="content longtext proof" v-for="item in list">{{item}}</div>
	</div>
</template>

<style scoped>
div.container {
	padding: 0px 10px;
}
div.container h1 {
	margin-top: 50px;
}
div.container div.title {
	margin: 5px 0px 10px 0px;
	font-size: 20px;
	font-weight: bolder;
}
div.container div.content {
	margin: 10px 0px 20px 0px;
}
div.container div.content.longtext {
	line-break: anywhere;
}
div.container div.content.proof {
	margin: 5px 0px 5px 0px;
}
div.container div.content input {
	width: 80%;
}
@media screen and (max-width: 800px) {
	div.container div.content input {
		width: 624px;
	}
}
@media screen and (max-width: 624px) {
	div.container div.content input {
		width: 100%;
	}
}
</style>

<script>
var cacheDB, dbStatus = 0, dbTask = [], dbRootTask;

const prepareDB = async (dbName) => {
	if (!!cacheDB) return;

	var dbName = 'PreSaleList';
	cacheDB = new window.CachedDB(dbName, 1);

	cacheDB.onUpdate(() => {
		cacheDB.open('root', 'name', 2);
		cacheDB.open('og', 'name', 100);
		cacheDB.open('presale', 'name', 100);
		console.log(dbName + ': Updated');
	});
	cacheDB.onConnect(() => {
		console.log(dbName + ': Connected');
	});

	await cacheDB.connect();
	if (dbStatus === 0) dbStatus = 1;
};

export default {
	name: 'PreSale',
	data () {
		return {
			target: '',
			title: '',
			root: '',
			list: [],
			eth: '',
			proof: [],
			address: '',
			checked: false,
			masked: false,
		}
	},
	created () {
		eventBus.sub('getPreSaleList', msg => {
			if (!msg.success) {
				notify({title: "Get " + msg.data.target + " MerkleTree Info Failed", type: 'error'});
				return;
			}
			this.root = msg.data.root;
			this.list = [...msg.data.list];

			if (dbStatus === 1) {
				dbStatus = 2;
				let target = this.target, time = Date.now();
				cacheDB.set('root', target, msg.data.root);
				msg.data.list.forEach(item => {
					item = item.trim();
					if (item.length === 0) return;
					cacheDB.set(target, item, time);
				});
			}
			else if (dbStatus === 0) {
				dbRootTask = msg.data.root;
				msg.data.list.forEach(item => {
					item = item.trim();
					if (item.length === 0) return;
					dbTask.push(item);
				});
			}

			if (this.masked) {
				this.masked = false;
				eventBus.pub('hideMask');
			}
		});
		eventBus.sub('checkMerkleProof', msg => {
			this.checked = true;
			eventBus.pub('hideMask');
			if (!msg.success) {
				notify({title: msg.error, type: 'error'});
				return;
			}

			if (msg.data.address === msg.data.node) {
				this.address = '';
			}
			else {
				this.address = msg.data.address;
			}
			this.proof = [...msg.data.proof];
		});
		eventBus.sub('eth-change-user', userId => {
			this.eth = userId;
		});
	},
	mounted () {
		if (!!window.ETHAddress) this.eth = window.ETHAddress;
		if (this.$route.name === 'OGList') {
			this.title = 'OG';
			this.target = 'og';
		}
		else if (this.$route.name === 'PreSaleList') {
			this.title = 'Pre-Sale';
			this.target = 'presale';
		}
		else {
			this.$router.push({path: '/'});
			return;
		}

		this.masked = true;
		eventBus.pub('showMask');

		prepareDB().then(async () => {
			if (dbStatus === 2) return;

			var target = this.target;
			if (!!dbTask && dbTask.length > 0) {
				let time = Date.now();
				let task = [];
				if (!!dbRootTask) task.push(cacheDB.set('root', target, dbRootTask));
				task.push(...(dbTask.map(async item => {
					await cacheDB.set(target, item, time);
				})));
				await Promise.all(task);
			}

			var root = await cacheDB.get('root', target);
			if (!!root) this.root = root;
			var list = await cacheDB.all(target);
			if (dbStatus === 2) return;
			this.list = Object.keys(list);
			if (this.list.length === 0) return;

			if (this.masked) {
				this.masked = false;
				eventBus.pub('hideMask');
			}
		});

		SocketChannel.sendRequest('getPreSaleList', this.target);
	},
	methods: {
		checkNode () {
			var node = this.$refs.leafNode.value;
			node = node.trim();
			if (node.length === 0) {
				notify({title: 'empty address', type: 'warn'});
				return;
			}
			eventBus.pub('showMask');
			SocketChannel.sendRequest('checkMerkleProof', this.target, node);
		}
	},
}
</script>