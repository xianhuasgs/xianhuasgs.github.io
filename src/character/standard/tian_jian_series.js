// 第二批 DIY 武将。技能通过工厂注入引擎，便于独立测试。
import { createSecondBatch } from "./tian_jian_extra.js";
export function createTianJianSeriesPack(runtime) {
	const { game, get } = runtime;
	const extra = createSecondBatch(runtime);
	const choices = ["摸一张牌", "回复1点体力", "获得场上一张牌", "对其他角色造成1点伤害"];
	const field = () => game.filterPlayer().flatMap(p => p.getCards("ej"));
	function available(player) {
		const used = player.storage.my_new_jianxiong_round === game.roundNumber ? player.storage.my_new_jianxiong_used || [] : [];
		return choices.filter((s, i) => !used.includes(i) && (i !== 1 || player.isDamaged()) && (i !== 2 || field().length) && (i !== 3 || game.hasPlayer(p => p !== player)));
	}
	return {
		character: extra.character,
		characterTitle: extra.characterTitle,
		skill: {
			...extra.skill,
			my_new_jianxiong: {
				trigger: { player: "damageEnd" },
				direct: true,
				filter(event, player) {
					return available(player).length > 0 || event.cards?.some(c => ["o", "d"].includes(get.position(c, true)));
				},
				async content(event, trigger, player) {
					if (!(await player.chooseBool("奸雄：获得造成伤害的牌，并选择一项本轮未选过的效果？").forResult()).bool) return;
					player.logSkill("my_new_jianxiong");
					const cards = trigger.cards?.filter(c => ["o", "d"].includes(get.position(c, true))) || [];
					if (cards.length) await player.gain(cards, "gain2");
					if (!player.isIn()) return;
					const options = available(player);
					if (!options.length) return;
					const result = await player.chooseControl(options).set("prompt", "奸雄：每轮每项限一次").forResult();
					const index = choices.indexOf(result.control);
					if (index < 0) return;
					if (player.storage.my_new_jianxiong_round !== game.roundNumber) {
						player.storage.my_new_jianxiong_round = game.roundNumber;
						player.storage.my_new_jianxiong_used = [];
					}
					player.storage.my_new_jianxiong_used.push(index);
					if (index === 0) await player.draw();
					else if (index === 1) await player.recover();
					else if (index === 2) {
						const r = await player.chooseButton(["奸雄：获得一张场上的牌", field()], true).forResult();
						if (r.bool) await player.gain(r.links, "gain2");
					} else {
						const r = await player.chooseTarget("奸雄：对一名其他角色造成1点伤害", true, (card, p, target) => target !== p).forResult();
						if (r.bool) await r.targets[0].damage(1, player);
					}
				},
			},
		},
		translate: {
			...extra.translate,
			my_new_jianxiong: "奸雄",
			my_new_jianxiong_info: "受到伤害后，你可获得造成此伤害的牌，并选择一项，每轮每项限一次：摸一张牌；回复1点体力；获得场上一张牌；对一名其他角色造成1点伤害。",
		},
	};
}
