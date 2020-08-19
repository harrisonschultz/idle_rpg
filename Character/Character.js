import { ProgressBar } from "../components/ProgressBar/ProgressBar.js";
import { theme } from "../theme.js";
import { adventures } from "../Adventure/Adventure.js";
import { JobsDetails } from "../JobsDetails/JobsDetails.js";

const STR_HEALTH_MODIFIER = 1;
const INT_MANA_MODIFIER = 1;
const AGI_STAMINA_MODIFIER = 1;

(async () => {
  const res = await fetch("./Character/Character.html");
  const textTemplate = await res.text();
  const HTMLTemplate = new DOMParser().parseFromString(textTemplate, "text/html").querySelector("template");

  class Character extends HTMLElement {
    constructor() {
      super();

      if (window.player) {
        this.attrs = window.player.attrs;
        this.level = window.player.level;
        this.stats = window.player.stats;
      }

      document.addEventListener("attr-level", () => this.setMaxStat("health", "str", STR_HEALTH_MODIFIER));
      document.addEventListener("attr-level", () => this.setMaxStat("mana", "int", INT_MANA_MODIFIER));
      document.addEventListener("attr-level", () => this.setMaxStat("stamina", "agi", AGI_STAMINA_MODIFIER));
      document.addEventListener("attr-level", this.render);
    }

    connectedCallback() {
      const shadowRoot = this.attachShadow({ mode: "open" });

      // Clone the template and the cloned node to the shadowDOM's root.
      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      this.initialRender();
    }

    initialRender = () => {
      // Create the progress bars.
      const statsColors = {
        health: theme.colors.pastelRed,
        mana: theme.colors.pastelBlue,
        stamina: theme.colors.pastelPaleGreen,
        fatigue: theme.colors.pastelPurple,
      };

      // Stat bars
      for (const s in window.player.stats) {
        const statBar = new ProgressBar("stat-changed", () => getStat(s), statsColors[s], {
          label: s,
          value: true,
        });
        this.shadowRoot.getElementById(`${s}-bar`).appendChild(statBar);
        statBar.className = "bar";
      }

      // Job details
      const jobDetails = new JobsDetails(undefined, {self: true})
      this.shadowRoot.getElementById("character-jobs-details").appendChild(jobDetails)

      // Attribute bars
      const attrContainer = this.shadowRoot.getElementById("attributes-container");
      for (const s in window.player.attrs) {
        const attr = window.player.attrs[s];
        const attrRow = document.createElement("div");
        const detailDiv = document.createElement("div");
        const labelDiv = document.createElement("div");
        const valueDiv = document.createElement("div");
        const barDiv = document.createElement("div");

        attrRow.className = "attribute";
        detailDiv.className = "attribute-details";
        labelDiv.className = "attribute-label";
        labelDiv.innerHTML = attr.label;
        valueDiv.className = "attribute-value";
        valueDiv.id = s;
        barDiv.className = "bar";
        barDiv.id = `${s}-bar`;

        const attrBar = new ProgressBar(
          "attr-changed",
          () => getAttrProgress(s),
          theme.colors.pastelGreen,
          { value: false },
          { height: "4px" }
        );
        attrBar.className = "bar";

        attrContainer.appendChild(attrRow);
        attrRow.appendChild(detailDiv);
        detailDiv.appendChild(labelDiv);
        detailDiv.appendChild(valueDiv);
        attrRow.appendChild(barDiv);
        barDiv.appendChild(attrBar);
      }

      this.render();
    };

    /*
      @param - Heal sets whether or not increase max hp also raises current by the same amount.
    */

    setMaxStat(stat, attr, mod, heal = true) {
      // Strength increases max hp.
      // Maybe also job modifier?
      const health = getStat(stat);
      const str = getAttr(attr);
      const strHealthModifier = mod;
      const baseHp = 1;
      let newHealthMax;
      let healthIncrease = 0;

      newHealthMax = str.level * strHealthModifier;
      if (health.max !== newHealthMax) {
        const healthDifference = newHealthMax - health.max;
        const newHealth = { ...health };
        newHealth.max = newHealthMax;

        if (heal) {
          newHealth.current += healthDifference;
        }

        setStat(stat, newHealth);
        this.render();
      }
    }

    render = () => {
      if (this.shadowRoot) {
        for (var key in player.attrs) {
          this.shadowRoot.getElementById(key).innerHTML = player.attrs[key].level;
        }
      }
    };
  }

  customElements.define("character-sheet", Character);
})();

export function getMaxHealth(actions) {
  window.player.availableActions = actions;
}

export function setAvailableActions(actions) {
  window.player.availableActions = actions;
}

export function getStat(stat, char = window.player) {
  return char.stats[stat];
}

export function setStat(stat, statData) {
  window.player.stats[stat] = statData;
  statChange();
}

export function completeAdventure() {
  resetAdventure();
  adventureChanged();
  setAction("rest");
}

export function setCurrentEnemy(enemy) {
  window.player.adventure.currentEnemy = enemy;
}

export function addStatCurrent(stat, value, char = window.player) {
  char.stats[stat].current += value;
  if (char.stats[stat].current > char.stats[stat].max) {
    char.stats[stat].current = char.stats[stat].max;
  } else if (char.stats[stat].current < 0) {
    char.stats[stat].current = 0;
  }
  statChange();
}

export function subtractStatCurrent(stat, value, char = window.player) {
  char.stats[stat].current -= value;
  if (char.stats[stat].current > char.stats[stat].max) {
    char.stats[stat].current = char.stats[stat].max;
  } else if (char.stats[stat].current < 0) {
    char.stats[stat].current = 0;
  }
  statChange();
}

export function getAttr(attr, char = window.player) {
  return char.attrs[attr];
}

export function getJobProgress(char = window.player, jobName = undefined) {
  let job = getJob();
  if (jobName) {
    job = getAnyJob(jobName, char);
  }
  return { current: job.level.exp, max: job.level.expNeeded };
}

export function getAnyJob(jobName, char = window.player) {
  return char.jobs[jobName];
}

export function getJob(char = window.player) {
  return char.jobs[char.job];
}

export function addJobExp(exp, level = false) {
  const job = getJob();
  // Higher tier jobs require more exp
  const expMultiplier = job.tier * 3;

  // Add exp and handle levels
  const totalExpNeeded = 1 * Math.pow(1.1, job.level.level * expMultiplier);
  const currentExp = job.level.exp;
  const expLeft = totalExpNeeded - (exp + currentExp);

  // Set the expNeeded
  job.level.expNeeded = totalExpNeeded;

  if (expLeft < 0) {
    // If expLeft is less than zero than we have leveled up
    // Recursively call the function to continue to level.
    // Base case is when exp amount does not cause us to level up.
    job.level.level++;
    job.level.exp = 0;
    addJobExp(Math.abs(expLeft), true);
  } else {
    // Base case hit, call send out event for components to render.
    job.level.exp = currentExp + exp;
    jobProgress();
    if (level) {
      levelUpJob();
    }
  }
}

export function levelUpJob() {
  // Add skill points
  getJob().skillPoints++;

  jobLevel();
}

export function getJobs(char = window.player) {
  return char.jobs
}

export function setJob(job) {
  window.player.job = job
  jobChanged()
  jobProgress()
}

export function getSkillPoints(jobName) {
  return window.player.jobs[jobName].skillPoints;
}

export function setCombatStartTick(tick) {
  window.player.combatStartTick = tick;
}

export function getCombatStartTick() {
  return window.player.combatStartTick;
}

export function getSecondaryAttribute(prop, char = window.player) {
  const attr = secondaryAttributes[prop];
  return getSecondaryAttributeValue(attr.attributes, char);
}

export function getSkills() {
  return window.player.skills
}

export function useSkills(type, data) {
  const skills = getSkills()

  for (const skill of skills) {
    if (skill.type === type) {
      data = skill.func(data)
    }
  }

  return data
}

export function getSecondaryAttributeValue(attrs, char = window.player) {
  let value = 0;
  for (const a of attrs) {
    value += getAttr(a.name, char).level * a.modifier;
  }
  return value;
}

export function getAttrProgress(attr) {
  return { current: window.player.attrs[attr].exp, max: window.player.attrs[attr].expNeeded };
}

export function addAttrExp(attr, exp, level = false) {
  const { attrs } = window.player;

  // Add exp and handle levels
  const totalExpNeeded = 1 * Math.pow(1.1, attrs[attr].level);
  const currentExp = attrs[attr].exp;
  const expLeft = totalExpNeeded - (exp + currentExp);

  // Set the expNeeded
  attrs[attr].expNeeded = totalExpNeeded;

  if (expLeft < 0) {
    // If expLeft is less than zero than we have leveled up
    // Recursively call the function to continue to level.
    // Base case is when exp amount does not cause us to level up.
    attrs[attr].level++;
    attrs[attr].exp = 0;
    addAttrExp(attr, Math.abs(expLeft), true);
  } else {
    // Base case hit, call send out event for components to render.
    attrs[attr].exp = currentExp + exp;
    attrChange();
    if (level) {
      attrLevel();
    }
  }
}

export function modifyStat(stat, value, whenResourcesEmpty = undefined, whenResourcesMax = undefined) {
  const { stats } = window.player;
  stats[stat].current += value;

  if (stats[stat].current > stats[stat].max) {
    stats[stat].current = stats[stat].max;
    if (whenResourcesMax) {
      whenResourcesMax();
    }
  }

  if (stats[stat].current < 0) {
    stats[stat].current = 0;
    if (whenResourcesEmpty) {
      whenResourcesEmpty();
    } else {
      // By default just stop the action
      setAction("rest");
    }
  }

  statChange();
}

export function rest() {
  const { stats } = window.player;
  const statsComplete = [];

  // Restore all stats by a percentage
  for (const stat in window.player.stats) {
    // Restore each stat by 5%
    stats[stat].current += stats[stat].max * 0.05;

    // When stat is max
    if (stats[stat].current > stats[stat].max) {
      stats[stat].current = stats[stat].max;
      statsComplete.push(stat);
    }
  }

  // Finished Resting
  if (statsComplete.length === Object.keys(window.player.stats).length) {
    setAction(window.player.prevAction);
  }

  useSkills('onRest');

  statChange();
}

export function setAction(action) {
  window.player.prevAction = window.player.action;
  window.player.action = action;

  if (action === "rest") {
    // Reset adventure progress on rest
    resetAdventure();
  }

  actionChange();
}

export function resetAdventure() {
  if (window.player.adventure) {
    window.player.adventure.currentEnemy = undefined;
    window.player.adventure.progress.current = 0;
  }
}

export function getAdventure() {
  return window.player.adventure;
}

export function getAdventureProgress() {
  return window.player.adventure.progress;
}

export function addAdventureProgress(val) {
  const { progress } = window.player.adventure;
  let newDistance = progress.current + val;

  if (newDistance > progress.max) {
    completeAdventure();
  } else {
    setAdventureProgress(newDistance);
  }
}

export function setAdventureProgress(val) {
  window.player.adventure.progress.current = val;
  adventureProgress();
}

export function setAdventure(adv) {
  window.player.adventure = { ...adv };
  adventureChanged();
  adventureProgress();
}

export function actionChange(data = {}) {
  const event = new CustomEvent("action-changed", data);
  document.dispatchEvent(event);
}

export function charChange(data = {}) {
  const event = new CustomEvent("character-changed", data);
  document.dispatchEvent(event);
}

export function statChange(data = {}) {
  const event = new CustomEvent("stat-changed", data);
  document.dispatchEvent(event);
}

export function jobLevel(data = {}) {
  const event = new CustomEvent("job-level", data);
  document.dispatchEvent(event);
}

export function jobProgress(data = {}) {
  const event = new CustomEvent("job-progress", data);
  document.dispatchEvent(event);
}

export function attrChange(data = {}) {
  const event = new CustomEvent("attr-changed", data);
  document.dispatchEvent(event);
}

export function adventureChanged(data = {}) {
  const event = new CustomEvent("adventure-changed", data);
  document.dispatchEvent(event);
}

export function adventureProgress(data = {}) {
  const event = new CustomEvent("adventure-progress", data);
  document.dispatchEvent(event);
}

export function attrLevel(data = {}) {
  const event = new CustomEvent("attr-level", data);
  document.dispatchEvent(event);
}

export function jobChanged(data = {}) {
  const event = new CustomEvent("job-changed", data);
  document.dispatchEvent(event);
}

export const secondaryAttributes = {
  criticalChance: {
    label: "Critical Chance",
    attributes: [
      { name: "per", modifier: 0.1 },
      { name: "lck", modifier: 1 },
    ],
  },
  balance: {
    label: "Balance",
    attributes: [
      { name: "str", modifier: 0.1 },
      { name: "agi", modifier: 0.1 },
    ],
  },
  dodge: {
    label: "Dodge",
    attributes: [
      { name: "per", modifier: 0.1 },
      { name: "agi", modifier: 0.07 },
    ],
  },
  block: {
    label: "Block",
    attributes: [
      { name: "per", modifier: 0.1 },
      { name: "str", modifier: 0.05 },
      { name: "agi", modifier: 0.05 },
    ],
  },
  deflect: {
    label: "Deflect",
    attributes: [
      { name: "str", modifier: 0.15 },
      { name: "agi", modifier: 0.08 },
    ],
  },
};
