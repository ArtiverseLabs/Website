<template>
	<div class="container fullsize">
		<div class="title">Showcase (demo)</div>
		<div class="content">Choose MetaPen color: <color-pad/></div>
		<div class="frame">
			<div class="canvas" @mousemove="onMove" @mousedown="onClick"><canvas ref="canvas"></canvas></div>
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
						<span>{{pointColor1}}</span>
					</div>
					<div class="infoItem">
						<span class="hint"></span>
						<span>{{pointColor2}}</span>
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
						<span class="hint">Wallet:</span>
						<span>{{myCoin}}</span>
					</div>
				</div>
			</div>
		</div>
		<div class="content center"><button @click="gotoMint">You need a MetaPen to draw.</button></div>
	</div>
</template>

<style scoped>
div.container {
	position: relative;
}
div.content.center {
	margin-top: 30px;
	text-align: center;
}
div.content.center button {
	padding: 5px 15px;
	font-size: 18px;
	font-weight: bold;
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
@media screen and (max-width: 1150px) {
	div.content.center {
		margin-top: 0px;
	}
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

const ArtWidth = 100, ArtHeight = 100, ArtSize = 10;
const DrawDelay = 10, PenDuration = 50;
const Fluctuation = 12;
var canvas, context, tmrDraw, tmrCD, pixels, origin;
var cacheDB, cacheList;
var lastX = -1, lastY = -1;
var drawTask = [], canvasTask = [], cacheTask = [];

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
const convertColorRGB = num => {
	var a = num >> 8, b = num - (a << 8);
	var result = [0, 0, b];
	b = a;
	a = a >> 8;
	result[0] = a;
	result[1] = b - (a << 8);
	return result;
};
const prepareDB = async () => {
	if (!!cacheDB) return;
	var dbName = 'MasterWork';
	cacheDB = new window.CachedDB(dbName, 1);
	cacheDB.onUpdate(() => {
		cacheDB.open('pixel', 'position', 10000);
		console.log(dbName + ': Updated');
	});
	cacheDB.onConnect(() => {
		console.log(dbName + ': Connected');
	});
	await cacheDB.connect();
};
const resumeSaveTasks = () => {
	if (!cacheList) return;
	if (cacheList.length <= 0) return;
	cacheList.forEach(item => {
		cacheDB.set('pixel', ...item);
	});
};

export default {
	name: 'Showcase',
	data () {
		return {
			launchTask: ['mount', 'socket'],
			pixels: [],
			pointX: 0,
			pointY: 0,
			pointColor1: 'rgb(0, 0, 0)',
			pointColor2: '#000000',
			pointOwner: 'nobody',
			pointPrice: 0,
			myCoin: 0,
			targetTime: 0,
		}
	},
	components: {
		ColorPad
	},
	created () {
		eventBus.sub('loadArtiverso', (_pixels) => {
			var index = canvasTask.indexOf('socket');
			if (index < 0) return;
			canvasTask.splice(index, 1);

			pixels = _pixels;
			var dbReady = !cacheTask.includes('db');
			if (!dbReady) cacheList = [];
			pixels.forEach((p, i) => {
				if (!p[0]) return;
				var d = [...p];
				if (dbReady) cacheDB.set('pixel', i, d);
				else cacheList.push([i, d]);
			});

			if (canvasTask.length === 0) this.onCanvasReady();
		});
		eventBus.sub('userLogin', info => {
			this.myCoin = info.balance;
			this.targetTime = info.target;
		});
		eventBus.sub('drawArtiverso', result => {
			eventBus.pub('hideMask');
			if (!result.success) {
				notify({title:result.reason, type: 'error'});
				return;
			}
			this.myCoin = result.user.balance;

			var index = result.pixel.x * ArtHeight + result.pixel.y;
			var db = [MyID, result.pixel.price, result.pixel.color];
			cacheDB.set('pixel', index, db);
			var info = this.pixels[index];
			info[0] = MyID;
			info[1] = result.pixel.price;
			info[3] = convertColorRGB(result.pixel.color);
			var p = result.pixel.color.toString(16);
			if (p.length < 6) p = String.blank(6 - p.length, '0') + p;
			p = '#' + p;
			info[2] = p;
			drawGrid(result.pixel.x, result.pixel.y, p, true, 1);
		});
		eventBus.sub('drawCanvas', info => {
			var rgb = convertColorRGB(info.color);
			var cname = info.color.toString(16);
			if (cname.length < 6) cname = String.blank(6 - cname.length, '0') + cname;
			cname = '#' + cname;
			var index = info.x * ArtHeight + info.y;
			var db = [info.id, info.price, info.color];
			cacheDB.set('pixel', index, db);
			var dot = this.pixels[index];
			dot[0] = info.id;
			dot[1] = info.price;
			dot[2] = cname;
			dot[3] = rgb;
			drawGrid(info.x, info.y, cname, true, 1);
		});
		if (!!window.io) {
			this.onMounted('socket');
		}
		else {
			eventBus.sub('launch-socket', () => {
				this.onMounted('socket');
			});
		}
	},
	mounted () {
		eventBus.pub('showMask');

		canvas = this.$refs.canvas;
		canvas.width = ArtWidth * ArtSize;
		canvas.height = ArtHeight * ArtSize;
		context = canvas.getContext('2d', {alpha: false});

		var img = new Image();
		cacheTask = ['image', 'db'];
		canvasTask = ['image', 'socket'];
		img.onload = () => {
			var cvs = document.createElement('canvas');
			var ctx = cvs.getContext('2d', {alpha: false});
			ctx.drawImage(img, 0, 0);
			var pixel = ctx.getImageData(0, 0, 100, 100).data;
			origin = [];
			var k = 0;
			for (let i = 0; i < 100; i ++) {
				for (let j = 0; j < 100; j ++) {
					let r = pixel[k];
					let g = pixel[k + 1];
					let b = pixel[k + 2];
					origin.push([r, g, b]);
					k += 4;
				}
			}
			var index = canvasTask.indexOf('image');
			if (index >= 0) {
				canvasTask.splice(index, 1);
				if (canvasTask.length === 0) {
					this.onCanvasReady();
					return;
				}
			}
			index = cacheTask.indexOf('image');
			if (index >= 0) {
				cacheTask.splice(index, 1);
				if (cacheTask.length === 0) {
					this.onCanvasReady();
				}
			}
		};
		img.src = '/pic/init.png';

		prepareDB().then(async () => {
			if (canvasTask.length === 0) return resumeSaveTasks();

			var db = await cacheDB.all('pixel');
			var px = [];
			for (let i = 0; i < 10000; i ++) {
				let j = db[i];
				if (!j) {
					px.push(['', 0, 0]);
				}
				else {
					px.push(j);
				}
			}
			if (canvasTask.length === 0) return resumeSaveTasks();
			pixels = px;

			var index = cacheTask.indexOf('db');
			if (index >= 0) {
				cacheTask.splice(index, 1);
				if (cacheTask.length === 0) {
					this.onCanvasReady();
				}
			}

			resumeSaveTasks();
		});

		this.onMounted('mount');
	},
	methods: {
		onMounted (task) {
			var index = this.launchTask.indexOf(task);
			if (index < 0) return;
			this.launchTask.splice(index, 1);
			if (this.launchTask.length > 0) return;
			SocketChannel.sendRequest('loadArtiverso');
			if (window.MyID) SocketChannel.sendRequest('userLogin', MyID);
		},
		onMove (evt) {
			var padX = canvas.clientWidth / ArtWidth, padY = canvas.clientHeight / ArtHeight;
			var x = Math.floor(evt.offsetX / padX), y = Math.floor(evt.offsetY / padY);
			if (x < 0 || x >= ArtWidth) return;
			if (y < 0 || y >= ArtHeight) return;
			if (x === lastX && y === lastY) return;
			lastX = x;
			lastY = y;
			var index = x * ArtHeight + y;
			var info = this.pixels[index];
			if (!info) return;
			this.pointX = x;
			this.pointY = y;
			this.pointOwner = info[0] || 'nobody';
			this.pointPrice = info[1] || 0;
			this.pointColor1 = 'rgb(' + info[3].join(',') + ')';
			this.pointColor2 = info[2];
			if (!!info[0]) return;
			var color = getCurrentMetaPen();
			drawTask.push([x, y, color, PenDuration]);
			this.callRedraw();
		},
		onCanvasReady () {
			eventBus.pub('hideMask');
			var k = 0;
			for (let i = 0; i < Artiverso.width; i ++) {
				for (let j = 0; j < Artiverso.height; j ++) {
					let info = pixels[k] || ['', 0, 0];
					let p;
					if (info[0] === '') {
						let c = origin[j * 100 + i];
						info[3] = c;
						p = (c[0] * 256 + c[1]) * 256 + c[2];
					}
					else {
						p = info[2];
						info[3] = convertColorRGB(p);
					}
					p = p.toString(16);
					if (p.length < 6) p = String.blank(6 - p.length, '0') + p;
					p = '#' + p;
					info[2] = p;
					this.pixels[k] = info;
					drawGrid(i, j, p, true, 1);
					k ++;
				}
			}
			this.callRedraw();
		},
		onClick (evt) {
			var padX = canvas.clientWidth / ArtWidth, padY = canvas.clientHeight / ArtHeight;
			var x = Math.floor(evt.offsetX / padX), y = Math.floor(evt.offsetY / padY);
			if (x < 0 || x >= ArtWidth) return;
			if (y < 0 || y >= ArtHeight) return;
			var color = getCurrentMetaPen();
			color = (color[0] * 256 + color[1]) * 256 + color[2];
			eventBus.pub('showMask');
			SocketChannel.sendRequest('drawArtiverso', MyID, x, y, color);
		},
		callRedraw () {
			if (!!tmrDraw) {
				clearTimeout(tmrDraw);
				tmrDraw = null;
			}

			this.doDraw();

			if (drawTask.length === 0) {
				return;
			}

			tmrDraw = setTimeout(() => {
				this.callRedraw();
			}, DrawDelay);
		},
		doDraw () {
			var muds = new Map();
			var removes = [];
			drawTask.forEach((task, i) => {
				var key = task[0] + '-' + task[1];
				var old = muds.get(key);
				if (!old) {
					muds.set(key, {color: task[2], step: task[3], idx: i});
				}
				else if (task[3] > old.step) {
					if (!removes.includes(old.idx)) removes.push(old.idx);
					old.color = task[2];
					old.step = task[3];
					old.idx = i;
				}
				else {
					if (!removes.includes(i)) removes.push(i);
				}
			});

			var k = 0;
			for (let i = 0; i < Artiverso.width; i ++) {
				for (let j = 0; j < Artiverso.height; j ++) {
					let info = this.pixels[k];
					let p = info[2];
					let key = i + '-' + j;
					let mud = muds.get(key);
					if (!!mud) {
						let c = info[3];
						let q = mud.step / PenDuration;
						let r = Math.round(c[0] + (mud.color[0] - c[0]) * q);
						let g = Math.round(c[1] + (mud.color[1] - c[1]) * q);
						let b = Math.round(c[2] + (mud.color[2] - c[2]) * q);
						c = (r * 256 + g) * 256 + b;
						c = c.toString(16);
						if (c.length < 6) c = String.blank(6 - c.length, '0') + c;
						c = '#' + c;
						p = c;
						c = drawTask[mud.idx];
						c[3] --;
						if (c[3] <= 0 && !removes.includes(mud.idx)) removes.push(mud.idx);
						drawGrid(i, j, p, true, 1);
					}
					k ++;
				}
			}
			muds.clear();
			muds = null;

			removes.sort((a, b) => b - a);
			removes.forEach(idx => drawTask.splice(idx, 1));
		},
		gotoMint () {
			this.$router.push({path: '/mint'});
		},
	}
}
</script>