import { isActionUnlocked } from "../../Actions/Actions.js";

export class PurchaseButton extends HTMLElement {
   constructor(item, prefix, onClick, onPurchase, options = {}) {
      super();

      this.action = item;
      this.idPrefix = prefix;
      this.onClick = onClick;
      this.options = options;

      document.addEventListener("gold-changed", this.render);
   }

   async connectedCallback() {
      const res = await fetch("./components/PurchaseButton/PurchaseButton.html");
      const textTemplate = await res.text();
      const HTMLTemplate = new DOMParser().parseFromString(textTemplate, "text/html").querySelector("template");

      const shadowRoot = this.attachShadow({ mode: "open" });
      // Clone the template and the cloned node to the shadowDOM's root.
      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      this.initialRender();
   }

   initialRender = () => {
      const actionsContainer = this.shadowRoot.getRootNode();
      const button = document.createElement("button");
      const tt = document.createElement("div");

      button.id = `${this.idPrefix}-${this.action.prop}`;
      button.innerHTML = this.options.label || this.action.label;

      actionsContainer.appendChild(button);

      this.render();
   };

   render = () => {
      const button = this.shadowRoot.getElementById(`${this.idPrefix}-${this.action.prop}`);

      if (isActionUnlocked(this.action)) {
         button.className = "action-button";

         button.onclick = (event) => {
            event.target.animate([{ boxShadow: " 0px 0px 3px 2px rgba(255,255,255, 0.25)" }, { boxShadow: "none" }], {
               duration: 1000,
               iterations: 1,
            });
            this.onClick(this.action);
         };
      } else {
         button.className = "action-button-purchase";

         button.onmouseenter = () => {
            const tt = this.shadowRoot.getElementById(`button-tooltip-${this.action.key}`);
            tt.style.display = "flex";
            tt.style.opacity = 1;
         };

         button.onmouseleave = () => {
            const tt = this.shadowRoot.getElementById(`button-tooltip-${this.action.key}`);
            tt.style.display = "none";
            tt.style.opacity = 0;
         };

         button.onclick = (event) => {
            event.target.animate([{ boxShadow: " 0px 0px 3px 2px rgba(255,255,255, 0.25)" }, { boxShadow: "none" }], {
               duration: 1000,
               iterations: 1,
            });
            this.onPurchase(this.action);
         };
      }
   };
}

customElements.define("purchase-button", PurchaseButton);
