// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'LawPay Docs',
			defaultLocale: 'root',
			locales: {
				root: { label: 'Français', lang: 'fr' },
				en: { label: 'English', lang: 'en' },
			},
			sidebar: [
				{
					label: 'Guides',
					translations: { fr: 'Guides' },
					items: [
						{ slug: 'guides/getting-started' },
						{ slug: 'guides/authentication' },
					],
				},
				{
					label: 'Payments',
					translations: { fr: 'Paiements' },
					items: [
						{ slug: 'payments/initialize' },
						{ slug: 'payments/status' },
						{ slug: 'payments/list' },
					],
				},
				{
					label: 'Webhooks',
					items: [
						{ slug: 'webhooks/setup' },
						{ slug: 'webhooks/events' },
					],
				},
				{
					label: 'Reference',
					translations: { fr: 'Référence' },
					items: [
						{ slug: 'reference/errors' },
					],
				},
			],
		}),
	],
});
