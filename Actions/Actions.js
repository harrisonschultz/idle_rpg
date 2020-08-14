import { setAction } from "/Character/Character.js";

(async () => {
  const res = await fetch("/Actions/Actions.html");
  const textTemplate = await res.text();
  const HTMLTemplate = new DOMParser().parseFromString(textTemplate, "text/html").querySelector("template");

  class Actions extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      const shadowRoot = this.attachShadow({ mode: "open" });
      // Clone the template and the cloned node to the shadowDOM's root.
      const instance = HTMLTemplate.content.cloneNode(true);
      shadowRoot.appendChild(instance);

      document.addEventListener("action-changed", this.render);
      this.initialRender();
    }

    initialRender = () => {
      this.shadowRoot.getElementById("str-train-1").onclick = () => {
        setAction("str-train-1");
      };
      this.shadowRoot.getElementById("agi-train-1").onclick = () => {
        setAction("agi-train-1");
      };
      this.shadowRoot.getElementById("int-train-1").onclick = () => {
        setAction("int-train-1");
      };
      this.shadowRoot.getElementById("per-train-1").onclick = () => {
        setAction("per-train-1");
      };
      this.shadowRoot.getElementById("rest").onclick = () => {
        // Set rest twice, to prevent resting from reverting back to the previous action.
        setAction("rest");
        setAction("rest");
      };
      
      this.render();
    };

    render = () => {
      this.shadowRoot.getElementById("action-description").innerHTML = actions[window.player.action].description;
    };
  }

  customElements.define("actions-list", Actions);
})();

export const actions = {
  "str-train-1": {
    type: "train",
    description: "Lifting Weights",
    attrs: [{ name: "str", value: 0.01 }],
    stats: [{ name: "fatigue", value: -0.1 }],
  },

  "agi-train-1": {
    type: "train",
    description: "Running",
    attrs: [{ name: "agi", value: 0.01 }],
    stats: [{ name: "fatigue", value: -0.1 }],
  },

  "int-train-1": {
    type: "train",
    description: "Studying",
    attrs: [{ name: "int", value: 0.01 }],
    stats: [{ name: "fatigue", value: -0.1 }],
  },

  "per-train-1": {
    type: "train",
    description: "Watching Birds",
    attrs: [{ name: "per", value: 0.01 }],
    stats: [{ name: "fatigue", value: -0.1 }],
  },

  rest: {
    type: "stat",
    description: "Resting",
    stats: [{ name: "fatigue", value: 0.3 }],
    whenResourcesMax: () => setAction(window.player.prevAction),
  },
};
