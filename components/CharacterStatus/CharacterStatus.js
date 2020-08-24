import {
   setAction,
   getAttr,
   setAvailableActions,
   secondaryAttributes,
   getSecondaryAttributeValue,
   getStat,
   getEffects,
   getStats,
} from "../../Character/Character.js";
import { ProgressBar } from "../ProgressBar/ProgressBar.js";
import { theme } from "../../theme.js";

export class CharacterStatus extends HTMLElement {
   constructor(char = window.player) {
      super();
      this.char = char;
   }

   async connectedCallback() {
      const res = await fetch("./components/CharacterStatus/CharacterStatus.html");
      const textTemplate = await res.text();
      const HTMLTemplate = new DOMParser().parseFromString(textTemplate, "text/html").querySelector("template");
      const shadowRoot = this.attachShadow({ mode: "open" });

      // Clone the template and the cloned node to the shadowDOM's root.
      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      document.addEventListener("attr-level", this.render);
      document.addEventListener("status-changed", this.renderBuffs);
      document.addEventListener("time-elapsed", this.renderBuffs);
      this.initialRender();
   }

   initialRender = () => {
      const statsColors = {
         health: theme.colors.pastelRed,
         mana: theme.colors.pastelBlue,
         stamina: theme.colors.pastelPaleGreen,
         fatigue: theme.colors.pastelPurple,
      };

      // Stat bars
      const statusContainer = this.shadowRoot.getElementById("character-status");
      for (const s in getStats(this.char)) {
         const statBar = new ProgressBar("stat-changed", () => getStat(s, this.char), statsColors[s], {
            label: s,
            value: true,
         });
         statBar.className = "bar";
         statusContainer.appendChild(statBar);
      }

      // Status (Buffs/Debuffs)
      const buffsContainer = document.createElement("div");
      buffsContainer.id = "buffs-container";
      const titleContainer = document.createElement("div");
      titleContainer.className = "title";
      titleContainer.innerHTML = "Buffs";

      for (const eff of getEffects(this.char)) {
         const effDiv = document.createElement("div");
         const effLabel = document.createElement("div");
         const effDuration = document.createElement("div");

         effDiv.className = "character-effect-row";
         effDiv.id = eff.key;
         effLabel.className = "character-effect-label";
         effDuration.className = "character-effect-duration";
         effDuration.id = `character-buff-duration-${eff.key}`;

         effLabel.innerHTML = eff.label;
         effDuration.innerHTML = `${eff.duration / 10}s`;

         effDiv.appendChild(effLabel);
         effDiv.appendChild(effDuration);
         buffsContainer.appendChild(effDiv);
      }
      statusContainer.appendChild(titleContainer);
      statusContainer.appendChild(buffsContainer);
   };

   renderBuffs = () => {
      const effects = getEffects();
      const buffsContainer = this.shadowRoot.getElementById("buffs-container");

      // Remove expired buffs
      for (const buffDiv of buffsContainer.children) {
         if (!effects.find((e) => e.key === buffDiv.id)) {
            buffDiv.remove();
         }
      }

      for (const eff of effects) {
         const effectDiv = buffsContainer.querySelector(`#character-buff-duration-${eff.key}`);

         // Update if component exists.
         if (effectDiv) {
            effectDiv.innerHTML = `${eff.duration / 10}s`;
         } else {
            const effDiv = document.createElement("div");
            const effLabel = document.createElement("div");
            const effDuration = document.createElement("div");
            effDiv.className = "character-effect-row";
            effDiv.id = eff.key;
            effLabel.className = "character-effect-label";
            effDuration.className = "character-effect-duration";
            effDuration.id = `character-buff-duration-${eff.key}`;

            effLabel.innerHTML = eff.label;
            effDuration.innerHTML = `${eff.duration / 10}s`;

            effDiv.appendChild(effLabel);
            effDiv.appendChild(effDuration);
            buffsContainer.appendChild(effDiv);
         }
      }
   };

   render = () => {};
}

customElements.define("character-status", CharacterStatus);
