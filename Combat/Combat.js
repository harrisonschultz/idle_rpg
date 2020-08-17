import {
  getAttr,
  getJob,
  setStatCurrent,
  setCombatStartTick,
  getCombatStartTick,
  setCurrentEnemy,
  getSecondaryAttribute,
  addAdventureProgress,
  getAdventure,
  getStat,
  setAction,
  addJobExp,
} from "../Character/Character.js";
import { getRandomEnemy } from "../Adventure/Adventure.js";

export class Combat extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    const res = await fetch("./Combat/Combat.html");
    const textTemplate = await res.text();
    const HTMLTemplate = new DOMParser().parseFromString(textTemplate, "text/html").querySelector("template");
    const shadowRoot = this.attachShadow({ mode: "open" });

    // Clone the template and the cloned node to the shadowDOM's root.
    const instance = HTMLTemplate.content.cloneNode(true);
    shadowRoot.appendChild(instance);
    this.render();
  }

  render() {}
}

customElements.define("combat-sheet", Combat);

export function fight(tick) {
  const adventure = getAdventure();
  // Get a random enemy from the current adventure
  if (!adventure.currentEnemy) {
    setCurrentEnemy(getRandomEnemy(adventure));
    setCombatStartTick(tick);
  }

  const combatTick = tick - getCombatStartTick();

  // Check for attacks
  // Player always attack first if both attack at the same time
  const playerJob = getJob();
  if (combatTick % playerJob.attack.speed === 0) {
    console.log("player attack");
    // Player attack
    setStatCurrent(
      "health",
      calculateDamage(playerJob.attack, window.player, adventure.currentEnemy),
      adventure.currentEnemy
    );

    // Check for enemy death
    if (getStat("health", adventure.currentEnemy) <= 0) {
      enemyDefeated(adventure.currentEnemy);
    }
  }
  const enemyJob = getJob(adventure.currentEnemy);
  if (combatTick % enemyJob.attack.speed === 0) {
    console.log("player hit");
    const damage = calculateDamage(enemyJob.attack, adventure.currentEnemy, window.player);
    console.log(damage);
    // Enemy attack
    setStatCurrent("health", damage);

    // Check for player death
    if (getStat("health") <= 0) {
      playerDeath(adventure.currentEnemy);
    }
  }
}

function enemyDefeated(currentEnemy) {
  awardPlayer("enemy-death", currentEnemy);

  // Clear enemy
  setCurrentEnemy();

  // Move ahead
  addAdventureProgress(1);
}

function playerDeath() {
  setAction("rest");
}

function awardPlayer(enemy) {
  addJobExp(enemy.reward.exp);
}

export function calculateDamage(attack, attacker, defender) {
  let baseDmg = 0;
  let finalDmg;

  for (const attr of attack.dmgModifiers) {
    console.log(getAttr(attr.name).level);
    console.log(attr.modifier);
    baseDmg += getAttr(attr.name).level * attr.modifier;
  }

  finalDmg = baseDmg;

  const critChance = getSecondaryAttribute("criticalChance", attacker);
  const blockChance = getSecondaryAttribute("block", defender);
  const deflectChance = getSecondaryAttribute("deflect", defender);
  const dodgeChance = getSecondaryAttribute("dodge", defender);

  // Roll for on hit effects
  const critRoll = Math.random() * 100;
  const blockRoll = Math.random() * 100;
  const deflectRoll = Math.random() * 100;
  const dodgeRoll = Math.random() * 100;

  // Check rolls
  if (critRoll <= critChance) {
    finalDmg = finalDmg * attack.criticalDamage;
  }

  // Check for block
  // If Block then check for deflect
  if (blockRoll <= blockChance) {
    finalDmg = 0;
    if (deflectRoll <= deflectChance) {
      // Deflect
    }
  }

  // Check for dodge
  if (dodgeRoll <= dodgeChance) {
    finalDmg = 0;
  }

  return finalDmg;
}
