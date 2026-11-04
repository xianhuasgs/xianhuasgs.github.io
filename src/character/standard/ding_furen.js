export function createDingFurenPack({ game, get, lib }) {
	const gains = new WeakMap();
	const living = p => p?.isIn();
	const partner = p => game.players.find(t => t.playerid === p.storage.my_yugong_partner && living(t));
	const deckCards = e => (e.cards || []).filter(c => get.position(c, true) === "c" || (c.original === "c" && !get.owner(c) && !get.position(c, true)));
	const gainCount = e => (e.cards || []).filter(c => gains.get(e)?.includes(c)).length;
	async function addJade(player) {
		await player.gainMaxHp();
		if (living(player)) await player.recover();
	}
	return {
		character: { my_jian_dingfuren: { sex: "female", group: "wei", hp: 3, maxHp: 3, skills: ["my_yugong"], img: "image/character/zhenji.jpg" } },
		characterTitle: { my_jian_dingfuren: "王业之憾" },
		skill: {
			my_yugong: {
				zhuanhuanji: true,
				mark: true,
				marktext: "共",
				forced: true,
				intro: {
					content(s, p) {
						return `当前为${s ? "阴" : "阳"}，与共角色：${get.translation(partner(p) || p.storage.my_yugong_name || "无")}`;
					},
				},
				trigger: { global: "gameStart" },
				filter(e, p) {
					return !p.storage.my_yugong_partner && game.hasPlayer(t => t !== p);
				},
				async content(event, trigger, player) {
					const result = await player.chooseTarget("与共：选择一名其他角色", true, (c, p, t) => t !== p).forResult();
					if (!result.bool) return;
					const target = result.targets[0];
					player.storage.my_yugong_partner = target.playerid;
					player.storage.my_yugong_name = target.name;
					player.markSkill("my_yugong");
				},
				group: ["my_yugong_capture", "my_yugong_gain", "my_yugong_damage", "my_yugong_death"],
			},
			my_yugong_capture: {
				charlotte: true,
				silent: true,
				forced: true,
				priority: -100,
				trigger: { global: "gainBegin" },
				filter(e, p) {
					const t = partner(p);
					return t && (e.player === p || e.player === t);
				},
				async content(event, trigger) {
					gains.set(trigger, deckCards(trigger));
				},
			},
			my_yugong_gain: {
				forced: true,
				popup: false,
				trigger: { global: "gainAfter" },
				filter(e, p) {
					const t = partner(p);
					return t && !p.storage.my_yugong && (e.player === p || e.player === t) && !e.getParent()?.my_yugong_mirror && gainCount(e) > 0;
				},
				async content(event, trigger, player) {
					const target = trigger.player === player ? partner(player) : player;
					if (!living(target)) return;
					player.logSkill("my_yugong", target);
					player.changeZhuanhuanji("my_yugong");
					const draw = target.draw(gainCount(trigger));
					draw.my_yugong_mirror = true;
					await draw;
				},
			},
			my_yugong_damage: {
				forced: true,
				popup: false,
				trigger: { global: "damageSource" },
				filter(e, p) {
					const t = partner(p);
					return t && p.storage.my_yugong && e.num > 0 && (e.source === p || e.source === t);
				},
				async content(event, trigger, player) {
					const target = trigger.source === player ? partner(player) : player;
					if (!living(target)) return;
					player.logSkill("my_yugong", target);
					player.changeZhuanhuanji("my_yugong");
					await addJade(target);
				},
			},
			my_yugong_death: {
				forced: true,
				popup: false,
				trigger: { global: "dieAfter" },
				async content(event, trigger, player) {
					player.logSkill("my_yugong");
					player.removeSkill("my_yugong");
					player.addSkill("my_yugong_yihen");
					if (player.maxHp > 1) await player.loseMaxHp(player.maxHp - 1);
					else if (player.maxHp < 1) await player.gainMaxHp(1 - player.maxHp);
				},
			},
			my_yugong_yihen: {
				mark: true,
				marktext: "恨",
				forced: true,
				intro: {
					content(s, p) {
						return `与共角色：${get.translation(partner(p) || p.storage.my_yugong_name || "无")}`;
					},
				},
				trigger: { global: "gainAfter" },
				group: ["my_yugong_capture", "my_yihen_tianqian", "my_yihen_transfer"],
				filter(e, p) {
					return e.player === partner(p) && gainCount(e) > 0 && game.hasPlayer(t => t !== p);
				},
				async content(event, trigger, player) {
					const n = gainCount(trigger);
					const result = await player.chooseTarget(`遗恨：选一名其他角色，你与其各弃置${n}张牌`, true, (c, p, t) => t !== p).forResult();
					if (!result.bool) return;
					for (const target of [player, result.targets[0]]) {
						if (!living(target)) continue;
						const count = Math.min(
							n,
							target.countCards("he", c => lib.filter.cardDiscardable(c, target, "my_yugong_yihen"))
						);
						if (count) await target.chooseToDiscard("he", count, true);
					}
				},
			},
			my_yihen_tianqian: {
				forced: true,
				popup: false,
				trigger: { global: "damageSource" },
				filter(e, p) {
					return e.source && e.source === partner(p) && e.num > 0;
				},
				async content(event, trigger, player) {
					player.logSkill("my_yugong_yihen", trigger.source);
					for (const target of [trigger.source, player]) {
						if (!living(target)) continue;
						const judgement = target.judge("天谴", card => {
							const number = get.number(card);
							return get.suit(card) === "spade" && number >= 2 && number <= 9 ? -5 : 1;
						});
						if ((await judgement.forResult()).bool === false && living(target)) await target.damage(3, "thunder", "nosource");
					}
					if (!living(player) || [...game.players, ...game.dead].some(t => t.getAllHistory("damage", d => d.num > 0 && d.getParent("my_yihen_tianqian") === event).length)) return;
					if (!game.hasPlayer(t => t !== player)) return;
					const result = await player.chooseTarget("天谴：选择一名其他角色，令其减1点体力上限并回复1点体力", true, (c, p, t) => t !== p).forResult();
					if (!result.bool) return;
					const target = result.targets[0];
					await target.loseMaxHp();
					if (living(target)) await target.recover();
					if (living(player)) await addJade(player);
				},
			},
			my_yihen_transfer: {
				forced: true,
				popup: false,
				trigger: { player: "damageBegin4" },
				priority: -100,
				filter(e, p) {
					const armor = e.nohujia || p.hasSkillTag("nohujia") ? 0 : p.hujia || 0;
					return partner(p) && p.hp > 0 && e.num - armor >= p.hp && p.storage.my_yihen_round !== game.roundNumber;
				},
				async content(event, trigger, player) {
					const target = partner(player);
					if (!target) return;
					player.storage.my_yihen_round = game.roundNumber;
					player.logSkill("my_yugong_yihen", target);
					trigger.player = target;
				},
			},
		},
		translate: {
			my_jian_dingfuren: "奸丁夫人",
			my_yugong: "与共",
			my_yugong_yihen: "与共（遗恨）",
			my_yugong_info: "锁定技，转换技，初始为阳。游戏开始时选择一名其他角色。阳：你与其之一从牌堆获得牌后，另一方摸等量的牌。阴：你与其之一造成伤害后，另一方增加1点体力上限并回复1点体力。每次触发后转换。场上首次有角色死亡后，你将体力上限调整为1，并将此技能改为与共（遗恨）。",
			my_yugong_yihen_info: "锁定技，与共角色从牌堆获得牌后，你选择一名其他角色，你与其各弃置等量的牌（不足则全弃，可选与共角色）。与共角色造成伤害后，其与你依次进行天谴。每轮限一次，你受到致命伤害时，将此伤害转移给与共角色。",
			my_yugong_append: "天谴：判定为黑桃2～9时，受到3点无来源雷电伤害。两次判定均未造成伤害时，你选择一名其他角色，其减少1点体力上限并回复1点体力，你增加1点体力上限并回复1点体力。",
			my_yugong_yihen_append: "天谴：判定为黑桃2～9时，受到3点无来源雷电伤害。两次判定均未造成伤害时，你选择一名其他角色，其减少1点体力上限并回复1点体力，你增加1点体力上限并回复1点体力。",
		},
	};
}
