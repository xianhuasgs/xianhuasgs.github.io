export function createMoZhangjiaoPack({ lib, game, ui, get, _status }) {
	const rang = p => p.getExpansions("my_rang");
	const holders = () => game.filterPlayer(p => rang(p).length > 0);
	const canHeal = p => p.isDamaged() || p.hasSkill("my_tongxin");
	const quota = p => {
		const used = p.storage.my_duhua_round === game.roundNumber ? p.storage.my_duhua_count || 0 : 0;
		return used < holders().length;
	};
	async function putRang(target, cards, source) {
		const next = target.addToExpansion(cards, source, "giveAuto");
		next.gaintag.add("my_rang");
		await next;
		target.addSkill("my_rang");
		target.markSkill("my_rang");
	}
	const skills = {
		my_rang: { charlotte: true, mark: true, marktext: "禳", intro: { content: "expansion", markcount: "expansion" } },
		my_jiyu: { global: "my_jiyu_give" },
		my_jiyu_give: {
			enable: "phaseUse",
			usable: 1,
			position: "he",
			selectCard: [1, Infinity],
			filter(event, player) {
				return game.hasPlayer(p => p.hasSkill("my_jiyu")) && player.countCards("he") > 0;
			},
			filterCard: true,
			discard: false,
			lose: false,
			delay: false,
			check(card) {
				return 7 - get.value(card);
			},
			async content(event, trigger, player) {
				await putRang(player, event.cards, player);
				const lost = event.cards.filter(c => rang(player).includes(c)).length;
				if (lost && player.isIn()) await player.draw(lost + holders().length);
			},
			ai: { order: 8, result: { player: 1 } },
		},
		my_hudao: {
			trigger: { player: "damageBegin4" },
			forced: true,
			filter(event) {
				return event.source?.isIn() && rang(event.source).length > 0;
			},
			async content(event, trigger, player) {
				trigger.cancel();
				const source = trigger.source;
				if (!source.isIn()) return;
				const expansions = rang(source);
				let choice = "获得禳";
				if (expansions.length && source.countGainableCards(player, "he")) {
					choice = (
						await player
							.chooseControl("获得禳", "获得牌")
							.set("prompt", "护道：选择获得伤害来源的一张禳或手牌/装备牌")
							.set("ai", () => "获得禳")
							.forResult()
					).control;
				} else if (!expansions.length) choice = "获得牌";
				if (choice === "获得禳" && expansions.length) {
					const result = await player.chooseButton(["护道：获得一张禳", expansions], true).forResult();
					if (result.bool) await player.gain(result.links, source, "give");
				} else if (source.countGainableCards(player, "he")) await player.gainPlayerCard(source, "he", true);
			},
			group: "my_hudao_decay",
		},
		my_hudao_decay: {
			trigger: { global: "phaseBegin" },
			forced: true,
			filter(event) {
				const count = rang(event.player).length;
				return count > 0 && count < game.roundNumber;
			},
			async content(event, trigger) {
				const target = trigger.player,
					cards = rang(target).slice();
				await target.loseToDiscardpile(cards);
				if (target.isIn()) await target.loseHp(cards.length);
			},
		},
		my_duhua: {
			enable: "chooseToUse",
			position: "h",
			selectCard: 1,
			filterCard: true,
			viewAs: { name: "tao", storage: { my_duhua: true } },
			viewAsFilter(player) {
				return quota(player) && player.countCards("h") > 0 && game.hasPlayer(p => p !== player && canHeal(p));
			},
			selectTarget: 1,
			filterTarget(card, player, target) {
				return target !== player && canHeal(target);
			},
			prompt: "渡化：将一张手牌当桃对其他角色使用，结算后将此牌置为其禳",
			check(card) {
				return 7 - get.value(card);
			},
			async precontent(event, trigger, player) {
				if (player.storage.my_duhua_round !== game.roundNumber) {
					player.storage.my_duhua_round = game.roundNumber;
					player.storage.my_duhua_count = 0;
				}
				player.storage.my_duhua_count++;
			},
			mod: {
				cardEnabled(card) {
					if (card.storage?.my_duhua) return true;
				},
				playerEnabled(card, player, target) {
					if (card.storage?.my_duhua && target !== player && canHeal(target)) return true;
				},
			},
			ai: {
				order: 8,
				save: true,
				result: { target: 2 },
				skillTagFilter(player) {
					return quota(player) && player.countCards("h") > 0;
				},
			},
			group: ["my_duhua_place", "my_duhua_transform", "my_duhua_damage"],
		},
		my_duhua_place: {
			trigger: { player: "useCardAfter" },
			forced: true,
			popup: false,
			filter(event) {
				return event.card.storage?.my_duhua && event.cards?.length && event.targets?.[0]?.isIn();
			},
			async content(event, trigger, player) {
				const cards = trigger.cards.filter(c => ["o", "d"].includes(get.position(c, true)));
				if (cards.length) await putRang(trigger.targets[0], cards, player);
			},
		},
		my_duhua_transform: {
			trigger: { global: ["addToExpansionAfter", "loseAfter", "loseAsyncAfter", "dieAfter", "gameDrawAfter"] },
			forced: true,
			skillAnimation: true,
			animationColor: "thunder",
			filter(event, player) {
				return !player.storage.my_rumo && holders().length > game.countPlayer() / 2;
			},
			async content(event, trigger, player) {
				player.storage.my_rumo = true;
				await player.removeSkills(["my_jiyu", "my_hudao"]);
				await player.addSkills(["my_tongxin", "my_rumo"]);
				player.markSkill("my_rumo");
			},
		},
		// Track damage before transformation too: the requirement concerns the entire current round.
		my_duhua_damage: {
			trigger: { source: "damageSource" },
			forced: true,
			silent: true,
			filter(event) {
				return event.num > 0;
			},
			async content(event, trigger, player) {
				player.storage.my_mozhangjiao_damage_round = game.roundNumber;
			},
		},
		my_rumo: {
			charlotte: true,
			mark: true,
			marktext: "魔",
			intro: { content: "已入魔。本轮未造成伤害，则轮末失去1点体力。" },
			trigger: { global: "roundEnd" },
			forced: true,
			filter(event, player) {
				return player.storage.my_mozhangjiao_damage_round !== game.roundNumber;
			},
			async content(event, trigger, player) {
				await player.loseHp(1);
			},
		},
		my_tongxin: {
			trigger: { player: "useCardToPlayered" },
			forced: true,
			filter(event) {
				return event.isFirstTarget && get.type(event.card) === "basic" && holders().some(p => p !== event.player);
			},
			async content(event, trigger, player) {
				const targets = trigger.targets.slice(),
					name = get.name(trigger.card);
				const list = holders()
					.filter(p => p !== player)
					.sortBySeat(player);
				for (const current of list) {
					if (!player.isIn() || !current.isIn() || !rang(current).length || !targets.every(p => p.isIn())) continue;
					const legal = card => get.name(card, current) === name && targets.every(target => current.canUse(card, target, false, true));
					if (!current.getCards("h", legal).length) continue;
					const result = await current
						.chooseCard("h", true, "同心：对相同目标使用一张" + get.translation(name), legal)
						.set("ai", card => 6 - get.value(card))
						.forResult();
					if (result.bool && legal(result.cards[0])) await current.useCard(result.cards[0], targets);
				}
			},
			mod: {
				// A healthy Tongxin owner can legally use a Peach on themself for the replacement effect.
				cardEnabled(card, player) {
					if (get.name(card) === "tao" && !player.isDamaged()) return true;
				},
				targetEnabled(card, player, target) {
					if (get.name(card) === "tao" && player === target && !target.isDamaged()) return true;
				},
			},
			group: "my_tongxin_maxhp",
		},
		my_tongxin_maxhp: {
			trigger: { target: "taoBegin" },
			forced: true,
			filter(event, player) {
				return !player.isDamaged();
			},
			async content(event, trigger, player) {
				const amount = (trigger.baseDamage ?? 1) + (trigger.extraDamage || 0);
				trigger.cancel();
				if (amount > 0) await player.gainMaxHp(amount);
			},
		},
	};
	return {
		character: { my_mo_zhangjiao: { sex: "male", group: "qun", hp: 4, maxHp: 4, skills: ["my_jiyu", "my_hudao", "my_duhua"], img: "image/character/zhangjiao.jpg" } },
		skill: skills,
		translate: {
			my_mo_zhangjiao: "魔张角",
			my_mo_custom: "个人武将·魔",
			my_rang: "禳",
			my_rang_info: "置于武将牌上的禳。",
			my_jiyu: "济宇",
			my_jiyu_give: "济宇",
			my_jiyu_info: "每名角色的出牌阶段限一次，其可以将任意张（至少一张）手牌或装备牌置于自己武将牌上，称为“禳”，然后摸失去数+X张牌（X为放置后场上拥有禳的角色数）。",
			my_jiyu_give_info: "将至少一张手牌或装备牌置为自己的禳，然后摸置入数+当前拥有禳的角色数张牌。",
			my_hudao: "护道",
			my_hudao_info: "锁定技，有禳的角色对你造成伤害时，防止之，然后你获得其一张禳或一张手牌/装备牌；有禳的角色回合开始时，若其禳的数量小于当前轮数，其失去所有禳和等量的体力。",
			my_duhua: "渡化",
			my_duhua_info: "每轮限X次，你可以将一张手牌当桃对其他角色使用，并将此牌置于其武将牌上，称为禳（X为当前拥有禳的角色数）。当拥有禳的角色数大于存活角色数的一半时，你失去济宇和护道，获得同心，并入魔。",
			my_tongxin: "同心",
			my_tongxin_info: "锁定技，当你使用基本牌指定目标后，其他拥有禳且手中有同名牌的角色，须对相同目标使用一张同名手牌（无距离限制，仍须符合其他用牌条件）。若你未受伤，当你成为桃的目标后，改为增加等同于该桃回复值的体力上限。",
			my_rumo: "入魔",
			my_rumo_info: "状态：若本轮未造成伤害，本轮结束时失去1点体力。",
		},
	};
}
