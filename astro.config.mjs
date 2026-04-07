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
				es: {
					label: 'Español',
					lang: 'es',
				},
				fr: {
					label: 'Français',
					lang: 'fr',
				},
				ja: {
					label: '日本語',
					lang: 'ja',
				},
				ko: {
					label: '한국어',
					lang: 'ko',
				},
				de: {
					label: 'Deutsch',
					lang: 'de',
				},
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/starVLA/starVLA' }],
			sidebar: [
				{
					label: 'Overview',
					translations: { 'zh-CN': '项目概览', es: 'Descripción General', fr: 'Aperçu', ja: '概要', ko: '개요', de: 'Übersicht' },
					items: [
						{ label: 'Project Overview', slug: 'overview', translations: { 'zh-CN': '项目概览', es: 'Descripción del Proyecto', fr: 'Aperçu du Projet', ja: 'プロジェクト概要', ko: '프로젝트 개요', de: 'Projektübersicht' } },
					],
				},
				{
					label: 'Getting Started',
					translations: { 'zh-CN': '开始上手', es: 'Primeros Pasos', fr: 'Démarrage', ja: 'はじめに', ko: '시작하기', de: 'Erste Schritte' },
					items: [
						{
							label: 'Quick Start',
							slug: 'getting-started/quick-start',
							translations: { 'zh-CN': '快速开始', es: 'Inicio Rápido', fr: 'Démarrage Rapide', ja: 'クイックスタート', ko: '빠른 시작', de: 'Schnellstart' },
						},
					],
				},
				{
					label: 'Core Concepts',
					translations: { 'zh-CN': '核心概念', es: 'Conceptos Clave', fr: 'Concepts Clés', ja: 'コアコンセプト', ko: '핵심 개념', de: 'Kernkonzepte' },
					items: [
						{
							label: 'Lego-like Design',
							slug: 'design/lego-like',
							translations: { 'zh-CN': '乐高式设计', es: 'Diseño Modular', fr: 'Conception Modulaire', ja: 'レゴ式設計', ko: '레고식 설계', de: 'Modulares Design' },
						},
						{
							label: 'Evaluation Framework',
							slug: 'design/eval-protocol',
							translations: { 'zh-CN': '评测框架', es: 'Marco de Evaluación', fr: "Cadre d'Évaluation", ja: '評価フレームワーク', ko: '평가 프레임워크', de: 'Evaluierungsrahmen' },
						},
					],
				},
				{
					label: 'Benchmarks',
					translations: { 'zh-CN': '基准测试', es: 'Benchmarks', fr: 'Benchmarks', ja: 'ベンチマーク', ko: '벤치마크', de: 'Benchmarks' },
					items: [
						{
							label: 'LIBERO',
							slug: 'benchmarks/libero',
							translations: { 'zh-CN': 'LIBERO', es: 'LIBERO', fr: 'LIBERO', ja: 'LIBERO', ko: 'LIBERO', de: 'LIBERO' },
						},
						{
							label: 'SimplerEnv',
							slug: 'benchmarks/simplerenv',
							translations: { 'zh-CN': 'SimplerEnv', es: 'SimplerEnv', fr: 'SimplerEnv', ja: 'SimplerEnv', ko: 'SimplerEnv', de: 'SimplerEnv' },
						},
						{
							label: 'RoboCasa',
							slug: 'benchmarks/robocasa',
							translations: { 'zh-CN': 'RoboCasa', es: 'RoboCasa', fr: 'RoboCasa', ja: 'RoboCasa', ko: 'RoboCasa', de: 'RoboCasa' },
						},
						{
							label: 'RoboTwin',
							slug: 'benchmarks/robotwin',
							translations: { 'zh-CN': 'RoboTwin', es: 'RoboTwin', fr: 'RoboTwin', ja: 'RoboTwin', ko: 'RoboTwin', de: 'RoboTwin' },
						},
						{
							label: 'BEHAVIOR-1K',
							slug: 'benchmarks/behavior',
							translations: { 'zh-CN': 'BEHAVIOR-1K', es: 'BEHAVIOR-1K', fr: 'BEHAVIOR-1K', ja: 'BEHAVIOR-1K', ko: 'BEHAVIOR-1K', de: 'BEHAVIOR-1K' },
						},
					],
				},
				{
					label: 'Training Your Own Model',
					translations: { 'zh-CN': '训练自己的模型', es: 'Entrena tu Propio Modelo', fr: 'Entraîner Votre Modèle', ja: 'モデルのトレーニング', ko: '모델 학습', de: 'Eigenes Modell Trainieren' },
					items: [
						{
							label: 'Co-Training with VLM Data',
							slug: 'training/cotrain-vlm',
							translations: { 'zh-CN': '与 VLM 数据联合训练', es: 'Co-entrenamiento con Datos VLM', fr: 'Co-entraînement avec Données VLM', ja: 'VLMデータとの共同トレーニング', ko: 'VLM 데이터 공동 학습', de: 'Co-Training mit VLM-Daten' },
						},
						{
							label: 'Use Your Own LeRobot Dataset',
							slug: 'training/lerobot-dataset',
							translations: { 'zh-CN': '使用自己的 LeRobot 数据集', es: 'Usa tu Propio Dataset LeRobot', fr: 'Utiliser Votre Dataset LeRobot', ja: '独自のLeRobotデータセットを使用', ko: '자체 LeRobot 데이터셋 사용', de: 'Eigenen LeRobot-Datensatz Verwenden' },
						},
					],
				},
				{
					label: 'Resources',
					translations: { 'zh-CN': '资源', es: 'Recursos', fr: 'Ressources', ja: 'リソース', ko: '리소스', de: 'Ressourcen' },
					items: [
						{ label: 'Model Zoo', slug: 'model-zoo', translations: { 'zh-CN': '模型库', es: 'Catálogo de Modelos', fr: 'Catalogue de Modèles', ja: 'モデルライブラリ', ko: '모델 저장소', de: 'Modellkatalog' } },
						{ label: 'FAQ', slug: 'faq', translations: { 'zh-CN': '常见问题', es: 'Preguntas Frecuentes', fr: 'FAQ', ja: 'よくある質問', ko: '자주 묻는 질문', de: 'FAQ' } },
					],
				},
				{
					label: 'Community',
					translations: { 'zh-CN': '社区', es: 'Comunidad', fr: 'Communauté', ja: 'コミュニティ', ko: '커뮤니티', de: 'Community' },
					items: [
						{ label: 'Contributing', slug: 'contributing', translations: { 'zh-CN': '贡献指南', es: 'Contribuir', fr: 'Contribuer', ja: '貢献ガイド', ko: '기여 가이드', de: 'Mitwirken' } },
						{
							label: 'Acknowledgements',
							slug: 'acknowledgements',
							translations: { 'zh-CN': '致谢', es: 'Agradecimientos', fr: 'Remerciements', ja: '謝辞', ko: '감사의 말', de: 'Danksagungen' },
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
