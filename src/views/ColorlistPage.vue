<template>
	<div class="container">
		<h1>ColorList</h1>
		<colorlist/>
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
div.container div.title {
	margin-bottom: 10px;
	padding-left: 10px;
	padding-right: 10px;
	padding-bottom: 5px;
	border-bottom: 1px solid rgb(105, 105, 105);
	font-size: 25px;
	font-weight: bolder;
}
</style>

<script>
import colorlist from '@/components/colorlist.vue';

export default {
	name: 'ColorListPad',
	data () {
		return {
		};
	},
	components: { colorlist },
	mounted () {
	},
	methods: {
	}
}
</script>