import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home
	},
	{
		path: '/colorlist',
		name: 'ColorlistPad',
		component: () => import('../views/ColorlistPage.vue')
	},
	{
		path: '/colorlist/manager',
		name: 'ColorlistManager',
		component: () => import('../views/Colorlist.vue')
	},
	{
		path: '/og',
		name: 'OGList',
		component: () => import('../views/PresaleList.vue')
	},
	{
		path: '/presale',
		name: 'PreSaleList',
		component: () => import('../views/PresaleList.vue')
	},
	{
		path: '/mint',
		name: 'Mint',
		component: () => import('../views/Contract.vue')
	},
	{
		path: '/metapen/:id',
		name: 'MetaPen',
		component: () => import('../views/MetaPen.vue')
	},
	{
		path: '/about',
		name: 'About',
		component: () => import('../views/About.vue')
	},
	{
		path: '/:pathMatch(.*)*',
		name: 'PageNotFound',
		component: function () {
			return import('../views/404.vue')
		}
	}
]

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes
})

export default router