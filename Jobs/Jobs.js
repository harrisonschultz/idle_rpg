import { getJob, getJobs, setJob, getJobProgress } from "../Character/Character.js";
import { ProgressBar } from "../components/ProgressBar/ProgressBar.js";
import { theme } from "../theme.js";
import { JobsDetails } from "../JobsDetails/JobsDetails.js";

export class JobsList extends HTMLElement {
  constructor() {
    super();

    document.addEventListener("job-level", this.render);
  }

  async connectedCallback() {
    const res = await fetch("Jobs/Jobs.html");
    const textTemplate = await res.text();
    const HTMLTemplate = new DOMParser().parseFromString(textTemplate, "text/html").querySelector("template");
    const shadowRoot = this.attachShadow({ mode: "open" });

    // Clone the template and the cloned node to the shadowDOM's root.
    const instance = HTMLTemplate.content.cloneNode(true);
    shadowRoot.appendChild(instance);

    this.intialRender();
  }

  intialRender = () => {
    const tier1 = this.shadowRoot.getElementById("jobs-tier-1");
    const tier2 = this.shadowRoot.getElementById("jobs-tier-2");
    const tier3 = this.shadowRoot.getElementById("jobs-tier-3");
    const tier4 = this.shadowRoot.getElementById("jobs-tier-4");
    const jobTiers = [tier1, tier2, tier3, tier4]

    for (const j in getJobs()) {
      const job = jobs[j];
      const jobDiv = document.createElement("div");
      const jobProgress = new JobsDetails(job);

      jobDiv.id = `jobs-${j}`;
      jobDiv.className = "jobs-item";
      jobDiv.appendChild(jobProgress);
      jobTiers[job.tier - 1].appendChild(jobDiv)

      const button = document.createElement('button')
      button.className = 'jobs-select-button'
      button.innerHTML = 'Select'
      button.onclick = () => setJob(j);
      jobDiv.appendChild(button)
    }
  };

  render = () => {};
}

customElements.define("jobs-list", JobsList);

export const jobs = {
  child: {
    label: "Child",
    prop: "child",
    description: "You are child with no specific strengths.",
    level: { level: 1, exp: 0, expNeeded: 1.1 },
    tier: 1,
    skillPoints: 0,
    attack: {
      speed: 15,
      criticalDamage: 1.5,
      dmgModifiers: [
        { name: "str", modifier: 0.3 },
        { name: "agi", modifier: 0.3 },
      ],
      variance: 0.1, // gives attacks a range of damage by 10% either up or down.
    },
  },

  urchin: {
    label: "Urchin",
    prop: "urchin",
    description: "As an urchin you have fend for yourself. Your strength and speed will be your only allies.",
    level: { level: 1, exp: 0, expNeeded: 1.1 },
    skillPoints: 0,
    tier: 2,
    attack: {
      speed: 15,
      criticalDamage: 1.5,
      dmgModifiers: [
        { name: "str", modifier: 0.35 },
        { name: "agi", modifier: 0.45 },
      ],
      variance: 0.1, // gives attacks a range of damage by 10% either up or down.
    },
  },

  student: {
    label: "Student",
    prop: "student",
    description: "A student of the world, a young mind to be molded.",
    level: { level: 1, exp: 0, expNeeded: 1.1 },
    skillPoints: 0,
    tier: 2,
    attack: {
      speed: 20,
      criticalDamage: 1.8,
      dmgModifiers: [{ name: "int", modifier: 1 }],
      variance: 0.15, // gives attacks a range of damage by 10% either up or down.
    },
  },
};
