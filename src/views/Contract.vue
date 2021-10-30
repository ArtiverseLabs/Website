<template>
	<div class="container" :disabled="!allReady">
		<h1>Mint</h1>
		<div class="content loading" v-if="cvsID===0">Loading Info...</div>
		<h2>Canvas</h2>
		<div class="content">Choose MetaPen color: <color-pad/></div>
		<div class="frame">
			<div class="canvas" @mousedown="onClick"><canvas ref="canvas"></canvas></div>
			<div class="infoPad">
				<div class="subframe">
					<div class="infoItem">
						<span class="hint">X:</span>
						<span>{{pointX}}</span>
					</div>
					<div class="infoItem">
						<span class="hint">Y:</span>
						<span>{{pointY}}</span>
					</div>
				</div>
				<div class="subframe">
					<div class="infoItem">
						<span class="hint">Color:</span>
						<span>{{pointColor}}</span>
					</div>
				</div>
				<div class="subframe">
					<div class="infoItem">
						<span class="hint">Owner:</span>
						<span class="overcut">{{pointOwner}}</span>
					</div>
					<div class="infoItem">
						<span class="hint">Price:</span>
						<span>{{pointPrice}}</span>
					</div>
				</div>
				<div class="subframe bottom">
					<div class="infoItem">
						<span class="hint trigger" @click="onDraw">Draw</span>
					</div>
				</div>
			</div>
		</div>

		<h2>Artiverse Info</h2>
		<div class="content">
			<span class="hint">CanvasID:</span>
			<span>{{cvsID}}</span>
			<span class="hint">Pixel Drawn:</span>
			<span>{{cvsDrawn}}</span>
			<span class="hint">Total ArtiV: </span>
			<span class="result">{{rtvSupply}} ARTV</span>
		</div>
		<div class="content">
			<span class="hint">Total Pen: </span>
			<span class="result">{{penSupply}}</span>
			<span class="hint">Unused Pen: </span>
			<span class="result">{{penAvailable}}</span>
		</div>

		<h2>My Wallet <span>({{myID||'unconnected'}}{{userStatus}})</span></h2>
		<div class="content">
			<span class="hint">Pixels You Own:</span>
			<span>{{cvsStock}}</span>
			<span class="hint">ARTV You Own: </span>
			<span class="result">{{rtvBalance}} ARTV</span>
		</div>
		<div class="content">
			<span class="hint">All Pen: </span>
			<span class="result">{{penUBalance}}</span>
			<span class="hint">Unused Pen: </span>
			<span class="result">{{penUAvailable}}</span>
			<span class="hint">Wallet Depth: </span>
			<span class="result">{{penUTotal}}</span>
		</div>
		<div class="content">
			<span class="hint">Available MetaPen: </span>
			<span>{{penList}}</span>
		</div>

		<h2>Market</h2>
		<div class="content">
			<span class="hint">Mint MetaPen: </span>
			<input ref="penPurchaseAmount" type="number" value="0" min="0" @change="onChange" @keyup="onChange">
			<button @click="getPenPurchase" :disabled="!canMint">MINT ({{penPay}} ETH)</button>
			<span class="result">{{penPrice}} ETH per MetaPen {{mentionHint}}</span>
		</div>
		<div class="content" v-if="penPurchaseSuccessHint.length>0">{{penPurchaseSuccessHint.replace(/\n/gi, '; ')}}</div>
		<div class="content">
			<span class="hint">Transfer Pen: </span>
			<input ref="penTransferToken" type="number" placeholder="tokenID">
			<span class="short">To: </span>
			<input ref="penTransferTo" type="text" placeholder="receiver address">
			<button @click="getPENTransferTo">transfer</button>
			<span class="result">{{penTransferToResult}}</span>
		</div>
		<div class="content">
			<span class="hint">Transfer ArtiV: </span>
			<input ref="rtvTransferAmount" type="number" placeholder="amount(ARTV)">
			<span class="short">To: </span>
			<input ref="rtvTransferTo" type="text" placeholder="receiver address">
			<button @click="getRTVTransferTo">transfer</button>
			<span class="result">{{rtvTransferToResult}}</span>
		</div>
	</div>
</template>

<style scoped>
div.container {
	padding: 0px 10px;
}
div.container[disabled="true"] {
	pointer-events: none;
}
div.container h2 {
	margin-top: 20px;
	padding-top: 20px;
	border-top: 1px solid rgb(105, 105, 105);
}
div.container h2 span {
	font-size: 18px;
}
div.content.loading {
	margin-bottom: 15px;
}
div.content span {
	display: inline-block;
	min-width: 100px;
	margin-left: 5px;
	margin-right: 5px;
}
div.content span.short {
	min-width: 30px;
}
div.content span.hint {
	display: inline-block;
	width: 150px;
	text-align: right;
	font-weight: bolder;
}
div.content span.result {
	display: inline-block;
}
div.content button {
	margin: 0px 10px;
}
div.content button[disabled] {
	color: rgb(127, 127, 127);
	pointer-events: none;
}
div.frame {
	display: flex;
	flex-flow: wrap;
	justify-content: space-around;
}
div.canvas {
	box-sizing: border-box;
	width: 800px;
	max-width: 100%;
	margin-left: auto;
	border: 1px solid rgb(105, 105, 105);
	font-size: 0px;
}
div.canvas canvas {
	width: 100%;
	cursor: pointer;
}
div.infoPad {
	position: relative;
	box-sizing: border-box;
	width: 300px;
	margin-right: auto;
	padding: 20px;
	font-size: 0px;
}
div.infoPad div.infoItem {
	display: block;
	margin-bottom: 10px;
	font-size: 20px;
}
div.infoPad div.subframe {
	box-sizing: border-box;
}
div.infoPad div.subframe.bottom {
	position: absolute;
	bottom: 10px;
}
div.infoPad div.infoItem span.hint {
	display: inline-block;
	width: 80px;
	margin-right: 10px;
	font-size: 24px;
	font-weight: bolder;
	text-align: right;
	user-select: none;
}
div.infoPad div.infoItem span.overcut {
	display: inline-block;
	width: 130px;
	vertical-align: bottom;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
div.infoPad div.subframe.bottom div.infoItem {
	font-size: 16px;
}
div.infoPad div.subframe.bottom div.infoItem span.hint {
	width: 120px;
	font-size: 20px;
}
div.infoPad div.subframe.bottom div.infoItem span.trigger {
	cursor: pointer;
	user-select: none;
}
@media screen and (max-width: 1150px) {
	div.frame {
		flex-flow: column;
	}
	div.canvas {
		margin-right: auto;
	}
	div.infoPad {
		display: flex;
		flex-flow: wrap;
		justify-content: space-around;
		width: 100%;
		margin-left: auto;
	}
	div.infoPad div.infoItem {
		width: 200px;
		font-size: 16px;
	}
	div.infoPad div.infoItem span.hint {
		width: 60px;
		margin-right: 4px;
		font-size: 16px;
		font-weight: bolder;
	}
	div.infoPad div.subframe {
		width: 200px;
	}
	div.infoPad div.subframe.bottom {
		position: relative;
		bottom: 0;
	}
	div.infoPad div.subframe.bottom div.infoItem {
		width: 200px;
		font-size: 12px;
	}
	div.infoPad div.subframe.bottom div.infoItem span.hint {
		width: 100px;
		font-size: 16px;
	}
}
</style>

<script>
import ColorPad from '@/components/colorpad.vue';

const BlockFrom = {
	mainnet: 13491907, // mainnet
	ropsten: 11291580, // ropsten
};
var ctrRTV, ctrPEN, ctrCVS;
var userType = 0, userProof = '';
var wallet = null;
var canvas, context;
const ArtWidth = 100, ArtHeight = 100, ArtSize = 10;
var showPurchaseHistory = false, emittedDrawEvents = new Set();
var cacheDB, dbReady = false, dbHooker = null;

const drawGrid = (x1, y1, color='white', fill=false, width=2) => {
	x1 *= ArtSize;
	y1 *= ArtSize;
	var x2 = x1 + ArtSize;
	var y2 = y1 + ArtSize;
	var target = context;

	if (fill) {
		target.fillStyle = color;
		target.fillRect(x1, y1, ArtSize, ArtSize);
	}
	else {
		target.beginPath();
		target.moveTo(x1, y1);
		target.lineTo(x1, y2);
		target.lineTo(x2, y2);
		target.lineTo(x2, y1);
		target.lineTo(x1, y1);
		target.closePath();
		target.strokeStyle = color;
		target.lineWidth = width;
		target.stroke();
	}
};

export default {
	name: 'Contract',
	data () {
		return {
			maskCanvas: false,
			canMint: false,
			mentionHint: '(loading...)',
			allReady: false,
			convertETH: 0,
			myID: '',
			userStatus: '',
			pointX: -1,
			pointY: -1,
			pointColor: '',
			pointOwner: '',
			pointPrice: 0,
			cvsID: 0,
			cvsDrawn: 0,
			cvsStock: 0,
			penPrice: 0.08,
			penPay: 0,
			penList: '',
			penSupply: 0,
			penAvailable: 0,
			penPurchaseSuccessHint: '',
			penUBalance: 0,
			penUAvailable: 0,
			penUTotal: 0,
			penTransferToResult: '',
			rtvSupply: 0,
			rtvBalance: 0,
			rtvTransferToResult: '',
			lastDrawBlockNum: 0,
		}
	},
	components: {
		ColorPad
	},
	created () {
		prepareDB('MetaCanvas', db => {
			db.open('history', 'blockNum');
			db.open('canvas', 'position');
		}).then(db => {
			cacheDB = db;
			dbReady = true;
			if (!!dbHooker) dbHooker();
		});

		eventBus.sub('eth-change-user', (userId, chainId) => {
			if (this.maskCanvas) {
				this.maskCanvas = false;
				eventBus.pub('hideMask');
			}
			this.onStart(userId, chainId);
		});
		eventBus.sub('loadCurrentCanvas', ({result, data}) => {
			if (!this.maskCanvas) return;
			this.maskCanvas = false;
			eventBus.pub('hideMask');
			if (!data) return;
			for (let pos in data) {
				let pixel = data[pos];
				drawGrid(pixel.x, pixel.y, pixel.color, true);
			}
		});
	},
	mounted () {
		if (!!window.ETHAddress) {
			this.onStart(window.ETHAddress, window.ETHChainID);
		}
		else {
			this.maskCanvas = true;
			eventBus.pub('showMask');
			setTimeout(() => {
				if (!this.maskCanvas) return;
				SocketChannel.sendRequest('loadCurrentCanvas');
			}, 100);
		}

		canvas = this.$refs.canvas;
		canvas.width = ArtWidth * ArtSize;
		canvas.height = ArtHeight * ArtSize;
		context = canvas.getContext('2d', {alpha: false});
		context.fillStyle = 'white';
		context.fillRect(0, 0, canvas.width, canvas.height);
	},
	methods: {
		onStart (userId, chainId) {
			var config, chainName = 'Test';
			if (chainId === '0x1') {
				chainName = 'Mainnet';
				config = Contracts.config.mainnet;
			}
			else if (chainId === '0x3') {
				chainName = 'Ropsten';
				config = Contracts.config.ropsten;
			}
			else {
				config = Contracts.config.test;
			}

			ctrRTV = new web3.eth.Contract(Contracts.abi.rtv, config.rtv);
			ctrPEN = new web3.eth.Contract(Contracts.abi.pen, config.pen);
			ctrCVS = new web3.eth.Contract(Contracts.abi.cvs, config.cvs);

			userType = 0;
			userProof = [];
			wallet = null;
			this.userStatus = '';
			this.myID = userId;
			this.getBasicInfos();

			var blockFrom = config.from;
			console.log('Login ' + chainName + ' as ' + userId);

			if (showPurchaseHistory) {
				ctrPEN.getPastEvents('Purchase', {filter: {owner: userId}, fromBlock: blockFrom}).then(events => {
					console.log('[:> My Purchase History <:]');
					events.forEach(evt => {
						console.log('|-------------------------------------------|');
						console.log('  BlockNum: ' + evt.blockNumber);
						console.log('    TxHash: ' + evt.transactionHash);
						var s = evt.returnValues.startTokenId * 1;
						var l = evt.returnValues.count * 1;
						var r = [];
						for (let i = 0; i < l; i ++) {
							r.push(s + i);
						}
						console.log('    PenIDs: ' + r.join(','));
					});
				});
			}
			if (dbReady) {
				this.requestDrawHistory(chainName, blockFrom);
			}
			else {
				dbHooker = () => this.requestDrawHistory(chainName, blockFrom);
			}

			ctrCVS.events.Draw((_, evt) => {
				if (emittedDrawEvents.has(evt.transactionHash)) return;
				emittedDrawEvents.add(evt.transactionHash);
				var color = (evt.returnValues.color * 1).toString(16);
				color = '#' + String.blank(6 - color.length, '0') + color;
				var data = {
					blockNum: evt.blockNumber * 1,
					txHash: evt.transactionHash,
					owner: evt.returnValues.owner,
					x: evt.returnValues.x * 1,
					y: evt.returnValues.y * 1,
					price: evt.returnValues.price * 1,
					color,
				};
				cacheDB.set('history', chainName + '-' + this.cvsID + ':' + data.txHash, data);
				cacheDB.set('canvas', chainName + '-' + this.cvsID + ':' + data.x + '-' + data.y, data);
				drawGrid(data.x, data.y, data.color, true);
				if (this.lastDrawBlockNum < data.blockNum) this.lastDrawBlockNum = data.blockNum;
				cacheDB.set('history', chainName + ':0', this.lastDrawBlockNum);
			});
		},
		onClick (evt) {
			var padX = canvas.clientWidth / ArtWidth, padY = canvas.clientHeight / ArtHeight;
			var x = Math.floor(evt.offsetX / padX), y = Math.floor(evt.offsetY / padY);
			if (x < 0 || x >= ArtWidth) return;
			if (y < 0 || y >= ArtHeight) return;
			this.pointX = x;
			this.pointY = y;
			this.getPixelInfo(x, y);
		},
		onDraw () {
			if (this.pointX < 0 || this.pointX >= ArtWidth || this.pointY < 0 || this.pointY >= ArtHeight) {
				notify({title: 'Select a Point first', type: 'warn'});
				return;
			}
			var color = getCurrentMetaPen();
			color = (color[0] * 256 + color[1]) * 256 + color[2];
			var token = wallet.filter(w => !w.used);
			if (token.length === 0) {
				notify({title: "No Usable MetaPen", type: 'warn'});
				return;
			}
			token = token[0].tokenID;
			this.drawPixel(this.pointX, this.pointY, color, token);
		},
		onChange () {
			var amount = this.$refs.penPurchaseAmount.value * 1;
			this.penPay = amount * this.penPrice;
		},

		async requestDrawHistory (chainName, blockFrom) {
			var prefix = chainName + '-' + this.cvsID + ':';
			var num = await cacheDB.get('history', prefix + '0');
			if (!num) num = blockFrom;
			else num --;

			// load db canvas first
			var list = await cacheDB.all('canvas');
			for (let key in list) {
				if (key.indexOf(prefix) !== 0) continue;
				let data = list[key];
				drawGrid(data.x, data.y, data.color, true);
			}

			// load canvas from chain
			list = await ctrCVS.getPastEvents('Draw', {filter: {canvasId: this.cvsID}, fromBlock: num});
			list = list.map(evt => {
				var color = (evt.returnValues.color * 1).toString(16);
				color = '#' + String.blank(6 - color.length, '0') + color;
				var data = {
					blockNum: evt.blockNumber * 1,
					txHash: evt.transactionHash,
					owner: evt.returnValues.owner,
					x: evt.returnValues.x * 1,
					y: evt.returnValues.y * 1,
					price: evt.returnValues.price * 1,
					color,
				};
				return data;
			});
			list.sort((d1, d2) => d1.blockNum - d2.blockNum);
			list.forEach(data => {
				cacheDB.set('history', prefix + ':' + data.txHash, data);
				cacheDB.set('canvas', prefix + ':' + data.x + '-' + data.y, data);
				drawGrid(data.x, data.y, data.color, true);
			});
			var last = list[list.length - 1];
			if (!!last) {
				this.lastDrawBlockNum = last.blockNum;
			}
			else {
				this.lastDrawBlockNum = 0;
			}
			await cacheDB.set('history', prefix + '0', this.lastDrawBlockNum);
		},

		doConvert () {
			var eth = this.$refs.testETH.value * 1;
			this.convertETH = eth * 1e18;
		},
		async getBasicInfos () {
			eventBus.pub('showMask');

			Artiverso.checkMintStage().then(mintProof => {
				userType = mintProof.stage;
				userProof = [];
				if (userType === 0) { // normal user
					this.userStatus = '';
					if (mintStage === 0) {
						this.mentionHint = '(Please wait for mint)';
						this.canMint = false;
					}
					else if (mintStage === 1) {
						this.mentionHint = '(You are not in the OG list)';
						this.canMint = false;
					}
					else if (mintStage === 2) {
						this.mentionHint = '(You are not in the PreSale list)';
						this.canMint = false;
					}
					else {
						this.mentionHint = '';
						this.canMint = true;
					}
				}
				else if (userType === 1) { // presale user
					this.userStatus = ' | PreSale User';
					if (mintStage === 0) {
						this.mentionHint = '(Please wait for mint)';
						this.canMint = false;
					}
					else if (mintStage === 1) {
						this.mentionHint = '(You are not in the OG list)';
						this.canMint = false;
					}
					else {
						this.mentionHint = '';
						this.canMint = true;
						if (mintStage === 2) {
							userProof = mintProof.proof;
						}
					}
				}
				else if (userType === 2) { // og user
					this.userStatus = ' | OG User';
					if (mintStage === 0) {
						this.mentionHint = '(Please wait for mint)';
						this.canMint = false;
					}
					else {
						this.mentionHint = '';
						this.canMint = true;
						if (mintStage <= 2) {
							userProof = mintProof.proof;
						}
					}
				}
			});

			var tasks = [];
			tasks.push(this.isPENPaused());
			tasks.push(this.isRTVPaused());
			tasks.push(this.getCanvasID());
			tasks.push(this.getCanvasCanWithdraw());
			tasks.push(this.getPenPrice());
			tasks.push(this.getPenTotalSupply());
			tasks.push(this.getPenTotalUnused());
			tasks.push(this.getPenMyBalance());
			tasks.push(this.getPenMyAvailable());
			tasks.push(this.getPenMyTotal());
			tasks.push(this.getRTVTotalSupply());
			tasks.push(this.getRTVMyBalance());
			await Promise.all(tasks);

			tasks = [];
			tasks.push(this.getCanvasTotalDraw());
			tasks.push(this.getCanvasSharing());
			tasks.push(this.getPenList());
			await Promise.all(tasks);

			this.allReady = true;

			eventBus.pub('hideMask');
		},

		async callRTV (method, ...params) {
			return await ctrRTV.methods[method](...params).call({
				from: this.myID
			});
		},
		async callPEN (method, ...params) {
			return await ctrPEN.methods[method](...params).call({
				from: this.myID
			});
		},
		async callCVS (method, ...params) {
			return await ctrCVS.methods[method](...params).call({
				from: this.myID
			});
		},

		async isPENPaused () {
			var result = await this.callPEN('isPaused');
			console.log('PEN Paused: ', result);
		},
		async isRTVPaused () {
			var result = await this.callRTV('isPaused');
			console.log('RTV Paused: ', result);
		},

		async getCanvasID () {
			var result = await this.callCVS('getCanvasId');
			this.cvsID = result;
		},
		async getCanvasTotalDraw () {
			var result = await this.callCVS('getTotalDraw', this.cvsID);
			this.cvsDrawn = result;
		},
		async getCanvasCanWithdraw () {
			var result = await this.callCVS('canWithdraw');
			console.log('Can WithDraw: ' + result);
		},
		async getCanvasSharing () {
			var result = await this.callCVS('getSharing', this.cvsID);
			this.cvsStock = result;
		},
		async getPenPrice () {
			var result = await this.callPEN('getPenPrice');
			result = result * 1;
			result = result / 1000000000000000000;
			this.penPrice = result;
		},
		async getPenTotalSupply () {
			var result = await this.callPEN('totalSupply');
			this.penSupply = result;
		},
		async getPenTotalUnused () {
			var result = await this.callPEN('totalAvailable');
			this.penAvailable = result;
		},
		async getPenMyBalance () {
			var result = await this.callPEN('balanceOf', this.myID);
			this.penUBalance = result;
		},
		async getPenMyAvailable () {
			var result = await this.callPEN('availableOf', this.myID);
			this.penUAvailable = result;
		},
		async getPenMyTotal () {
			var result = await this.callPEN('totalOf', this.myID);
			this.penUTotal = result;
		},
		async getRTVTotalSupply () {
			var result = await this.callRTV('totalSupply');
			this.rtvSupply = result;
		},
		async getRTVMyBalance () {
			var result = await this.callRTV('balanceOf', this.myID);
			this.rtvBalance = result;
		},
		async getPenList () {
			var tasks = [];
			for (let i = 0; i < this.penUTotal; i ++) {
				tasks.push(i);
			}
			var list = await Promise.all(tasks.map(async i => {
				var tokenID = await this.callPEN('tokenOfOwnerByIndex', this.myID, i);
				tokenID = tokenID * 1;
				if (tokenID === 0 || typeof tokenID !== 'number') {
					return null;
				}
				var info = await this.callPEN('tokenInfo', tokenID);
				return {
					tokenID,
					index: i,
					used: info.used,
					timestamp: info.timestamp,
					blocknum: info.blocknum
				};
			}));
			list = list.filter(i => !!i);
			wallet = list;
			var unused = list.filter(i => !i.used);
			if (unused.length === 0) this.penList = 'EMPTY';
			else this.penList = unused.map(i => i.tokenID).join(', ');
		},
		async getPixelInfo (x, y) {
			eventBus.pub('showMask');

			var result = await this.callCVS('getPixelInfo', this.cvsID, x, y);
			result[0] *= 1;
			result[2] *= 1;
			result[3] *= 1;
			var color = result[0];
			var rgb = [0, 0, 0];
			rgb[1] = color >> 8;
			rgb[2] = color - (rgb[1] << 8);
			color = rgb[1];
			rgb[0] = color >> 8;
			rgb[1] = color - (rgb[0] << 8);
			color = 'RGB(' + rgb.join(',') + ')';
			if (result[3] > 0) drawGrid(x, y, color, true);
			this.pointColor = color;
			this.pointOwner = result[3] === 0 ? 'nobody' : result[1];
			this.pointPrice = result[2] + (result[3] === 0 ? 0 : 300);

			eventBus.pub('hideMask');
		},
		async drawPixel (x, y, color, penID) {
			eventBus.pub('showMask', 1000 * 60 * 15);

			try {
				let result = await ctrCVS.methods.drawPixel(this.cvsID, penID, x, y, color).send({
					from: this.myID
				});
				notify({title: 'DrawPixel Success', message: 'TxHash: ' + result.events.Draw.transactionHash, type: 'success'});

				let rgb = [0, 0, 0];
				rgb[1] = color >> 8;
				rgb[2] = color - (rgb[1] << 8);
				color = rgb[1];
				rgb[0] = color >> 8;
				rgb[1] = color - (rgb[0] << 8);
				rgb = 'RGB(' + rgb.join(',') + ')';
				drawGrid(x, y, color, true);
				this.getBasicInfos();
			}
			catch (err) {
				console.error('DrawPixel Error!');
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
				notify({title: 'DrawPixel Failed', message: "You can view the detail on EtherScan.\nTxHash: " + txHash + '\nBlockHash: ' + blockHash, duration: 10000, type: 'error'});
			}

			eventBus.pub('hideMask');
		},
		async getPenPurchase () {
			eventBus.pub('showMask', 1000 * 60 * 15);
			this.penPurchaseSuccessHint = '';
			var amount = this.$refs.penPurchaseAmount.value * 1;
			amount *= this.penPrice;
			if (amount === 0) {
				notify({title: "Can't buy MetaPen without ETH", type: 'error'});
				eventBus.pub('hideMask');
				return;
			}
			amount = web3.utils.toWei(amount + '');

			var result;
			try {
				result = await ctrPEN.methods.mintMetaPen(userProof).send({
					from: this.myID,
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
		async getRTVTransferTo () {
			eventBus.pub('showMask', 1000 * 60 * 15);
			var to = this.$refs.rtvTransferTo.value;
			var amount = this.$refs.rtvTransferAmount.value * 1;
			var result;
			try {
				this.rtvTransferToResult = 'submitted and MetaMask is working';
				result = await ctrRTV.methods.transfer(to, amount).send({
					from: this.myID
				});
				this.rtvTransferToResult = '';
				notify({title: 'Transfer Success', message: "You can check this transaction on EtherScan", type: 'success'});
				this.getBasicInfos();
			}
			catch (err) {
				console.error('Transfer Error!');
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
				notify({title: 'Transfer Failed', message: "You can view the detail on EtherScan.\nTxHash: " + txHash + '\nBlockHash: ' + blockHash, duration: 10000, type: 'error'});
			}
			eventBus.pub('hideMask');
		},
		async getPENTransferTo () {
			eventBus.pub('showMask', 1000 * 60 * 15);
			var to = this.$refs.penTransferTo.value;
			var tokenID = this.$refs.penTransferToken.value * 1;
			var result;
			try {
				this.penTransferToResult = 'submitted and MetaMask is working';
				result = await ctrPEN.methods.transfer(to, tokenID).send({
					from: this.myID
				});
				this.penTransferToResult = 'Transfer Done. TxHash: ' + result.events.Transfer.transactionHash + ', gas used: ' + result.gasUsed;
				notify({title: 'Transfer Success', message: "You can check this transaction on EtherScan\nTxHash: " + result.events.Transfer.transactionHash + '\nGas: ' + result.gasUsed, type: 'success'});
				this.getBasicInfos();
			}
			catch (err) {
				console.error('Transfer Error!');
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
				notify({title: 'Transfer Failed', message: "You can view the detail on EtherScan.\nTxHash: " + txHash + '\nBlockHash: ' + blockHash, duration: 10000, type: 'error'});
			}
			eventBus.pub('hideMask');
		},
	},
}
</script>