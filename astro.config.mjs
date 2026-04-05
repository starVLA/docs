// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://starvla.github.io',
	base: '/docs',
	integrations: [
		starlight({
			title: 'StarVLA',
			logo: {
				src: './src/assets/logo.svg',
			},
			customCss: ['./src/styles/custom.css'],
			defaultLocale: 'root',
			locales: {
				root: {
					label: 'English',
					lang: 'en',
				},
				'zh-cn': {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/starVLA/starVLA' }],
			sidebar: [
				{
					label: 'Overview',
					translations: { 'zh-CN': '项目概览' },
					items: [
						{ label: 'Project Overview', slug: 'overview', translations: { 'zh-CN': '项目概览' } },
					],
				},
				{
					label: 'Getting Started',
					translations: { 'zh-CN': '开始上手' },
					items: [
						{
							label: 'Quick Start',
							slug: 'getting-started/quick-start',
							translations: { 'zh-CN': '快速开始' },
						},
					],
				},
				{
					label: 'Core Concepts',
					translations: { 'zh-CN': '核心概念' },
					items: [
						{
							label: 'Lego-like Design',
							slug: 'design/lego-like',
							translations: { 'zh-CN': '乐高式设计' },
						},
						{
							label: 'Evaluation Framework',
							slug: 'design/eval-protocol',
							translations: { 'zh-CN': '评测框架' },
						},
					],
				},
				{
					label: 'Benchmarks',
					translations: { 'zh-CN': '基准测试' },
					items: [
						{
							label: 'LIBERO',
							slug: 'benchmarks/libero',
							translations: { 'zh-CN': 'LIBERO' },
						},
						{
							label: 'SimplerEnv',
							slug: 'benchmarks/simplerenv',
							translations: { 'zh-CN': 'SimplerEnv' },
						},
						{
							label: 'RoboCasa',
							slug: 'benchmarks/robocasa',
							translations: { 'zh-CN': 'RoboCasa' },
						},
						{
							label: 'RoboTwin',
							slug: 'benchmarks/robotwin',
							translations: { 'zh-CN': 'RoboTwin' },
						},
						{
							label: 'BEHAVIOR-1K',
							slug: 'benchmarks/behavior',
							translations: { 'zh-CN': 'BEHAVIOR-1K' },
						},
					],
				},
				{
					label: 'Training Your Own Model',
					translations: { 'zh-CN': '训练自己的模型' },
					items: [
						{
							label: 'Co-Training with VLM Data',
							slug: 'training/cotrain-vlm',
							translations: { 'zh-CN': '与 VLM 数据联合训练' },
						},
						{
							label: 'Use Your Own LeRobot Dataset',
							slug: 'training/lerobot-dataset',
							translations: { 'zh-CN': '使用自己的 LeRobot 数据集' },
						},
					],
				},
				{
					label: 'Resources',
					translations: { 'zh-CN': '资源' },
					items: [
						{ label: 'Model Zoo', slug: 'model-zoo', translations: { 'zh-CN': '模型库' } },
						{ label: 'FAQ', slug: 'faq', translations: { 'zh-CN': '常见问题' } },
					],
				},
				{
					label: 'Community',
					translations: { 'zh-CN': '社区' },
					items: [
						{ label: 'Contributing', slug: 'contributing', translations: { 'zh-CN': '贡献指南' } },
						{
							label: 'Acknowledgements',
							slug: 'acknowledgements',
							translations: { 'zh-CN': '致谢' },
						},
					],
				},
			],

			head: [
				{
					tag: 'script',
					attrs: {
						is: 'inline',
					},
					content: `
						window.MathJax = {
							tex: {
								inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
								displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
								processEscapes: true,
								processEnvironments: true
							},
							options: {
								skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
							}
						};
					`
				},
				{
					tag: 'script',
					attrs: {
						id: 'MathJax-script',
						async: true,
						src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
					}
				}
			]
		}),
	],
});
