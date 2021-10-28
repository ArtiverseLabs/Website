<template>
	<div class="container" @click="onClick">
		<div class="title">FAQ</div>
		<div class="item" v-for="item in qalist">
			<div class="subtitle">{{item.q}}</div>
			<div class="content">
				<p>{{item.a}}</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
div.item {
	margin-top: 16px;
	margin-bottom: 16px;
}
div.content {
	margin-top: 10px;
	margin-bottom: 25px;
	padding-left: 10px;
	padding-right: 10px;
	line-height: 24px;
}
div.content span.link {
	text-decoration: underline;
	text-underline-offset: 2px;
	cursor: pointer;
}
</style>

<script>
export default {
	name: 'Faq',
	data () {
		return {
			qalist: [
				{
					q: "What is WAGMA?",
					a: "It's short for \"We All Gonna Make Art\", the name of the first crowdsourced artwork in human history. Thousands of people will be creating WAGMA together on MetaCanvas using MetaPen."
				},
				{
					q: "What is MetaPen?",
					a: "It's the tool to draw on MetaCanvas."
				},
				{
					q: "Is it just a pen?",
					a: "No. It's not just a pen. It's the basic tool in Artiverse. In the coming projects, more tools will be airdropped to MetaPen holders."
				},
				{
					q: "How does the amount 16,777 come?",
					a: "From #000000 to #FFFFFF, there are 16777216 colors in total, MetaPen is one of a thousand of the total colors."
				},
				{
					q: "How many MetaPens does Artiverse Labs keep?",
					a: "None. We don't keep any. All MetaPens are for public mint."
				},
				{
					q: "Will there be a MetaPen giveaway?",
					a: "No. We can't do giveaway since we don't keep any MetaPen. You can request to be [colorlisted](#colorlist) to ensure you get one."
				},
				{
					q: "How do I take part?",
					a: "You need some ETH to mint the MetaPen."
				},
				{
					q: "How do I know the rarity of my MetaPen?",
					a: "The ending six digits of SHA256(TX Hash + Block Number + Metapen ID) is assigned as the color as the MetaPen, you can [check](https://xorbin.com/tools/sha256-hash-calculator) it by yourself (the information should be input line by line). Since it's impossible for 16,777 MetaPens to be evenly allocated through the color pallet. You can check the palette, the more isolated a MetaPen is, the rarer."
				},
				{
					q: "What color can I use to paint on the MetaCanvas?",
					a: "Any color of your choice."
				},
				{
					q: "How many times a MetaPen can be used?",
					a: "Each MetaPen can draw one dot on the MetaCanvas. If you want to draw more, you need more MetaPens."
				},
				{
					q: "What if there's no spot left to be painted?",
					a: "You can pay to overwrite other's spot. We encourage everyone to paint it as soon as possible."
				},
				{
					q: "What's the benefit to draw it as soon as possible?",
					a: "There will be an airdrop of Artiverse's utility token($ARTV) to those who drew on a blank spot. Late comers overwriting others' work need to compensate the previous drawer with $ARTV."
				},
				{
					q: "If my spot is overwritten, can I still get the reward of the auction?",
					a: "No. Only the final owner of the spot is elligible to get the reward. You've already compensated by the overwriter."
				},
				{
					q: "What is Artiverse?",
					a: "It's the meta art universe created by you."
				}
			]
		}
	},
	mounted () {
		var list = this.$el.querySelectorAll('div.content');
		for (let ele of list) {
			let inner = ele.innerText;
			inner = inner.replace(/\[(.*?)\][ 　\t]*\((.*?)\)/gi, (match, name, link) => {
				return '<a href="' + link + '" target="_blank">' + name + '</a>';
			});
			ele.innerHTML = inner;
		}
	},
	methods: {
		onClick (evt) {
			if (evt.target.tagName !== 'A') return;
			var target = evt.target.getAttribute('href');
			if (target.indexOf('#') !== 0) return;
			target = target.replace(/^\#+/, '');
			evt.stopPropagation();
			evt.preventDefault();
			eventBus.pub('navigator-goto', 'colorlist');
		},
	}
}
</script>