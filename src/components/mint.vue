<template>
	<div class="container">
		<div class="title">Mint</div>
		<div class="content">
			<p>
				<span class="hint">Purchase</span>: 
				<input ref="purchase" type="number" min="0" placeholder="amount" @change="onChange" @keyup="onChange">
				<button @click="onBuy" :disabled="!canMint">Submit ({{penTotalPrice}} ETH)</button>
			</p>
			<p><span class="hint">Price</span>: {{penPrice}} eth</p>
			<p><span class="hint">Total</span>: {{penTotal}}</p>
			<p><span class="hint">OG mint</span>: 777</p>
			<p><span class="hint">Colorlist mint</span>: 1000</p>
			<p><span class="hint">Time</span>: Nov 1th 00:00 UTC</p>
			<p><span class="hint">Public mint</span>: 15000</p>
			<p><span class="hint">Time</span>: Nov 1th 03:00 UTC</p>
			<p><span class="hint">Drawing starts</span>: Nov 1th 00:00 UTC</p>
			<p><span class="hint">Drawing ends</span>: Nov 11th 00:00 UTC</p>
		</div>
		<div class="content" v-if="stage>0">
			<a href="https://github.com/ArtiverseLabs/OG-list-and-colorlist/blob/main/OG-list" target="_blank">OG List</a>
		</div>
		<div class="content mention">Artiverse is waiting for your masterpiece, be patient...</div>
	</div>
</template>

<style scoped>
div.content {
	position: relative;
}
div.content.mention {
	margin-top: 20px;
	font-style: italic;
	text-align: center;
}
div.content p {
	margin-top: 8px;
	margin-bottom: 8px;
}
div.content span.hint {
	display: inline-block;
	width: 125px;
	text-align: right;
	font-weight: bolder;
}
div.content input {
	width: 100px;
}
div.content button {
	margin-left: 10px;
}
div.content button[disabled] {
	pointer-events: none;
	color: rgb(127, 127, 127);
}
</style>

<script>
var ctrPEN;
var userProof;

export default {
	name: 'Mint',
	data () {
		return {
			stage: mintStage,
			penPrice: 0.08,
			penTotal: 16777,
			penTotalPrice: 0,
			canMint: false,
		}
	},
	created () {
		eventBus.sub('eth-change-user', (userId, chainId) => {
			this.onStart(userId, chainId);
		});
	},
	mounted () {
		if (!!window.ETHAddress) {
			this.onStart(window.ETHAddress, window.ETHChainID);
		}
	},
	methods: {
		async onStart (userID, chainID) {
			eventBus.pub('showMask');

			Artiverso.checkMintStage().then(mintProof => {
				mintProof.stage = 3;
				userProof = [];
				if (mintProof.stage === 0) { // normal user
					if (mintStage <= 2) {
						this.canMint = false;
					}
					else {
						this.canMint = true;
					}
				}
				else if (mintProof.stage === 1) { // presale user
					if (mintStage <= 1) {
						this.canMint = false;
					}
					else {
						this.canMint = true;
						if (mintStage === 2) {
							userProof = mintProof.proof;
						}
					}
				}
				else if (mintProof.stage === 2) { // og user
					if (mintStage === 0) {
						this.canMint = false;
					}
					else {
						this.canMint = true;
						if (mintStage <= 2) {
							userProof = mintProof.proof;
						}
					}
				}
				else {
					this.canMint = true;
				}
			});

			var config, chainName = 'Test';
			if (chainID === '0x1') {
				chainName = 'Mainnet';
				config = Contracts.config.mainnet;
			}
			else if (chainID === '0x3') {
				chainName = 'Ropsten';
				config = Contracts.config.ropsten;
			}
			else {
				config = Contracts.config.test;
			}

			ctrPEN = new web3.eth.Contract(Contracts.abi.pen, config.pen);

			var tasks = [];
			tasks.push(this.getPenPrice());
			await Promise.all(tasks);

			eventBus.pub('hideMask');
		},
		async callPEN (method, ...params) {
			return await ctrPEN.methods[method](...params).call({
				from: window.ETHAddress
			});
		},
		async getPenPrice () {
			var result = await this.callPEN('getPenPrice');
			result = result * 1;
			result = result / 1000000000000000000;
			this.penPrice = result;
		},
		onChange () {
			var amount = this.$refs.purchase.value * 1;
			if (isNaN(amount)) return;
			this.penTotalPrice = amount * this.penPrice;
		},
		async onBuy () {
			eventBus.pub('showMask', 1000 * 60 * 15);

			var amount = this.$refs.purchase.value * 1;
			if (amount === 0) {
				notify({title: "Can't buy MetaPen without ETH", type: 'error'});
				eventBus.pub('hideMask');
				return;
			}
			amount *= this.penPrice;
			amount = web3.utils.toWei(amount + '');

			var result;
			try {
				result = await ctrPEN.methods.mintMetaPen(userProof).send({
					from: window.ETHAddress,
					value: amount
				});
				var ids = [];
				try {
					var count = result.events.Purchase.returnValues.count * 1;
					var id = result.events.Purchase.returnValues.startTokenId * 1;
					for (let i = 0; i < count; i ++) {
						ids.push(id + i);
					}
				}
				catch (err) {
					console.error(err);
				}
				var hint = "TxHash: " + result.transactionHash + '\nGas: ' + result.gasUsed;
				if (ids.length > 0) {
					msg = msg + '\nMetaPenTokenID: ' + ids.join(', ');
				}
				this.penPurchaseSuccessHint = hint;
				var msg = "You can check this transaction on EtherScan\n" + hint;
				notify({title: 'Purchase Success', message: msg, type: 'success'});
				this.getBasicInfos();
			}
			catch (err) {
				console.error('Purchase Error!');
				console.error(err);
				let msg = err.message;
				if (typeof msg === 'string') {
					msg = msg.replace(/^[\w\W]*?\{/, '{');
					try {
						msg = JSON.parse(msg);
					}
					catch {
						msg = {};
					}
				}
				let txHash = msg.transactionHash || '', blockHash = msg.blockHash || '';
				notify({title: 'Purchase Failed', message: "You can view the detail on EtherScan.\nTxHash: " + txHash + '\nBlockHash: ' + blockHash, duration: 10000, type: 'error'});
			}
			eventBus.pub('hideMask');
		},
	},
}
</script>