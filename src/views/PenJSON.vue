<script>
export default {
	name: 'PenJSON',
	created () {
		location.href = location.origin + this.$route.path;
	},
}
</script>