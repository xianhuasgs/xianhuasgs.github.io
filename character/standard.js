import { get, game, _status, ui, lib } from "noname";
const characters = {
  std_yuejin: {
    sex: "male",
    group: "wei",
    hp: 4,
    skills: ["stdxiaoguo"],
    dieAudios: ["yuejin"],
    img: "image/character/gz_yuejin.jpg"
  },
  old_re_lidian: {
    sex: "male",
    group: "wei",
    hp: 3,
    skills: ["xunxun", "wangxi"],
    dieAudios: ["lidian"]
  },
  ganfuren: {
    sex: "female",
    group: "shu",
    hp: 3,
    skills: ["stdshushen", "shenzhi"],
    names: "甘|null"
  },
  std_panfeng: {
    sex: "male",
    group: "qun",
    hp: 4,
    skills: ["stdkuangfu"],
    dieAudios: ["re_panfeng"]
  },
  caocao: {
    sex: "male",
    group: "wei",
    hp: 4,
    skills: ["jianxiong", "hujia"],
    isZhugong: true
  },
  simayi: {
    sex: "male",
    group: "wei",
    hp: 3,
    skills: ["fankui", "guicai"],
    names: "司马|懿"
  },
  xiahoudun: {
    sex: "male",
    group: "wei",
    hp: 4,
    skills: ["ganglie"],
    names: "夏侯|惇"
  },
  zhangliao: {
    sex: "male",
    group: "wei",
    hp: 4,
    skills: ["tuxi"]
  },
  xuzhu: {
    sex: "male",
    group: "wei",
    hp: 4,
    skills: ["luoyi"]
  },
  guojia: {
    sex: "male",
    group: "wei",
    hp: 3,
    skills: ["tiandu", "yiji"]
  },
  zhenji: {
    sex: "female",
    group: "wei",
    hp: 3,
    skills: ["luoshen", "qingguo"]
  },
  liubei: {
    sex: "male",
    group: "shu",
    hp: 4,
    skills: ["rende", "jijiang"],
    isZhugong: true
  },
  guanyu: {
    sex: "male",
    group: "shu",
    hp: 4,
    skills: ["wusheng"]
  },
  zhangfei: {
    sex: "male",
    group: "shu",
    hp: 4,
    skills: ["paoxiao"]
  },
  zhugeliang: {
    sex: "male",
    group: "shu",
    hp: 3,
    skills: ["guanxing", "kongcheng"],
    names: "诸葛|亮",
    clans: ["琅琊诸葛氏"]
  },
  zhaoyun: {
    sex: "male",
    group: "shu",
    hp: 4,
    skills: ["longdan"]
  },
  machao: {
    sex: "male",
    group: "shu",
    hp: 4,
    skills: ["mashu", "tieji"]
  },
  huangyueying: {
    sex: "female",
    group: "shu",
    hp: 3,
    skills: ["jizhi", "qicai"]
  },
  sunquan: {
    sex: "male",
    group: "wu",
    hp: 4,
    skills: ["zhiheng", "jiuyuan"],
    isZhugong: true
  },
  ganning: {
    sex: "male",
    group: "wu",
    hp: 4,
    skills: ["qixi"]
  },
  lvmeng: {
    sex: "male",
    group: "wu",
    hp: 4,
    skills: ["keji"]
  },
  huanggai: {
    sex: "male",
    group: "wu",
    hp: 4,
    skills: ["kurou"]
  },
  zhouyu: {
    sex: "male",
    group: "wu",
    hp: 3,
    skills: ["yingzi", "fanjian"]
  },
  daqiao: {
    sex: "female",
    group: "wu",
    hp: 3,
    skills: ["guose", "liuli"],
    names: "桥|null"
  },
  luxun: {
    sex: "male",
    group: "wu",
    hp: 3,
    skills: ["qianxun", "lianying"],
    clans: ["吴郡陆氏"]
  },
  sunshangxiang: {
    sex: "female",
    group: "wu",
    hp: 3,
    skills: ["xiaoji", "jieyin"]
  },
  huatuo: {
    sex: "male",
    group: "qun",
    hp: 3,
    skills: ["qingnang", "jijiu"]
  },
  lvbu: {
    sex: "male",
    group: "qun",
    hp: 4,
    skills: ["wushuang"]
  },
  diaochan: {
    sex: "female",
    group: "qun",
    hp: 3,
    skills: ["lijian", "biyue"],
    names: "null|null"
  },
  huaxiong: {
    sex: "male",
    group: "qun",
    hp: 6,
    skills: ["yaowu"]
  },
  gongsunzan: {
    sex: "male",
    group: "qun",
    hp: 4,
    skills: ["reyicong"],
    names: "公孙|瓒"
  },
  xf_yiji: {
    sex: "male",
    group: "shu",
    hp: 3,
    skills: ["xinfu_jijie", "xinfu_jiyuan"]
  },
  re_yuanshu: {
    sex: "male",
    group: "qun",
    hp: 4,
    skills: ["rewangzun", "retongji"]
  }
};
const cards = {};
const pinyins = {};
const skills = {
  //主公吕布
  stdqingjiao: {
    audio: 2,
    trigger: {
      player: "phaseJieshuBegin"
    },
    zhuSkill: true,
    filter(event, player) {
      return player.hasHistory("sourceDamage", (evt) => evt.player !== player && evt.player?.group === "qun");
    },
    forced: true,
    async content(event, trigger, player) {
      await player.draw();
    }
  },
  //标准版乐进
  stdxiaoguo: {
    audio: "xiaoguo",
    trigger: { global: "phaseJieshuBegin" },
    filter(event, player) {
      return event.player.isIn() && event.player !== player && player.hasCards("h", (card) => {
        if (_status.connectMode) {
          return true;
        }
        return get.type(card) === "basic" && lib.filter.cardDiscardable(card, player);
      });
    },
    async cost(event, trigger, player) {
      const target = trigger.player;
      event.result = await player.chooseToDiscard({
        prompt: get.prompt(event.skill),
        filterCard(card, player2) {
          return get.type(card) === "basic";
        },
        chooseonly: true,
        ai(card) {
          return get.event().eff - get.useful(card);
        }
      }).set(
        "eff",
        (() => {
          if (target.hasSkillTag("noe")) {
            return get.attitude(_status.event.player, target);
          }
          return get.damageEffect(target, player, _status.event.player);
        })()
      ).forResult();
    },
    logTarget: "player",
    async content(event, trigger, player) {
      const target = trigger.player;
      await player.discard({
        cards: event.cards,
        discarder: player
      });
      const { bool } = await target.chooseToDiscard({
        prompt: "弃置一张装备牌，或受到1点伤害",
        filterCard: get.filter({ type: "equip" }),
        position: "he",
        ai(card) {
          if (get.event().damage > 0) {
            return 0;
          }
          if (get.event().noe) {
            return 12 - get.value(card);
          }
          return -get.event().damage - get.value(card);
        }
      }).set("damage", get.damageEffect(target, player, target)).set("noe", target.hasSkillTag("noe")).forResult();
      if (!bool) {
        await target.damage();
      }
    }
  },
  //标准版甘夫人
  stdshushen: {
    audio: "shushen",
    trigger: { player: "recoverEnd" },
    getIndex(event) {
      return event.num || 1;
    },
    async cost(event, trigger, player) {
      event.result = await player.chooseTarget({
        prompt: get.prompt2(event.skill),
        filterTarget: lib.filter.notMe,
        ai(target) {
          return get.attitude(get.player(), target);
        }
      }).forResult();
    },
    async content(event, trigger, player) {
      const target = event.targets[0];
      await target.draw(target.hasCards("h") ? 1 : 2);
    },
    ai: { threaten: 0.8, expose: 0.1 }
  },
  stdkuangfu: {
    audio: "xinkuangfu",
    trigger: { source: "damageSource" },
    forced: true,
    filter(event, player) {
      if (player.hasSkill("stdkuangfu_used")) {
        return false;
      }
      return player.isPhaseUsing() && event.card && event.card.name === "sha" && event.player !== player && event.player.isIn();
    },
    async content(event, trigger, player) {
      player.addTempSkill("stdkuangfu_used", "phaseChange");
      if (trigger.player.hp < player.hp) {
        await player.draw(2);
      } else {
        await player.loseHp();
      }
    },
    ai: {
      halfneg: true
    },
    subSkill: {
      used: {
        charlotte: true
      }
    }
  },
  rewangzun: {
    trigger: { global: "phaseZhunbeiBegin" },
    forced: true,
    audio: "wangzun",
    filter(event, player) {
      return event.player.hp > player.hp;
    },
    logTarget: "player",
    async content(event, trigger, player) {
      await player.draw();
      let zhu = false;
      const target = trigger.player;
      switch (get.mode()) {
        case "identity": {
          zhu = target.isZhu;
          break;
        }
        case "guozhan": {
          zhu = get.is.jun(target);
          break;
        }
        case "versus": {
          zhu = target.identity == "zhu";
          break;
        }
        case "doudizhu": {
          zhu = target == game.zhu;
          break;
        }
      }
      if (zhu) {
        await player.draw();
        target.addTempSkill("rewangzun2");
        target.addMark("rewangzun2", 1, false);
      }
    }
  },
  rewangzun2: {
    onremove: true,
    mod: {
      maxHandcard(player, num) {
        return num - player.countMark("rewangzun2");
      }
    },
    intro: { content: "手牌上限-#" }
  },
  retongji: {
    trigger: { global: "useCardToTarget" },
    logTarget: "target",
    audio: "tongji",
    filter(event, player) {
      return event.card.name === "sha" && event.player !== player && !event.targets.includes(player) && event.target.inRange(player) && event.target.hasCards("he");
    },
    async cost(event, trigger, player) {
      event.result = await trigger.target.chooseToDiscard({
        prompt: get.prompt("retongji", player),
        prompt2: `弃置一张牌，将${get.translation(trigger.card)}转移给${get.translation(player)}`,
        position: "he",
        chooseonly: true,
        ai(card) {
          if (!_status.event.check) {
            return -1;
          }
          return get.unuseful(card) + 9;
        }
      }).set(
        "check",
        (() => {
          if (trigger.target.hasCards("h", "shan")) {
            return -get.attitude(trigger.target, player);
          }
          if (get.attitude(trigger.target, player) < 5) {
            return 6 - get.attitude(trigger.target, player);
          }
          if (trigger.target.hp === 1 && !player.hasCards("h", "shan")) {
            return 10 - get.attitude(trigger.target, player);
          }
          if (trigger.target.hp === 2 && !player.hasCards("h", "shan")) {
            return 8 - get.attitude(trigger.target, player);
          }
          return -1;
        })() > 0
      ).forResult();
    },
    async content(event, trigger, player) {
      const evt = trigger.getParent();
      if (evt == null) {
        throw new ReferenceError("找不到触发【同疾】的使用牌事件");
      }
      await trigger.target.discard({
        cards: event.cards,
        discarder: trigger.target
      });
      evt.triggeredTargets2.remove(trigger.target);
      evt.targets.remove(trigger.target);
      evt.targets.push(player);
    },
    ai: {
      neg: true
    }
  },
  hujia: {
    audio: 2,
    audioname: ["re_caocao"],
    audioname2: {
      pe_jun_caocao: "sbhujia"
    },
    zhuSkill: true,
    trigger: { player: ["chooseToRespondBefore", "chooseToUseBefore"] },
    filter(event, player) {
      if (event.responded) {
        return false;
      }
      if (player.storage.hujiaing) {
        return false;
      }
      if (!player.hasZhuSkill("hujia")) {
        return false;
      }
      if (!event.filterCard({ name: "shan", isCard: true }, player, event)) {
        return false;
      }
      return game.hasPlayer((current) => current !== player && current.group === "wei");
    },
    check(event, player) {
      if (get.damageEffect(player, event.player, player) >= 0) {
        return false;
      }
      return true;
    },
    async content(event, trigger, player) {
      let current = player.next;
      while (true) {
        event.current = current;
        if (current === player) {
          return;
        }
        let bool = false;
        if (current.group === "wei") {
          if (current === game.me && !_status.auto || get.attitude(current, player) > 2 || current.isOnline()) {
            player.storage.hujiaing = true;
            const next = current.chooseToRespond({
              prompt: `是否替${get.translation(player)}打出一张闪？`,
              filterCard: get.filter({ name: "shan" }),
              ai() {
                const event2 = get.event();
                return get.attitude(event2.player, event2.source) - 2;
              }
            });
            next.set("skillwarn", `替${get.translation(player)}打出一张闪`);
            next.autochoose = lib.filter.autoRespondShan;
            next.set("source", player);
            bool = !!(await next.forResult()).bool;
          }
        }
        player.storage.hujiaing = false;
        if (bool) {
          trigger.result = { bool: true, card: { name: "shan", isCard: true } };
          trigger.responded = true;
          trigger.animate = false;
          if (typeof current.ai.shown === "number" && current.ai.shown < 0.95) {
            current.ai.shown += 0.3;
            if (current.ai.shown > 0.95) {
              current.ai.shown = 0.95;
            }
          }
          return;
        } else {
          current = current.next;
        }
      }
    },
    ai: {
      respondShan: true,
      skillTagFilter(player) {
        if (player.storage.hujiaing) {
          return false;
        }
        if (!player.hasZhuSkill("hujia")) {
          return false;
        }
        return game.hasPlayer((current) => current != player && current.group == "wei");
      }
    }
  },
  jianxiong: {
    audio: 2,
    audioname2: { caoying: "lingren_jianxiong" },
    preHidden: true,
    trigger: { player: "damageEnd" },
    filter(event, player) {
      return get.itemtype(event.cards) === "cards" && get.position(event.cards[0], true) === "o";
    },
    async content(event, trigger, player) {
      player.gain({
        cards: trigger.cards,
        animate: "gain2"
      });
    },
    ai: {
      maixie: true,
      maixie_hp: true,
      effect: {
        target(card, player, target) {
          if (player.hasSkillTag("jueqing", false, target)) {
            return [1, -1];
          }
          if (get.tag(card, "damage")) {
            return [1, 0.55];
          }
        }
      }
    }
  },
  fankui: {
    audio: 2,
    trigger: { player: "damageEnd" },
    logTarget: "source",
    preHidden: true,
    filter(event, player) {
      return event.num > 0 && event.source?.hasGainableCards(player, event.source !== player ? "he" : "e");
    },
    async content(event, trigger, player) {
      player.gainPlayerCard({
        target: trigger.source,
        position: trigger.source !== player ? "he" : "e",
        forced: true
      });
    },
    ai: {
      maixie_defend: true,
      effect: {
        target(card, player, target) {
          if (player.countCards("he") > 1 && get.tag(card, "damage")) {
            if (player.hasSkillTag("jueqing", false, target)) {
              return [1, -1.5];
            }
            if (get.attitude(target, player) < 0) {
              return [1, 1];
            }
          }
        }
      }
    }
  },
  guicai: {
    audio: 2,
    audioname2: { new_simayi: "reguicai_new_simayi" },
    trigger: { global: "judge" },
    preHidden: true,
    filter(event, player) {
      return player.hasCards(get.mode() === "guozhan" ? "hes" : "hs");
    },
    async cost(event, trigger, player) {
      event.result = await player.chooseCard({
        prompt: `${get.translation(trigger.player)}的${trigger.judgestr || ""}判定为${get.translation(trigger.player.judging[0])}，${get.prompt(event.skill)}`,
        filterCard(card) {
          const player2 = get.player();
          const mod2 = game.checkMod(card, player2, "unchanged", "cardEnabled2", player2);
          if (mod2 !== "unchanged") {
            return !!mod2;
          }
          const mod = game.checkMod(card, player2, "unchanged", "cardRespondable", player2);
          if (mod !== "unchanged") {
            return !!mod;
          }
          return true;
        },
        position: get.mode() === "guozhan" ? "hes" : "hs",
        ai(card) {
          const trigger2 = get.event().getTrigger();
          const { player: player2, judging } = get.event();
          const result = trigger2.judge(card) - trigger2.judge(judging);
          const attitude = get.attitude(player2, trigger2.player);
          let val = get.value(card);
          if (get.subtype(card) == "equip2") {
            val /= 2;
          } else {
            val /= 4;
          }
          if (attitude == 0 || result == 0) {
            return 0;
          }
          if (attitude > 0) {
            return result - val;
          }
          return -result - val;
        }
      }).set("judging", trigger.player.judging[0]).setHiddenSkill(event.skill).forResult();
    },
    //技能的logSkill跟着打出牌走 不进行logSkill
    popup: false,
    async content(event, trigger, player) {
      const next = player.respond({
        cards: event.cards,
        skill: event.name,
        highlight: true,
        noOrdering: true
      });
      await next;
      const { cards: cards2 } = next;
      if (cards2?.length) {
        if (trigger.player.judging[0].clone) {
          trigger.player.judging[0].clone.classList.remove("thrownhighlight");
          game.broadcast((card) => {
            if (card.clone) {
              card.clone.classList.remove("thrownhighlight");
            }
          }, trigger.player.judging[0]);
          game.addVideo("deletenode", player, get.cardsInfo([trigger.player.judging[0].clone]));
        }
        await game.cardsDiscard(trigger.player.judging[0]);
        trigger.player.judging[0] = cards2[0];
        trigger.orderingCards.addArray(cards2);
        game.log(trigger.player, "的判定牌改为", cards2);
        await game.delay(2);
      }
    },
    ai: {
      rejudge: true,
      tag: { rejudge: 1 }
    }
  },
  ganglie: {
    audio: 2,
    trigger: { player: "damageEnd" },
    check(event, player) {
      if (!event.source?.isIn()) {
        return Math.random() < 0.5;
      }
      return get.attitude(player, event.source) <= 0;
    },
    prompt2(event, player) {
      let str = "你可以判定。";
      if (event.source?.isIn()) {
        str += `若结果不为红桃，则${get.translation(event.source)}须弃置两张手牌，否则其受到来自你的1点伤害。`;
      }
      return str;
    },
    async content(event, trigger, player) {
      const { source } = trigger;
      let result = await player.judge({
        judge(card) {
          if (get.suit(card) === "heart") {
            return -2;
          }
          return 2;
        },
        judge2(result2) {
          return result2.bool;
        }
      }).forResult();
      if (!result?.bool || !source?.isIn()) {
        return;
      }
      result = source.countDiscardableCards(source, "h") < 2 ? { bool: false } : await source.chooseToDiscard({
        prompt: `弃置两张手牌，否则${get.translation(player)}对你造成1点伤害`,
        selectCard: 2,
        ai(card) {
          if (card.name === "tao") {
            return -10;
          }
          if (card.name === "jiu" && get.player().hp === 1) {
            return -10;
          }
          return get.unuseful(card) + 2.5 * (5 - (get.owner(card)?.hp ?? 0));
        }
      }).forResult();
      if (!result?.bool) {
        await source.damage();
      }
    },
    ai: {
      maixie_defend: true,
      effect: {
        target(card, player, target) {
          if (player.hasSkillTag("jueqing", false, target)) {
            return [1, -1];
          }
          return 0.8;
        }
      }
    }
  },
  ganglie_three: {
    audio: "ganglie",
    trigger: { player: "damageEnd" },
    async cost(event, trigger, player) {
      event.result = await player.chooseTarget({
        prompt: get.prompt2(event.skill),
        filterTarget(card, player2, target) {
          return target.isEnemyOf(player2);
        },
        ai(target) {
          return -get.attitude(get.player(), target) / Math.sqrt(1 + target.countCards("h"));
        }
      }).forResult();
    },
    async content(event, trigger, player) {
      event.target = event.targets[0];
      const { judge } = await player.judge({
        judge(card) {
          if (get.suit(card) === "heart") {
            return -2;
          }
          return 2;
        },
        judge2(result) {
          return result.bool;
        }
      }).forResult();
      if (judge < 2) {
        return;
      }
      const { bool: chooseToDiscardResultBool } = await event.target.chooseToDiscard({
        selectCard: 2,
        ai(card) {
          if (card.name === "tao") {
            return -10;
          }
          if (card.name === "jiu" && _status.event.player.hp == 1) {
            return -10;
          }
          return get.unuseful(card) + 2.5 * (5 - (get.owner(card)?.hp ?? 0));
        }
      }).forResult();
      if (chooseToDiscardResultBool === false) {
        await event.target.damage();
      }
    },
    ai: {
      maixie_defend: true,
      effect: {
        target(card, player, target) {
          if (player.hasSkillTag("jueqing", false, target)) {
            return [1, -1];
          }
          return 0.8;
        }
      }
    }
  },
  tuxi: {
    audio: 2,
    trigger: { player: "phaseDrawBegin1" },
    filter(event, player) {
      return !event.numFixed;
    },
    async cost(event, trigger, player) {
      let num = game.countPlayer((current) => current !== player && get.attitude(player, current) <= 0 && current.hasCards("h"));
      let check = num >= 2;
      event.result = await player.chooseTarget({
        prompt: get.prompt(event.skill),
        prompt2: "获得其他一至两名角色的各一张手牌",
        filterTarget(card, player2, target) {
          return player2 !== target && target.hasCards("h");
        },
        selectTarget: [1, 2],
        ai(target) {
          const { player: player2, aicheck } = get.event();
          if (!aicheck) {
            return 0;
          }
          const att = get.attitude(player2, target);
          if (target.hasSkill("tuntian")) {
            return att / 10;
          }
          return 1 - att;
        }
      }).set("aicheck", check).forResult();
    },
    async content(event, trigger, player) {
      await player.gainMultiple(event.targets);
      trigger.changeToZero();
      await game.delay();
    },
    ai: {
      threaten: 2,
      expose: 0.3
    }
  },
  luoyi: {
    audio: 2,
    trigger: { player: "phaseDrawBegin2" },
    check(event, player) {
      if (player.skipList.includes("phaseUse") || player.countCards("h") < 3) {
        return false;
      }
      if (!player.hasSha()) {
        return false;
      }
      return game.hasPlayer((current) => get.attitude(player, current) < 0 && player.canUse("sha", current));
    },
    preHidden: true,
    filter(event, player) {
      return !event.numFixed && event.num > 0;
    },
    async content(event, trigger, player) {
      player.addTempSkill("luoyi2", "phaseJieshuBegin");
      trigger.num--;
    }
  },
  luoyi2: {
    trigger: { source: "damageBegin1" },
    sourceSkill: "luoyi",
    filter(event) {
      return event.card && (event.card.name === "sha" || event.card.name === "juedou") && event.notLink();
    },
    charlotte: true,
    forced: true,
    async content(event, trigger, player) {
      trigger.num++;
    },
    ai: {
      damageBonus: true
    }
  },
  tiandu: {
    audio: 2,
    audioname: ["re_guojia", "xizhicai", "gz_nagisa"],
    trigger: { player: "judgeEnd" },
    preHidden: true,
    frequent(event) {
      return event.result.card?.name !== "du";
    },
    check(event) {
      return event.result.card?.name !== "du";
    },
    filter(event, player) {
      return get.position(event.result.card, true) === "o";
    },
    async content(event, trigger, player) {
      player.gain({
        cards: [trigger.result.card],
        animate: "gain2"
      });
    }
  },
  yiji: {
    audio: 2,
    trigger: { player: "damageEnd" },
    frequent: true,
    filter(event) {
      return event.num > 0;
    },
    getIndex(event, player, triggername) {
      return event.num;
    },
    async content(event, trigger, player) {
      const cards2 = get.cards(2);
      await game.cardsGotoOrdering(cards2);
      if (_status.connectMode) {
        game.broadcastAll(() => {
          _status.noclearcountdown = true;
        });
      }
      event.given_map = {};
      if (!cards2.length) {
        return;
      }
      do {
        const { bool, links } = cards2.length == 1 ? { links: cards2.slice(0), bool: true } : await player.chooseCardButton({
          prompt: "遗计：请选择要分配的牌",
          cards: cards2,
          select: [1, cards2.length],
          forced: true,
          ai() {
            if (ui.selected.buttons.length === 0) {
              return 1;
            }
            return 0;
          }
        }).forResult();
        if (!bool || !links?.length) {
          return;
        }
        cards2.removeArray(links);
        event.togive = links.slice(0);
        const { targets } = await player.chooseTarget({
          prompt: `选择一名角色获得${get.translation(links)}`,
          forced: true,
          ai(target) {
            const { player: player2, enemy } = get.event();
            const att = get.attitude(player2, target);
            if (enemy) {
              return -att;
            } else if (att > 0) {
              return att / (1 + target.countCards("h"));
            } else {
              return att / 100;
            }
          }
        }).set("enemy", get.value(event.togive[0], player, "raw") < 0).forResult();
        if (targets?.length) {
          const id = targets[0].playerid;
          const map = event.given_map;
          if (id != null) {
            if (!map[id]) {
              map[id] = [];
            }
            map[id].addArray(event.togive);
          }
        }
      } while (cards2.length > 0);
      if (_status.connectMode) {
        game.broadcastAll(() => {
          delete _status.noclearcountdown;
          game.stopCountChoose();
        });
      }
      const list = [];
      for (const i in event.given_map) {
        const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
        player.line(source, "green");
        if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) {
          player.addExpose(0.2);
        }
        list.push([source, event.given_map[i]]);
      }
      await game.loseAsync({
        gain_list: list,
        giver: player,
        animate: "draw"
      }).setContent("gaincardMultiple");
    },
    ai: {
      maixie: true,
      maixie_hp: true,
      effect: {
        target(card, player, target) {
          if (get.tag(card, "damage")) {
            if (player.hasSkillTag("jueqing", false, target)) {
              return [1, -2];
            }
            if (!target.hasFriend()) {
              return;
            }
            let num = 1;
            if (get.attitude(player, target) > 0) {
              if (player.needsToDiscard()) {
                num = 0.7;
              } else {
                num = 0.5;
              }
            }
            if (target.hp >= 4) {
              return [1, num * 2];
            }
            if (target.hp == 3) {
              return [1, num * 1.5];
            }
            if (target.hp == 2) {
              return [1, num * 0.5];
            }
          }
        }
      }
    }
  },
  luoshen: {
    audio: 2,
    trigger: { player: "phaseZhunbeiBegin" },
    frequent: true,
    preHidden: true,
    async content(event, trigger, player) {
      event.cards ??= [];
      while (true) {
        const judgeEvent = player.judge({
          judge(card) {
            if (get.color(card) == "black") {
              return 1.5;
            }
            return -1.5;
          },
          judge2(result3) {
            return result3.bool;
          }
        });
        if (get.mode() !== "guozhan" && !player.hasSkillTag("rejudge")) {
          judgeEvent.set("callback", async (event2, trigger2, player2) => {
            if (event2.judgeResult.color === "black" && get.position(event2.card, true) === "o") {
              await player2.gain({
                cards: [event2.card],
                animate: "gain2"
              });
            }
          });
        } else {
          judgeEvent.set("callback", async (event2) => {
            if (event2.judgeResult.color === "black") {
              event2.getParent().orderingCards.remove(event2.card);
            }
          });
        }
        const result = await judgeEvent.forResult();
        if (!result?.bool || !result.card) {
          break;
        }
        event.cards.push(result.card);
        const result2 = await player.chooseBool({
          prompt: "是否再次发动【洛神】？"
        }).set("frequentSkill", "luoshen").forResult();
        if (!result2?.bool) {
          break;
        }
      }
      if (event.cards.someInD()) {
        await player.gain({
          cards: event.cards.filterInD(),
          animate: "gain2"
        });
      }
    }
  },
  qingguo: {
    mod: {
      aiValue(player, card, num) {
        if (get.name(card) != "shan" && get.color(card) != "black") {
          return;
        }
        const cards2 = player.getCards("hs", (card2) => get.name(card2) == "shan" || get.color(card2) == "black");
        cards2.sort((a, b) => {
          return (get.name(b) == "shan" ? 1 : 2) - (get.name(a) == "shan" ? 1 : 2);
        });
        const geti = () => {
          if (cards2.includes(card)) {
            cards2.indexOf(card);
          }
          return cards2.length;
        };
        if (get.name(card) == "shan") {
          return Math.min(num, [6, 4, 3][Math.min(geti(), 2)]) * 0.6;
        }
        return Math.max(num, [6.5, 4, 3][Math.min(geti(), 2)]);
      },
      aiUseful(...args) {
        return lib.skill.qingguo.mod?.aiValue?.(...args) ?? 0;
      }
    },
    locked: false,
    audio: 2,
    audioname: ["sb_zhenji"],
    audioname2: {
      re_zhenji: "reqingguo"
    },
    enable: ["chooseToRespond", "chooseToUse"],
    filterCard(card) {
      return get.color(card) === "black";
    },
    viewAs: { name: "shan" },
    viewAsFilter(player) {
      if (!player.hasCards("hs", { color: "black" })) {
        return false;
      }
    },
    position: "hs",
    prompt: "将一张黑色手牌当闪使用或打出",
    check() {
      return 1;
    },
    ai: {
      order: 3,
      respondShan: true,
      skillTagFilter(player) {
        if (!player.hasCards("hs", { color: "black" })) {
          return false;
        }
      },
      effect: {
        target(card, player, target, current) {
          if (get.tag(card, "respondShan") && current < 0) {
            return 0.6;
          }
        }
      }
    }
  },
  rende: {
    audio: 2,
    enable: "phaseUse",
    filterCard: true,
    selectCard: [1, Infinity],
    allowChooseAll: true,
    discard: false,
    lose: false,
    delay: 0,
    filterTarget(card, player, target) {
      return player != target;
    },
    check(card) {
      if (ui.selected.cards.length > 1) {
        return 0;
      }
      if (ui.selected.cards.length && ui.selected.cards[0].name == "du") {
        return 0;
      }
      if (!ui.selected.cards.length && card.name == "du") {
        return 20;
      }
      const player = get.owner(card);
      if (player == null) {
        return 0;
      }
      const evt2 = _status.event.getParent();
      const num = player.iterHistory("lose", (evt) => evt.getParent()?.skill === "rende" && evt.getParent(3) === evt2).map((evt) => evt.cards.length).reduce((a, b) => a + b, 0);
      if (player.hp === player.maxHp || num > 1 || player.countCards("h") <= 1) {
        if (ui.selected.cards.length) {
          return -1;
        }
        const players = game.filterPlayer();
        for (const current of players) {
          if (current.hasSkill("haoshi") && !current.isTurnedOver() && !current.hasJudge("lebu") && get.attitude(player, current) >= 3 && get.attitude(current, player) >= 3) {
            return 11 - get.value(card);
          }
        }
        if (player.countCards("h") > player.hp) {
          return 10 - get.value(card);
        }
        if (player.countCards("h") > 2) {
          return 6 - get.value(card);
        }
        return -1;
      }
      return 10 - get.value(card);
    },
    async content(event, trigger, player) {
      const evt2 = event.getParent(3);
      const num = player.iterHistory("lose", (evt) => evt.getParent(2)?.name === "rende" && evt.getParent(5) === evt2).map((evt) => evt.cards.length).reduce((a, b) => a + b, 0);
      await player.give(event.cards, event.target);
      if (num < 2 && num + event.cards.length > 1) {
        await player.recover();
      }
    },
    ai: {
      order(skill, player) {
        if (player == null) {
          return 0;
        }
        if (player.hp < player.maxHp && player.storage.rende < 2 && player.countCards("h") > 1) {
          return 10;
        }
        return 1;
      },
      result: {
        target(player, target) {
          if (target.hasSkillTag("nogain")) {
            return 0;
          }
          if (ui.selected.cards.length && ui.selected.cards[0].name == "du") {
            return target.hasSkillTag("nodu") ? 0 : -10;
          }
          if (target.hasJudge("lebu")) {
            return 0;
          }
          const nh = target.countCards("h");
          const np = player.countCards("h");
          if (player.hp == player.maxHp || player.storage.rende < 0 || player.countCards("h") <= 1) {
            if (nh >= np - 1 && np <= player.hp && !target.hasSkill("haoshi")) {
              return 0;
            }
          }
          return Math.max(1, 5 - nh);
        }
      },
      effect: {
        target_use(card, player, target) {
          if (player == target && get.type(card) == "equip") {
            if (player.countCards("e", { subtype: get.subtype(card) })) {
              const players = game.filterPlayer();
              for (let i = 0; i < players.length; i++) {
                if (players[i] != player && get.attitude(player, players[i]) > 0) {
                  return 0;
                }
              }
            }
          }
        }
      },
      threaten: 0.8
    }
  },
  rende1: {
    trigger: { player: "phaseUseBegin" },
    silent: true,
    sourceSkill: "rende",
    async content(event, trigger, player) {
      player.storage.rende = 0;
    }
  },
  jijiang: {
    audio: "jijiang1",
    audioname: ["liushan", "re_liubei", "re_liushan", "ol_liushan"],
    audioname2: {
      pe_jun_liubei: "sbjijiang"
    },
    group: ["jijiang1"],
    zhuSkill: true,
    filter(event, player) {
      if (!player.hasZhuSkill("jijiang") || !game.hasPlayer((current) => current !== player && current.group === "shu")) {
        return false;
      }
      return !event.jijiang && (event.type !== "phase" || !player.hasSkill("jijiang3"));
    },
    enable: ["chooseToUse", "chooseToRespond"],
    viewAs: { name: "sha" },
    filterCard() {
      return false;
    },
    selectCard: -1,
    ai: {
      order() {
        return get.order({ name: "sha" }) + 0.3;
      },
      respondSha: true,
      skillTagFilter(player) {
        if (!player.hasZhuSkill("jijiang") || !game.hasPlayer((current) => current != player && current.group == "shu")) {
          return false;
        }
      }
    }
  },
  jijiang1: {
    audio: 2,
    audioname: ["liushan", "re_liubei", "re_liushan", "ol_liushan"],
    audioname2: {
      pe_jun_liubei: "sbjijiang"
    },
    trigger: { player: ["useCardBegin", "respondBegin"] },
    logTarget: "targets",
    sourceSkill: "jijiang",
    filter(event, player) {
      return event.skill === "jijiang";
    },
    forced: true,
    async content(event, trigger, player) {
      delete trigger.skill;
      const jijiang = trigger.getParent();
      if (jijiang == null) {
        return;
      }
      jijiang.set("jijiang", true);
      let current = player.next;
      while (true) {
        event.current = current;
        if (current === player) {
          player.addTempSkill("jijiang3");
          trigger.cancel();
          jijiang.goto(0);
          return;
        }
        if (current.group === "shu") {
          const next = current.chooseToRespond({
            prompt: `是否替${get.translation(player)}打出一张杀？`,
            filterCard: function(card2, player2) {
              if (get.name(card2) !== "sha") {
                return false;
              }
              return lib.filter.cardRespondable(card2, player2);
            },
            ai() {
              const event2 = get.event();
              return get.attitude(event2.player, event2.source) - 2;
            }
          });
          next.set("source", player);
          next.set("jijiang", true);
          next.set("skillwarn", `替${get.translation(player)}打出一张杀`);
          next.noOrdering = true;
          next.autochoose = lib.filter.autoRespondSha;
          const { bool, card, cards: cards2 } = await next.forResult();
          if (bool) {
            trigger.card = card;
            trigger.cards = cards2;
            trigger.throw = false;
            if (typeof event.current.ai.shown === "number" && event.current.ai.shown < 0.95) {
              event.current.ai.shown += 0.3;
              if (event.current.ai.shown > 0.95) {
                event.current.ai.shown = 0.95;
              }
            }
            return;
          } else {
            current = current.next;
          }
        } else {
          current = current.next;
        }
      }
    }
  },
  jijiang3: {
    trigger: { global: ["useCardAfter", "useSkillAfter", "phaseAfter"] },
    silent: true,
    charlotte: true,
    sourceSkill: "jijiang",
    filter(event) {
      return event.skill !== "jijiang" && event.skill !== "qinwang";
    },
    async content(event, trigger, player) {
      player.removeSkill("jijiang3");
    }
  },
  wusheng: {
    audio: 2,
    audioname2: {
      old_guanzhang: "wusheng_old_guanzhang",
      old_guanyu: "wusheng_re_guanyu",
      guanzhang: "wusheng_guanzhang",
      guansuo: "wusheng_guansuo"
    },
    audioname: ["re_guanyu", "jsp_guanyu", "re_guanzhang", "dc_jsp_guanyu"],
    enable: ["chooseToRespond", "chooseToUse"],
    filterCard(card, player) {
      if (get.zhu(player, "shouyue")) {
        return true;
      }
      return get.color(card) === "red";
    },
    position: "hes",
    viewAs: { name: "sha" },
    viewAsFilter(player) {
      if (get.zhu(player, "shouyue")) {
        if (!player.hasCards("hes")) {
          return false;
        }
      } else {
        if (!player.hasCards("hes", { color: "red" })) {
          return false;
        }
      }
    },
    prompt: "将一张红色牌当杀使用或打出",
    check(card) {
      const val = get.value(card);
      if (get.event().name === "chooseToRespond") {
        return 1 / Math.max(0.1, val);
      }
      return 5 - val;
    },
    ai: {
      skillTagFilter(player) {
        if (get.zhu(player, "shouyue")) {
          if (!player.hasCards("hes")) {
            return false;
          }
        } else {
          if (!player.hasCards("hes", { color: "red" })) {
            return false;
          }
        }
      },
      respondSha: true
    }
  },
  wusheng_re_guanyu: { audio: 2 },
  zhongyi: {
    audio: 2,
    enable: "phaseUse",
    limited: true,
    skillAnimation: true,
    animationColor: "orange",
    filterCard: true,
    position: "he",
    filter(event, player) {
      return player.hasCards("he");
    },
    discard: false,
    lose: false,
    async content(event, trigger, player) {
      player.awakenSkill(event.name);
      player.addTempSkill("zhongyi2", "roundStart");
      await player.addToExpansion({
        cards: event.cards,
        source: player,
        animate: "give",
        gaintag: ["zhongyi2"]
      });
    }
  },
  zhongyi2: {
    trigger: { global: "damageBegin1" },
    forced: true,
    popup: false,
    logTarget: "source",
    sourceSkill: "zhongyi",
    filter(event, player) {
      return event.source?.isFriendOf(player) && event.getParent()?.name === "sha";
    },
    async content(event, trigger, player) {
      trigger.num++;
    },
    intro: { content: "expansion", markcount: "expansion" },
    onremove(player, skill) {
      const cards2 = player.getExpansions(skill);
      if (cards2.length) {
        player.loseToDiscardpile({ cards: cards2 });
      }
    }
  },
  paoxiao: {
    audio: 2,
    firstDo: true,
    audioname: ["re_zhangfei", "xiahouba"],
    audioname2: {
      old_guanzhang: "paoxiao_old_guanzhang",
      guanzhang: "paoxiao_guanzhang"
    },
    trigger: { player: "useCard1" },
    forced: true,
    filter(event, player) {
      return !event.audioed && event.card.name === "sha" && player.countUsed("sha", true) > 1 && event.getParent()?.type === "phase";
    },
    async content(event, trigger, player) {
      trigger.audioed = true;
    },
    mod: {
      cardUsable(card, player, num) {
        if (card.name == "sha") {
          return Infinity;
        }
      }
    },
    ai: {
      unequip: true,
      skillTagFilter(player, tag, arg) {
        if (!get.zhu(player, "shouyue")) {
          return false;
        }
        if (arg && arg.name == "sha") {
          return true;
        }
        return false;
      }
    }
  },
  paoxiao_xiahouba: { audio: 2 },
  guanxing_fail: {},
  guanxing: {
    audio: 2,
    audioname: ["jiangwei", "re_jiangwei", "re_zhugeliang", "ol_jiangwei"],
    trigger: { player: "phaseZhunbeiBegin" },
    frequent: true,
    preHidden: true,
    async content(event, trigger, player) {
      const num = player.hasSkill("yizhi") && player.hasSkill("guanxing") ? 5 : Math.min(5, game.countPlayer());
      const result = await player.chooseToGuanxing(num).set("prompt", "观星：点击或拖动将牌移动到牌堆顶或牌堆底").forResult();
      if (!result.bool || !result.moved[0].length) {
        player.addTempSkill("guanxing_fail");
      }
    },
    ai: {
      threaten: 1.2,
      guanxing: true
    }
  },
  kongcheng: {
    mod: {
      targetEnabled(card, player, target, now) {
        if (!target.hasCards("h")) {
          if (card.name === "sha" || card.name === "juedou") {
            return false;
          }
        }
      }
    },
    group: "kongcheng1",
    audio: "kongcheng1",
    audioname: ["re_zhugeliang"],
    ai: {
      noh: true,
      skillTagFilter(player, tag) {
        if (tag === "noh") {
          if (player.countCards("h") != 1) {
            return false;
          }
        }
      }
    }
  },
  kongcheng1: {
    audio: 2,
    trigger: { player: "loseEnd" },
    forced: true,
    firstDo: true,
    audioname: ["re_zhugeliang"],
    sourceSkill: "kongcheng",
    filter(event, player) {
      if (player.hasCards("h")) {
        return false;
      }
      for (const card of event.cards) {
        if (card.original === "h") {
          return true;
        }
      }
      return false;
    },
    async content() {
    }
  },
  longdan: {
    audio: "longdan_sha",
    audioname: ["re_zhaoyun"],
    audioname2: { old_zhaoyun: "longdan_sha_re_zhaoyun" },
    group: ["longdan_sha", "longdan_shan", "longdan_draw"],
    subSkill: {
      draw: {
        trigger: { player: ["useCard", "respond"] },
        forced: true,
        popup: false,
        filter(event, player) {
          if (!get.zhu(player, "shouyue")) {
            return false;
          }
          return event.skill === "longdan_sha" || event.skill === "longdan_shan";
        },
        async content(event, trigger, player) {
          await player.draw();
          player.storage.fanghun2++;
        }
      },
      sha: {
        audio: 2,
        audioname: ["re_zhaoyun"],
        audioname2: { old_zhaoyun: "longdan_sha_re_zhaoyun" },
        enable: ["chooseToUse", "chooseToRespond"],
        filterCard: { name: "shan" },
        viewAs: { name: "sha" },
        viewAsFilter(player) {
          if (!player.hasCards("hs", "shan")) {
            return false;
          }
        },
        position: "hs",
        prompt: "将一张闪当杀使用或打出",
        check() {
          return 1;
        },
        ai: {
          effect: {
            target(card, player, target, current) {
              if (get.tag(card, "respondSha") && current < 0) {
                return 0.6;
              }
            }
          },
          respondSha: true,
          skillTagFilter(player) {
            if (!player.hasCards("hs", "shan")) {
              return false;
            }
          },
          order() {
            return get.order({ name: "sha" }) + 0.1;
          },
          useful: -1,
          value: -1
        }
      },
      shan: {
        audio: "longdan_sha",
        audioname: ["re_zhaoyun"],
        audioname2: { old_zhaoyun: "longdan_sha_re_zhaoyun" },
        enable: ["chooseToRespond", "chooseToUse"],
        filterCard: { name: "sha" },
        viewAs: { name: "shan" },
        prompt: "将一张杀当闪使用或打出",
        check() {
          return 1;
        },
        position: "hs",
        viewAsFilter(player) {
          if (!player.hasCards("hs", "sha")) {
            return false;
          }
        },
        ai: {
          respondShan: true,
          skillTagFilter(player) {
            if (!player.hasCards("hs", "sha")) {
              return false;
            }
          },
          effect: {
            target(card, player, target, current) {
              if (get.tag(card, "respondShan") && current < 0) {
                return 0.6;
              }
            }
          },
          order: 4,
          useful: -1,
          value: -1
        }
      }
    }
  },
  longdan_sha_re_zhaoyun: { audio: 2 },
  mashu: {
    mod: {
      globalFrom(from, to, distance) {
        return distance - 1;
      }
    }
  },
  feiying: {
    mod: {
      globalTo(from, to, distance) {
        return distance + 1;
      }
    }
  },
  tieji: {
    audio: 2,
    trigger: { player: "useCardToPlayered" },
    check(event, player) {
      return get.attitude(player, event.target) <= 0;
    },
    filter(event, player) {
      return event.card.name === "sha";
    },
    logTarget: "target",
    preHidden: true,
    async content(event, trigger, player) {
      const { bool } = await player.judge({
        judge(card) {
          if (get.zhu(get.player(), "shouyue")) {
            if (get.suit(card) !== "spade") {
              return 2;
            }
          } else {
            if (get.color(card) === "red") {
              return 2;
            }
          }
          return -0.5;
        },
        judge2(result) {
          return result.bool;
        }
      }).forResult();
      if (bool) {
        trigger.getParent()?.directHit.add(trigger.target);
      }
    },
    ai: {
      directHit_ai: true,
      skillTagFilter(player, tag, arg) {
        if (get.attitude(player, arg.target) > 0 || arg.card.name !== "sha" || !ui.cardPile.firstChild || get.color(ui.cardPile.firstChild, player) !== "red") {
          return false;
        }
      }
    }
  },
  jizhi: {
    audio: 2,
    audioname: ["jianyong"],
    audioname2: {
      new_simayi: "rejizhi_new_simayi"
    },
    trigger: { player: "useCard" },
    frequent: true,
    preHidden: true,
    filter(event) {
      return get.type(event.card) === "trick";
    },
    async content(event, trigger, player) {
      await player.draw({ nodelay: true });
    },
    ai: {
      threaten: 1.4,
      noautowuxie: true
    }
  },
  qicai: {
    mod: {
      targetInRange(card, player, target, now) {
        if (["trick", "delay"].includes(get.type(card))) {
          return true;
        }
      }
    }
  },
  zhiheng: {
    audio: 2,
    audioname: ["gz_jun_sunquan"],
    audioname2: {
      new_simayi: "rezhiheng_new_simayi"
    },
    mod: {
      aiOrder(player, card, num) {
        if (num <= 0 || get.itemtype(card) !== "card" || get.type(card) !== "equip") {
          return num;
        }
        const eq = player.getEquip(get.subtype(card));
        if (eq != null && get.equipValue(card) - get.equipValue(eq) < Math.max(1.2, 6 - player.hp)) {
          return 0;
        }
      }
    },
    locked: false,
    enable: "phaseUse",
    usable: 1,
    position: "he",
    filterCard: true,
    selectCard: [1, Infinity],
    allowChooseAll: true,
    prompt: "弃置任意张牌并摸等量的牌",
    check(card) {
      let player = get.player();
      if (get.position(card) === "e") {
        let subs = get.subtypes(card);
        if (subs.includes("equip2") || subs.includes("equip3")) {
          return player.getHp() - get.value(card);
        }
      }
      return 6 - get.value(card);
    },
    async content(event, trigger, player) {
      await player.draw(event.cards.length);
    },
    ai: {
      order: 1,
      result: {
        player: 1
      },
      threaten: 1.5
    }
  },
  jiuyuan: {
    audio: 2,
    trigger: { target: "taoBegin" },
    zhuSkill: true,
    forced: true,
    filter(event, player) {
      if (event.player === player) {
        return false;
      }
      if (!player.hasZhuSkill("jiuyuan")) {
        return false;
      }
      if (event.player.group !== "wu") {
        return false;
      }
      return true;
    },
    async content(event, trigger, player) {
      trigger.baseDamage++;
    }
  },
  qixi: {
    audio: 2,
    audioname: ["re_ganning"],
    audioname2: { re_heqi: "duanbing_heqi" },
    enable: "chooseToUse",
    filterCard(card) {
      return get.color(card) === "black";
    },
    position: "hes",
    viewAs: { name: "guohe" },
    viewAsFilter(player) {
      if (!player.hasCards("hes", { color: "black" })) {
        return false;
      }
    },
    prompt: "将一张黑色牌当过河拆桥使用",
    check(card) {
      return 4 - get.value(card);
    }
  },
  keji: {
    audio: 2,
    audioname: ["re_lvmeng", "sp_lvmeng"],
    trigger: { player: "phaseDiscardBefore" },
    frequent(event, player) {
      return player.needsToDiscard();
    },
    filter(event, player) {
      if (player.getHistory("skipped").includes("phaseUse")) {
        return true;
      }
      const history = player.getHistory("useCard").concat(player.getHistory("respond"));
      for (const evt of history) {
        if (evt.card.name === "sha" && evt.isPhaseUsing()) {
          return false;
        }
      }
      return true;
    },
    async content(event, trigger, player) {
      trigger.cancel();
    }
  },
  kurou: {
    audio: 2,
    enable: "phaseUse",
    prompt: "失去1点体力并摸两张牌",
    delay: false,
    manualConfirm: true,
    async content(event, trigger, player) {
      player.loseHp(1);
      player.draw(2, "nodelay");
    },
    ai: {
      basic: {
        order: 1
      },
      result: {
        player(player) {
          if (player.needsToDiscard(3) && !player.hasValueTarget({ name: "sha" }, false)) {
            return -1;
          }
          if (player.countCards("h") >= player.hp - 1) {
            return -1;
          }
          if (player.hp < 3) {
            return -1;
          }
          return 1;
        }
      }
    }
  },
  yingzi: {
    audio: 2,
    audioname: ["sp_lvmeng"],
    trigger: { player: "phaseDrawBegin2" },
    frequent: true,
    filter(event, player) {
      return !event.numFixed;
    },
    async content(event, trigger, player) {
      trigger.num++;
    },
    ai: {
      threaten: 1.3
    }
  },
  fanjian: {
    audio: 2,
    enable: "phaseUse",
    usable: 1,
    filter(event, player) {
      return player.hasCards("h");
    },
    filterTarget(card, player, target) {
      return player !== target;
    },
    async content(event, trigger, player) {
      const target = event.target;
      const { control } = await target.chooseControl({
        controls: ["heart2", "diamond2", "club2", "spade2"],
        ai() {
          switch (Math.floor(Math.random() * 6)) {
            case 0:
              return "heart2";
            case 1:
            case 4:
            case 5:
              return "diamond2";
            case 2:
              return "club2";
            case 3:
              return "spade2";
          }
        }
      }).forResult();
      game.log(target, `选择了${get.translation(control)}`);
      event.choice = control;
      target.chat(`我选${get.translation(event.choice)}`);
      const { bool, cards: cards2 } = await target.gainPlayerCard({
        target: player,
        position: "h",
        forced: true
      }).forResult();
      if (bool && cards2?.length && get.suit(cards2[0], player) + "2" !== event.choice) {
        await target.damage({ nocard: true });
      }
    },
    ai: {
      order: 1,
      result: {
        target(player, target) {
          const eff = get.damageEffect(target, player);
          if (eff >= 0) {
            return 1 + eff;
          }
          let value = 0, i;
          const cards2 = player.getCards("h");
          for (i = 0; i < cards2.length; i++) {
            value += get.value(cards2[i]);
          }
          value /= player.countCards("h");
          if (target.hp == 1) {
            return Math.min(0, value - 7);
          }
          return Math.min(0, value - 5);
        }
      }
    }
  },
  guose: {
    audio: 2,
    filter(event, player) {
      return player.hasCards("hes", { suit: "diamond" });
    },
    enable: "chooseToUse",
    filterCard(card) {
      return get.suit(card) === "diamond";
    },
    position: "hes",
    viewAs: { name: "lebu" },
    prompt: "将一张方片牌当乐不思蜀使用",
    check(card) {
      return 6 - get.value(card);
    },
    ai: {
      threaten: 1.5
    }
  },
  liuli: {
    audio: 2,
    audioname: ["re_daqiao", "daxiaoqiao"],
    trigger: { target: "useCardToTarget" },
    preHidden: true,
    filter(event, player) {
      if (event.card.name !== "sha") {
        return false;
      }
      if (!player.hasCards("he")) {
        return false;
      }
      return game.hasPlayer((current) => {
        return player.inRange(current) && current !== event.player && current !== player && !!lib.filter.targetEnabled(event.card, event.player, current);
      });
    },
    async cost(event, trigger, player) {
      event.result = await player.chooseCardTarget({
        filterTarget(card, player2, target) {
          const trigger2 = _status.event;
          if (player2.inRange(target) && target != trigger2.source) {
            if (lib.filter.targetEnabled(trigger2.card, trigger2.source, target)) {
              return true;
            }
          }
          return false;
        },
        filterCard: lib.filter.cardDiscardable,
        position: "he",
        ai1: (card) => get.unuseful(card) + 9,
        ai2: (target) => {
          const player2 = get.player();
          if (player2.hasCards("h", "shan")) {
            return -get.attitude(player2, target);
          }
          if (get.attitude(player2, target) < 5) {
            return 6 - get.attitude(player2, target);
          }
          if (player2.hp == 1 && !player2.hasCards("h", "shan")) {
            return 10 - get.attitude(player2, target);
          }
          if (player2.hp == 2 && !player2.hasCards("h", "shan")) {
            return 8 - get.attitude(player2, target);
          }
          return -1;
        },
        prompt: get.prompt(event.skill),
        prompt2: "弃置一张牌，将此【杀】转移给攻击范围内的一名其他角色",
        source: trigger.player,
        card: trigger.card
      }).setHiddenSkill(event.name.slice(0, -5)).forResult();
    },
    async content(event, trigger, player) {
      const target = event.targets[0];
      const evt = trigger.getParent();
      if (evt) {
        evt.triggeredTargets2.remove(player);
        evt.targets.remove(player);
        evt.targets.push(target);
        await player.discard({ cards: event.cards });
      } else {
        throw new ReferenceError("找不到触发【流离】的使用牌事件");
      }
    },
    ai: {
      effect: {
        target_use(card, player, target) {
          if (!target.hasCards("he")) {
            return;
          }
          if (card.name !== "sha") {
            return;
          }
          let min = 1;
          const friend = get.attitude(player, target) > 0;
          const vcard = { name: "shacopy", nature: card.nature, suit: card.suit };
          const players = game.filterPlayer();
          for (const current of players) {
            if (player != current && get.attitude(target, current) < 0 && target.canUse(card, current)) {
              if (!friend) {
                return 0;
              }
              if (get.effect(current, vcard, player, player) > 0) {
                if (!player.canUse(card, players[0])) {
                  return [0, 0.1];
                }
                min = 0;
              }
            }
          }
          return min;
        }
      }
    }
  },
  qianxun: {
    mod: {
      targetEnabled(card, player, target, now) {
        if (card.name === "shunshou" || card.name === "lebu") {
          return false;
        }
      }
    },
    audio: 2
  },
  lianying: {
    audio: 2,
    trigger: {
      player: "loseAfter",
      global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"]
    },
    frequent: true,
    filter(event, player) {
      if (player.hasCards("h")) {
        return false;
      }
      const evt = event.getl(player);
      return evt && evt.player === player && evt.hs && evt.hs.length > 0;
    },
    async content(event, trigger, player) {
      await player.draw();
    },
    ai: {
      threaten: 0.8,
      effect: {
        player_use(card, player, target) {
          if (player.countCards("h") === 1) {
            return [1, 0.8];
          }
        },
        target(card, player, target) {
          if (get.tag(card, "loseCard") && target.countCards("h") === 1) {
            return 0.5;
          }
        }
      },
      noh: true,
      freeSha: true,
      freeShan: true,
      skillTagFilter(player, tag) {
        if (player.countCards("h") !== 1) {
          return false;
        }
      }
    }
  },
  xiaoji: {
    audio: 2,
    audioname: ["sp_sunshangxiang", "re_sunshangxiang"],
    trigger: {
      player: "loseAfter",
      global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"]
    },
    frequent: true,
    getIndex(event, player) {
      const evt = event.getl(player);
      if (evt?.player === player && evt.es) {
        return evt.es.length;
      }
      return false;
    },
    async content(event, trigger, player) {
      await player.draw(2);
    },
    ai: {
      noe: true,
      reverseEquip: true,
      effect: {
        target(card, player, target, current) {
          if (get.type(card) == "equip" && !get.cardtag(card, "gifts")) {
            return [1, 3];
          }
        }
      }
    }
  },
  jieyin: {
    audio: 2,
    enable: "phaseUse",
    filterCard: true,
    usable: 1,
    selectCard: 2,
    check(card) {
      const player = get.owner(card);
      if (player == null) {
        return 0;
      }
      if (player.countCards("h") > player.hp) {
        return 8 - get.value(card);
      }
      if (player.hp < player.maxHp) {
        return 6 - get.value(card);
      }
      return 4 - get.value(card);
    },
    filterTarget(card, player, target) {
      if (!target.hasSex("male")) {
        return false;
      }
      if (target.hp >= target.maxHp) {
        return false;
      }
      if (target === player) {
        return false;
      }
      return true;
    },
    async content(event, trigger, player) {
      await player.recover();
      await event.target.recover();
    },
    ai: {
      order: 5.5,
      result: {
        player(player) {
          if (player.hp < player.maxHp) {
            return 4;
          }
          if (player.countCards("h") > player.hp) {
            return 0;
          }
          return -1;
        },
        target: 4
      },
      threaten: 2
    }
  },
  qingnang: {
    audio: 2,
    enable: "phaseUse",
    filterCard: true,
    usable: 1,
    check(card) {
      return 9 - get.value(card);
    },
    filterTarget(card, player, target) {
      if (target.hp >= target.maxHp) {
        return false;
      }
      return true;
    },
    async content(event, trigger, player) {
      await event.target.recover();
    },
    ai: {
      order: 9,
      result: {
        target(player, target) {
          if (target.hp === 1) {
            return 5;
          }
          if (player === target && player.countCards("h") > player.hp) {
            return 5;
          }
          return 2;
        }
      },
      threaten: 2
    }
  },
  jijiu: {
    mod: {
      aiValue(player, card, num) {
        if (get.name(card) !== "tao" && get.color(card) !== "red") {
          return;
        }
        const cards2 = player.getCards("hs", (card2) => get.name(card2) === "tao" || get.color(card2) === "red");
        cards2.sort((a, b) => (get.name(a) === "tao" ? 1 : 2) - (get.name(b) === "tao" ? 1 : 2));
        const geti = () => {
          if (cards2.includes(card)) {
            cards2.indexOf(card);
          }
          return cards2.length;
        };
        return Math.max(num, [6.5, 4, 3, 2][Math.min(geti(), 2)]);
      },
      aiUseful(...args) {
        return lib.skill.jijiu.mod?.aiValue?.(...args);
      }
    },
    locked: false,
    audio: 2,
    audioname: ["re_huatuo"],
    audioname2: { old_huatuo: "jijiu_re_huatuo" },
    enable: "chooseToUse",
    viewAsFilter(player) {
      return player !== _status.currentPhase && player.hasCards("hes", { color: "red" });
    },
    filterCard(card) {
      return get.color(card) === "red";
    },
    position: "hes",
    viewAs: { name: "tao" },
    prompt: "将一张红色牌当桃使用",
    check(card) {
      return 15 - get.value(card);
    },
    ai: {
      threaten: 1.5
    }
  },
  jijiu_re_huatuo: { audio: 2 },
  wushuang: {
    audio: 2,
    audioname: ["re_lvbu", "shen_lvbu", "lvlingqi", "mb_shen_lvbu"],
    audioname2: { sb_lvbu: "sbliyu_effect" },
    forced: true,
    locked: true,
    group: ["wushuang1", "wushuang2"],
    preHidden: ["wushuang1", "wushuang2"]
  },
  wushuang1: {
    audio: "wushuang",
    audioname: ["re_lvbu", "shen_lvbu", "lvlingqi", "mb_shen_lvbu"],
    audioname2: {
      sb_lvbu: "sbliyu_effect",
      gz_lvlingqi: "wushuang_lvlingqi"
    },
    trigger: { player: "useCardToPlayered" },
    forced: true,
    sourceSkill: "wushuang",
    filter(event, player) {
      return event.card.name === "sha" && !event.getParent()?.directHit.includes(event.target);
    },
    //priority:-1,
    logTarget: "target",
    async content(event, trigger, player) {
      const id = trigger.target.playerid;
      const map = trigger.getParent()?.customArgs;
      if (id != null) {
        if (!map[id]) {
          map[id] = {};
        }
        if (typeof map[id].shanRequired == "number") {
          map[id].shanRequired++;
        } else {
          map[id].shanRequired = 2;
        }
      }
    },
    ai: {
      directHit_ai: true,
      skillTagFilter(player, tag, arg) {
        if (arg.card.name !== "sha" || arg.target.countCards("h", "shan") > 1) {
          return false;
        }
      }
    }
  },
  wushuang2: {
    audio: "wushuang",
    audioname: ["re_lvbu", "shen_lvbu", "lvlingqi", "mb_shen_lvbu"],
    audioname2: {
      sb_lvbu: "sbliyu_effect",
      gz_lvlingqi: "wushuang_lvlingqi"
    },
    trigger: { player: "useCardToPlayered", target: "useCardToTargeted" },
    forced: true,
    sourceSkill: "wushuang",
    logTarget(trigger, player) {
      return player === trigger.player ? trigger.target : trigger.player;
    },
    filter(event, player) {
      return event.card.name === "juedou";
    },
    //priority:-1,
    async content(event, trigger, player) {
      const id = (player === trigger.player ? trigger.target : trigger.player)["playerid"];
      const idt = trigger.target.playerid;
      const map = trigger.getParent()?.customArgs;
      if (id != null && idt != null) {
        if (!map[idt]) {
          map[idt] = {};
        }
        if (!map[idt].shaReq) {
          map[idt].shaReq = {};
        }
        if (!map[idt].shaReq[id]) {
          map[idt].shaReq[id] = 1;
        }
        map[idt].shaReq[id]++;
      }
    },
    ai: {
      directHit_ai: true,
      skillTagFilter(player, tag, arg) {
        if (arg.card.name !== "juedou" || Math.floor(arg.target.countCards("h", "sha") / 2) > player.countCards("h", "sha")) {
          return false;
        }
      }
    }
  },
  zhanshen: {
    audio: 2,
    trigger: { player: "phaseZhunbeiBegin" },
    forced: true,
    juexingji: true,
    skillAnimation: true,
    animationColor: "gray",
    filter(event, player) {
      return player.isDamaged() && game.dead.filter((target) => target.isFriendOf(player)).length > 0;
    },
    async content(event, trigger, player) {
      player.awakenSkill(event.name);
      const cards2 = player.getEquips(1);
      if (cards2.length) {
        await player.discard({ cards: cards2 });
      }
      await player.loseMaxHp();
      await player.addSkills(["mashu", "shenji"]);
    },
    derivation: ["mashu", "shenji"]
  },
  shenji: {
    audio: 2,
    mod: {
      selectTarget(card, player, range) {
        if (range[1] === -1) {
          return;
        }
        if (card.name === "sha") {
          range[1] += 2;
        }
      },
      cardUsable(card, player, num) {
        if (card.name === "sha") {
          return num + 1;
        }
      }
    }
  },
  lijian: {
    audio: 2,
    audioname: ["re_diaochan"],
    enable: "phaseUse",
    usable: 1,
    filter(event, player) {
      return game.countPlayer((current) => current !== player && current.hasSex("male")) > 1;
    },
    check(card) {
      return 10 - get.value(card);
    },
    filterCard: true,
    position: "he",
    filterTarget(card, player, target) {
      if (player === target) {
        return false;
      }
      if (!target.hasSex("male")) {
        return false;
      }
      if (ui.selected.targets.length === 1) {
        return target.canUse({ name: "juedou" }, ui.selected.targets[0]);
      }
      return true;
    },
    targetprompt: ["先出杀", "后出杀"],
    selectTarget: 2,
    multitarget: true,
    async content(event, trigger, player) {
      const next = event.targets[1].useCard({
        card: get.autoViewAs({ name: "juedou", isCard: true }),
        targets: [event.targets[0]],
        nowuxie: true,
        noai: true
      }).set("animate", false);
      await game.delay(0.5);
      return next;
    },
    ai: {
      order: 8,
      result: {
        target(player, target) {
          if (ui.selected.targets.length === 0) {
            return -3;
          } else {
            return get.effect(target, { name: "juedou" }, ui.selected.targets[0], target);
          }
        }
      },
      expose: 0.4,
      threaten: 3
    }
  },
  biyue: {
    audio: 2,
    trigger: { player: "phaseJieshuBegin" },
    frequent: true,
    preHidden: true,
    async content(event, trigger, player) {
      player.draw();
    }
  },
  yaowu: {
    trigger: { player: "damageBegin3" },
    audio: 2,
    filter(event, player) {
      return event.card?.name === "sha" && get.color(event.card) === "red" && event.source?.isIn();
    },
    forced: true,
    check() {
      return false;
    },
    async content(event, trigger, player) {
      await trigger.source.chooseDrawRecover({ forced: true });
    },
    ai: {
      neg: true,
      effect: {
        target(card, player, target, current) {
          if (card.name === "sha" && get.color(card) === "red") {
            return [1, -2];
          }
        }
      }
    }
  },
  new_jiangchi: {
    audio: "jiangchi",
    trigger: {
      player: "phaseDrawEnd"
    },
    logAudio: (event, player, name, indexedData, costResult) => costResult.cost_data.control === "弃牌" ? "jiangchi2.mp3" : "jiangchi1.mp3",
    async cost(event, trigger, player) {
      const list = ["弃牌", "摸牌", "cancel2"];
      if (!player.hasCards("he")) {
        list.remove("弃牌");
      }
      const { control } = await player.chooseControl({
        prompt: get.prompt2(event.skill),
        controls: list,
        ai() {
          const player2 = _status.event.player;
          if (list.includes("弃牌")) {
            if (player2.countCards("h") > 3 && player2.countCards("h", "sha") > 1) {
              return "弃牌";
            }
            if (player2.countCards("h", "sha") > 2) {
              return "弃牌";
            }
          }
          if (!player2.hasCards("h", "sha")) {
            return "摸牌";
          }
          return "cancel2";
        }
      }).forResult();
      if (control === "cancel2") {
        event.result = { bool: false };
      } else {
        event.result = {
          bool: true,
          cost_data: { control }
        };
      }
    },
    async content(event, trigger, player) {
      const { control } = event.cost_data;
      if (control === "弃牌") {
        player.addTempSkill("jiangchi2", "phaseUseEnd");
        await player.chooseToDiscard({
          position: "he",
          forced: true
        });
      } else if (control === "摸牌") {
        player.addTempSkill("new_jiangchi3", "phaseEnd");
        await player.draw();
      }
    }
  },
  new_jiangchi3: {
    mod: {
      cardEnabled(card) {
        if (card.name === "sha") {
          return false;
        }
      },
      cardRespondable(card) {
        if (card.name === "sha") {
          return false;
        }
      },
      ignoredHandcard(card, player) {
        if (get.name(card) === "sha") {
          return true;
        }
      },
      cardDiscardable(card, player, name) {
        if (name === "phaseDiscard" && get.name(card) === "sha") {
          return false;
        }
      }
    }
  },
  xinfu_jijie: {
    enable: "phaseUse",
    usable: 1,
    audio: 2,
    async content(event, trigger, player) {
      const card = get.bottomCards()[0];
      game.cardsGotoOrdering(card);
      event.card = card;
      const { bool, targets } = await player.chooseTarget({
        forced: true,
        ai(target) {
          let att = get.attitude(_status.event.player, target);
          if (_status.event.du) {
            if (target.hasSkillTag("nodu")) {
              return 0.5;
            }
            return -att;
          }
          if (att > 0) {
            if (_status.event.player != target) {
              att += 2;
            }
            return att + Math.max(0, 5 - target.countCards("h"));
          }
          return att;
        }
      }).set("du", event.card.name === "du").set("createDialog", ["机捷：选择一名角色获得此牌", [card]]).forResult();
      if (bool && targets?.length) {
        const target = targets[0];
        player.line(target, "green");
        const gainEvent = target.gain({
          cards: [card],
          animate: "draw"
        });
        gainEvent.giver = player;
        await gainEvent;
      }
    },
    ai: {
      order: 7.2,
      result: {
        player: 1
      }
    }
  },
  xinfu_jiyuan: {
    trigger: {
      global: ["dying", "gainAfter", "loseAsyncAfter"]
    },
    audio: 2,
    getIndex(event, player) {
      if (event.name !== "loseAsync") {
        return [event.player];
      } else {
        return game.filterPlayer((current) => current !== player && event.getg(current).length > 0).sortBySeat();
      }
    },
    filter(event, player, triggername, target) {
      if (!target?.isIn()) {
        return false;
      }
      if (event.name === "dying") {
        return true;
      }
      if (event.giver !== player) {
        return false;
      }
      if (event.name === "gain") {
        return event.player != player && event.getg(target).length > 0;
      }
      return game.hasPlayer((current) => current != player && event.getg(current).length > 0);
    },
    logTarget(event, player, triggername, target) {
      return target;
    },
    check(event, player, triggername, target) {
      return get.attitude(player, target) > 0;
    },
    async content(event, trigger, player) {
      await event.targets[0].draw();
    }
  }
};
const translates = {
  caocao: "曹操",
  hujia: "护驾",
  hujia_info: "主公技，当你需要使用或打出一张【闪】时，你可以令其他魏势力角色选择是否打出一张【闪】。若有角色响应，则你视为使用或打出了一张【闪】。",
  jianxiong: "奸雄",
  jianxiong_info: "当你受到伤害后，你可以获得对你造成伤害的牌。",
  simayi: "司马懿",
  fankui: "反馈",
  fankui_info: "当你受到伤害后，你可以获得伤害来源的一张牌。",
  guicai: "鬼才",
  guicai_info: "一名角色的判定牌生效前，你可以打出一张手牌代替之。",
  guicai_info_guozhan: "一名角色的判定牌生效前，你可以打出一张牌代替之。",
  xiahoudun: "夏侯惇",
  zhangliao: "张辽",
  xuzhu: "许褚",
  guojia: "郭嘉",
  zhenji: "甄宓",
  liubei: "刘备",
  guanyu: "关羽",
  zhangfei: "张飞",
  zhugeliang: "诸葛亮",
  zhaoyun: "赵云",
  machao: "马超",
  huangyueying: "黄月英",
  sunquan: "孙权",
  ganning: "甘宁",
  lvmeng: "吕蒙",
  huanggai: "黄盖",
  zhouyu: "周瑜",
  daqiao: "大乔",
  luxun: "陆逊",
  sunshangxiang: "孙尚香",
  huatuo: "华佗",
  lvbu: "吕布",
  diaochan: "貂蝉",
  huaxiong: "华雄",
  xf_yiji: "伊籍",
  re_yuanshu: "袁术",
  caozhang: "曹彰",
  ganglie: "刚烈",
  tuxi: "突袭",
  luoyi: "裸衣",
  luoyi2: "裸衣",
  tiandu: "天妒",
  yiji: "遗计",
  luoshen: "洛神",
  qingguo: "倾国",
  rende: "仁德",
  jijiang: "激将",
  jijiang1: "激将",
  jijiang2: "激将",
  wusheng: "武圣",
  paoxiao: "咆哮",
  guanxing: "观星",
  kongcheng: "空城",
  kongcheng1: "空城",
  longdan: "龙胆",
  longdan1: "龙胆",
  longdan2: "龙胆",
  mashu: "马术",
  feiying: "飞影",
  tieji: "铁骑",
  jizhi: "集智",
  qicai: "奇才",
  zhiheng: "制衡",
  jiuyuan: "救援",
  qixi: "奇袭",
  keji: "克己",
  kurou: "苦肉",
  yingzi: "英姿",
  fanjian: "反间",
  guose: "国色",
  liuli: "流离",
  qianxun: "谦逊",
  lianying: "连营",
  xiaoji: "枭姬",
  jieyin: "结姻",
  qingnang: "青囊",
  jijiu: "急救",
  wushuang: "无双",
  wushuang1: "无双",
  wushuang2: "无双",
  lijian: "离间",
  biyue: "闭月",
  pileTop: "牌堆顶",
  pileBottom: "牌堆底",
  ganglie_info: "当你受到伤害后，你可以判定。若结果不为红桃，则伤害来源须弃置两张手牌，否则其受到来自你的1点伤害。",
  tuxi_info: "摸牌阶段，你可以改为获得至多两名其他角色的各一张手牌。",
  luoyi_info: "摸牌阶段，你可以少摸一张牌。若如此做，当你本回合内使用【杀】或【决斗】造成伤害时，此伤害+1。",
  tiandu_info: "当你的判定牌生效后，你可以获得之。",
  yiji_info: "当你受到1点伤害后，你可以观看牌堆顶的两张牌，然后将其分配给任意角色。",
  luoshen_info: "准备阶段，你可以判定。若结果为黑色，你获得判定牌。你可重复此流程，直到出现红色的判定结果。",
  luoshen_info_guozhan: "准备阶段，你可以判定。若结果为黑色，则可以继续判定，直到出现红色的判定牌。然后你获得所有黑色的判定牌。（判定结果为黑色的牌在此过程中不会进入弃牌堆）",
  qingguo_info: "你可以将一张黑色手牌当做【闪】使用或打出。",
  rende_info: "出牌阶段，你可以将任意张手牌交给其他角色。当你以此法于一回合内给出第二张牌时，你回复1点体力。",
  jijiang_info: "主公技，当你需要使用或打出【杀】时，你可以令其他蜀势力角色依次选择是否打出一张【杀】。若有角色响应，则你视为使用或打出了此【杀】。",
  wusheng_info: "你可以将一张红色牌当做【杀】使用或打出。",
  paoxiao_info: "锁定技，出牌阶段，你使用【杀】没有数量限制。",
  guanxing_info: "准备阶段，你可以观看牌堆顶的X张牌，并将其以任意顺序置于牌堆顶或牌堆底。（X为存活角色数且至多为5）",
  kongcheng_info: "锁定技，当你没有手牌时，你不能成为【杀】或【决斗】的目标。",
  longdan_info: "你可以将【杀】当做【闪】，或将【闪】当做【杀】使用或打出。",
  mashu_info: "锁定技，你计算与其他角色的距离时-1。",
  feiying_info: "锁定技，其他角色计算与你的距离时+1。",
  tieji_info: "当你使用【杀】指定目标后，你可以进行判定。若结果为红色，则此【杀】不可被闪避。",
  jizhi_info: "当你使用普通锦囊牌时，你可以摸一张牌。",
  qicai_info: "锁定技，你使用锦囊牌无距离限制。",
  zhiheng_info: "出牌阶段限一次，你可以弃置任意张牌，然后摸等量的牌。",
  jiuyuan_info: "主公技，锁定技，其他吴势力角色对你使用的【桃】的回复值+1。",
  qixi_info: "你可以将一张黑色牌当做【过河拆桥】使用。",
  keji_info: "弃牌阶段开始时，若你于本回合的出牌阶段内没有使用或打出过【杀】，则你可以跳过此阶段。",
  kurou_info: "出牌阶段，你可以失去1点体力，然后摸两张牌。",
  yingzi_info: "摸牌阶段，你可以多摸一张牌。",
  fanjian_info: "出牌阶段限一次。你可以令一名角色选择一种花色，然后其获得你的一张手牌。若其以此法选择的花色与其得到的牌花色不同，则你对其造成1点伤害。",
  guose_info: "你可以将一张方片牌当做【乐不思蜀】使用。",
  liuli_info: "当你成为【杀】的目标时，你可以弃置一张牌并将此【杀】转移给攻击范围内的一名其他角色（不能是此【杀】的使用者）。",
  qianxun_info: "锁定技，你不能成为【顺手牵羊】和【乐不思蜀】的目标。",
  lianying_info: "当你失去最后的手牌时，你可以摸一张牌。",
  xiaoji_info: "当你失去一张装备区内的牌后，你可以摸两张牌。",
  jieyin_info: "出牌阶段限一次，你可以弃置两张手牌并选择一名已经受伤的男性角色。你与其各回复1点体力。",
  qingnang_info: "出牌阶段限一次，你可以弃置一张手牌并令一名角色回复1点体力。",
  jijiu_info: "你的回合外，你可以将一张红色牌当做【桃】使用。",
  wushuang_info: "锁定技，①当你使用【杀】指定一名角色为目标后，其需使用两张【闪】才能抵消；②当你使用【决斗】指定其他角色为目标后，或成为其他角色使用【决斗】的目标后，其每次响应需打出两张【杀】。",
  lijian_info: "出牌阶段限一次，你可以弃置一张牌，视为一名男性角色对另一名男性角色使用一张【决斗】（不可被【无懈可击】响应）。",
  biyue_info: "结束阶段，你可以摸一张牌。",
  yaowu: "耀武",
  yaowu_info: "锁定技，一名角色使用红色【杀】对你造成伤害时，该角色回复1点体力或摸一张牌。",
  new_jiangchi: "将驰",
  new_jiangchi_info: "摸牌阶段结束时，你可以选择一项：1、摸一张牌，若如此做，你本回合内不能使用或打出【杀】且【杀】不计入手牌上限。 2、弃置一张牌，若如此做，出牌阶段你使用【杀】无距离限制且你可以额外使用一张【杀】，直到回合结束。",
  xinfu_jijie: "机捷",
  xinfu_jijie_info: "出牌阶段限一次。你可以观看牌堆底的一张牌，然后将其交给一名角色。",
  xinfu_jiyuan: "急援",
  xinfu_jiyuan_info: "当有角色进入濒死状态时，或你将牌交给一名其他角色后，你可以令该角色摸一张牌。",
  ganglie_three: "刚烈",
  ganglie_three_info: "当你受到伤害后，你可令一名敌方角色判定。若结果不为♥，其弃置两张牌或受到来自你的1点伤害。",
  zhongyi: "忠义",
  zhongyi2: "忠义",
  zhongyi_info: "限定技，出牌阶段，你可以将一张牌置于武将牌上。你的武将牌上有〖忠义〗牌时，己方角色使用【杀】造成的伤害+1。下轮游戏开始时，你将〖忠义〗牌置入弃牌堆。",
  zhanshen: "战神",
  zhanshen_info: "觉醒技，准备阶段，若场上有已死亡的其他己方角色且你已受伤，则你弃置装备区的武器牌，减1点体力上限，获得技能〖马术〗和〖神戟〗。",
  shenji: "神戟",
  shenji_info: "锁定技，你使用【杀】指定的目标数上限+2，次数上限+1。",
  rewangzun: "妄尊",
  rewangzun2: "妄尊",
  rewangzun_info: "锁定技，一名其他角色的准备阶段开始时，若其体力值大于你，你摸一张牌。然后若其身份为主公/主帅/君主/地主且明置，则你摸一张牌，且其本回合的手牌上限-1。",
  retongji: "同疾",
  retongji_info: "攻击范围内包含你的角色成为【杀】的目标时，若你不是此【杀】的使用者或目标，其可弃置一张牌，然后将此【杀】转移给你。",
  std_panfeng: "标潘凤",
  std_panfeng_prefix: "标",
  stdkuangfu: "狂斧",
  stdkuangfu_info: "锁定技。出牌阶段限一次。当你使用【杀】对其他角色造成伤害后，若其体力值：小于你，你摸两张牌；不小于你，你失去1点体力。",
  ganfuren: "标甘夫人",
  ganfuren_prefix: "标",
  stdshushen: "淑慎",
  stdshushen_info: "当你回复1点体力时，你可以令一名其他角色摸一张牌（若其没有手牌则改为摸两张牌）。",
  old_re_lidian: "李典",
  std_yuejin: "标乐进",
  std_yuejin_prefix: "标",
  stdxiaoguo: "骁果",
  stdxiaoguo_info: "其他角色的结束阶段开始时，你可以弃置一张基本牌，令该角色选择一项：1.弃置一张装备牌；2.受到你对其造成的1点伤害。",
  stdqingjiao: "轻狡",
  stdqingjiao_info: "主公技，锁定技，结束阶段，若你本回合对其他群势力角色造成过伤害，你摸一张牌。"
};
const characterTitles = {
  caocao: "魏武帝",
  simayi: "狼顾之鬼",
  xiahoudun: "独眼的罗刹",
  zhangliao: "前将军",
  xuzhu: "虎痴",
  guojia: "早终的先知",
  zhenji: "薄幸的美人",
  liubei: "乱世的枭雄",
  guanyu: "美髯公",
  zhangfei: "万夫不当",
  zhugeliang: "迟暮的丞相",
  zhaoyun: "少年将军",
  machao: "一骑当千",
  huangyueying: "归隐的杰女",
  sunquan: "年轻的贤君",
  ganning: "锦帆游侠",
  lvmeng: "白衣渡江",
  huanggai: "轻身为国",
  zhouyu: "大都督",
  daqiao: "矜持之花",
  luxun: "儒生雄才",
  sunshangxiang: "弓腰姬",
  huatuo: "神医",
  lvbu: "武的化身",
  diaochan: "绝世的舞姬",
  huaxiong: "飞扬跋扈",
  xf_yiji: "礼仁同渡",
  re_yuanshu: "野心渐增",
  gongsunzan: "白马义从",
  caozhang: "黄须儿",
  std_panfeng: "桀骜不驯",
  ganfuren: "昭烈皇后",
  old_re_lidian: "学而不厌",
  std_yuejin: "奋强突固"
};
const characterIntro = {
  liubei: "先主姓刘，讳备，字玄德，涿郡涿县人，汉景帝子中山靖王胜之后也。以仁德治天下。",
  guanyu: "字云长，本字长生，并州河东解州人。五虎上将之首，爵至汉寿亭侯，谥曰“壮缪侯”。被奉为“关圣帝君”，崇为“武圣”。",
  zhangfei: "字翼德，涿郡人，燕颔虎须，豹头环眼。有诗云：“长坂坡头杀气生，横枪立马眼圆睁。一声好似轰雷震，独退曹家百万兵”。",
  zhugeliang: "字孔明，号卧龙，琅琊阳都人，蜀汉丞相。在世时被封为武乡侯，谥曰忠武侯。著有《出师表》、《诫子书》等。怀不世之才，以空城戏司马，能观星象而通鬼神。",
  zhaoyun: "字子龙，常山真定人。身长八尺，姿颜雄伟。长坂坡单骑救阿斗，先主云：“子龙一身都是胆也。”",
  machao: "字孟起，扶风茂陵人。面如冠玉，目如流星，虎体猿臂，彪腹狼腰，声雄力猛。因衣着讲究，举止非凡，故人称“锦马超”。麾铁骑，捻金枪。",
  huangyueying: "荆州沔南白水人，沔阳名士黄承彦之女，诸葛亮之妻，诸葛瞻之母。容貌甚丑，而有奇才：上通天文，下察地理，韬略近于诸书无所不晓，诸葛亮在南阳闻其贤而迎娶。",
  sunquan: "吴大帝，字仲谋，吴郡富春县人。统领吴与蜀魏三足鼎立，制衡天下。",
  ganning: "字兴霸，巴郡临江人，祖籍荆州南阳郡。为人勇猛刚强，忠心耿耿，勇往无前。曾带兵百人于二更奇袭曹营，大挫其锐气。",
  lvmeng: "字子明，汝南富陂人。陈寿评曰：“吕蒙勇而有谋断，识军计，谲郝普，擒关羽，最其妙者。初虽轻果妄杀，终于克己，有国士之量，岂徒武将而已乎！”",
  huanggai: "字公覆，零陵郡泉陵县人。官至偏将军、武陵太守。以苦肉计骗曹孟德，亲往诈降，火烧战船，重创敌军。",
  zhouyu: "字公瑾，庐江舒县人，任东吴三军大都督，雄姿英发，人称“美周郎”。赤壁之战前，巧用反间计杀了精通水战的叛将蔡瑁、张允。",
  daqiao: "庐江皖县人，为乔公长女，孙策之妻，小乔之姊。与小乔并称为“江东二乔”，容貌国色流离。",
  luxun: "本名陆议，字伯言，吴郡吴县人。历任东吴大都督、丞相。吴大帝孙权兄孙策之婿，世代为江东大族。以谦逊之书麻痹关羽，夺取荆州，又有火烧连营大破蜀军。",
  sunshangxiang: "孙夫人，乃孙权之妹。刘备定荆州，孙权进妹与其结姻，重固盟好。孙夫人才捷刚猛，有诸兄之风。后人为其立庙，号曰“枭姬庙”。",
  caocao: "魏武帝曹操，字孟德，小名阿瞒、吉利，沛国谯人。精兵法，善诗歌，乃治世之能臣，乱世之奸雄也。",
  simayi: "晋宣帝，字仲达，河内温人。曾任职过曹魏的大都督，太尉，太傅。少有奇节，聪明多大略，博学洽闻，伏膺儒教，世之鬼才也。",
  xiahoudun: "字元让，沛国谯人。有拔矢啖睛之勇，性格勇猛刚烈。",
  zhangliao: "字文远，魏雁门马邑人。官至前将军、征东将军、晋阳侯。武功高强，又谋略过人，多次建立奇功，以800人突袭孙权十万大军，皆望风披靡。",
  xuzhu: "字仲康，谯国谯县人。和典韦一同统率着曹操的亲卫队“虎卫军”。因为他十分勇猛，所以有“虎痴”的绰号。曾有裸衣斗马超之举。",
  guojia: "字奉孝，颍川阳翟人，官至军师祭酒。惜天妒英才，英年早逝。有诗云：“良计环环不遗策，每临制变满座惊”。",
  zhenji: "中山无极人，别称甄洛或甄宓，谥号文昭甄皇后。魏文帝曹丕的正室。懂诗文，有倾国倾城之貌，《洛神赋》即是曹植为她所作。",
  huatuo: "字元化，一名旉，沛国谯人，“建安三神医”之一。集平生之所得著《青囊经》，现已失传。",
  lvbu: "字奉先，五原郡九原县人。三国第一猛将，曾独力战刘关张三人，其武力世之无双。时人语曰：“人中有吕布，马中有赤兔。”",
  diaochan: "中国古代四大美女之一，有闭月羞花之貌。司徒王允之义女，由王允授意施行连环计，离间董卓、吕布，借布手除卓。后貂蝉成为吕布的妾。",
  huaxiong: "董卓旗下名将，自荐抵抗山东地区反对董卓的诸侯联军于汜水关前，他先后斩杀济北相鲍信之弟鲍忠和孙坚部将祖茂、以及袁术部将俞涉和韩馥手下潘凤等人，最后关东联军派出关羽与之一对一决斗而被杀。",
  xf_yiji: "伊籍，字机伯，生卒年不详，兖州山阳郡（今山东金乡县）人，三国时期蜀汉官员。年少时依附于同乡刘表。刘备落难到荆州时，伊籍时常拜访，托请刘备照顾。建安十三年（208年），刘表病死，伊籍便转投刘备，一起渡江南下。建安十六年（211年），刘备入蜀帮助刘璋，伊籍亦有跟随。随后刘备和刘璋双方决裂。建安十九年（214年），刘备平定益州，任命伊籍为左将军从事中郎，其待遇次于简雍、孙乾等。后升任昭文将军，并与诸葛亮、法正、刘巴、李严共同编制《蜀科》。"
};
const characterFilters = {};
const dynamicTranslates = {};
const perfectPairs = {};
const voices = {
  "#ganfuren:die": "请替我照顾好阿斗……",
  "#jianxiong1": "宁教我负天下人，休教天下人负我！",
  "#jianxiong2": "吾好梦中杀人！",
  "#hujia1": "魏将何在？",
  "#hujia2": "来人！护驾！",
  "#caocao:die": "霸业未成未成啊！",
  "#fankui1": "出来混，早晚要还的。",
  "#fankui2": "下次注意点。",
  "#guicai1": "天命？哈哈哈哈……",
  "#guicai2": "吾乃天命之子！",
  "#simayi:die": "难道真是天意难违？",
  "#ganglie1": "鼠辈，竟敢伤我！",
  "#ganglie2": "以彼之道，还施彼身！",
  "#xiahoudun:die": "两，两边都看不见了……",
  "#tuxi1": "哼，没想到吧！",
  "#tuxi2": "拿来吧！",
  "#zhangliao:die": "真的没想到……",
  "#luoyi1": "脱！",
  "#luoyi2": "谁来与我大战三百回合？",
  "#xuzhu:die": "冷，好冷啊……",
  "#tiandu1": "罢了。",
  "#tiandu2": "也好。",
  "#yiji1": "就这样吧。",
  "#yiji2": "哦？",
  "#guojia:die": "咳，咳……",
  "#luoshen1": "髣髴兮若轻云之蔽月。",
  "#luoshen2": "飘飖兮若流风之回雪。",
  "#qingguo1": "凌波微步，罗袜生尘。",
  "#qingguo2": "体迅飞凫，飘忽若神。",
  "#zhenji:die": "悼良会之永绝兮，哀一逝而异乡……",
  "#rende1": "以德服人。",
  "#rende2": "唯贤唯德，能服于人。",
  "#jijiang11": "蜀将何在？",
  "#jijiang12": "尔等敢应战否？",
  "#liubei:die": "这就是桃园吗？",
  "#wusheng1": "关羽在此，尔等受死！",
  "#wusheng2": "看尔乃插标卖首！",
  "#guanyu:die": "什么？此地名叫麦城？",
  "#paoxiao1": "燕人张飞在此！",
  "#paoxiao2": "啊~~~！",
  "#zhangfei:die": "实在是，杀不动了……",
  "#guanxing1": "观今夜天象，知天下大事。",
  "#guanxing2": "知天易，逆天难。",
  "#kongcheng11": "（抚琴声）",
  "#kongcheng12": "（抚琴声）",
  "#zhugeliang:die": "将星陨落，天命难违……",
  "#longdan_sha1": "能进能退，乃真正法器！",
  "#longdan_sha2": "吾乃常山赵子龙也！",
  "#longdan_sha_sp_zhaoyun1": "大将军，岂可有勇无谋？",
  "#longdan_sha_sp_zhaoyun2": "一技闯天下，何有所惧!",
  "#zhaoyun:die": "这，就是失败的滋味吗？",
  "#tieji1": "全军突击！",
  "#tieji2": "（马蹄声，马叫声）",
  "#machao:die": "（马蹄声远去……）",
  "#jizhi1": "哼哼~",
  "#jizhi2": "哼~",
  "#huangyueying:die": "亮……",
  "#zhiheng1": "容我三思。",
  "#zhiheng2": "且慢。",
  "#jiuyuan1": "有汝辅佐，甚好！",
  "#jiuyuan2": "好舒服啊。",
  "#sunquan:die": "父亲，大哥，仲谋愧矣……",
  "#qixi1": "接招吧！",
  "#qixi2": "你的牌太多啦！",
  "#ganning:die": "二十年后，又是一条好汉……",
  "#keji1": "不是不报，时候未到！",
  "#keji2": "留得青山在，不怕没柴烧！",
  "#lvmeng:die": "被看穿了吗……",
  "#kurou1": "请鞭笞我吧，公瑾！",
  "#kurou2": "赴汤蹈火，在所不辞。",
  "#huanggai:die": "失血……过多了……",
  "#yingzi1": "哈哈哈哈！",
  "#yingzi2": "汝等看好了！",
  "#fanjian1": "痛苦吧，在仇与恨的地狱中！",
  "#fanjian2": "挣扎吧，在血和暗的深渊里！",
  "#zhouyu:die": "既生瑜，何生……",
  "#guose1": "请休息吧。",
  "#guose2": "你累了。",
  "#liuli1": "交给你了~",
  "#liuli2": "你来嘛~",
  "#daqiao:die": "伯符，我去了……",
  "#qianxun1": "儒生脱尘，不为贪逸淫乐之事。",
  "#qianxun2": "谦谦君子，不饮盗泉之水。",
  "#lianying1": "牌不是万能的，但是没牌是万万不能的。",
  "#lianying2": "旧的不去，新的不来。",
  "#luxun:die": "我还是太年轻了……",
  "#xiaoji1": "哼！",
  "#xiaoji2": "看我的厉害！",
  "#jieyin1": "夫君，身体要紧。",
  "#jieyin2": "他好，我也好。",
  "#sunshangxiang:die": "不！还不可以死！",
  "#qingnang1": "早睡早起，方能养生。",
  "#qingnang2": "越老越要补啊。",
  "#jijiu1": "别紧张，有老夫呢。",
  "#jijiu2": "救人一命，胜造七级浮屠。",
  "#huatuo:die": "医者……不能自医啊……",
  "#wushuang1": "谁能挡我！",
  "#wushuang2": "神挡杀神，佛挡杀佛！",
  "#lvbu:die": "不可能！",
  "#lijian1": "嗯呵呵~~呵呵~~",
  "#lijian2": "夫君，你要替妾身做主啊……",
  "#biyue1": "失礼了~",
  "#biyue2": "羡慕吧~",
  "#diaochan:die": "父亲大人，对不起……",
  "#yaowu1": "大人有大量，不和你计较！",
  "#yaowu2": "哼，先让你尝点甜头！",
  "#huaxiong:die": "这，怎么可能……",
  "#yicong1": "冲啊！",
  "#yicong2": "众将听令，排好阵势，御敌！",
  "#gongsunzan:die": "我军将败，我已无颜苟活于世……",
  "#xinfu_jijie1": "一拜一起，未足为劳。",
  "#xinfu_jijie2": "识言观行，方能雍容风议。",
  "#xinfu_jiyuan1": "公若辞，必遭蔡瑁之害矣。",
  "#xinfu_jiyuan2": "形势危急，还请速行。",
  "#xf_yiji:die": "未能，救得刘公脱险……",
  "#wangzun1": "真命天子，八方拜服。",
  "#wangzun2": "归顺于我，封爵赏地！",
  "#tongji1": "弑君之罪，当诛九族！",
  "#tongji2": "你，你这是反啦！",
  "#re_yuanshu:die": "把玉玺，还给我……"
};
const characterSort = {
  standard_2008: ["caocao", "simayi", "xiahoudun", "zhangliao", "xuzhu", "guojia", "zhenji", "liubei", "guanyu", "zhangfei", "zhugeliang", "zhaoyun", "machao", "huangyueying", "sunquan", "ganning", "lvmeng", "huanggai", "zhouyu", "daqiao", "luxun", "sunshangxiang", "huatuo", "lvbu", "diaochan"],
  standard_2013: ["old_re_lidian", "huaxiong", "re_yuanshu"],
  standard_2019: ["gongsunzan", "xf_yiji"],
  standard_2023: ["std_panfeng", "ganfuren", "std_yuejin"]
};
const characterSortTranslate = {
  standard_2008: "2008版标准包",
  standard_2013: "2013版标准包",
  standard_2019: "2019版标准包",
  standard_2023: "2023版标准包"
};
function createJinSimayiPack({ lib: lib2, game: game2, ui: ui2, get: get2, _status: _status2 }) {
  const suits = ["spade", "heart", "club", "diamond"];
  const phases = ["phaseZhunbei", "phaseJudge", "phaseDraw", "phaseUse", "phaseDiscard", "phaseJieshu"];
  const hidden = (owner) => game2.players.find((p) => p.storage?.jinsimayi_owner === owner.playerid && p.name === "my_yinni");
  const ownerOf = (p) => game2.players.find((owner) => owner.playerid === p.storage?.jinsimayi_owner);
  const partner = (p) => p.name === "my_yinni" ? ownerOf(p) : hidden(p);
  const sharedCards = (p) => partner(p)?.getCards("h") || [];
  const availableSuits = (p) => suits.filter((suit) => {
    if ((p.storage.my_cangyuan_suits || []).includes(suit)) return false;
    const cards2 = p.getCards("h", (c) => get2.suit(c, p) === suit);
    return cards2.length && cards2.every((c) => lib2.filter.cardDiscardable(c, p, "my_cangyuan"));
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
    if (game2.me === p && owner?.isIn()) game2.swapPlayerAuto(owner);
    if (_status2.roundStart === p) _status2.roundStart = p.next;
    await game2.removePlayerOL(p, { animate: false });
    if (owner) await awaken(owner);
  }
  const skills2 = {
    my_cangyuan: {
      trigger: { global: "gameStart" },
      forced: true,
      filter(event, player) {
        return !player.storage.my_cangyuan_created && !_status2.connectMode;
      },
      async content(event, trigger, player) {
        player.storage.my_cangyuan_created = true;
        const token = await game2.addPlayerOL(player, "my_yinni", null, true, { source: player, animate: false });
        token.storage.jinsimayi_owner = player.playerid;
        token._trueMe = player;
        token.identity = player.identity === "zhu" ? "zhong" : player.identity;
        token.identityShown = player.identityShown;
        token.ai.shown = player.ai.shown;
        token.setIdentity();
        token.update();
        game2.log(player, "在下家前插入了", token);
      },
      group: ["my_cangyuan_guard", "my_cangyuan_depart", "my_cangyuan_maxhp", "my_cangyuan_cleanup"],
      global: ["my_cangyuan_share", "my_cangyuan_control"],
      mark: true,
      marktext: "渊",
      intro: {
        content(storage, player) {
          return "已弃置花色：" + ((player.storage.my_cangyuan_suits || []).map((s) => get2.translation(s)).join("、") || "无");
        }
      }
    },
    my_cangyuan_guard: {
      trigger: { global: "damageBegin4" },
      direct: true,
      filter(event, player) {
        return event.player === hidden(player) && availableSuits(player).length > 0;
      },
      async content(event, trigger, player) {
        const choices = availableSuits(player);
        const result = await player.chooseControl([...choices, "cancel2"]).set("prompt", "藏渊：弃置一种花色的全部手牌，防止此次伤害").set("ai", () => choices[0]).forResult();
        if (!choices.includes(result.control)) return;
        const suit = result.control;
        const cards2 = player.getCards("h", (c) => get2.suit(c, player) === suit);
        if (!cards2.length || !cards2.every((c) => lib2.filter.cardDiscardable(c, player, "my_cangyuan"))) return;
        player.logSkill("my_cangyuan", trigger.player);
        (player.storage.my_cangyuan_suits ??= []).push(suit);
        await player.discard(cards2);
        trigger.cancel();
        player.markSkill("my_cangyuan");
        for (const recipient of [player, trigger.source]) {
          if (!recipient?.isIn()) continue;
          const gains = suits.filter((s) => s !== suit).map((s) => get2.cardPile2((c) => get2.suit(c, false) === s)).filter(Boolean);
          if (gains.length) await recipient.gain(gains, "gain2");
        }
      }
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
        if (trigger.name === "phase" || trigger.name === "die") trigger.cancel();
        await removeHidden(token);
      }
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
      }
    },
    my_cangyuan_cleanup: {
      trigger: { player: "dieAfter" },
      forced: true,
      silent: true,
      forceDie: true,
      async content(event, trigger, player) {
        await removeHidden(hidden(player));
      }
    },
    my_cangyuan_control: {
      trigger: { global: ["chooseToUseBegin", "chooseToRespondBegin", "chooseToDiscardBegin", "chooseButtonBegin", "chooseCardBegin", "chooseTargetBegin", "chooseControlBegin", "chooseBoolBegin", "choosePlayerCardBegin", "discardPlayerCardBegin", "gainPlayerCardBegin"] },
      forced: true,
      silent: true,
      firstDo: true,
      priority: 200,
      filter(event) {
        const p = event.player, owner = p?.name === "my_yinni" ? ownerOf(p) : p;
        return !_status2.connectMode && !_status2.auto && owner?.isIn() && (p?.name === "my_yinni" || hidden(p)) && p !== game2.me && (owner === game2.me || game2.me?._trueMe === owner);
      },
      async content(event, trigger) {
        game2.swapPlayerAuto(trigger.player);
      }
    },
    my_cangyuan_share: {
      enable: ["chooseToUse", "chooseToRespond"],
      filter(event, player) {
        return !event.responded && sharedCards(player).some((c) => event.filterCard(get2.autoViewAs(c), player, event));
      },
      hiddenCard(player, name) {
        return sharedCards(player).some((c) => get2.name(c) === name);
      },
      chooseButton: {
        dialog(event, player) {
          return ui2.create.dialog("藏渊：使用或打出对方的手牌", sharedCards(player), "hidden");
        },
        filter(button, player) {
          const event = _status2.event.getParent();
          return sharedCards(player).includes(button.link) && event.filterCard(get2.autoViewAs(button.link), player, event);
        },
        check(button) {
          return get2.player().getUseValue(button.link);
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
              event.result.cards = [card];
              event.result.card = get2.autoViewAs(card);
            }
          };
        },
        prompt(links) {
          return "藏渊：使用或打出" + get2.translation(links[0]);
        }
      },
      ai: {
        order: 8,
        respondSha: true,
        respondShan: true,
        skillTagFilter(player, tag) {
          return sharedCards(player).some((c) => get2.name(c) === (tag === "respondSha" ? "sha" : "shan"));
        },
        result: { player: 1 }
      }
    },
    my_choulue: {
      trigger: { global: "phaseEnd" },
      direct: true,
      filter(event, player) {
        return !!hidden(player) && player.storage.my_choulue_round !== game2.roundNumber && game2.hasPlayer((p) => p !== player && p !== hidden(player));
      },
      async content(event, trigger, player) {
        const token = hidden(player);
        const result = await player.chooseTarget("筹略：令一名其他角色与隐匿交换座位及全部手牌", (card, player2, target2) => target2 !== player2 && target2 !== hidden(player2)).set("ai", (target2) => -get2.attitude(get2.player(), target2)).forResult();
        if (!result.bool || !token?.isIn()) return;
        player.storage.my_choulue_round = game2.roundNumber;
        const target = result.targets[0];
        player.logSkill("my_choulue", target);
        game2.swapSeat(target, token);
        await target.swapHandcards(token);
      }
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
      }
    },
    my_duoshi_unrespondable: {
      charlotte: true,
      trigger: { player: "useCard" },
      forced: true,
      popup: false,
      async content(event, trigger) {
        trigger.directHit.addArray(game2.players);
      }
    },
    my_dingding: {
      trigger: { global: "phaseBegin" },
      direct: true,
      filter(event, player) {
        return phases.some((p) => !(player.storage.my_dingding_used || []).includes(p));
      },
      async content(event, trigger, player) {
        const choices = phases.filter((p) => !(player.storage.my_dingding_used || []).includes(p));
        const result = await player.chooseControl([...choices, "cancel2"]).set("prompt", "定鼎：令" + get2.translation(trigger.player) + "跳过一个阶段，你于此回合结束时执行之（每种阶段每局一次）").set("ai", () => choices.includes("phaseDraw") ? "phaseDraw" : "cancel2").forResult();
        if (!choices.includes(result.control)) return;
        const phase = result.control;
        (player.storage.my_dingding_used ??= []).push(phase);
        trigger.my_dingding_turn ??= get2.id();
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
          return "已用阶段：" + ((player.storage.my_dingding_used || []).map((p) => get2.translation(p)).join("、") || "无");
        }
      }
    },
    my_dingding_execute: {
      trigger: { global: "phaseEnd" },
      forced: true,
      popup: false,
      filter(event, player) {
        return (player.storage.my_dingding_pending || []).some((p) => p.turn === event.my_dingding_turn);
      },
      async content(event, trigger, player) {
        const pending = player.storage.my_dingding_pending || [];
        const run = pending.filter((p) => p.turn === trigger.my_dingding_turn);
        player.storage.my_dingding_pending = pending.filter((p) => p.turn !== trigger.my_dingding_turn);
        for (const { phase } of run) {
          if (!player.isIn()) break;
          await player[phase]().set("_extraPhaseReason", "my_dingding");
        }
      }
    }
  };
  return {
    character: {
      my_jin_simayi: { sex: "male", group: "jin", hp: 4, maxHp: 4, skills: ["my_cangyuan", "my_choulue", "my_duoshi"], img: "image/character/simayi.jpg" },
      my_yinni: { sex: "male", group: "jin", hp: 1, maxHp: 1, skills: [], isUnseen: true, img: "image/character/simayi.jpg" }
    },
    skill: skills2,
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
      my_jin_custom: "个人武将·晋"
    }
  };
}
function createMoZhangjiaoPack({ lib: lib2, game: game2, ui: ui2, get: get2, _status: _status2 }) {
  const rang = (p) => p.getExpansions("my_rang");
  const holders = () => game2.filterPlayer((p) => rang(p).length > 0);
  const canHeal = (p) => p.isDamaged() || p.hasSkill("my_tongxin");
  const quota = (p) => {
    const used = p.storage.my_duhua_round === game2.roundNumber ? p.storage.my_duhua_count || 0 : 0;
    return used < holders().length;
  };
  async function putRang(target, cards2, source) {
    const next = target.addToExpansion(cards2, source, "giveAuto");
    next.gaintag.add("my_rang");
    await next;
    target.addSkill("my_rang");
    target.markSkill("my_rang");
  }
  const skills2 = {
    my_rang: { charlotte: true, mark: true, marktext: "禳", intro: { content: "expansion", markcount: "expansion" } },
    my_jiyu: { global: "my_jiyu_give" },
    my_jiyu_give: {
      enable: "phaseUse",
      usable: 1,
      position: "he",
      selectCard: [1, Infinity],
      filter(event, player) {
        return game2.hasPlayer((p) => p.hasSkill("my_jiyu")) && player.countCards("he") > 0;
      },
      filterCard: true,
      discard: false,
      lose: false,
      delay: false,
      check(card) {
        return 7 - get2.value(card);
      },
      async content(event, trigger, player) {
        await putRang(player, event.cards, player);
        const lost = event.cards.filter((c) => rang(player).includes(c)).length;
        if (lost && player.isIn()) await player.draw(lost + holders().length);
      },
      ai: { order: 8, result: { player: 1 } }
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
          choice = (await player.chooseControl("获得禳", "获得牌").set("prompt", "护道：选择获得伤害来源的一张禳或手牌/装备牌").set("ai", () => "获得禳").forResult()).control;
        } else if (!expansions.length) choice = "获得牌";
        if (choice === "获得禳" && expansions.length) {
          const result = await player.chooseButton(["护道：获得一张禳", expansions], true).forResult();
          if (result.bool) await player.gain(result.links, source, "give");
        } else if (source.countGainableCards(player, "he")) await player.gainPlayerCard(source, "he", true);
      },
      group: "my_hudao_decay"
    },
    my_hudao_decay: {
      trigger: { global: "phaseBegin" },
      forced: true,
      filter(event) {
        const count = rang(event.player).length;
        return count > 0 && count < game2.roundNumber;
      },
      async content(event, trigger) {
        const target = trigger.player, cards2 = rang(target).slice();
        await target.loseToDiscardpile(cards2);
        if (target.isIn()) await target.loseHp(cards2.length);
      }
    },
    my_duhua: {
      enable: "chooseToUse",
      position: "h",
      selectCard: 1,
      filterCard: true,
      viewAs: { name: "tao", storage: { my_duhua: true } },
      viewAsFilter(player) {
        return quota(player) && player.countCards("h") > 0 && game2.hasPlayer((p) => p !== player && canHeal(p));
      },
      selectTarget: 1,
      filterTarget(card, player, target) {
        return target !== player && canHeal(target);
      },
      prompt: "渡化：将一张手牌当桃对其他角色使用，结算后将此牌置为其禳",
      check(card) {
        return 7 - get2.value(card);
      },
      async precontent(event, trigger, player) {
        if (player.storage.my_duhua_round !== game2.roundNumber) {
          player.storage.my_duhua_round = game2.roundNumber;
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
        }
      },
      ai: {
        order: 8,
        save: true,
        result: { target: 2 },
        skillTagFilter(player) {
          return quota(player) && player.countCards("h") > 0;
        }
      },
      group: ["my_duhua_place", "my_duhua_transform", "my_duhua_damage"]
    },
    my_duhua_place: {
      trigger: { player: "useCardAfter" },
      forced: true,
      popup: false,
      filter(event) {
        return event.card.storage?.my_duhua && event.cards?.length && event.targets?.[0]?.isIn();
      },
      async content(event, trigger, player) {
        const cards2 = trigger.cards.filter((c) => ["o", "d"].includes(get2.position(c, true)));
        if (cards2.length) await putRang(trigger.targets[0], cards2, player);
      }
    },
    my_duhua_transform: {
      trigger: { global: ["addToExpansionAfter", "loseAfter", "loseAsyncAfter", "dieAfter", "gameDrawAfter"] },
      forced: true,
      skillAnimation: true,
      animationColor: "thunder",
      filter(event, player) {
        return !player.storage.my_rumo && holders().length > game2.countPlayer() / 2;
      },
      async content(event, trigger, player) {
        player.storage.my_rumo = true;
        await player.removeSkills(["my_jiyu", "my_hudao"]);
        await player.addSkills(["my_tongxin", "my_rumo"]);
        player.markSkill("my_rumo");
      }
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
        player.storage.my_mozhangjiao_damage_round = game2.roundNumber;
      }
    },
    my_rumo: {
      charlotte: true,
      mark: true,
      marktext: "魔",
      intro: { content: "已入魔。本轮未造成伤害，则轮末失去1点体力。" },
      trigger: { global: "roundEnd" },
      forced: true,
      filter(event, player) {
        return player.storage.my_mozhangjiao_damage_round !== game2.roundNumber;
      },
      async content(event, trigger, player) {
        await player.loseHp(1);
      }
    },
    my_tongxin: {
      trigger: { player: "useCardToPlayered" },
      forced: true,
      filter(event) {
        return event.isFirstTarget && get2.type(event.card) === "basic" && holders().some((p) => p !== event.player);
      },
      async content(event, trigger, player) {
        const targets = trigger.targets.slice(), name = get2.name(trigger.card);
        const list = holders().filter((p) => p !== player).sortBySeat(player);
        for (const current of list) {
          if (!player.isIn() || !current.isIn() || !rang(current).length || !targets.every((p) => p.isIn())) continue;
          const legal = (card) => get2.name(card, current) === name && targets.every((target) => current.canUse(card, target, false, true));
          if (!current.getCards("h", legal).length) continue;
          const result = await current.chooseCard("h", true, "同心：对相同目标使用一张" + get2.translation(name), legal).set("ai", (card) => 6 - get2.value(card)).forResult();
          if (result.bool && legal(result.cards[0])) await current.useCard(result.cards[0], targets);
        }
      },
      mod: {
        // A healthy Tongxin owner can legally use a Peach on themself for the replacement effect.
        cardEnabled(card, player) {
          if (get2.name(card) === "tao" && !player.isDamaged()) return true;
        },
        targetEnabled(card, player, target) {
          if (get2.name(card) === "tao" && player === target && !target.isDamaged()) return true;
        }
      },
      group: "my_tongxin_maxhp"
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
      }
    }
  };
  return {
    character: { my_mo_zhangjiao: { sex: "male", group: "qun", hp: 4, maxHp: 4, skills: ["my_jiyu", "my_hudao", "my_duhua"], img: "image/character/zhangjiao.jpg" } },
    skill: skills2,
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
      my_rumo_info: "状态：若本轮未造成伤害，本轮结束时失去1点体力。"
    }
  };
}
function createJianSeriesPack({ lib: lib2, game: game2, ui: ui2, get: get2, _status: _status2 }) {
  const alive = (p) => p?.isIn();
  const yin = (p, s) => !!p.storage[s];
  const change = (p, s) => p.changeZhuanhuanji(s);
  const ordinary = (card) => get2.type(card) === "trick";
  const tricks = (card) => get2.type2(card) === "trick";
  const choose = async (next) => next.forResult();
  const roundCards = (p) => p.getRoundHistory("useCard").map((e) => get2.name(e.card));
  const turn = (e) => e.name === "phase" ? e : e.getParent("phase");
  const conversion = (name, initial = false) => ({
    zhuanhuanji: true,
    mark: true,
    marktext: "☯",
    init(p) {
      if (p.storage[name] === void 0) p.storage[name] = initial;
    },
    intro: {
      content(storage) {
        return storage ? "当前为阴" : "当前为阳";
      }
    }
  });
  function fieldCards() {
    return game2.filterPlayer().flatMap((p) => p.getCards("ej"));
  }
  async function invoke(p, skill2) {
    p.logSkill(skill2);
    change(p, skill2);
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
          const r = await choose(player.chooseCard("he", [1, Infinity], `奉绝：交给${get2.translation(target)}任意张牌，并造成等量伤害`));
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
          if (!(await choose(player.chooseBool(`奉绝：防止${get2.translation(target)}此次伤害并将其移出游戏？`))).bool) return;
          player.storage.my_fengjue_spent = true;
          const x = player.storage.my_fengjue_count = (player.storage.my_fengjue_count || 0) + 1;
          player.awakenSkill("my_fengjue");
          await invoke(player, "my_fengjue");
          trigger.cancel();
          const cards2 = fieldCards();
          if (cards2.length) {
            const r = await choose(player.chooseButton([`奉绝：令其获得${Math.min(x, cards2.length)}张场上的牌`, cards2], Math.min(x, cards2.length), true));
            if (r.bool) await target.gain(r.links, "gain2");
          }
          if (!alive(target)) return;
          target.storage.my_fengjue_exile = { source: trigger.source, round: game2.roundNumber };
          target.addSkill("my_fengjue_exile");
          target.out("my_fengjue_exile");
        }
      }
    },
    my_fengjue_bonus: {
      charlotte: true,
      mark: true,
      marktext: "绝",
      intro: {
        content(storage, p) {
          return `下次伤害+${p.storage.my_fengjue_damage || 0}；下次从牌堆获得牌+${p.storage.my_fengjue_cards || 0}`;
        }
      },
      trigger: { source: "damageBegin1", player: ["drawBegin", "gainBegin"] },
      forced: true,
      popup: false,
      priority: 40,
      filter(e, p) {
        if (e.name === "damage") return p.storage.my_fengjue_damage > 0;
        if (!(p.storage.my_fengjue_cards > 0)) return false;
        return e.name === "draw" || e.cards.some((c) => !get2.owner(c) && (get2.position(c) === "c" || c.original === "c"));
      },
      content(event, trigger, player) {
        if (trigger.name === "damage") {
          trigger.num += player.storage.my_fengjue_damage;
          delete player.storage.my_fengjue_damage;
        } else {
          const x = player.storage.my_fengjue_cards;
          delete player.storage.my_fengjue_cards;
          if (trigger.name === "draw") trigger.num += x;
          else trigger.cards.push(...get2.cards(x));
        }
        if (!player.storage.my_fengjue_damage && !player.storage.my_fengjue_cards) player.removeSkill("my_fengjue_bonus");
      }
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
        return s && (e.name === "phase" ? e.player === s.source : game2.roundNumber >= s.round + 1);
      },
      async content(event, trigger, player) {
        player.in("my_fengjue_exile");
        player.removeSkill("my_fengjue_exile");
        delete player.storage.my_fengjue_exile;
        if (trigger.name !== "phase") await player.die();
      }
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
      }
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
      }
    },
    my_yifang: {
      trigger: { target: "useCardToTargeted" },
      direct: true,
      filter(e, p) {
        return e.player !== p && tricks(e.card) && p.countCards("he") > 0;
      },
      async content(event, trigger, player) {
        const used = roundCards(player);
        const names = lib2.inpile.filter((n) => tricks({ name: n }) && !used.includes(n) && player.hasUseTarget({ name: n, isCard: true }));
        if (!names.length) return;
        const r = await choose(player.chooseButton(["遗方：将一张牌当本轮未使用过的锦囊牌使用", [names.map((n) => ["锦囊", "", n]), "vcard"]]));
        if (!r.bool) return;
        const c = await choose(player.chooseCard("he", 1, "遗方：选择转化的牌"));
        if (c.bool) {
          player.logSkill("my_yifang");
          await player.chooseUseTarget({ name: r.links[0][2], isCard: true }, c.cards, true);
        }
      },
      group: "my_yifang_heal"
    },
    my_yifang_heal: {
      trigger: { player: "damageEnd" },
      forced: true,
      filter(e, p) {
        return game2.hasPlayer((t) => t !== p && t.isDamaged());
      },
      async content(event, trigger, player) {
        const r = await choose(player.chooseTarget("遗方：令一名其他角色回复1点体力", true, (card, p, t) => t !== p && t.isDamaged()));
        if (r.bool) await r.targets[0].recover();
      }
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
          const n = trigger.player.getHistory("gain", (e) => turn(e) === trigger).reduce((a, e) => a + e.cards.length, 0);
          await invoke(player, "my_jingshi");
          const count = Math.min(n, trigger.player.countCards("he"));
          if (count) await trigger.player.chooseToDiscard("he", count, true);
        } else {
          const r = await choose(player.chooseTarget("经世：令一名角色摸体力上限数的牌（至多5）"));
          if (!r.bool) return;
          await invoke(player, "my_jingshi");
          await r.targets[0].draw(Math.min(5, r.targets[0].maxHp));
        }
      }
    },
    my_zhongzhi: {
      trigger: { global: ["phaseBegin", "loseAfter", "loseAsyncAfter", "cardsDiscardAfter", "gainAfter", "equipAfter", "addJudgeAfter", "addToExpansionAfter"] },
      forced: true,
      filter(e, p) {
        const phase = turn(e);
        if (!phase || phase.name !== "phase" || p.storage.my_zhongzhi_phase === phase) return false;
        const types = new Set(Array.from(ui2.discardPile.childNodes).map((c) => get2.type2(c, false)));
        return ["basic", "trick", "equip"].every((t) => types.has(t));
      },
      async content(event, trigger, player) {
        player.storage.my_zhongzhi_phase = turn(trigger);
        const reverse = !!player.storage.my_zhongzhi_reverse;
        async function toggle() {
          const skills2 = player.getSkills().filter((s2) => lib2.skill[s2]?.zhuanhuanji);
          if (!skills2.length) return;
          let s = skills2[0];
          if (skills2.length > 1) s = (await choose(player.chooseControl(skills2).set("prompt", "终志：转换一个技能状态"))).control;
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
      group: "my_zhongzhi_reverse"
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
      }
    },
    my_xiangran: {
      ...conversion("my_xiangran", true),
      trigger: { global: ["phaseEnd", "useCard1"] },
      direct: true,
      filter(e, p) {
        if (yin(p, "my_xiangran")) return e.name === "phase" && alive(e.player);
        return e.name === "useCard" && tricks(e.card) && _status2.currentPhase === e.player && e.player.getHistory("useCard", (x) => tricks(x.card))[0] === e;
      },
      async content(event, trigger, player) {
        if (!yin(player, "my_xiangran")) {
          if ((await choose(player.chooseBool(`想然：令${get2.translation(trigger.card)}无效？`))).bool) {
            await invoke(player, "my_xiangran");
            trigger.all_excluded = true;
          }
          return;
        }
        const actor = trigger.player;
        const used = actor.getHistory("useCard").map((e) => get2.name(e.card));
        const names = lib2.inpile.filter((n) => ordinary({ name: n }) && !used.includes(n) && actor.hasUseTarget({ name: n, isCard: true }));
        if (!names.length) return;
        const r = await choose(player.chooseButton(["想然：声明本回合未使用的普通锦囊", [names.map((n) => ["锦囊", "", n]), "vcard"]]));
        if (!r.bool) return;
        const card = { name: r.links[0][2], isCard: true }, info = get2.info(card);
        let targets;
        const range = get2.select(info.selectTarget ?? 1);
        if (range[1] === -1) targets = game2.filterPlayer((t) => actor.canUse(card, t));
        else {
          const t = await choose(player.chooseTarget("想然：声明目标", range, (c, p, target) => actor.canUse(card, target)));
          if (!t.bool) return;
          targets = t.targets;
        }
        if (info.singleCard && info.filterAddedTarget) {
          const extra = await choose(player.chooseTarget("想然：声明第二目标", true, (c, p, target) => info.filterAddedTarget(card, actor, target, targets[0])));
          if (!extra.bool) return;
          targets.push(extra.targets[0]);
        }
        if (!targets.length) return;
        await invoke(player, "my_xiangran");
        await actor.useCard(card, targets, false);
      }
    },
    my_gaoyi: {
      trigger: { global: ["logSkill", "useSkillAfter"] },
      forced: true,
      filter(e, p) {
        const s = e.sourceSkill || e.skill, info = lib2.skill[s];
        if (e.player === p || !info || info.charlotte || info.silent || s === "my_gaoyi" || ["global", "equip"].includes(e.type)) return false;
        const history = e.player.getRoundHistory("useSkill", (x) => (x.sourceSkill || x.skill) === s);
        const ref = e.log_event || e;
        return history.length > 1 && !p.storage.my_gaoyi_seen?.has(ref);
      },
      async content(event, trigger, player) {
        if (player.storage.my_gaoyi_round !== game2.roundNumber) {
          player.storage.my_gaoyi_round = game2.roundNumber;
          player.storage.my_gaoyi_seen = /* @__PURE__ */ new Set();
        }
        player.storage.my_gaoyi_seen.add(trigger.log_event || trigger);
        await player.draw();
      }
    }
  };
  return {
    character: {
      my_jian_guojia: { sex: "male", group: "wei", hp: 3, maxHp: 4, skills: ["my_fengjue", "my_weijing"], img: "image/character/guojia.jpg" },
      my_jian_liuxie: { sex: "male", group: "wei", hp: 4, maxHp: 4, skills: ["my_fumeng", "my_yifang"], img: "image/character/liuxie.jpg" },
      my_jian_xunyu: { sex: "male", group: "wei", hp: 3, maxHp: 3, skills: ["my_jingshi", "my_zhongzhi"], img: "image/character/xunyu.jpg" },
      my_jian_kongrong: { sex: "male", group: "qun", hp: 4, maxHp: 4, skills: ["my_xiangran", "my_gaoyi"], img: "image/character/kongrong.jpg" }
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
      my_xiangran: "想然",
      my_gaoyi: "高议",
      my_fengjue_info: "限定技，转换技。阳：一名角色的回合开始时，你可交给其任意张（至少一张）手牌或装备牌，对其造成等量伤害，然后按其已损失体力固定X，其下次造成伤害+X，下次从牌堆获得牌+X。阴：伤害即将令一名角色濒死时，你可防止之，令其获得场上X张牌（装备区、判定区，不足全得，X为奉绝累计发动次数），将其移出游戏，直到伤害来源回合开始；若至下一轮结束仍未返回，其死亡。每次发动后转换。",
      my_weijing_info: "锁定技，一名角色濒死结算后，重置奉绝的限定次数（不重置阴阳状态及累计发动次数）。",
      my_fumeng_info: "锁定技，转换技，初始为阳。一名角色脱离濒死后转换。阳：普通锦囊牌额外结算一次。阴：所有伤害改为失去等量体力。",
      my_yifang_info: "当你成为其他角色的锦囊牌目标时，你可将一张手牌或装备牌当你本轮未使用过的锦囊牌使用（含延时锦囊）。受到伤害后，令一名其他角色回复1点体力。",
      my_jingshi_info: "转换技，初始为阳，每次发动后转换。阳：准备阶段或受到伤害后，你可令一名角色摸X张牌（X为其体力上限，至多5）。阴：一名角色回合结束时，其弃置本回合获得数量的手牌或装备牌，不足则全弃。",
      my_zhongzhi_info: "锁定技，每个角色回合内，弃牌堆首次同时包含基本、锦囊、装备三类牌时，你依次执行：①受到1点无来源伤害；②转换自己的一个转换技状态。若因此进入濒死并脱离，今后颠倒两项顺序（再次满足则再次颠倒）。",
      my_xiangran_info: "转换技，初始为阴，每次发动后转换。阴：一名角色回合结束时，你可声明其本回合未使用过的一种普通锦囊及合法目标，视为其使用之。阳：一名角色在其回合内首次使用锦囊时，你可令此牌无效。",
      my_gaoyi_info: "锁定技，其他角色发动一个技能后，若这不是该角色本轮首次发动该技能，你摸一张牌。"
    }
  };
}
const jinSimayi = createJinSimayiPack({ lib, game, ui, get, _status });
const moZhangjiao = createMoZhangjiaoPack({ lib, game, ui, get, _status });
const jianSeries = createJianSeriesPack({ lib, game, ui, get, _status });
game.import("character", function() {
  return {
    name: "standard",
    connect: true,
    character: { ...characters, ...jinSimayi.character, ...moZhangjiao.character, ...jianSeries.character },
    characterSort: {
      standard: { ...characterSort, my_jin_custom: ["my_jin_simayi"], my_mo_custom: ["my_mo_zhangjiao"], my_jian_custom: Object.keys(jianSeries.character) }
    },
    characterFilter: {
      ...characterFilters,
      ...Object.fromEntries(Object.keys(jianSeries.character).map((name) => [name, (mode) => mode === "identity" && !_status.connectMode])),
      my_jin_simayi: (mode) => mode === "identity" && !_status.connectMode,
      my_mo_zhangjiao: (mode) => mode === "identity" && !_status.connectMode
    },
    characterTitle: { ...characterTitles, ...jianSeries.characterTitle },
    dynamicTranslate: { ...dynamicTranslates },
    characterIntro: { ...characterIntro },
    card: { ...cards },
    skill: { ...skills, ...jinSimayi.skill, ...moZhangjiao.skill, ...jianSeries.skill },
    perfectPair: { ...perfectPairs },
    translate: { ...translates, ...voices, ...characterSortTranslate, ...jinSimayi.translate, ...moZhangjiao.translate, ...jianSeries.translate },
    pinyins: { ...pinyins }
  };
});
