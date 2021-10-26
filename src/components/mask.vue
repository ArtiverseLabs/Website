<template>
	<div class="mask-frame" :show="show">
		<div class="hint">
			<div class="animate"><i class="fas fa-spinner fa-spin fa-fast" /></div>
		</div>
	</div>
</template>

<style scoped>
.mask-frame {
	position: fixed;
	display: none;
	z-index: 9999;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	background-color: rgba(220, 220, 220, 0.3);
	pointer-events: none;
}
.mask-frame[show="true"] {
	display: block;
	pointer-events: auto;
}
.hint {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 48px;
	text-align: center;
	text-shadow: 1px 1px 2px black;
}
</style>

<script>
const TimeoutLimit = 15 * 1000;
var timer;

export default {
	name: "Mask",
	data () {
		return {
			level: 0,
			show: false
		}
	},
	install (app) {
		app.component('Mask', this);
	},
	mounted () {
		eventBus.sub('showMask', (duration) => {
			this.level ++;
			this.show = true;
			if (!!timer) clearTimeout(timer);
			timer = setTimeout(() => {
				if (!!timer) clearTimeout(timer);
				this.show = false;
				timer = null;
			}, duration || TimeoutLimit);
		});
		eventBus.sub('hideMask', () => {
			this.level --;
			if (this.level === 0) {
				this.show = false;
				if (!!timer) {
					clearTimeout(timer);
					timer = null;
				}
			}
			else if (this.level < 0) this.level = 0;
		});
	},
	methods: {
	}
}
</script>