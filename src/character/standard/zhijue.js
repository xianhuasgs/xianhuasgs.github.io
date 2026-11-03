// “废除”限定为本项目确认的七种规则；只记录整次触发被取消的技能。
export function createZhijuePack({ lib, game, ui, get, _status }) {
	const concepts = ["距离", "花色", "点数", "手牌上限", "伤害来源", "颜色", "装备"];
	const owners = new Set(),
		missed = new Map(),
		discards = new Map();
	const seen = new WeakMap();
	let installed = false,
		suspended = 0;
	const phaseOf = e => (e?.name === "phase" ? e : e?.getParent?.("phase"));
	const active = name => !suspended && [...owners].some(p => p.storage.my_zhijue_round === game.roundNumber && p.storage.my_zhijue_concept === name);
	function remember(e, actor, name, skill, indexedData) {
		const phase = phaseOf(e);
		if (!phase || phase.name !== "phase" || actor !== _status.currentPhase) return;
		let keys = seen.get(e);
		if (!keys) seen.set(e, (keys = new Set()));
		const key = `${actor.playerid}:${skill}:${name}`;
		if (keys.has(key)) return;
		keys.add(key);
		if (!missed.has(phase)) missed.set(phase, []);
		missed.get(phase).push({ actor, skill, name, trigger: e, indexedData });
	}
	function install() {
		if (installed) return;
		installed = true;
		for (const [method, concept, empty] of [
			["suit", "花色", "none"],
			["color", "颜色", "none"],
			["number", "点数", null],
			["distance", "距离", 0],
		]) {
			const original = get[method];
			get[method] = function (...args) {
				if (active(concept)) return empty;
				// 花色与颜色是两个独立概念：废花色时仍保留原本的颜色。
				if (method === "color" && active("花色")) {
					suspended++;
					try {
						return original.apply(this, args);
					} finally {
						suspended--;
					}
				}
				return original.apply(this, args);
			};
		}
		const info = get.info,
			skillsFromEquips = get.skillsFromEquips;
		get.info = function (...args) {
			const result = info.apply(this, args);
			return active("装备") && result?.type === "equip" ? { ...result, distance: {}, skills: [] } : result;
		};
		get.skillsFromEquips = function (...args) {
			return active("装备") ? [] : skillsFromEquips.apply(this, args);
		};
		const filter = lib.filter.filterTrigger;
		lib.filter.filterTrigger = function (e, actor, name, s, indexedData) {
			const result = filter.call(this, e, actor, name, s, indexedData);
			if (result || suspended || ![...owners].some(p => p.storage.my_zhijue_round === game.roundNumber && p.storage.my_zhijue_concept)) return result;
			// 比较完整原始条件；不猜测技能内部被跳过的片段。
			const source = e.source;
			suspended++;
			try {
				if (e.my_zhijue_source) e.source = e.my_zhijue_source;
				if (filter.call(this, e, actor, name, s, indexedData)) remember(e, actor, name, s, indexedData);
			} finally {
				e.source = source;
				suspended--;
			}
			return result;
		};
		game.addGlobalSkill("my_zhijue_rules");
		game.addGlobalSkill("my_zhijue_source_record");
	}
	function originalContext(context) {
		let e = context;
		for (let i = 0; e && i < 5; i++, e = e.getParent?.()) {
			if (e._trigger) return { event: e._trigger, name: e.triggername };
		}
		return null;
	}
	function adapted(record, owner, actor) {
		const e = Object.create(record.event);
		for (const key of ["player", "source", "target"]) if (record.event[key] === actor) e[key] = owner;
		if (record.event.my_zhijue_source === actor) e.source = owner;
		return e;
	}
	function canRepeat(owner, s, context, actor) {
		const info = lib.skill[s];
		if (!info || info.charlotte || info.silent || !owner.isIn()) return false;
		if ((info.limited || info.juexingji || info.dutySkill) && owner.awakenedSkills?.includes(s)) return false;
		const record = originalContext(context);
		if (record && info.trigger && info.content) {
			const e = adapted(record, owner, actor);
			try {
				return !info.filter || info.filter(e, owner, record.name);
			} catch {
				return false;
			}
		}
		// 主动技须仍在发动者自己的相应阶段内；通过正常选择流程支付牌和选择目标。
		const enables = Array.isArray(info.enable) ? info.enable : [info.enable];
		try {
			return enables.includes("phaseUse") && _status.currentPhase === owner && context?.getParent?.("phaseUse")?.name === "phaseUse" && (!info.filter || info.filter(context, owner));
		} catch {
			return false;
		}
	}
	async function repeat(owner, s, context, actor) {
		if (!canRepeat(owner, s, context, actor)) return false;
		const info = lib.skill[s],
			record = originalContext(context);
		await owner.addAdditionalSkills("my_skill_repeat", s);
		try {
			if (record && info.trigger) {
				const next = game.createTrigger(record.name, s, owner, adapted(record, owner, actor));
				next.uncheckHasSkill = true;
				await next;
			} else {
				const next = owner.chooseToUse();
				next.set("openskilldialog", `发动${get.translation(s)}`)
					.set("norestore", true)
					.set("_backupevent", s);
				next.backup(s);
				await next;
			}
		} finally {
			await owner.removeAdditionalSkills("my_skill_repeat");
		}
		return true;
	}
	function dropped(e) {
		return (e.getd?.() || e.cards || []).filter(c => get.position(c, true) === "d");
	}
	function fromUse(e) {
		const related = e.getParent("orderingDiscard")?.relatedEvent;
		if (related) return related.name === "useCard";
		if (e.getParent("respond")?.name === "respond") return false;
		return e.getParent("useCard")?.name === "useCard";
	}
	return {
		canRepeat,
		repeat,
		skill: {
			my_zhijue: {
				init(p) {
					owners.add(p);
					install();
				},
				trigger: { global: "roundStart" },
				forced: true,
				priority: 100,
				mark: true,
				marktext: "绝",
				intro: {
					content(s, p) {
						return `本轮废除：${p.storage.my_zhijue_concept || "无"}；本局已选：${(p.storage.my_zhijue_used || []).join("、") || "无"}`;
					},
				},
				filter(e, p) {
					return (p.storage.my_zhijue_used || []).length < concepts.length;
				},
				async content(event, trigger, player) {
					const remaining = concepts.filter(c => !player.storage.my_zhijue_used?.includes(c));
					const r = await player.chooseControl(remaining).set("prompt", "智绝：本轮废除一种本局未选过的概念").forResult();
					(player.storage.my_zhijue_used ||= []).push(r.control);
					player.storage.my_zhijue_concept = r.control;
					player.storage.my_zhijue_round = game.roundNumber;
					player.markSkill("my_zhijue");
				},
			},
			my_zhijue_rules: {
				charlotte: true,
				trigger: { global: ["damageBegin1", "roundEnd"] },
				forced: true,
				silent: true,
				priority: 10000,
				filter(e, p) {
					return p === game.filterPlayer()[0] && (e.name !== "damage" || active("伤害来源"));
				},
				content(event, trigger) {
					if (trigger.name === "damage") {
						trigger.my_zhijue_source = trigger.source;
						delete trigger.source;
					} else for (const p of owners) delete p.storage.my_zhijue_concept;
				},
				mod: {
					targetInRange() {
						if (active("距离")) return true;
					},
					maxHandcard() {
						if (active("手牌上限")) return Infinity;
					},
					cardEnabled(card) {
						if (active("装备") && get.type(card) === "equip") return false;
					},
				},
			},
			my_zhijue_source_record: {
				charlotte: true,
				trigger: { global: ["damageBegin2", "damageBegin3", "damageBegin4", "damage", "damageSource", "damageEnd"] },
				forced: true,
				silent: true,
				priority: 10000,
				filter(e, p) {
					return p === game.filterPlayer()[0] && active("伤害来源") && e.my_zhijue_source === _status.currentPhase;
				},
				content(event, trigger) {
					const actor = trigger.my_zhijue_source,
						source = trigger.source;
					suspended++;
					try {
						trigger.source = actor;
						for (const s of game.expandSkills(actor.getSkills().slice())) {
							const info = lib.skill[s],
								names = info?.trigger?.source;
							if (!names || !(Array.isArray(names) ? names : [names]).includes(event.triggername)) continue;
							if (lib.filter.filterTrigger(trigger, actor, event.triggername, s)) remember(trigger, actor, event.triggername, s);
						}
					} finally {
						trigger.source = source;
						suspended--;
					}
				},
			},
			my_yandao: {
				trigger: { global: ["loseAfter", "loseAsyncAfter", "cardsDiscardAfter"] },
				forced: true,
				filter(e) {
					return !fromUse(e) && dropped(e).length > 0 && phaseOf(e)?.name === "phase";
				},
				async content(event, trigger, player) {
					const phase = phaseOf(trigger);
					if (!discards.has(phase)) discards.set(phase, new Map());
					const entries = discards.get(phase);
					for (const card of dropped(trigger)) {
						if (!entries.has(player)) entries.set(player, []);
						entries.get(player).push(card.name);
						await player.draw();
					}
				},
				group: ["my_yandao_replay", "my_yandao_cleanup"],
			},
			my_yandao_replay: {
				trigger: { global: "phaseEnd" },
				direct: true,
				filter(e, p) {
					return discards.get(e)?.get(p)?.length || missed.get(e)?.length;
				},
				async content(event, trigger, player) {
					const names = discards.get(trigger)?.get(player)?.slice() || [];
					discards.get(trigger)?.delete(player);
					for (const name of names) {
						const card = { name, isCard: true };
						if (player.isIn() && player.hasUseTarget(card)) await player.chooseUseTarget(card, `演道：是否视为使用${get.translation(card)}？`);
					}
					const records = (missed.get(trigger) || []).filter(r => r.actor === trigger.player);
					for (const r of records) {
						if (!player.isIn() || !lib.skill[r.skill]?.content) continue;
						suspended++;
						try {
							const context = { _trigger: r.trigger, triggername: r.name };
							if (canRepeat(player, r.skill, context, r.actor) && (await player.chooseBool(`演道：发动记录的${get.translation(r.skill)}？`).forResult()).bool) await repeat(player, r.skill, context, r.actor);
						} finally {
							suspended--;
						}
					}
				},
			},
			my_yandao_cleanup: {
				charlotte: true,
				trigger: { global: "phaseAfter" },
				forced: true,
				silent: true,
				content(event, trigger) {
					missed.delete(trigger);
					discards.delete(trigger);
				},
			},
		},
		translate: {
			my_zhijue: "智绝",
			my_yandao: "演道",
			my_zhijue_info: "锁定技，每轮开始选择本局未选过的一种概念并废除至本轮结束：距离（忽略距离限制）、花色（无花色）、点数（无点数）、手牌上限（不限）、伤害来源（无来源）、颜色（无颜色）、装备（不能使用，装备技能与距离失效）。本项目只记录因废除概念而整次触发条件失效的技能，不记录技能内部失效片段。",
			my_yandao_info: "一张牌未因使用进入弃牌堆时，你摸一张牌并记录牌名。每个回合结束时，你可依次视为使用本回合记录的牌，再依次合法发动所记录的当前回合角色因智绝整次失效的触发技。按原规则支付代价、选择目标；不满足条件者跳过。然后清除记录。",
		},
	};
}
