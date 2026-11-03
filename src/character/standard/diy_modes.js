// 单机选将兼容。模式自己的阵营、双将及禁将规则仍然适用。
export function configureDiyModes({ lib, _status, characters }) {
	const names = Object.keys(characters).filter(name => !characters[name].isUnseen);
	const filters = Object.fromEntries(names.map(name => [name, mode => mode !== "connect" && !_status.connectMode]));
	lib.arenaReady.push(() => {
		if (_status.connectMode || lib.config.mode === "connect") return;
		const modeConfig = lib.config.mode_config;
		const current = (modeConfig[lib.config.mode] ||= {});
		current.free_choose = true;
		// 国战默认只展示其专属包；打开通用池才会包含自制武将。
		if (lib.config.mode === "guozhan") current.onlyguozhan = false;
		// 单挑有独立角色表与长坂坡名单，不使用普通武将包列表。
		if (lib.characterSingle) for (const name of names) lib.characterSingle[name] = lib.character[name] || characters[name];
		if (lib.config.mode === "single") current.enable_jin = true;
		for (const list of [lib.changbanCharacter, lib.choiceThree, lib.choiceFour, modeConfig.versus?.character_three, modeConfig.versus?.character_four]) {
			if (Array.isArray(list)) for (const name of names) if (!list.includes(name)) list.push(name);
		}
	});
	return filters;
}
