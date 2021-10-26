<template>
	<div class="container">
		<div class="content">
			<div class="item">
				<span class="hint">ETH Address<i class="fas fa-star-of-life"></i>:</span>
				<input ref="address" type="text" :value="address">
			</div>
			<div class="item">
				<span class="hint">Email<i class="fas fa-star-of-life"></i>:</span>
				<input ref="email" type="text">
			</div>
			<div class="item">
				<span class="hint">Twitter:</span>
				<input ref="twitter" type="text">
			</div>
			<div class="item">
				<span class="hint long">If you want, tell us about how you feel about this art project:</span>
				<textarea ref="message" placeholder="(Optional)"></textarea>
			</div>
			<div class="panel">
				<button class="submit" @click="onSubmit">Submit</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
div.item {
	margin-top: 15px;
	margin-bottom: 15px;
}
div.item span.hint {
	display: inline-block;
	width: 125px;
	font-weight: bolder;
	text-align: right;
}
div.item span.hint.long {
	width: 100%;
	text-align: left;
}
div.item span.hint i {
	position: relative;
	bottom: 10px;
	margin-left: 3px;
	margin-right: 3px;
	color: red;
	font-size: 8px;
	zoom: 0.6;
}
div.item input {
	width: 180px;
	margin-left: 5px;
}
div.item textarea {
	display: block;
	width: 100%;
	height: 80px;
	margin-top: 5px;
}
div.panel {
	margin-top: 10px;
	margin-bottom: 30px;
}
</style>

<script>
const SubmitDelay = 5000;
var lastSubmit = 0;

export default {
	name: 'ColorList',
	data () {
		return {
			address: '',
		}
	},
	created () {
		eventBus.sub('eth-change-user', userId => {
			console.log('ETH::Change::User', userId);
			this.address = userId;
		});
		eventBus.sub('appendColorlist', result => {
			eventBus.pub('hideMask');
			if (!result.success) {
				notify({title: result.reason, type: 'error'});
				return;
			}
			notify({title: "Added to ColorList", type: 'success'});
		});
	},
	mounted () {
		if (!!window.ETHAddress) this.address = window.ETHAddress;
	},
	methods: {
		onSubmit () {
			var time = Date.now();
			if (time - lastSubmit <= SubmitDelay) {
				notify({title: 'submit too fast', message: 'you could take a tea and enjoy the art for a while.', type: 'warn'});
				return;
			}
			lastSubmit = time;

			var address = this.$refs.address.value.trim();
			if (!address) {
				notify({title: "Addres cannot be empty", type: 'error'});
				return;
			}
			var email = this.$refs.email.value.trim();
			if (!email) {
				notify({title: "Email cannot be empty", type: 'error'});
				return;
			}
			var twitter = this.$refs.twitter.value.trim() || '';
			var message = this.$refs.message.value.trim() || '';

			var history = localStorage.get('colorlisthistory', []);
			var repeated = false;
			history.some(item => {
				if (item[0] !== address) return;
				if (item[1] !== email) return;
				if (item[2] !== twitter) return;
				if (item[3] !== message) return;
				repeated = true;
				return true;
			});
			if (repeated) {
				notify({title: "you have submitted the same request for colorlist", type: "warn"});
				return;
			}
			history.push([address, email, twitter, message]);
			localStorage.set('colorlisthistory', history);

			eventBus.pub('showMask');
			SocketChannel.sendRequest('appendColorlist', address, email, twitter, message);
		},
	}
}
</script>