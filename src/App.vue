<template>
	<Notification hAlign="right" vAlign="top" />
	<Mask/>
	<nav-bar/>
	<router-view/>
	<foot-mark/>
</template>

<style>
html, body, #app {
	margin: 0px;
	padding: 0px;
}
body {
	background-color: rgb(250, 250, 250);
	font-family: Pixellari, Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	font-size: 18px;
	color: rgb(45, 45, 45);
}
body.dark-mode {
	background-color: rgb(25, 25, 25);
	color: rgb(240, 240, 240);
}
#app {
	position: relative;
	z-index: 1;
}
a, a:hover, a:visited {
	text-underline-offset: 2px;
	color: rgb(65, 105, 225);
}
u {
	text-underline-offset: 2px;
}
div, input, textarea, p {
	box-sizing: border-box;
}
p {
	line-height: 28px;
}
input, textarea {
	background-color: transparent;
	outline: none;
	resize: none;
}
.dark-mode input, .dark-mode textarea {
	color: rgb(240, 240, 240);
}
input {
	padding: 2px 5px;
	border: none;
	border-bottom: 1px solid rgb(105, 105, 105);
}
textarea {
	padding: 10px;
	border: 1px solid rgb(105, 105, 105);
}
button, input[type="submit"], .button {
	padding-top: 6px;
	padding-bottom: 5px;
	padding-left: 10px;
	padding-right: 10px;
	background-color: transparent;
	border: 1px solid rgb(105, 105, 105);
	color: rgb(45, 45, 45);
	user-select: none;
	cursor: pointer;
}
.dark-mode button, .dark-mode input[type="submit"], .dark-mode .button {
	border: 1px solid rgb(105, 105, 105);
	color: rgb(240, 240, 240);
}
button[disabled="true"], input[type="submit"][disabled="true"], .button[disabled="true"] {
	border: 1px solid rgb(195, 195, 195);
	color: rgb(195, 195, 195);
	pointer-events: none;
}
.dark-mode button[disabled="true"], .dark-mode input[type="submit"][disabled="true"], .dark-mode .button[disabled="true"] {
	border: 1px solid rgb(65, 65, 65);
	color: rgb(65, 65, 65);
}
@media screen and (max-width: 350px) {
	body {
		font-size: 14px;
	}
}
@media screen and (max-width: 300px) {
	body {
		font-size: 12px;
	}
}
@media screen and (max-width: 280px) {
	body {
		font-size: 10px;
	}
}
</style>

<script>
import NavBar from '@/components/navbar.vue'
import FootMark from '@/components/footmark.vue'

export default {
	name: 'Home',
	components: { NavBar, FootMark },
	mounted () {
		setTimeout(() => {
			var total = document.body.scrollHeight - window.innerHeight;
			var percent = 1;
			if (total > 0) {
				percent = window.scrollY / total;
			}
			eventBus.pub('page-scroll', percent, window.scrollY, total);
			eventBus.pub('page-resize', window.innerWidth, window.innerHeight);
		}, 0);
	}
}
</script>