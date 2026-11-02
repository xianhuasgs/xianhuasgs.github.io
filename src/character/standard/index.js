import { lib, game, ui, get, ai, _status } from "noname";
import characters from "./character.js";
import cards from "./card.js";
import pinyins from "./pinyin.js";
import skills from "./skill.js";
import translates from "./translate.js";
import characterTitles from "./characterTitle.js";
import characterIntros from "./intro.js";
import characterFilters from "./characterFilter.js";
import dynamicTranslates from "./dynamicTranslate.js";
import perfectPairs from "./perfectPairs.js";
import voices from "./voices.js";
import { characterSort, characterSortTranslate } from "./sort.js";
import { createJinSimayiPack } from "./jin_simayi.js";
import { createMoZhangjiaoPack } from "./mo_zhangjiao.js";
const jinSimayi = createJinSimayiPack({ lib, game, ui, get, _status });
const moZhangjiao = createMoZhangjiaoPack({ lib, game, ui, get, _status });

game.import("character", function () {
	return {
		name: "standard",
		connect: true,
		character: { ...characters, ...jinSimayi.character, ...moZhangjiao.character },
		characterSort: {
			standard: { ...characterSort, my_jin_custom: ["my_jin_simayi"], my_mo_custom: ["my_mo_zhangjiao"] },
		},
		characterFilter: {
			...characterFilters,
			my_jin_simayi: mode => mode === "identity" && !_status.connectMode,
			my_mo_zhangjiao: mode => mode === "identity" && !_status.connectMode,
		},
		characterTitle: { ...characterTitles },
		dynamicTranslate: { ...dynamicTranslates },
		characterIntro: { ...characterIntros },
		card: { ...cards },
		skill: { ...skills, ...jinSimayi.skill, ...moZhangjiao.skill },
		perfectPair: { ...perfectPairs },
		translate: { ...translates, ...voices, ...characterSortTranslate, ...jinSimayi.translate, ...moZhangjiao.translate },
		pinyins: { ...pinyins },
	};
});
