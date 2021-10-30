<template>
	<div class="container">
		<h1>MetaPen - {{tokenID}} <i class="fas fa-pen-nib" :style="{color: penColor}"></i></h1>
		<template v-if="showInfo">
		<div class="content">
			<span class="hint">Owner: </span>
			<span class="info">{{owner}}</span>
		</div>
		<div class="content">
			<span class="hint">Used: </span>
			<span class="info">{{used ? 'used' : 'USABLE'}}</span>
		</div>
		<div class="content">
			<span class="hint">BlockNumber: </span>
			<span class="info">{{blockNum}}</span>
		</div>
		<div class="content">
			<span class="hint">TimeStamp: </span>
			<span class="info">{{timestamp}}</span>
		</div>
		<div class="content">
			<span class="hint">TxHash: </span>
			<span class="info">{{txHash}}</span>
		</div>
		<div class="content">
			<span class="hint">ColorHash: </span>
			<span class="info">{{colorHash}}</span>
		</div>
		<div class="content">
			<span class="hint">PenColor: </span>
			<span class="info">{{penColor}}</span>
		</div>
		</template>
		<template v-if="!showInfo">
		<div class="content">{{errMsg}}</div>
		</template>
	</div>
</template>

<style scoped>
div.container {
	padding: 0px 10px;
}
h1 i {
	text-shadow: 1px 1px 2px rgb(45, 45, 45), 0px 0px 1px rgb(45, 45, 45);
}
.dark-mode h1 i {
	text-shadow: 1px 1px 2px rgb(240, 240, 240), 0px 0px 1px rgb(240, 240, 240);
}
div.content {
	margin-top: 5px;
}
div.content span.hint {
	display: inline-block;
	width: 120px;
	margin-right: 5px;
	text-align: right;
	font-weight: bolder;
}
</style>

<script>
var ctrPEN;
export default {
	name: 'MetaPen',
	data () {
		return {
			maskCanvas: false,
			chainID: 'test',
			tokenID: 0,
			showInfo: true,
			owner: '',
			used: false,
			blockNum: '',
			timestamp: '',
			txHash: '',
			colorHash: '',
			penColor: '',
			errMsg: '',
		}
	},
	created () {
		eventBus.sub('eth-change-user', (userId, chainId) => {
			this.chainID = chainId;
			if (this.maskCanvas) {
				this.maskCanvas = false;
				eventBus.pub('hideMask');
			}
			this.onStart();
		});
		eventBus.sub('getMetaPenInfo', async (msg) => {
			if (!this.maskCanvas) return;
			this.maskCanvas = false;
			eventBus.pub('hideMask');

			if (!msg.success) {
				this.showInfo = false;
				if (msg.reason.indexOf('query for nonexistent token') >= 0) {
					this.errMsg = 'The MetaPen with given tokenID (' + this.tokenID + ') does not exist.';
				}
				else {
					this.errMsg = msg.reason;
				}
				return;
			}

			var data = msg.data;
			this.owner = data.owner;
			this.used = data.used;
			this.blockNum = data.blockNum;
			this.timestamp = data.timestamp;
			this.txHash = data.txHash;
			var penColor = data.txHash + '\n' + data.blockNum + '\n' + data.tokenID;
			this.colorHash = await sha256(penColor);
			this.penColor = '#' + this.colorHash.substring(this.colorHash.length - 6);
			this.showInfo = true;
			this.errMsg = '';
			data.colorHash = this.colorHash;
			data.penColor = this.penColor;
			data._timestamp = Date.now();
			sessionStorage.set('0x1-metapen-' + this.tokenID, data);
		});
	},
	mounted () {
		this.tokenID = this.$route.params.id;
		if (!!window.ETHAddress) {
			this.chainID = window.ETHChainID;
			this.onStart();
		}
		else {
			this.maskCanvas = true;
			eventBus.pub('showMask');
			setTimeout(() => {
				if (!this.maskCanvas) return;
				var result;
				result = sessionStorage.get('0x1-metapen-' + this.tokenID, null);
				if (!!result) {
					let delta = Date.now() - (result._timestamp || 0);
					if (delta < 1000 * 30) {
						this.owner = result.owner;
						this.used = result.used;
						this.blockNum = result.blockNum;
						this.timestamp = result.timestamp;
						this.txHash = result.txHash;
						this.colorHash = result.colorHash;
						this.penColor = result.penColor;
						this.showInfo = true;
						this.errMsg = '';
						this.maskCanvas = false;
						eventBus.pub('hideMask');
						return;
					}
				}
				SocketChannel.sendRequest('getMetaPenInfo', this.tokenID);
			}, 0);
		}
	},
	methods: {
		async onStart () {
			var config, chainName = 'Test';
			if (this.chainID === '0x1') {
				chainName = 'Mainnet';
				config = Contracts.config.mainnet;
			}
			else if (this.chainID === '0x3') {
				chainName = 'Ropsten';
				config = Contracts.config.ropsten;
			}
			else {
				config = Contracts.config.test;
			}
			ctrPEN = new web3.eth.Contract(Contracts.abi.pen, config.pen);

			var result;
			result = sessionStorage.get(this.chainID + '-metapen-' + this.tokenID, null);
			if (!!result) {
				let delta = Date.now() - (result._timestamp || 0);
				if (delta < 1000 * 30) {
					this.owner = result.owner;
					this.used = result.used;
					this.blockNum = result.blockNum;
					this.timestamp = result.timestamp;
					this.txHash = result.txHash;
					this.colorHash = result.colorHash;
					this.penColor = result.penColor;
					this.showInfo = true;
					this.errMsg = '';
					return;
				}
			}

			eventBus.pub('showMask');
			try {
				result = await this.requstPenInfo(this.tokenID);
				this.owner = result.owner;
				this.used = result.used;
				this.blockNum = result.blocknum;
				this.timestamp = result.timestamp;
				let txHash = await this.getPurchaseInfo(result.blocknum, this.tokenID);
				this.txHash = txHash || '';
				var penColor = txHash + '\n' + result.blocknum + '\n' + this.tokenID;
				var colorHash = await sha256(penColor);
				this.colorHash = colorHash;
				penColor = '#' + colorHash.substring(colorHash.length - 6);
				this.penColor = penColor;
				this.showInfo = true;
				this.errMsg = '';
				var data = {
					owner: result.owner,
					used: result.used,
					blockNum: result.blocknum,
					timestamp: result.timestamp,
					txHash: txHash,
					colorHash: colorHash,
					penColor: penColor,
					_timestamp: Date.now(),
				};
				sessionStorage.set(this.chainID + '-metapen-' + this.tokenID, data);
			}
			catch (err) {
				this.showInfo = false;
				if (err.message.indexOf('query for nonexistent token') >= 0) {
					this.errMsg = 'The MetaPen with given tokenID (' + this.tokenID + ') does not exist.';
				}
				else {
					this.errMsg = err.message;
				}
			}
			eventBus.pub('hideMask');
		},
		async requstPenInfo (tokenID) {
			return await ctrPEN.methods.tokenInfo(tokenID).call({
				from: this.myID
			});
		},
		async getPurchaseInfo (blockNum, tokenID) {
			var events = await ctrPEN.getPastEvents('Purchase', {fromBlock: blockNum, toBlock: blockNum});
			var tx = '';
			events.some(evt => {
				var start = evt.returnValues.startTokenId * 1;
				var finish = start - 1 + (evt.returnValues.count * 1);
				if (tokenID >= start && tokenID <= finish) {
					tx = evt.transactionHash;
					return true;
				}
			});
			return tx;
		},
	},
}
</script>