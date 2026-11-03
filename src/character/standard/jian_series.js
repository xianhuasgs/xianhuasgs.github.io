// 本地 DIY 扩展：开放单机模式；联机同步尚未实现。
export function createJianSeriesPack({ lib, game, ui, get, _status }) {
	const alive = p => p?.isIn();
	const yin = (p, s) => !!p.storage[s];
	const change = (p, s) => p.changeZhuanhuanji(s);
	const ordinary = card => get.type(card) === "trick";
	const tricks = card => get.type2(card) === "trick";
	const choose = async next => next.forResult();
	const roundCards = p => p.getRoundHistory("useCard").map(e => get.name(e.card));
	const turn = e => (e.name === "phase" ? e : e.getParent("phase"));
	const conversion = (name, initial = false) => ({
		zhuanhuanji: true,
		mark: true,
		marktext: "☯",
		init(p) {
			if (p.storage[name] === undefined) p.storage[name] = initial;
		},
		intro: {
			content(storage) {
				return storage ? "当前为阴" : "当前为阳";
			},
		},
	});
	function fieldCards() {
		return game.filterPlayer().flatMap(p => p.getCards("ej"));
	}
	async function invoke(p, skill) {
		p.logSkill(skill);
		change(p, skill);
	}
	function predictedLoss(e) {
		const armor = e.nohujia || e.player.hasSkillTag("nohujia") ? 0 : e.player.hujia || 0;
		return Math.max(0, e.num - armor);
	}
	const skill = {
		my_fengjue: {
			...conversion("my_fengjue"),
			limited: true,
			skillAnimation: true,
			animationColor: "water",
			trigger: { global: ["phaseBegin", "damageBegin4"] },
			direct: true,
			filter(e, p) {
				if (p.storage.my_fengjue_spent) return false;
				if (e.name === "phase") return !yin(p, "my_fengjue") && p.countCards("he") > 0;
				return yin(p, "my_fengjue") && e.player.hp > 0 && predictedLoss(e) >= e.player.hp;
			},
			async content(event, trigger, player) {
				const target = trigger.player;
				if (!yin(player, "my_fengjue")) {
					const r = await choose(player.chooseCard("he", [1, Infinity], `奉绝：交给${get.translation(target)}任意张牌，并造成等量伤害`));
					if (!r.bool) return;
					player.storage.my_fengjue_spent = true;
					player.storage.my_fengjue_count = (player.storage.my_fengjue_count || 0) + 1;
					player.awakenSkill("my_fengjue");
					await invoke(player, "my_fengjue");
					if (target !== player) await player.give(r.cards, target);
					await target.damage(r.cards.length, player);
					if (alive(target)) {
						const x = Math.max(0, target.maxHp - target.hp);
						target.storage.my_fengjue_damage = (target.storage.my_fengjue_damage || 0) + x;
						target.storage.my_fengjue_cards = (target.storage.my_fengjue_cards || 0) + x;
						target.addSkill("my_fengjue_bonus");
					}
				} else {
					if (!(await choose(player.chooseBool(`奉绝：防止${get.translation(target)}此次伤害并将其移出游戏？`))).bool) return;
					player.storage.my_fengjue_spent = true;
					const x = (player.storage.my_fengjue_count = (player.storage.my_fengjue_count || 0) + 1);
					player.awakenSkill("my_fengjue");
					await invoke(player, "my_fengjue");
					trigger.cancel();
					const cards = fieldCards();
					if (cards.length) {
						const r = await choose(player.chooseButton([`奉绝：令其获得${Math.min(x, cards.length)}张场上的牌`, cards], Math.min(x, cards.length), true));
						if (r.bool) await target.gain(r.links, "gain2");
					}
					if (!alive(target)) return;
					target.storage.my_fengjue_exile = { source: trigger.source, round: game.roundNumber };
					target.addSkill("my_fengjue_exile");
					target.out("my_fengjue_exile");
				}
			},
		},
		my_fengjue_bonus: {
			charlotte: true,
			mark: true,
			marktext: "绝",
			intro: {
				content(storage, p) {
					return `下次伤害+${p.storage.my_fengjue_damage || 0}；下次从牌堆获得牌+${p.storage.my_fengjue_cards || 0}`;
				},
			},
			trigger: { source: "damageBegin1", player: ["drawBegin", "gainBegin"] },
			forced: true,
			popup: false,
			priority: 40,
			filter(e, p) {
				if (e.name === "damage") return p.storage.my_fengjue_damage > 0;
				if (!(p.storage.my_fengjue_cards > 0)) return false;
				return e.name === "draw" || e.cards.some(c => !get.owner(c) && (get.position(c) === "c" || c.original === "c"));
			},
			content(event, trigger, player) {
				if (trigger.name === "damage") {
					trigger.num += player.storage.my_fengjue_damage;
					delete player.storage.my_fengjue_damage;
				} else {
					const x = player.storage.my_fengjue_cards;
					delete player.storage.my_fengjue_cards;
					if (trigger.name === "draw") trigger.num += x;
					else trigger.cards.push(...get.cards(x));
				}
				if (!player.storage.my_fengjue_damage && !player.storage.my_fengjue_cards) player.removeSkill("my_fengjue_bonus");
			},
		},
		my_fengjue_exile: {
			charlotte: true,
			forceOut: true,
			forceDie: true,
			forced: true,
			popup: false,
			trigger: { global: ["phaseBefore", "roundEnd"] },
			filter(e, p) {
				const s = p.storage.my_fengjue_exile;
				return s && (e.name === "phase" ? e.player === s.source : game.roundNumber >= s.round + 1);
			},
			async content(event, trigger, player) {
				player.in("my_fengjue_exile");
				player.removeSkill("my_fengjue_exile");
				delete player.storage.my_fengjue_exile;
				if (trigger.name !== "phase") await player.die();
			},
		},
		my_weijing: {
			trigger: { global: "dyingAfter" },
			forced: true,
			filter(e, p) {
				return !!p.storage.my_fengjue_spent;
			},
			content(event, trigger, player) {
				delete player.storage.my_fengjue_spent;
				player.restoreSkill("my_fengjue");
			},
		},
		my_fumeng: {
			...conversion("my_fumeng"),
			trigger: { global: ["dyingAfter", "useCard1", "damageBegin1"] },
			forced: true,
			priority: 20,
			filter(e, p) {
				if (e.name === "dying") return alive(e.player) && e.player.hp > 0;
				return yin(p, "my_fumeng") ? e.name === "damage" && e.num > 0 : e.name === "useCard" && ordinary(e.card);
			},
			async content(event, trigger, player) {
				if (trigger.name === "dying") change(player, "my_fumeng");
				else if (trigger.name === "useCard") trigger.effectCount++;
				else {
					trigger.cancel();
					await trigger.player.loseHp(trigger.num);
				}
			},
		},
		my_yifang: {
			trigger: { target: "useCardToTargeted" },
			direct: true,
			filter(e, p) {
				return e.player !== p && tricks(e.card) && p.countCards("he") > 0;
			},
			async content(event, trigger, player) {
				const used = roundCards(player);
				const names = lib.inpile.filter(n => tricks({ name: n }) && !used.includes(n) && player.hasUseTarget({ name: n, isCard: true }));
				if (!names.length) return;
				const r = await choose(player.chooseButton(["遗方：将一张牌当本轮未使用过的锦囊牌使用", [names.map(n => ["锦囊", "", n]), "vcard"]]));
				if (!r.bool) return;
				const c = await choose(player.chooseCard("he", 1, "遗方：选择转化的牌"));
				if (c.bool) {
					player.logSkill("my_yifang");
					await player.chooseUseTarget({ name: r.links[0][2], isCard: true }, c.cards, true);
				}
			},
			group: "my_yifang_heal",
		},
		my_yifang_heal: {
			trigger: { player: "damageEnd" },
			forced: true,
			filter(e, p) {
				return game.hasPlayer(t => t !== p && t.isDamaged());
			},
			async content(event, trigger, player) {
				const r = await choose(player.chooseTarget("遗方：令一名其他角色回复1点体力", true, (card, p, t) => t !== p && t.isDamaged()));
				if (r.bool) await r.targets[0].recover();
			},
		},
		my_jingshi: {
			...conversion("my_jingshi"),
			trigger: { player: ["phaseZhunbeiBegin", "damageEnd"], global: "phaseEnd" },
			direct: true,
			filter(e, p, name) {
				return yin(p, "my_jingshi") ? name === "phaseEnd" : name !== "phaseEnd" && e.player === p;
			},
			async content(event, trigger, player) {
				if (yin(player, "my_jingshi")) {
					const n = trigger.player.getHistory("gain", e => turn(e) === trigger).reduce((a, e) => a + e.cards.length, 0);
					await invoke(player, "my_jingshi");
					const count = Math.min(n, trigger.player.countCards("he"));
					if (count) await trigger.player.chooseToDiscard("he", count, true);
				} else {
					const r = await choose(player.chooseTarget("经世：令一名角色摸体力上限数的牌（至多5）"));
					if (!r.bool) return;
					await invoke(player, "my_jingshi");
					await r.targets[0].draw(Math.min(5, r.targets[0].maxHp));
				}
			},
		},
		my_zhongzhi: {
			trigger: { global: ["phaseBegin", "loseAfter", "loseAsyncAfter", "cardsDiscardAfter", "gainAfter", "equipAfter", "addJudgeAfter", "addToExpansionAfter"] },
			forced: true,
			filter(e, p) {
				const phase = turn(e);
				if (!phase || phase.name !== "phase" || p.storage.my_zhongzhi_phase === phase) return false;
				const types = new Set(Array.from(ui.discardPile.childNodes).map(c => get.type2(c, false)));
				return ["basic", "trick", "equip"].every(t => types.has(t));
			},
			async content(event, trigger, player) {
				player.storage.my_zhongzhi_phase = turn(trigger);
				const reverse = !!player.storage.my_zhongzhi_reverse;
				async function toggle() {
					const skills = player.getSkills().filter(s => lib.skill[s]?.zhuanhuanji);
					if (!skills.length) return;
					let s = skills[0];
					if (skills.length > 1) s = (await choose(player.chooseControl(skills).set("prompt", "终志：转换一个技能状态"))).control;
					change(player, s);
				}
				if (reverse) await toggle();
				player.storage.my_zhongzhi_resolving = true;
				try {
					await player.damage(1, "nosource");
				} finally {
					delete player.storage.my_zhongzhi_resolving;
				}
				if (!reverse && alive(player)) await toggle();
			},
			group: "my_zhongzhi_reverse",
		},
		my_zhongzhi_reverse: {
			trigger: { player: "dyingAfter" },
			forced: true,
			popup: false,
			filter(e, p) {
				return p.storage.my_zhongzhi_resolving && alive(p) && p.hp > 0;
			},
			content(event, trigger, player) {
				player.storage.my_zhongzhi_reverse = !player.storage.my_zhongzhi_reverse;
			},
		},
		my_xiangran: {
			...conversion("my_xiangran", true),
			trigger: { global: ["phaseEnd", "useCard1"] },
			direct: true,
			filter(e, p) {
				if (e.player === p) return false;
				if (yin(p, "my_xiangran")) return e.name === "phase" && alive(e.player);
				return e.name === "useCard" && ordinary(e.card) && game.getRoundHistory("useCard", null, e).some(previous => previous !== e && ordinary(previous.card) && get.name(previous.card) === get.name(e.card));
			},
			async content(event, trigger, player) {
				if (!yin(player, "my_xiangran")) {
					if ((await choose(player.chooseBool(`想然：令${get.translation(trigger.card)}无效？`))).bool) {
						await invoke(player, "my_xiangran");
						trigger.all_excluded = true;
					}
					return;
				}
				const actor = trigger.player;
				const used = game.getRoundHistory("useCard").map(e => get.name(e.card));
				const names = lib.inpile.filter(n => ordinary({ name: n }) && !used.includes(n) && actor.hasUseTarget({ name: n, isCard: true }));
				if (!names.length) return;
				const r = await choose(player.chooseButton(["想然：声明本轮全场未使用过的普通锦囊", [names.map(n => ["锦囊", "", n]), "vcard"]]));
				if (!r.bool) return;
				const card = { name: r.links[0][2], isCard: true },
					info = get.info(card);
				let targets;
				const range = get.select(info.selectTarget ?? 1);
				if (range[1] === -1) targets = game.filterPlayer(t => actor.canUse(card, t));
				else {
					const t = await choose(player.chooseTarget("想然：声明目标", range, (c, p, target) => actor.canUse(card, target)));
					if (!t.bool) return;
					targets = t.targets;
				}
				// 借刀杀人的第二目标由声明者选择，并遵守持刀角色的攻击范围。
				if (info.singleCard && info.filterAddedTarget) {
					const extra = await choose(player.chooseTarget("想然：声明第二目标", true, (c, p, target) => info.filterAddedTarget(card, actor, target, targets[0])));
					if (!extra.bool) return;
					targets.push(extra.targets[0]);
				}
				if (!targets.length) return;
				await invoke(player, "my_xiangran");
				await actor.useCard(card, targets, false);
			},
		},
		my_bingjie: {
			trigger: { player: "loseAfter", global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"] },
			forced: true,
			filter(event, player) {
				if (player.countCards("h") || !player.isDamaged()) return false;
				const loss = event.getl?.(player);
				return !!(loss && loss.player === player && loss.hs?.length);
			},
			async content(event, trigger, player) {
				await player.recover();
			},
		},
		my_gaoyi: {
			trigger: { global: ["logSkill", "useSkillAfter"] },
			forced: true,
			filter(e, p) {
				const s = e.sourceSkill || e.skill,
					info = lib.skill[s];
				if (e.player === p || !info || info.charlotte || info.silent || s === "my_gaoyi" || ["global", "equip"].includes(e.type)) return false;
				const history = e.player.getRoundHistory("useSkill", x => (x.sourceSkill || x.skill) === s);
				const ref = e.log_event || e;
				return history.length > 1 && !p.storage.my_gaoyi_seen?.has(ref);
			},
			async content(event, trigger, player) {
				if (player.storage.my_gaoyi_round !== game.roundNumber) {
					player.storage.my_gaoyi_round = game.roundNumber;
					player.storage.my_gaoyi_seen = new Set();
				}
				player.storage.my_gaoyi_seen.add(trigger.log_event || trigger);
				await player.draw();
			},
		},
	};
	return {
		character: {
			my_jian_guojia: { sex: "male", group: "wei", hp: 3, maxHp: 4, skills: ["my_fengjue", "my_weijing"], img: "image/character/guojia.jpg" },
			my_jian_liuxie: { sex: "male", group: "wei", hp: 4, maxHp: 4, skills: ["my_fumeng", "my_yifang"], img: "image/character/liuxie.jpg" },
			my_jian_xunyu: { sex: "male", group: "wei", hp: 3, maxHp: 3, skills: ["my_jingshi", "my_zhongzhi", "my_bingjie"], img: "image/character/xunyu.jpg" },
			my_jian_kongrong: { sex: "male", group: "qun", hp: 4, maxHp: 4, skills: ["my_xiangran", "my_gaoyi"], img: "image/character/kongrong.jpg" },
		},
		characterTitle: { my_jian_guojia: "知孤者，嘉也", my_jian_liuxie: "汉祚余梦", my_jian_xunyu: "魏阙孤臣", my_jian_kongrong: "想当然耳" },
		skill,
		translate: {
			my_jian_custom: "奸系列·自制",
			my_jian_guojia: "奸郭嘉",
			my_jian_liuxie: "奸刘协",
			my_jian_xunyu: "奸荀彧",
			my_jian_kongrong: "奸孔融",
			my_fengjue: "奉绝",
			my_weijing: "未竟",
			my_fumeng: "浮梦",
			my_yifang: "遗方",
			my_yifang_heal: "遗方",
			my_jingshi: "经世",
			my_zhongzhi: "终志",
			my_bingjie: "秉节",
			my_xiangran: "想然",
			my_gaoyi: "高议",
			my_fengjue_info: "限定技，转换技。阳：一名角色的回合开始时，你可交给其任意张（至少一张）手牌或装备牌，对其造成等量伤害，然后按其已损失体力固定X，其下次造成伤害+X，下次从牌堆获得牌+X。阴：伤害即将令一名角色濒死时，你可防止之，令其获得场上X张牌（装备区、判定区，不足全得，X为奉绝累计发动次数），将其移出游戏，直到伤害来源回合开始；若至下一轮结束仍未返回，其死亡。每次发动后转换。",
			my_weijing_info: "锁定技，一名角色濒死结算后，重置奉绝的限定次数（不重置阴阳状态及累计发动次数）。",
			my_fumeng_info: "锁定技，转换技，初始为阳。一名角色脱离濒死后转换。阳：普通锦囊牌额外结算一次。阴：所有伤害改为失去等量体力。",
			my_yifang_info: "当你成为其他角色的锦囊牌目标时，你可将一张手牌或装备牌当你本轮未使用过的锦囊牌使用（含延时锦囊）。受到伤害后，令一名其他角色回复1点体力。",
			my_jingshi_info: "转换技，初始为阳，每次发动后转换。阳：准备阶段或受到伤害后，你可令一名角色摸X张牌（X为其体力上限，至多5）。阴：一名角色回合结束时，其弃置本回合获得数量的手牌或装备牌，不足则全弃。",
			my_zhongzhi_info: "锁定技，每个角色回合内，弃牌堆首次同时包含基本、锦囊、装备三类牌时，你依次执行：①受到1点无来源伤害；②转换自己的一个转换技状态。若因此进入濒死并脱离，今后颠倒两项顺序（再次满足则再次颠倒）。",
			my_xiangran_info: "转换技，初始为阴，每次发动后转换。阴：其他角色回合结束时，你可以声明一种本轮全场未使用过的普通锦囊牌及合法目标，令其使用之。阳：其他角色使用普通锦囊牌时，若本轮此前已有同名牌被使用过，你可以令此牌无效。",
			my_gaoyi_info: "锁定技，其他角色发动一个技能后，若这不是该角色本轮首次发动该技能，你摸一张牌。",
			my_bingjie_info: "锁定技，当你失去最后的手牌后，你回复1点体力。",
		},
	};
}
