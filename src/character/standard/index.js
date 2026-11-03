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
import { createJianSeriesPack } from "./jian_series.js";
import { createTianJianSeriesPack } from "./tian_jian_series.js";
import { configureDiyModes } from "./diy_modes.js";
const jinSimayi = createJinSimayiPack({ lib, game, ui, get, _status });
const moZhangjiao = createMoZhangjiaoPack({ lib, game, ui, get, _status });
const jianSeries = createJianSeriesPack({ lib, game, ui, get, _status });
const tianJian = createTianJianSeriesPack({ lib, game, ui, get, _status });
const diyFilters = configureDiyModes({ lib, _status, characters: { ...jinSimayi.character, ...moZhangjiao.character, ...jianSeries.character, ...tianJian.character } });

game.import("character", function () {
	return {
		name: "standard",
		connect: true,
		character: { ...characters, ...jinSimayi.character, ...moZhangjiao.character, ...jianSeries.character, ...tianJian.character },
		characterSort: {
			standard: { ...characterSort, my_jin_custom: ["my_jin_simayi"], my_mo_custom: ["my_mo_zhangjiao"], my_jian_custom: Object.keys(jianSeries.character), my_tian_custom: Object.keys(tianJian.character) },
		},
		characterFilter: {
			...characterFilters,
			...diyFilters,
		},
		characterTitle: { ...characterTitles, ...jianSeries.characterTitle, ...tianJian.characterTitle },
		dynamicTranslate: { ...dynamicTranslates },
		characterIntro: { ...characterIntros },
		card: { ...cards },
		skill: { ...skills, ...jinSimayi.skill, ...moZhangjiao.skill, ...jianSeries.skill, ...tianJian.skill },
		perfectPair: { ...perfectPairs },
		translate: { ...translates, ...voices, ...characterSortTranslate, ...jinSimayi.translate, ...moZhangjiao.translate, ...jianSeries.translate, ...tianJian.translate },
		pinyins: { ...pinyins },
	};
});
