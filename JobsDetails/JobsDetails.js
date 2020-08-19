import { getJob, getJobProgress, getSkillPoints } from '../Character/Character.js'
import { getAttackDamageRange } from '../Combat/Combat.js'
import { ProgressBar } from "../components/ProgressBar/ProgressBar.js";
import { theme } from '../theme.js';
import { jobs } from '../Jobs/Jobs.js'

export class JobsDetails extends HTMLElement {
  constructor(job, options) {
    super();

    this.job = job || getJob();
    this.options = options

    document.addEventListener('job-changed', this.render)
    document.addEventListener('job-level', this.render)
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
      { value: true, duration: 0.8, resetOnOverflow: true },
      { height: "4px" }
    );
    
    this.shadowRoot.getElementById(`jobs-bar`).appendChild(attrBar);
    attrBar.className = "bar";

   this.render();
  };

  render = () => {
    if (this.options && this.options.self) {
      this.job = getJob()
    }

    if(this.shadowRoot) {


    this.shadowRoot.getElementById("jobs-label").innerHTML = this.job.label
    this.shadowRoot.getElementById("jobs-value").innerHTML = `${this.job.level.level}`
    this.shadowRoot.getElementById("job-skill-points-value").innerHTML = getSkillPoints(this.job.prop)

     // Add job stats
     const dmg = this.shadowRoot.getElementById('job-attack-damage-value')
     const attackSpeed = this.shadowRoot.getElementById('job-attack-speed-value')
     const critDmg = this.shadowRoot.getElementById('job-crit-damage-value')
 
     const damageRange = getAttackDamageRange(this.job)
     dmg.innerHTML = `${damageRange.min} - ${damageRange.max}`
     attackSpeed.innerHTML = `${this.job.attack.speed / 10}s`
     critDmg.innerHTML = `${this.job.attack.criticalDamage * 100}%`
    }
  }
}

customElements.define("jobs-details", JobsDetails);

