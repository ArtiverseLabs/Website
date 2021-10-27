<template>
	<div class="navbar">
		<div class="title">
			<span class="main">Artiverse</span>
			<span class="vice"> Labs</span>
		</div>
		<div class="mode">
			<i class="fas fa-moon" @click="toMoonMode"></i>
			<i class="far fa-sun" @click="toSunMode"></i>
		</div>
		<div class="button" :disabled="disabled" @click="connectWallet">{{stateTitle}}</div>
	</div>
	<div class="menu">
		<i class="fas fa-bars"></i>
		<div class="item" @click="goto('showcase')">Showcase</div>
		<div class="item" @click="goto('mint')">Mint</div>
		<div class="item" @click="goto('about')">About</div>
		<div class="item" @click="goto('roadmap')">Roadmap</div>
		<div class="item" @click="goto('team')">Team</div>
		<div class="item" @click="goto('contactus')">ContactUS</div>
		<div class="item" @click="goto('faq')">FAQ</div>
		<div class="item" @click="goto('newsletter')">Newsletter</div>
	</div>
	<div class="subbar">We All Gonna Make Art!</div>
</template>

<style scoped>
div.navbar {
	position: relative;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 50px;
	background-color: rgb(64, 64, 64);
	border-bottom: 1px solid rgb(0, 0, 0);
}

div.navbar div.title {
	padding-top: 8px;
	padding-left: 10px;
	font-size: 36px;
	font-weight: bolder;
}
div.navbar div.title span.main {
	color: rgb(203, 64, 66);
}
div.navbar div.title span.vice {
	color: rgb(0, 137, 167);
}

div.navbar div.mode {
	position: absolute;
	top: 15px;
	right: 20px;
	width: 20px;
	height: 20px;
	overflow: hidden;
	color: white;
	cursor: pointer;
}
div.navbar div.mode i {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 20px;
	text-align: center;
}
div.navbar div.mode i.fa-moon {
	left: 0px;
}
.dark-mode div.navbar div.mode i.fa-moon {
	left: -20px;
}
div.navbar div.mode i.fa-sun {
	left: 20px;
	color: rgb(249, 244, 220);
}
.dark-mode div.navbar div.mode i.fa-sun {
	left: 0px;
}

div.menu {
	position: relative;
	left: 0px;
	width: 100%;
	padding-top: 10px;
	padding-bottom: 5px;
	border-bottom: 1px solid rgb(105, 105, 105);
}
div.menu div.item {
	display: inline-block;
	margin-left: 10px;
	margin-right: 10px;
	font-weight: bolder;
	cursor: pointer;
}
div.menu > i {
	display: none;
	position: relative;
	cursor: pointer;
	pointer-events: none;
}
div.menu div.item:hover {
	color: rgb(65, 105, 225);
}

div.subbar {
	padding: 5px 10px 2px 10px;
	background-color: rgb(64, 64, 64);
	border-bottom: 1px solid rgb(0, 0, 0);
	color: rgb(240, 240, 240);
	text-align: center;
}

div.navbar div.button {
	position: absolute;
	top: 125px;
	right: 20px;
	cursor: pointer;
	z-index: 110;
}

@media screen and (max-width: 730px) {

div.navbar div.title {
	padding-left: 35px;
}

div.menu {
	position: absolute;
	z-index: 2;
	top: 0px;
	left: 0px;
	width: 30px;
	height: 50px;
	padding: 10px;
	background-color: transparent;
	border: none;
	overflow: hidden;
}
div.menu:hover {
	width: 110px;
	height: 320px;
	background-color: rgb(250, 250, 250);
	border: 1px solid rgb(45, 45, 45);
}
.dark-mode div.menu:hover {
	background-color: rgb(25, 25, 25);
	border: 1px solid rgb(105, 105, 105);
}
div.menu > i {
	display: block;
	margin-top: 5px;
	margin-bottom: 15px;
	pointer-events: auto;
	color: rgb(240, 240, 240);
}
div.menu:hover > i {
	color: rgb(45, 45, 45);
}
.dark-mode div.menu:hover > i {
	color: rgb(240, 240, 240);
}
div.menu div.item {
	display: block;
	margin-top: 10px;
	margin-bottom: 10px;
	margin-left: 0px;
	margin-right: 0px;
}
div.navbar div.button {
	top: 88px;
}

}
</style>

<script>
var tmrWeb3, wallet;

export default {
	name: 'NavBar',
	data () {
		return {
			disabled: true,
			stateTitle: 'WAITING...',
			chainID: '',
			currUser: '',
		}
	},
	mounted () {
		if (!!tmrWeb3) clearInterval(tmrWeb3);
		if (!window.ethereum) {
			tmrWeb3 = setInterval(() => {
				if (!!window.ethereum) {
					clearInterval(tmrWeb3);
					tmrWeb3 = null;
					this.onEthReady();
				}
			}, 1000);
		}
		else {
			tmrWeb3 = null;
			this.onEthReady();
		}
	},
	methods: {
		onEthReady () {
			this.disabled = false;
			this.stateTitle = 'Connect';
			ethereum.on('accountsChanged', userId => {
				console.log('Ethereum::AccountsChanged', userId);
				if (typeof userId === 'string') this.currUser = userId;
				else this.currUser = userId[0];
				eventBus.pub('eth-change-user', this.currUser);
			});
			ethereum.on('chainChanged', async chainId => {
				console.log('Ethereum::ChainChanged', chainId);
				this.chainID = chainId;

				var accounts;
				try {
					accounts = await ethereum.request({ method: 'eth_requestAccounts' });
				}
				catch (err) {
					console.error('Connect to MetaMask failed:\n' + err.message);
					return;
				}
				if (!this.currUser || !accounts.includes(this.currUser)) {
					this.currUser = accounts[0];
				}
				eventBus.pub('eth-change-user', this.currUser);
			});
			ethereum.on('message', msg => {
				console.log('Ethereum::Message', msg.data);
			});

			var connect = localStorage.get('metamask-connected', false);
			if (connect) this.connectWallet();
		},
		async connectWallet () {
			var accounts, chainId;
			try {
				accounts = await ethereum.request({ method: 'eth_requestAccounts' });
			}
			catch (err) {
				notify({title: 'Connect to MetaMask failed', message: err.message});
				console.error('Connect to MetaMask failed:\n' + err.message);
				return;
			}
			console.log('Connect to Ethereum Successfully.\nEthereum Account:\n' + accounts.join('\n'));
			this.disabled = true;
			this.stateTitle = 'connected';
			this.currUser = accounts[0];

			try {
				chainId = await ethereum.request({ method: 'eth_chainId' });
			}
			catch (err) {
				console.error('Get Eth ChainId Failed:\n' + err.message);
				return;
			}
			console.log('Chain ID: ' + chainId);
			this.chainID = chainId;
			eventBus.pub('eth-change-user', this.currUser, this.chainID);
			localStorage.set('metamask-connected', true);
		},
		toMoonMode () {
			eventBus.pub('page-dark-mode', true);
		},
		toSunMode () {
			eventBus.pub('page-dark-mode', false);
		},
		goto (target) {
			if (this.$route.name === 'Home') {
				eventBus.pub('navigator-goto', target);
			}
			else {
				this.$router.push({
					name: 'Home',
					params: { target }
				});
			}
		}
	}
}
</script>