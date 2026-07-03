export type Locale = "ja" | "en"

type NavItem = {
	label: string
	href: string
}

type NavGroup = {
	label: string
	items: NavItem[]
}

export const localizedPages = new Set([
	"/",
	"/profile",
	"/skills",
	"/works",
	"/blog",
	"/social",
	"/contact",
])

export const siteCopy = {
	ja: {
		description: "mikio815のポートフォリオ",
		menu: "Menu",
		openNavigation: "Open navigation",
		closeNavigation: "Close navigation",
		switchLanguage: "English",
		switchLanguageAria: "Switch to English",
	},
	en: {
		description: "Portfolio of mikio815",
		menu: "Menu",
		openNavigation: "Open navigation",
		closeNavigation: "Close navigation",
		switchLanguage: "日本語",
		switchLanguageAria: "日本語版へ切り替える",
	},
} satisfies Record<Locale, Record<string, string>>

const navGroups: NavGroup[] = [
	{
		label: "Profile",
		items: [
			{ label: "About", href: "/profile" },
			{ label: "Career", href: "/profile#career" },
			{ label: "Blog", href: "/blog" },
		],
	},
	{
		label: "Tech",
		items: [
			{ label: "Skills", href: "/skills" },
			{ label: "Works", href: "/works" },
		],
	},
	{
		label: "Contact",
		items: [
			{ label: "Social", href: "/social" },
			{ label: "Contact", href: "/contact" },
		],
	},
]

export const normalizeLocale = (value: unknown, pathname = "/"): Locale => {
	if (value === "ja" || value === "en") {
		return value
	}

	return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ja"
}

export const stripLocalePrefix = (pathname: string) => {
	const normalized = pathname || "/"
	const withoutTrailingSlash =
		normalized.length > 1 ? normalized.replace(/\/$/, "") : normalized
	const stripped = withoutTrailingSlash.replace(/^\/en(?=\/|$)/, "")

	return stripped === "" ? "/" : stripped
}

export const toLocalizedPath = (path: string, locale: Locale) => {
	const [pathAndQuery, hash] = path.split("#")
	const [rawPathname, query] = pathAndQuery.split("?")
	const pathname = rawPathname.startsWith("/") ? rawPathname : `/${rawPathname}`
	const basePath = stripLocalePrefix(pathname)
	const localizedPath =
		locale === "en" ? (basePath === "/" ? "/en/" : `/en${basePath}`) : basePath

	return `${localizedPath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`
}

const getFallbackBasePath = (basePath: string) => {
	if (localizedPages.has(basePath)) {
		return basePath
	}

	if (basePath.startsWith("/posts/")) {
		return "/blog"
	}

	if (basePath.startsWith("/works/") || basePath.startsWith("/docs/")) {
		return "/works"
	}

	return "/"
}

export const getAlternateLocalePath = (pathname: string, locale: Locale) => {
	const targetLocale: Locale = locale === "ja" ? "en" : "ja"
	const basePath = getFallbackBasePath(stripLocalePrefix(pathname))

	return toLocalizedPath(basePath, targetLocale)
}

export const getNavGroups = (locale: Locale): NavGroup[] =>
	navGroups.map((group) => ({
		...group,
		items: group.items.map((item) => ({
			...item,
			href: toLocalizedPath(item.href, locale),
		})),
	}))
