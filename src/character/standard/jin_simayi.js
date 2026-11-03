// Personal character pack. Engine dependencies are injected for rule-level tests.
export function createJinSimayiPack({ lib, game, ui, get, _status }) {
	const suits = ["spade", "heart", "club", "diamond"];
	const phases = ["phaseZhunbei", "phaseJudge", "phaseDraw", "phaseUse", "phaseDiscard", "phaseJieshu"];
	const hidden = owner => game.players.find(p => p.storage?.jinsimayi_owner === owner.playerid && p.name === "my_yinni");
	const ownerOf = p => game.players.find(owner => owner.playerid === p.storage?.jinsimayi_owner);
	const partner = p => (p.name === "my_yinni" ? ownerOf(p) : hidden(p));
	const sharedCards = p => partner(p)?.getCards("h") || [];
	const availableSuits = p =>
		suits.filter(suit => {
			if ((p.storage.my_cangyuan_suits || []).includes(suit)) return false;
			const cards = p.getCards("h", c => get.suit(c, p) === suit);
			return cards.length && cards.every(c => lib.filter.cardDiscardable(c, p, "my_cangyuan"));
		});
	async function awaken(p) {
		if (!p.isIn() || p.storage.my_duoshi_awakened || !p.storage.my_cangyuan_created || hidden(p)) return;
		p.storage.my_duoshi_awakened = true;
		p.awakenSkill("my_duoshi");
		await p.recover();
		await p.addSkills(["my_duoshi_unrespondable", "my_dingding"]);
	}
	async function removeHidden(p) {
		if (!p || p.storage.my_yinni_removing) return;
		const owner = ownerOf(p);
		p.storage.my_yinni_removing = true;
		if (game.me === p && owner?.isIn()) game.swapPlayerAuto(owner);
		if (_status.roundStart === p) _status.roundStart = p.next;
		await game.removePlayerOL(p, { animate: false });
		if (owner) await awaken(owner);
	}
	const skills = {
		my_cangyuan: {
			trigger: { global: "gameStart", player: "enterGame" },
			forced: true,
			filter(event, player) {
				return !player.storage.my_cangyuan_created && !_status.connectMode;
			},
			async content(event, trigger, player) {
				player.storage.my_cangyuan_created = true;
				const token = await game.addPlayerOL(player, "my_yinni", null, true, { source: player, animate: false });
				token.storage.jinsimayi_owner = player.playerid;
				token._trueMe = player;
				token.identity = (get.mode?.() || "identity") === "identity" && player.identity === "zhu" ? "zhong" : player.identity;
				if (player.side !== undefined) token.side = player.side;
				token.identityShown = player.identityShown;
				token.ai.shown = player.ai.shown;
				token.setIdentity();
				token.update();
				game.log(player, "在下家前插入了", token);
			},
			group: ["my_cangyuan_guard", "my_cangyuan_depart", "my_cangyuan_maxhp", "my_cangyuan_cleanup"],
			global: ["my_cangyuan_share", "my_cangyuan_control"],
			mark: true,
			marktext: "渊",
			intro: {
				content(storage, player) {
					return "已弃置花色：" + ((player.storage.my_cangyuan_suits || []).map(s => get.translation(s)).join("、") || "无");
				},
			},
		},
		my_cangyuan_guard: {
			trigger: { global: "damageBegin4" },
			direct: true,
			filter(event, player) {
				return event.player === hidden(player) && availableSuits(player).length > 0;
			},
			async content(event, trigger, player) {
				const choices = availableSuits(player);
				const result = await player
					.chooseControl([...choices, "cancel2"])
					.set("prompt", "藏渊：弃置一种花色的全部手牌，防止此次伤害")
					.set("ai", () => choices[0])
					.forResult();
				if (!choices.includes(result.control)) return;
				const suit = result.control;
				const cards = player.getCards("h", c => get.suit(c, player) === suit);
				if (!cards.length || !cards.every(c => lib.filter.cardDiscardable(c, player, "my_cangyuan"))) return;
				player.logSkill("my_cangyuan", trigger.player);
				(player.storage.my_cangyuan_suits ??= []).push(suit);
				await player.discard(cards);
				trigger.cancel();
				player.markSkill("my_cangyuan");
				// Resolve each gain before searching for the next recipient; physical cards cannot be awarded twice.
				for (const recipient of [player, trigger.source]) {
					if (!recipient?.isIn()) continue;
					const gains = suits
						.filter(s => s !== suit)
						.map(s => get.cardPile2(c => get.suit(c, false) === s))
						.filter(Boolean);
					if (gains.length) await recipient.gain(gains, "gain2");
				}
			},
		},
		my_cangyuan_depart: {
			trigger: { global: ["changeHp", "phaseBefore", "dieBefore"] },
			forced: true,
			silent: true,
			forceDie: true,
			filter(event, player) {
				return event.player === hidden(player) && (event.name !== "changeHp" || event.num < 0);
			},
			async content(event, trigger, player) {
				const token = trigger.player;
				// Finish its turn/death event so a removed token cannot continue acting or award a kill reward.
				if (trigger.name === "phase" || trigger.name === "die") trigger.cancel();
				await removeHidden(token);
			},
		},
		my_cangyuan_maxhp: {
			trigger: { global: "changeMaxHpBefore" },
			forced: true,
			silent: true,
			filter(event, player) {
				return event.player === hidden(player);
			},
			async content(event, trigger) {
				trigger.cancel();
			},
		},
		my_cangyuan_cleanup: {
			trigger: { player: "dieAfter" },
			forced: true,
			silent: true,
			forceDie: true,
			async content(event, trigger, player) {
				await removeHidden(hidden(player));
			},
		},
		my_cangyuan_control: {
			trigger: { global: ["chooseToUseBegin", "chooseToRespondBegin", "chooseToDiscardBegin", "chooseButtonBegin", "chooseCardBegin", "chooseTargetBegin", "chooseControlBegin", "chooseBoolBegin", "choosePlayerCardBegin", "discardPlayerCardBegin", "gainPlayerCardBegin"] },
			forced: true,
			silent: true,
			firstDo: true,
			priority: 200,
			filter(event) {
				const p = event.player,
					owner = p?.name === "my_yinni" ? ownerOf(p) : p;
				return !_status.connectMode && !_status.auto && owner?.isIn() && (p?.name === "my_yinni" || hidden(p)) && p !== game.me && (owner === game.me || game.me?._trueMe === owner);
			},
			async content(event, trigger) {
				game.swapPlayerAuto(trigger.player);
			},
		},
		my_cangyuan_share: {
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				return !event.responded && sharedCards(player).some(c => event.filterCard(get.autoViewAs(c), player, event));
			},
			hiddenCard(player, name) {
				return sharedCards(player).some(c => get.name(c) === name);
			},
			chooseButton: {
				dialog(event, player) {
					return ui.create.dialog("藏渊：使用或打出对方的手牌", sharedCards(player), "hidden");
				},
				filter(button, player) {
					const event = _status.event.getParent();
					return sharedCards(player).includes(button.link) && event.filterCard(get.autoViewAs(button.link), player, event);
				},
				check(button) {
					return get.player().getUseValue(button.link);
				},
				backup(links) {
					const card = links[0];
					return {
						filterCard: () => false,
						selectCard: -1,
						viewAs: { name: card.name, nature: card.nature, suit: card.suit, number: card.number },
						async precontent(event, trigger, player) {
							if (!sharedCards(player).includes(card)) {
								event.getParent().cancel();
								event.cancel();
								return;
							}
							// The engine's useCard/respond content records loss against the physical card's actual owner.
							event.result.cards = [card];
							event.result.card = get.autoViewAs(card);
						},
					};
				},
				prompt(links) {
					return "藏渊：使用或打出" + get.translation(links[0]);
				},
			},
			ai: {
				order: 8,
				respondSha: true,
				respondShan: true,
				skillTagFilter(player, tag) {
					return sharedCards(player).some(c => get.name(c) === (tag === "respondSha" ? "sha" : "shan"));
				},
				result: { player: 1 },
			},
		},
		my_choulue: {
			trigger: { global: "phaseEnd" },
			direct: true,
			filter(event, player) {
				return !!hidden(player) && player.storage.my_choulue_round !== game.roundNumber && game.hasPlayer(p => p !== player && p !== hidden(player));
			},
			async content(event, trigger, player) {
				const token = hidden(player);
				const result = await player
					.chooseTarget("筹略：令一名其他角色与隐匿交换座位及全部手牌", (card, player, target) => target !== player && target !== hidden(player))
					.set("ai", target => -get.attitude(get.player(), target))
					.forResult();
				if (!result.bool || !token?.isIn()) return;
				player.storage.my_choulue_round = game.roundNumber;
				const target = result.targets[0];
				player.logSkill("my_choulue", target);
				game.swapSeat(target, token);
				await target.swapHandcards(token);
			},
		},
		my_duoshi: {
			trigger: { global: ["phaseBefore", "dieAfter"] },
			forced: true,
			juexingji: true,
			skillAnimation: true,
			animationColor: "thunder",
			filter(event, player) {
				return player.storage.my_cangyuan_created && !player.storage.my_duoshi_awakened && !hidden(player);
			},
			async content(event, trigger, player) {
				await awaken(player);
			},
		},
		my_duoshi_unrespondable: {
			charlotte: true,
			trigger: { player: "useCard" },
			forced: true,
			popup: false,
			async content(event, trigger) {
				trigger.directHit.addArray(game.players);
			},
		},
		my_dingding: {
			trigger: { global: "phaseBegin" },
			direct: true,
			filter(event, player) {
				return phases.some(p => !(player.storage.my_dingding_used || []).includes(p));
			},
			async content(event, trigger, player) {
				const choices = phases.filter(p => !(player.storage.my_dingding_used || []).includes(p));
				const result = await player
					.chooseControl([...choices, "cancel2"])
					.set("prompt", "定鼎：令" + get.translation(trigger.player) + "跳过一个阶段，你于此回合结束时执行之（每种阶段每局一次）")
					.set("ai", () => (choices.includes("phaseDraw") ? "phaseDraw" : "cancel2"))
					.forResult();
				if (!choices.includes(result.control)) return;
				const phase = result.control;
				(player.storage.my_dingding_used ??= []).push(phase);
				// Store the exact turn event, so nested/extra turns cannot consume another turn's pending stage.
				trigger.my_dingding_turn ??= get.id();
				(player.storage.my_dingding_pending ??= []).push({ turn: trigger.my_dingding_turn, phase });
				trigger.player.skip(phase);
				player.logSkill("my_dingding", trigger.player);
				player.markSkill("my_dingding");
			},
			group: "my_dingding_execute",
			mark: true,
			marktext: "鼎",
			intro: {
				content(storage, player) {
					return "已用阶段：" + ((player.storage.my_dingding_used || []).map(p => get.translation(p)).join("、") || "无");
				},
			},
		},
		my_dingding_execute: {
			trigger: { global: "phaseEnd" },
			forced: true,
			popup: false,
			filter(event, player) {
				return (player.storage.my_dingding_pending || []).some(p => p.turn === event.my_dingding_turn);
			},
			async content(event, trigger, player) {
				const pending = player.storage.my_dingding_pending || [];
				const run = pending.filter(p => p.turn === trigger.my_dingding_turn);
				player.storage.my_dingding_pending = pending.filter(p => p.turn !== trigger.my_dingding_turn);
				for (const { phase } of run) {
					if (!player.isIn()) break;
					await player[phase]().set("_extraPhaseReason", "my_dingding");
				}
			},
		},
	};
	return {
		character: {
			my_jin_simayi: { sex: "male", group: "jin", hp: 4, maxHp: 4, skills: ["my_cangyuan", "my_choulue", "my_duoshi"], img: "image/character/simayi.jpg" },
			my_yinni: { sex: "male", group: "jin", hp: 1, maxHp: 1, skills: [], isUnseen: true, img: "image/character/simayi.jpg" },
		},
		skill: skills,
		translate: {
			my_jin_simayi: "司马懿",
			my_jin_simayi_prefix: "晋",
			my_yinni: "隐匿",
			my_cangyuan: "藏渊",
			my_cangyuan_info: "分配座次后，你与下家之间插入一名由你操控的“隐匿”（男性、晋、1/1、无技能）。你与隐匿可以互相使用或打出对方手牌区里的牌。隐匿受到伤害时，你可弃置一种未以此法弃置过的花色的全部手牌，防止此伤害，然后你与伤害来源各从牌堆获得其余每种花色的牌各一张。隐匿扣减体力后或回合开始时移除；其体力上限改变时，终止该流程。",
			my_cangyuan_share: "藏渊·共手",
			my_cangyuan_share_info: "使用或打出你与隐匿之中另一方的手牌。",
			my_choulue: "筹略",
			my_choulue_info: "每轮限一次，一名角色的回合结束时，你可以令一名除你及隐匿以外的角色与隐匿交换座位及手牌区里的所有牌。",
			my_duoshi: "夺势",
			my_duoshi_info: "觉醒技，藏渊插入隐匿后，当场上没有你的隐匿时，你回复1点体力，然后你使用的牌不可被响应，并获得“定鼎”。",
			my_duoshi_unrespondable: "夺势",
			my_duoshi_unrespondable_info: "你使用的牌不可被响应。",
			my_dingding: "定鼎",
			my_dingding_info: "一名角色的回合开始时，你可以令其跳过一个阶段，然后你于此回合结束时执行此阶段。准备、判定、摸牌、出牌、弃牌、结束阶段各每局限一次。",
			my_jin_custom: "个人武将·晋",
		},
	};
}
