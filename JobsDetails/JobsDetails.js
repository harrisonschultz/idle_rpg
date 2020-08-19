import {
   getJob,
   getJobProgress,
   getSkillPoints,
   isSkillEquipped,
   isSkillUnlocked,
   unequipSkill,
   equipSkill,
   purchaseSkill,
} from "../Character/Character.js";
import { getAttackDamageRange } from "../Combat/Combat.js";
import { ProgressBar } from "../components/ProgressBar/ProgressBar.js";
import { theme } from "../theme.js";
import { jobs } from "../Jobs/Jobs.js";
import { Button } from "../components/Button/Button.js";

export class JobsDetails extends HTMLElement {
   constructor(job, options) {
      super();

      this.job = job || getJob();
      this.options = options;

      document.addEventListener("job-changed", this.render);
      document.addEventListener("job-level", this.render);
      document.addEventListener("skill-unlocked", this.renderSkills);
      document.addEventListener("skill-equipped", this.renderSkills);
   }

   async connectedCallback() {
      const res = await fetch("JobsDetails/JobsDetails.html");
      const textTemplate = await res.text();
      const HTMLTemplate = new DOMParser().parseFromString(textTemplate, "text/html").querySelector("template");
      const shadowRoot = this.attachShadow({ mode: "open" });

      // Clone the template and the cloned node to the shadowDOM's root.
      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      this.intialRender();
   }

   intialRender = () => {
      const attrBar = new ProgressBar(
         "job-progress",
         () => getJobProgress(window.player, this.job.prop),
         theme.colors.pastelYellow,
         { value: true, resetOnOverflow: true },
         { height: "4px" }
      );

      this.shadowRoot.getElementById(`jobs-bar`).appendChild(attrBar);
      attrBar.className = "bar";

      // Job skills panel
      const skillTree = this.shadowRoot.getElementById("job-skill-tree");
      for (const skill of this.job.skills) {
         const skillDiv = document.createElement("div");
         const skillAction = document.createElement("div");
         const skillInfo = document.createElement("div");
         const skillLabel = document.createElement("div");
         const skillDescription = document.createElement("div");
         const skillFlavor = document.createElement("div");
         const skillCost = document.createElement("div");
         const tooltip = document.createElement("div");

         tooltip.id = `skill-tooltip-${skill.key}`;

         skillAction.className = "skill-action-container";
         skillAction.id = `skill-action-${skill.key}`;
         skillDiv.className = "skill-container";
         skillDiv.id = `skills-${skill.key}`;

         skillInfo.className = "skill-info";
         skillInfo.id = `skill-info-${skill.key}`;
         skillInfo.onmouseenter = () => {
            this.shadowRoot
               .getElementById(`skill-info-${skill.key}`)
               .appendChild(this.shadowRoot.getElementById(`skill-tooltip-${skill.key}`));
         };

         skillLabel.className = "skill-label";
         skillLabel.innerHTML = skill.label;

         skillDescription.className = "skill-description";
         skillDescription.innerHTML = skill.description;

         skillCost.className = "skill-cost";
         skillCost.innerHTML = skill.cost;

         skillFlavor.className = "skill-flavor";
         skillFlavor.innerHTML = skill.flavor;

         skillDiv.appendChild(skillInfo);
         skillInfo.appendChild(skillLabel);
         skillInfo.appendChild(skillCost);
         tooltip.appendChild(skillDescription);
         tooltip.appendChild(skillFlavor);

         if (isSkillEquipped(skill)) {
            skillDiv.className += "skill-equipped";

            // Add unequip option
            const button = new Button(skill, "skills", (skl) => unequipSkill(skl), "Unequip");
            skillAction.title = "Unequip";
            skillAction.appendChild(button);
         } else if (isSkillUnlocked(skill)) {
            skillDiv.className += "skill-unlocked";

            // Add equip option
            const button = new Button(skill, "skills", (skl) => equipSkill(skl), "Equip");
            skillAction.title = "Equip";
            skillAction.appendChild(button);
         } else {
            // Add purchase option
            const button = new Button(skill, "skills", (skl) => purchaseSkill(this.job, skl), "Purchase");
            skillAction.title = "Purchase";
            skillAction.appendChild(button);
         }

         skillDiv.appendChild(skillAction);
         skillTree.appendChild(skillDiv);
      }

      this.render();
   };

   renderSkills = () => {
      // Job skills panel
      for (const skill of this.job.skills) {
         const skillDiv = this.shadowRoot.getElementById(`skills-${skill.key}`);

         if (skill.key == "pliable") {
            console.log("test");
         }

         skillDiv.className = "skill-container";
         if (isSkillEquipped(skill)) {
            skillDiv.className += "skill-equipped";
            // Remove and add new Button if it should be changed.
            const skillAction = this.shadowRoot.getElementById(`skill-action-${skill.key}`);
            if (skillAction.title !== "Unequip") {
               skillAction.removeChild(skillAction.firstChild);
               // Add unequip option
               const button = new Button(skill, "skills", (skl) => unequipSkill(skl), "Unequip");
               skillAction.appendChild(button);
            }
         } else if (isSkillUnlocked(skill)) {
            skillDiv.className += "skill-unlocked";
            // Remove and add new Button if it should be changed.
            const skillAction = this.shadowRoot.getElementById(`skill-action-${skill.key}`);
            if (skillAction.title !== "Equip") {
               skillAction.removeChild(skillAction.firstChild);
               // Add unequip option
               const button = new Button(skill, "skills", (skl) => equipSkill(skl), "Equip");
               skillAction.appendChild(button);
            }
         } else {
            // Remove and add new Button if it should be changed.
            const skillAction = this.shadowRoot.getElementById(`skill-action-${skill.key}`);
            if (skillAction.title !== "Purchase") {
               skillAction.removeChild(skillAction.firstChild);
               // Add purchase option
               const button = new Button(skill, "skills", (skl) => purchaseSkill(this.job, skl), "Purchase");
               skillAction.appendChild(button);
            }
         }
      }
   };

   render = () => {
      if (this.options && this.options.self) {
         this.job = getJob();
      }

      if (this.shadowRoot) {
         this.shadowRoot.getElementById("jobs-label").innerHTML = this.job.label;
         this.shadowRoot.getElementById("jobs-value").innerHTML = `${this.job.level.level}`;
         this.shadowRoot.getElementById("job-skill-points-value").innerHTML = getSkillPoints(this.job.prop);

         // Add job stats
         const dmg = this.shadowRoot.getElementById("job-attack-damage-value");
         const attackSpeed = this.shadowRoot.getElementById("job-attack-speed-value");
         const critDmg = this.shadowRoot.getElementById("job-crit-damage-value");

         const damageRange = getAttackDamageRange(this.job);
         dmg.innerHTML = `${damageRange.min} - ${damageRange.max}`;
         attackSpeed.innerHTML = `${this.job.attack.speed / 10}s`;
         critDmg.innerHTML = `${this.job.attack.criticalDamage * 100}%`;
      }
   };
}

customElements.define("jobs-details", JobsDetails);
