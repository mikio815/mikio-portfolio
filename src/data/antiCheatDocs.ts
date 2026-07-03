export const antiCheatDoc = {
	title: "既存アンチチート調査",
	description:
		"Linux向けアンチチート実装のために、既存アンチチートの設計、観測面、検出境界を整理する調査ドキュメントです。",
	basePath: "/docs/anti-cheat",
	worksPath: "/works/anti-cheat",
}

export const antiCheatChapters = [
	{
		slug: "overview",
		title: "概要",
		description: "調査の目的、読者、全体像を整理します。",
	},
	{
		slug: "scope",
		title: "調査対象と前提",
		description: "対象にするアンチチート、環境、公開範囲を整理します。",
	},
	{
		slug: "threat-model",
		title: "攻撃者モデル",
		description: "想定するチート、権限、観測できる境界を整理します。",
	},
	{
		slug: "existing-architecture",
		title: "既存アンチチートの構成",
		description: "ユーザーランド、カーネル、サービス側の役割分担を整理します。",
	},
	{
		slug: "linux-observation",
		title: "Linuxで観測できるイベント",
		description: "Linux上で取得できるイベント、状態、制約を整理します。",
	},
	{
		slug: "ebpf-boundary",
		title: "eBPFとkernel/userland境界",
		description: "eBPF、カーネル、ユーザーランドの責務と限界を整理します。",
	},
	{
		slug: "detection",
		title: "検出ロジック",
		description: "検出可能なふるまい、シグナル、組み合わせ方を整理します。",
	},
	{
		slug: "limitations",
		title: "回避耐性と限界",
		description: "検出しにくい領域、回避可能性、未解決の課題を整理します。",
	},
	{
		slug: "privacy-safety",
		title: "プライバシーと安全性",
		description: "収集情報、誤検知、ユーザー影響を整理します。",
	},
	{
		slug: "implementation-notes",
		title: "実装メモ",
		description: "実装中に得た知見、設計判断、検証メモを整理します。",
	},
	{
		slug: "references",
		title: "参考資料",
		description: "仕様、論文、実装、関連ドキュメントを整理します。",
	},
].map((chapter, index) => ({
	...chapter,
	order: index + 1,
	href: `${antiCheatDoc.basePath}/${chapter.slug}`,
}))
