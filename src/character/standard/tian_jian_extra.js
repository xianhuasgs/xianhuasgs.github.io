import { createZhijuePack } from "./zhijue.js";

export function createSecondBatch(runtime) {
	const { lib, game, ui, get, _status } = runtime;
	const zhijue = createZhijuePack(runtime);
	const q = next => next.forResult();
	const live = () => game.players.filter(p => !p.isDead());
	const phaseOf = e => (e.name === "phase" ? e : e.getParent("phase"));
	const watched = new Map();
	const snapshots = new Map();
	let empowered = false;
	function incoming(e) {
		return (e.getd?.() || e.cards || []).filter(c => get.position(c, true) === "d");
	}
	function watchedMatches(e, p) {
		const entries = watched.get(phaseOf(e));
		return entries ? incoming(e).filter(c => entries.get(c)?.has(p)) : [];
	}
	function grow(p) {
		p.storage.my_anshi_count = (p.storage.my_anshi_count || 1) + 1;
		p.markSkill("my_anshi");
		if (p.storage.my_anshi_count > game.countPlayer() && !empowered) {
			empowered = true;
			game.addGlobalSkill("my_anshi_basic");
			game.log("安时：本局杀、桃、酒的效果数值增加1");
		}
	}
	const skill = {
		...zhijue.skill,
		my_anshi: {
			mark: true,
			marktext: "时",
			intro: {
				content(s, p) {
					return `观看数量：${p.storage.my_anshi_count || 1}`;
				},
			},
			trigger: { global: "phaseZhunbeiBegin" },
			direct: true,
			async content(event, trigger, player) {
				if (!(await q(player.chooseBool("安时：观看牌堆顶的牌？"))).bool) return;
				player.logSkill("my_anshi");
				const phase = phaseOf(trigger),
					cards = get.cards(player.storage.my_anshi_count || 1);
				if (!cards.length) return;
				let entries = watched.get(phase);
				if (!entries) watched.set(phase, (entries = new Map()));
				for (const c of cards) {
					if (!entries.has(c)) entries.set(c, new Set());
					entries.get(c).add(player);
				}
				await player.viewCards("安时：观看牌堆顶", cards);
				let order = cards;
				if (player.countCards("he") >= cards.length && (await q(player.chooseToDiscard("he", cards.length, "安时：弃置等量牌，调整这些牌的顺序"))).bool) {
					const r = await q(
						player
							.chooseToMove("安时：调整顺序（左侧为牌堆顶）", true)
							.set("list", [["牌堆顶", cards]])
							.set("processAI", list => [list[0][1]])
					);
					if (r.bool) order = r.moved[0];
				}
				for (let i = order.length - 1; i >= 0; i--) ui.cardPile.insertBefore(order[i], ui.cardPile.firstChild);
				game.updateRoundNumber();
			},
			group: ["my_anshi_discard", "my_anshi_cleanup"],
		},
		my_anshi_discard: {
			trigger: { global: ["loseAfter", "loseAsyncAfter", "cardsDiscardAfter"] },
			forced: true,
			popup: false,
			filter(e, p) {
				return watchedMatches(e, p).length > 0;
			},
			async content(event, trigger, player) {
				for (const card of watchedMatches(trigger, player)) {
					if (get.position(card, true) !== "d") continue;
					const r = await q(player.chooseControl("获得此牌", "观看数量+1").set("prompt", `安时：${get.translation(card)}进入弃牌堆`));
					if (r.control === "获得此牌") await player.gain(card, "gain2");
					else grow(player);
				}
			},
		},
		my_anshi_cleanup: {
			charlotte: true,
			trigger: { global: "phaseAfter" },
			forced: true,
			silent: true,
			content(event, trigger) {
				watched.delete(trigger);
			},
		},
		my_anshi_basic: {
			charlotte: true,
			trigger: { global: ["useCard1", "recoverBegin"] },
			forced: true,
			popup: false,
			filter(e, p) {
				if (p !== game.filterPlayer()[0]) return false;
				if (e.name === "useCard") return ["sha", "jiu"].includes(get.name(e.card));
				return ["tao", "jiu"].some(n => e.getParent(n)?.name === n);
			},
			content(event, trigger) {
				if (trigger.name === "useCard") trigger.baseDamage = (trigger.baseDamage ?? 1) + 1;
				else trigger.num++;
			},
		},
		my_fushi: {
			limited: true,
			skillAnimation: true,
			animationColor: "wood",
			trigger: { global: "phaseJieshuBegin" },
			direct: true,
			filter(e, p) {
				return !p.storage.my_fushi_spent && live().some(t => snapshots.has(t));
			},
			async content(event, trigger, player) {
				if (!(await q(player.chooseBool("复始：将所有角色的手牌数、体力调整至各自上个准备阶段的记录？"))).bool) return;
				player.logSkill("my_fushi");
				player.awakenSkill("my_fushi");
				player.storage.my_fushi_spent = true;
				player.storage.my_fushi_check = { round: game.roundNumber, count: live().length };
				// 固定本次快照，避免结算过程中额外回合覆盖目标状态。
				const states = live().map(t => [t, snapshots.get(t)]);
				for (const [target, state] of states) {
					if (!state || !target.isIn()) continue;
					const delta = state.cards - target.countCards("h");
					if (delta > 0) await target.draw(delta);
					else if (delta < 0) await target.chooseToDiscard("h", -delta, true);
					if (!target.isIn()) continue;
					const hp = Math.min(state.hp, target.maxHp) - target.hp;
					if (hp > 0) await target.recover(hp);
					else if (hp < 0) await target.loseHp(-hp);
				}
			},
			group: ["my_fushi_record", "my_fushi_reset"],
		},
		my_fushi_record: {
			charlotte: true,
			trigger: { global: "phaseZhunbeiBegin" },
			forced: true,
			silent: true,
			priority: 1000,
			content(event, trigger) {
				snapshots.set(trigger.player, { cards: trigger.player.countCards("h"), hp: trigger.player.hp });
			},
		},
		my_fushi_reset: {
			charlotte: true,
			trigger: { global: "roundEnd" },
			forced: true,
			popup: false,
			filter(e, p) {
				return !!p.storage.my_fushi_check;
			},
			content(event, trigger, player) {
				const record = player.storage.my_fushi_check;
				delete player.storage.my_fushi_check;
				if (record.count === live().length) {
					delete player.storage.my_fushi_spent;
					player.restoreSkill("my_fushi");
				}
			},
		},
		my_liubin: {
			zhuanhuanji: true,
			mark: true,
			marktext: "☯",
			intro: {
				content(s) {
					return s ? "阴：额外结算并交换手牌" : "阳：弃最多类别手牌，反伤并获得此牌";
				},
			},
			trigger: { player: "useCardToPlayered" },
			forced: true,
			filter(e) {
				return e.targets?.length === 1 && e.target?.isIn();
			},
			async content(event, trigger, player) {
				const target = trigger.target,
					use = trigger.getParent("useCard");
				const yin = !!player.storage.my_liubin;
				player.changeZhuanhuanji("my_liubin");
				if (!yin) {
					const cards = target.getCards("h"),
						counts = new Map();
					for (const c of cards) {
						const t = get.type2(c, target);
						counts.set(t, (counts.get(t) || 0) + 1);
					}
					if (counts.size) {
						const max = Math.max(...counts.values()),
							types = [...counts.keys()].filter(t => counts.get(t) === max);
						let type = types[0];
						if (types.length > 1) type = types[(await q(player.chooseControl(types.map(t => get.translation(t))).set("prompt", "留宾：选择并列最多的一类手牌"))).index];
						await target.discard(cards.filter(c => get.type2(c, target) === type));
					}
					if (target.isIn() && player.isIn()) await player.damage(1, target);
					const physical = (use.cards || []).filter(c => ["o", "d"].includes(get.position(c, true)));
					if (target.isIn() && physical.length) await target.gain(physical, "gain2");
				} else {
					use.effectCount = (use.effectCount || 1) + 1;
					if (!player.countCards("h") || !target.countCards("h") || target === player) return;
					const a = await q(player.chooseCard("h", 1, true, "留宾：选择交换的一张手牌"));
					const b = await q(target.chooseCard("h", 1, true, "留宾：选择交换的一张手牌"));
					if (a.bool && b.bool) await player.swapHandcards(target, a.cards, b.cards);
				}
			},
		},
		my_fuwo: {
			trigger: { global: ["gainAfter", "loseAsyncAfter"] },
			forced: true,
			filter(e, p) {
				const hand = e.getl?.(p)?.hs || [];
				return hand.length > 0 && game.hasPlayer(t => t !== p && e.getg?.(t)?.some(c => hand.includes(c)));
			},
			async content(event, trigger, player) {
				const hand = trigger.getl(player).hs;
				for (const target of game.filterPlayer(t => t !== player && trigger.getg(t)?.some(c => hand.includes(c)))) await target.draw();
			},
			group: "my_fuwo_death",
		},
		my_fuwo_death: {
			trigger: { player: "die" },
			forced: true,
			forceDie: true,
			filter(e, p) {
				return e.source && e.source !== p && e.source.isIn();
			},
			async content(event, trigger) {
				const killer = trigger.source;
				killer.storage.my_fuwo_equips = game.expandSkills(killer.getSkills("e")).slice();
				await killer.removeSkills(killer.getSkills(null, false, false));
				killer.addSkill("my_fuwo_curse");
				killer.addSkillBlocker("my_fuwo_curse");
				await killer.addSkills("my_new_jianxiong");
			},
		},
		my_fuwo_curse: {
			charlotte: true,
			skillBlocker(s, p) {
				return s !== "my_new_jianxiong" && p.storage.my_fuwo_equips?.includes(s);
			},
			onremove(p) {
				p.removeSkillBlocker("my_fuwo_curse");
			},
		},
		my_jianjue: {
			juexingji: true,
			dutySkill: true,
			trigger: { global: "roundStart" },
			forced: true,
			filter(e, p) {
				return !p.storage.my_jianjue_done;
			},
			async content(event, trigger, player) {
				const r = await q(player.chooseControl("摸牌", "回复体力", "获得其他角色区域牌", "造成伤害").set("prompt", "奸绝：选择本轮跟随执行的一项"));
				player.storage.my_jianjue_option = r.index;
				player.storage.my_jianjue_round = game.roundNumber;
				delete player.storage.my_jianjue_echoed;
			},
			group: ["my_jianjue_echo", "my_jianjue_success"],
		},
		my_jianjue_echo: {
			trigger: { global: ["drawAfter", "recoverAfter", "gainAfter", "damageEnd"] },
			forced: true,
			popup: false,
			filter(e, p) {
				if (p.storage.my_jianjue_done || p.storage.my_jianjue_echoed || p.storage.my_jianjue_round !== game.roundNumber) return false;
				const i = p.storage.my_jianjue_option;
				if (i === 0) return e.name === "draw" && e.player !== p && e.num > 0;
				if (i === 1) return e.name === "recover" && e.player !== p && e.num > 0;
				if (i === 3) return e.name === "damage" && e.source && e.source !== p && e.num > 0;
				return i === 2 && e.name === "gain" && e.player !== p && game.hasPlayer(t => t !== e.player && e.getl?.(t)?.cards2?.some(c => e.cards.includes(c)));
			},
			async content(event, trigger, player) {
				player.storage.my_jianjue_echoed = true;
				const i = player.storage.my_jianjue_option;
				if (i === 0) await player.draw();
				else if (i === 1) await player.recover();
				else {
					const r = await q(player.chooseTarget(i === 2 ? "奸绝：获得其他角色区域的一张牌" : "奸绝：对其他角色造成1点伤害", true, (c, p, t) => t !== p && (i !== 2 || t.countGainableCards(p, "hej") > 0)));
					if (!r.bool) return;
					if (i === 2) await player.gainPlayerCard(r.targets[0], "hej", true);
					else {
						const damage = r.targets[0].damage(1, player);
						damage.my_jianjue_echo = player;
						await damage;
					}
				}
			},
		},
		my_jianjue_success: {
			trigger: { source: "damageEnd" },
			forced: true,
			popup: false,
			filter(e, p) {
				return e.my_jianjue_echo === p && !p.storage.my_jianjue_done;
			},
			async content(event, trigger, player) {
				player.storage.my_jianjue_damage = (player.storage.my_jianjue_damage || 0) + trigger.num;
				if (player.storage.my_jianjue_damage >= player.hp) {
					player.storage.my_jianjue_done = true;
					player.awakenSkill("my_jianjue");
					await player.addSkills("my_new_jianxiong");
				}
			},
		},
		my_xieling: {
			trigger: { global: "logSkillBegin" },
			forced: true,
			filter(e, p) {
				const s = get.sourceSkillFor(e),
					info = lib.skill[s];
				return e.player !== p && info && !info.charlotte && !info.silent && !["global", "equip"].includes(e.type) && s !== "my_xieling" && e.player.getHistory("useSkill", x => (x.sourceSkill || x.skill) === s).length > 1;
			},
			async content(event, trigger, player) {
				const s = get.sourceSkillFor(trigger),
					actor = trigger.player;
				const list = actor.getHistory("useSkill", e => (e.sourceSkill || e.skill) === s);
				if (list.length < 2) return;
				const context = trigger.log_event;
				const copySkill = trigger.skill;
				const can = zhijue.canRepeat(player, copySkill, context, actor);
				const options = can ? ["令曹操发动此技能", "失去此技能"] : ["失去此技能"];
				const r = await q(actor.chooseControl(options).set("prompt", `挟令：${get.translation(s)}本回合再次发动`));
				if (can && r.control === options[0]) {
					if (!(await zhijue.repeat(player, copySkill, context, actor))) await actor.removeSkills(s);
				} else await actor.removeSkills(s);
			},
		},
	};
	return {
		character: {
			my_zhi_zhugeliang: { sex: "male", group: "shu", hp: 3, maxHp: 3, skills: ["my_zhijue", "my_yandao"], img: "image/character/zhugeliang.jpg" },
			my_jian_caocao: { sex: "male", group: "wei", hp: 4, maxHp: 4, skills: ["my_jianjue", "my_xieling"], img: "image/character/caocao.jpg" },
			my_zhi_cuizhouping: { sex: "male", group: "qun", hp: 3, maxHp: 3, skills: ["my_anshi", "my_fushi"], img: "image/character/friend_cuijun.jpg" },
			my_jian_lvboshe: { sex: "male", group: "qun", hp: 4, maxHp: 4, skills: ["my_liubin", "my_fuwo"], img: "image/character/lvboshe.jpg" },
		},
		characterTitle: { my_zhi_zhugeliang: "智绝千古", my_jian_caocao: "奸绝天下", my_zhi_cuizhouping: "顺天者逸", my_jian_lvboshe: "负世之始" },
		skill,
		translate: {
			...zhijue.translate,
			my_tian_custom: "智奸·自制",
			my_zhi_zhugeliang: "智诸葛亮",
			my_jian_caocao: "奸曹操",
			my_zhi_cuizhouping: "智崔州平",
			my_jian_lvboshe: "奸吕伯奢",
			my_anshi: "安时",
			my_anshi_info: "每名角色准备阶段，你可观看牌堆顶N张牌（初始N=1），然后可弃置N张手牌或装备牌调整其顺序。此角色本回合内，观看的牌进入弃牌堆时，你逐张选择获得之或令N+1。N大于场上角色数后，本局杀伤害、桃回复、酒加伤和濒死回复均+1。",
			my_fushi: "复始",
			my_fushi_info: "限定技，一名角色结束阶段，你可将所有角色的手牌数、体力调整至各自上个准备阶段开始时的记录（以摸弃牌、回复和失去体力实现，体力不超过当前上限，尚无记录者不调整）。本轮结束时若存活人数与发动时相同，重置此技能。",
			my_liubin: "留宾",
			my_liubin_info: "锁定技，转换技，初始阳，每次触发后转换。使用牌指定唯一目标时，阳：目标弃置其手牌中数量最多类别的全部牌（并列由你选），然后对你造成1点伤害，并获得此牌的实体牌。阴：此牌额外结算一次，你与其各选择一张手牌交换。",
			my_fuwo: "负我",
			my_fuwo_info: "锁定技，其他角色每次获得你的手牌后，该角色摸一张牌。杀死你的角色失去其所有技能（当时的装备技能永久失效），并获得本版奸雄。",
			my_jianjue: "奸绝",
			my_jianjue_info: "使命技，每轮开始选择一项：摸牌、回复体力、获得其他角色区域牌、造成伤害。本轮其他角色首次执行该项后，你执行同项（摸1、回1、获得其他角色区域1张牌、对其他角色造成1伤害，目标由你选）。使命成功：以此法累计造成伤害不小于当前体力时，获得奸雄，使命结束。",
			my_xieling: "挟令",
			my_xieling_info: "锁定技，记录其他角色本回合发动的技能。同一角色再次发动同一技能时，其选择令你按原规则合法发动一次，或永久失去此技能。不满足当前发动条件的技能不能选择复制。",
		},
	};
}
