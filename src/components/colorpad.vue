<template>
	<div class="color-pad">
		<i class="fas fa-pencil-alt" :style="{color: penColor}"></i>
		<div class="chooser-frame">
			<div class="progress">
				<span class="hint">R</span>
				<input ref="colorpickerred" type="range" name="red" max=255 min=0 :value="metapen.red" @input="changeColor('red')">
				<span class="value">{{metapen.red}}</span>
			</div>
			<div class="progress">
				<span class="hint">G</span>
				<input ref="colorpickergreen" type="range" name="green" max=255 min=0 :value="metapen.green" @input="changeColor('green')">
				<span class="value">{{metapen.green}}</span>
			</div>
			<div class="progress">
				<span class="hint">B</span>
				<input ref="colorpickerblue" type="range" name="blue" max=255 min=0 :value="metapen.blue" @input="changeColor('blue')">
				<span class="value">{{metapen.blue}}</span>
			</div>
			<div class="colorResult" :style="{backgroundColor: penColor}"></div>
		</div>
	</div>
</template>

<style scoped>
div.color-pad {
	position: relative;
	display: inline-block;
	margin-left: 10px;
	margin-right: 10px;
	cursor: pointer;
}
div.color-pad > i {
	width: 200px;
	height: 30px;
	text-shadow: 0px 0px 2px black, 0px 0px 2px white;
	outline: none;
}
div.color-pad div.chooser-frame {
	box-sizing: border-box;
	display: none;
	position: absolute;
	top: 25px;
	width: 205px;
	height: 0px;
	overflow: hidden;
	padding: 8px;
	background-color: rgb(250, 250, 250);
	border: 1px solid rgb(105, 105, 105);
	pointer-events: none;
}
.dark-mode div.color-pad div.chooser-frame {
	background-color: rgb(25, 25, 25);
}
div.color-pad:hover div.chooser-frame {
	display: block;
	height: 145px;
	pointer-events: auto;
}
div.color-pad div.chooser-frame div.progress {
	display: block;
	height: 20px;
}
div.color-pad div.chooser-frame div.progress span,
div.color-pad div.chooser-frame div.progress input {
	display: inline-block;
}
div.color-pad div.chooser-frame div.progress span {
	user-select: none;
}
div.color-pad div.chooser-frame div.progress span.hint {
	display: inline-block;
	width: 12px;
}
div.color-pad div.chooser-frame div.progress input {
	-webkit-appearance: none;
	margin-left: 5px;
	margin-right: 5px;
	width: 130px;
	height: 12px;
	outline: none;
	background: transparent;
	border-bottom: none;
}
div.color-pad div.chooser-frame div.progress input::-webkit-slider-thumb {
	-webkit-appearance: none;
	position: relative;
	top: -3px;
	width: 10px;
	height: 14px;
	border-radius: 3px;
	box-shadow: 1px 1px 3px rgba(25, 25, 25, 0.9);
}
div.color-pad div.chooser-frame div.progress input::-webkit-slider-runnable-track {
	height: 8px;
	border-radius: 4px;
	box-shadow: inset 1px 1px 2px rgba(25, 25, 25, 0.5);
	cursor: pointer;
}
div.color-pad div.chooser-frame div.progress input[name="red"]::-webkit-slider-thumb,
div.color-pad div.chooser-frame div.progress input[name="red"]::-webkit-slider-runnable-track {
	background-color: rgb(238, 184, 195);
}
div.color-pad div.chooser-frame div.progress input[name="green"]::-webkit-slider-thumb,
div.color-pad div.chooser-frame div.progress input[name="green"]::-webkit-slider-runnable-track {
	background-color: rgb(131, 203, 172);
}
div.color-pad div.chooser-frame div.progress input[name="blue"]::-webkit-slider-thumb,
div.color-pad div.chooser-frame div.progress input[name="blue"]::-webkit-slider-runnable-track {
	background-color: rgb(81, 196, 211);
}
div.color-pad div.chooser-frame div.colorResult {
	display: block;
	width: 170px;
	height: 50px;
	margin-top: 10px;
	margin-left: 5px;
	border: 1px solid rgb(105, 105, 105);
}

@media screen and (max-width: 1150px) {

div.color-pad > i {
	width: 100px;
}

div.color-pad div.chooser-frame {
	left: -30px;
}


}
</style>

<script>
export default {
	name: 'ColorPad',
	data () {
		return {
			metapen: {
				red: 0,
				green: 0,
				blue: 0
			}
		}
	},
	computed: {
		penColor () {
			return 'rgb(' + this.metapen.red + ',' + this.metapen.green + ',' + this.metapen.blue + ')';
		}
	},
	mounted () {
		this.metapen.red = Math.floor(256 * Math.random());
		this.metapen.green = Math.floor(256 * Math.random());
		this.metapen.blue = Math.floor(256 * Math.random());
		window.getCurrentMetaPen = () => {
			return [this.metapen.red, this.metapen.green, this.metapen.blue];
		};
	},
	methods: {
		changeColor (type) {
			var ui = this.$refs['colorpicker' + type];
			this.metapen[type] = ui.valueAsNumber;
		}
	}
}
</script>