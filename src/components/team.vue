<template>
	<div class="container">
		<div class="title">Team</div>
		<div class="content">
			<ul>
				<li class="member" v-for="mem in list">
					<span class="name" v-if="!mem.link">{{mem.name}}</span><span class="name" v-if="!!mem.link"><a :href="mem.link" target="_blank">{{mem.name}}</a></span>, <span class="desc">{{mem.desc}}</span>
				</li>
			</ul>
		</div>
	</div>
</template>

<style scoped>
li.member {
	margin-top: 10px;
	margin-bottom: 10px;
}
li.member span.name {
	font-weight: bolder;
}
div.line {
	line-height: 30px;
}
</style>

<script>
export default {
	name: 'Team',
	data () {
		return {
			list: [
				{
					name: "Magwa",
					desc: "just take lot of WAGs.",
					link: "https://twitter.com/ArtiverseLabs"
				},
				{
					name: "D3",
					desc: "frontend programmer. More curry means more code.",
					link: "https://twitter.com/ArtiverseD3"
				},
				{
					name: "John",
					desc: "color artist. Did you ever see rainbow colored coffee?",
					link: "https://twitter.com/WagmaNFT"
				},
				{
					name: "AntiPop",
					desc: "an artist against the pop art, \"Life's not a consumerist!\""
				},
			]
		}
	},
}
</script>