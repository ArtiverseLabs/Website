<template>
	<div class="container">
		<div class="title">Mint</div>
		<div class="content">
			<p><span class="hint">Price</span>: 0.08eth</p>
			<p><span class="hint">Amount</span>: 16777</p>
			<p><span class="hint">OG mint</span>: 777</p>
			<p><span class="hint">Colorlist mint</span>: 1000</p>
			<p><span class="hint">Public mint</span>: 15000</p>
			<p><span class="hint">Time</span>: Oct 31th UTC 03:00</p>
			<p><span class="hint">Drawing starts</span>: Oct 31th UTC 00:00</p>
			<p><span class="hint">Drawing ends</span>: Nov 11th UTC 00:00</p>
		</div>
		<div class="content buttons" v-if="stage>0">
			<button @click="goto('og')">Get OG Proof</button>
			<button @click="goto('presale')" v-if="stage>1">Get Pre-Sale Proof</button>
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
div.content.buttons {
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
div.content button {
	width: 150px;
	margin: 10px 20px;
}
</style>

<script>
export default {
	name: 'Mint',
	data () {
		return {
			stage: mintStage
		}
	},
	methods: {
		goto (target) {
			this.$router.push({path: '/' + target});
		}
	},
}
</script>