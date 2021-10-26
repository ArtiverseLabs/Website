<template>
	<div class="container">
		<h1>ColorList</h1>
		<button class="refresh" @click="onClick"><i class="fas fa-sync"></i></button>
		<section>
			<article v-for="(item, index) in list">
				<div class="item">
					<span class="hint">ETH Address:</span>
					<span>{{item.address}}</span>
				</div>
				<div class="item">
					<span class="hint">Email:</span>
					<span>{{item.email}}</span>
				</div>
				<div class="item" v-if="!!item.twitter">
					<span class="hint">Twitter:</span>
					<span>{{item.twitter}}</span>
				</div>
				<div class="item long" v-if="!!item.message">
					<span class="hint">Message:</span>
					<span class="message">{{item.message}}</span>
				</div>
				<div class="button" @click="onRemove(index)"><i class="fas fa-eraser"></i></div>
			</article>
		</section>
		<div class="mask" :show="showMask">
			<div class="frame">
				<div class="hint">Input administrator password please:</div>
				<input ref="pwd" type="password" @keydown.enter="onLogin" @keydown.esc="cancelLogin">
				<div class="btnarea">
					<button @click="onLogin">Confirm</button>
					<button @click="cancelLogin">Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
div.container {
	position: relative;
	box-sizing: border-box;
	width: 1500px;
	max-width: 100%;
	margin-left: auto;
	margin-right: auto;
	margin-bottom: -40px;
	padding: 0px 50px;
}
h1 {
	margin-top: 0px;
	margin-bottom: 20px;
	padding: 10px;
	border-bottom: 1px solid rgb(145, 152, 159);
	font-size: 24px;
	font-weight: bolder;
}
.dark-mode h1 {
	border-bottom: 1px solid rgb(127, 127, 127);
}
button.refresh {
	position: absolute;
	top: 8px;
	left: 180px;
}
section {
	text-align: left;
}
section article {
	position: relative;
	margin-top: 15px;
	padding-left: 10px;
	padding-right: 10px;
	padding-bottom: 15px;
	border-bottom: 1px solid rgb(145, 152, 159);
}
section article:last-child {
	border-bottom: none;
}
section article div.item {
	margin-top: 5px;
	margin-bottom: 5px;
}
section article div.item.long {
	display: flex;
	flex-flow: row;
}
section article div.item span.hint {
	display: inline-block;
	width: 130px;
	margin-right: 5px;
	font-weight: bolder;
	text-align: right;
}
section article div.item.long span.hint {
	flex: 0 0 130px;
}
section article div.item.long span.message {
	display: inline-block;
	white-space: pre;
}
section article div.button {
	position: absolute;
	top: 0px;
	right: 10px;
	cursor: pointer;
}
div.mask {
	position: fixed;
	z-index: 200;
	top: 0px;
	bottom: 0px;
	left: 0px;
	width: 0%;
	background-color: rgba(54, 41, 47, 0.5);
	opacity: 0;
	pointer-events: none;
	overflow: hidden;
}
div.mask[show="true"] {
	width: 100%;
	opacity: 1;
	pointer-events: auto;
}
div.mask div.frame {
	box-sizing: border-box;
	position: absolute;
	top: 50%;
	left: 50%;
	width: 360px;
	height: 110px;
	padding: 10px;
	background-color: rgb(30, 19, 29);
	border-radius: 8px;
	box-shadow: inset 0px 0px 2px 1px rgba(226, 225, 228, 0.6), 3px 3px 6px rgba(34, 32, 46, 0.8);
	color: rgb(249, 244, 220);
	transform: translate(-50%, -50%);
	text-align: center;
}
div.mask div.frame div.hint {
	padding-top: 0px;
	padding-bottom: 2px;
	padding-left: 5px;
	padding-right: 5px;
	border-bottom: 1px solid rgb(249, 244, 220);
	font-size: 18px;
	font-weight: bolder;
	text-align: left;
}
div.mask div.frame input {
	width: 300px;
	margin-top: 10px;
	margin-bottom: 12px;
	background-color: transparent;
	border: none;
	border-bottom: 1px solid rgb(249, 244, 220);
	color: rgb(249, 244, 220);
	outline: none;
}
div.mask div.frame div.btnarea button {
	width: 80px;
	margin-left: 20px;
	margin-right: 20px;
	padding: 5px 10px;
	background-color: transparent;
	border: 1px solid rgb(166, 27, 41);
	border-radius: 5px;
	box-shadow: 2px 2px 5px rgba(204, 204, 214, 0.3), 1px 1px 3px rgba(47, 47, 53, 0.6);
	color: rgb(249, 244, 220);
	outline: none;
	cursor: pointer;
}
</style>

<script>
export default {
	name: 'ColorlistManager',
	data () {
		return {
			list: [],
			showMask: false,
		};
	},
	mounted () {
		eventBus.sub('queryColorlist', msg => {
			eventBus.pub('hideMask');
			if (!msg.success) {
				notify({title: msg.reason, type: 'error'});
				return;
			}

			this.list = msg.data.map(item => {
				return {
					address: item[0],
					email: item[1],
					twitter: item[2],
					message: item[3],
				};
			});
		});
		eventBus.sub('removeColorlist', result => {
			eventBus.pub('hideMask');
			if (!result.success) {
				notify({title: result.reason, type: 'error'});
				return;
			}
			notify({title: 'Delete ColorList record successfully', type: 'success'});

			this.onMounted();
		});
		eventBus.sub('adminLogin', msg => {
			eventBus.pub('hideMask');
			if (msg.success) {
				localStorage.set('__token__', msg.token);
				this.showMask = false;
				this.onMounted();
			}
			else {
				notify({title: 'Login failed', type: 'error'});
			}
		});
		eventBus.sub('checkAdminLogin', msg => {
			eventBus.pub('hideMask');
			if (msg.success) {
				this.showMask = false;
				this.onMounted();
			}
			else {
				this.showMask = true;
			}
		});

		var token = localStorage.get('__token__', '');
		if (!token) {
			setTimeout(() => {
				this.showMask = true;
			}, 100);
		}
		else {
			eventBus.pub('showMask');
			SocketChannel.sendRequest('checkAdminLogin', token);
		}
	},
	methods: {
		onMounted () {
			eventBus.pub('showMask');
			SocketChannel.sendRequest('queryColorlist');
		},
		onRemove (index) {
			var info = this.list[index];
			var msg = JSON.stringify(info);
			var packLen = Math.ceil(msg.length / 256), packs = [];
			for (let i = 0; i < packLen; i ++) {
				let m = msg.substr(i * 256, 256);
				m = encrypt(m);
				packs[i] = m;
			}
			eventBus.pub('showMask');
			SocketChannel.sendRequest('removeColorlist', localStorage.get('__token__', ''), packs);
		},
		onLogin () {
			var pwd = this.$refs.pwd.value;
			eventBus.pub('showMask');
			SocketChannel.sendRequest('adminLogin', [encrypt(pwd)]);
		},
		cancelLogin () {
			this.$router.push({path: '/colorlist'})
		},
		onClick () {
			this.onMounted();
		},
	}
}
</script>