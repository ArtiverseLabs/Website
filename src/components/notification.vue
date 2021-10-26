<template>
	<div class="notifaction-frame" :horizontal="hAlign" :vertial="vAlign" @click="onClick"></div>
</template>

<style>
.notifaction-frame {
	position: fixed;
	display: flex;
	max-width: 30%;
	top: 10px;
	left: 50%;
	z-index: 550;
	transform: translateX(-50%);
	flex-direction: column-reverse;
	text-align: center;
}
@media screen and (max-width: 1000px) {
	.notifaction-frame {
		max-width: 300px;
	}
}
@media screen and (max-width: 300px) {
	.notifaction-frame {
		max-width: 100%;
	}
}
.notifaction-frame[vertial="middle"] {
	top: 50%;
	transform: translateX(-50%), translateY(-50%);
}
.notifaction-frame[vertial="bottom"] {
	top: auto;
	bottom: 0px;
	flex-direction: column;
}
.notifaction-frame[horizontal="left"] {
	left: 0px;
	transform: none;
	text-align: left;
}
.notifaction-frame[horizontal="right"] {
	left: auto;
	right: 0px;
	transform: none;
	text-align: right;
}
.notifaction-frame[horizontal="left"][vertial="middle"] {
	transform: translateY(-50%);
}
.notifaction-frame[horizontal="left"][vertial="bottom"] {
	transform: none;
}
.notifaction-frame[horizontal="right"][vertial="middle"] {
	transform: translateY(-50%);
}
.notifaction-frame[horizontal="right"][vertial="bottom"] {
	transform: none;
}

.notifaction-frame section {
	box-sizing: border;
	min-width: 180px;
	padding: 5px 8px;
	margin-top: 5px;
	margin-bottom: 5px;
	margin-left: auto;
	margin-right: auto;
	background-color: rgba(254, 215, 26, 0.9);
	box-shadow: 2px 2px 5px rgba(62, 56, 65, 0.6);
	border-left: 10px solid rgb(254, 215, 26);
	border-right: 10px solid rgb(254, 215, 26);
	color: rgb(248, 244, 237);
	text-shadow: 0px 0px 1px rgb(57, 55, 51), 1px 1px 3px rgb(23, 23, 23, 0.6);
	transform: scaleY(0);
	cursor: pointer;
	pointer-events: none;
}
.notifaction-frame[horizontal="left"] section {
	margin-left: 0px;
	margin-right: auto;
	border-left-width: 0px;
	transform: translateX(-100%);
}
.notifaction-frame[horizontal="right"] section {
	margin-left: auto;
	margin-right: 0px;
	border-right-width: 0px;
	transform: translateX(100%);
}
.notifaction-frame section.show {
	transform: scaleY(1);
	pointer-events: all;
}
.notifaction-frame[horizontal="left"] section.show {
	transform: translateX(0%);
}
.notifaction-frame[horizontal="right"] section.show {
	transform: translateX(0%);
}
.notifaction-frame section[type="info"] {
	background-color: rgba(86, 152, 195, 0.9);
	border-color: rgb(86, 152, 195);
}
.notifaction-frame section[type="success"] {
	background-color: rgba(65, 174, 60, 0.9);
	border-color: rgb(65, 174, 60);
}
.notifaction-frame section[type="warn"] {
	background-color: rgba(252, 161, 6, 0.9);
	border-color: rgb(252, 161, 6);
}
.notifaction-frame section[type="error"] {
	background-color: rgba(194, 31, 48, 0.9);
	border-color: rgb(194, 31, 48);
}

.notifaction-frame section header {
	padding-left: 5px;
	padding-right: 5px;
	font-size: 16px;
	font-weight: bolder;
	text-align: left;
	pointer-events: none;
}

.notifaction-frame section article {
	margin-top: 5px;
	padding-top: 5px;
	padding-left: 8px;
	padding-right: 8px;
	border-top: 1px solid rgb(226, 225, 228);
	font-size: 14px;
	text-align: left;
	pointer-events: none;
}
</style>

<script>
var current;
var pending = new Set();
window.notify = msg => {
	if (!current) {
		pending.add(msg);
		return;
	}
	current.showMessage(msg);
};

export default {
	name: "Notification",
	props: {
		"hAlign": String,
		"vAlign": String
	},
	install (app) {
		app.component('Notification', this);
	},
	async mounted () {
		current = this;
		if (!pending) return;
		for (let msg of pending) {
			await wait();
			this.showMessage(msg);
		}
		pending.clear();
		pending = null;
	},
	methods: {
		async showMessage (msg) {
			if (String.is(msg)) msg = {title: msg};
			var duration = msg.duration || 3000;
			var key = Math.floor(10000000000 * Math.random());
			msg.key = key;

			msg.ele = this.newMsg(msg);
			msg.ele.exit = async () => {
				if (!!msg.timer) clearTimeout(msg.timer);
				delete msg.timer;

				msg.ele.classList.remove('show');
				await wait(300);
				this.$el.removeChild(msg.ele);

				delete msg.ele.exit;
				delete msg.ele;
			};
			this.$el.appendChild(msg.ele);
			await wait(100);
			msg.ele.classList.add('show');

			msg.timer = setTimeout(msg.ele.exit, duration);
		},
		newMsg (msg) {
			var ele = document.createElement('section');
			ele.setAttribute('key', msg.key);
			ele.setAttribute('type', msg.type || 'default');
			if (!!msg.title) {
				let header = document.createElement('header');
				header.innerText = msg.title;
				ele.appendChild(header);
			}
			if (!!msg.message) {
				let article = document.createElement('article');
				article.innerText = msg.message;
				ele.appendChild(article);
			}
			return ele;
		},
		onClick (evt) {
			var ele = evt.target;
			if (!ele) return;
			if (!ele.exit) return;
			ele.exit();
		}
	}
}
</script>