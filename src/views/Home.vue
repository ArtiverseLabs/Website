<template>
	<div class="column-frame">
		<showcase ref="showcase"/>
		<mint ref="mint" />
		<about ref="about" />
		<roadmap ref="roadmap" />
		<team ref="team" />
		<contactus ref="contactus" />
		<faq ref="faq" />
		<newsletter ref="newsletter" />
	</div>
</template>

<style>
div.column-frame {
	width: 100%;
}
div.column-frame div.container {
	box-sizing: border-box;
	width: 100%;
	margin-top: 20px;
}
div.column-frame div.container div.title {
	margin-bottom: 10px;
	padding-left: 10px;
	padding-right: 10px;
	padding-bottom: 5px;
	border-bottom: 1px solid rgb(105, 105, 105);
	font-size: 25px;
	font-weight: bolder;
}
div.column-frame div.container div.subtitle {
	margin-top: 10px;
	padding-left: 10px;
	padding-right: 10px;
	font-size: 22px;
	font-weight: bolder;
}
div.column-frame div.container div.content {
	padding-left: 10px;
	padding-right: 10px;
}
</style>

<script>
import Showcase from '@/components/showcase.vue'
import Mint from '@/components/mint.vue'
import About from '@/components/about.vue'
import Roadmap from '@/components/roadmap.vue'
import Team from '@/components/team.vue'
import Contactus from '@/components/contactus.vue'
import Faq from '@/components/faq.vue'
import Newsletter from '@/components/newsletter.vue'

export default {
	name: 'Home',
	components: { Showcase, Mint, About, Roadmap, Team, Contactus, Faq, Newsletter },
	mounted () {
		eventBus.sub('navigator-goto', target => {
			this.goto(target);
		});
		var target = this.$route.params.target;
		if (!!target) {
			this.goto(target);
		}
	},
	methods: {
		goto (target) {
			target = this.$refs[target];
			if (!target) return;
			target = target.$el || target;
			var offset = target.offsetTop;
			offset -= 8;
			offset = offset - window.scrollY;
			window.scrollBy({top: offset, behavior: 'smooth'});
		}
	}
}
</script>