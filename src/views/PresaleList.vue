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
		<div class="content">You can get the full list in the <a href="https://github.com/ArtiverseLabs/OG-list-and-colorlist/blob/main/OG-list" target="_blank">GitHub Project</a>.</div>
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

export default {
	name: 'PreSale',
	data () {
		return {
			target: '',
			title: '',
			root: '',
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

			if (dbStatus === 1) {
				dbStatus = 2;
				let target = this.target, time = Date.now();
				cacheDB.set('root', target, msg.data.root);
			}
			else if (dbStatus === 0) {
				dbRootTask = msg.data.root;
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

		prepareDB('PreSaleList', db => {
			db.open('root', 'name', 2);
			db.open('og', 'name', 100);
			db.open('presale', 'name', 100);
		}).then(async db => {
			cacheDB = db;
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