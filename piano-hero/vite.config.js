import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	server: {
		https: {
			key: './localhost-key.pem',
			cert: './localhost.pem'
		},
		host: true,
	},

	plugins: [vue()],

	base: '/piano-hero/dist/',

	build: {
		minify: 'terser',
		terserOptions: {
			keep_classnames: true,
			keep_fnames: true
		},
	}
})
