<template>
	<div class="container">
		<div class="title">NewsLetter</div>
		<div class="content">
			<form action="https://tinyletter.com/artiverse" method="post" target="popupwindow" @submit="onSubmit">
				<div><label for="tlemail">Enter your email address here:</label></div>
				<div><input type="text" name="email" id="tlemail" /></div>
				<input type="hidden" value="1" name="embed" />
				<div class="center"><input type="submit" value="Subscribe" /></div>
			</form>
		</div>
	</div>
</template>

<style scoped>
form {
	width: 500px;
	max-width: 100%;
}
input[type="text"] {
	width: 100%;
	margin-top: 10px;
	margin-bottom: 10px;
}
.dark-mode input[type="text"] {
	color: rgb(249, 244, 220);
}
input[type="submit"] {
	width: 120px;
}
</style>

<script>
export default {
	name: 'NewsLetter',
	methods: {
		onSubmit (evt) {
			var email = document.querySelector('#tlemail').value.trim();
			if (!email) {
				notify({title: "Email cannot be empty", type: 'error'});
				evt.stopPropagation();
				evt.preventDefault();
				return true;
			}
		}
	}
}
</script>