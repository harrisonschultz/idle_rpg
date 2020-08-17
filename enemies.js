export const enemies = {
  feeder: {
    prop: "feeder",
    description: "They want you to win, but they need to at least not be afk.",
    attrs: {
      agi: { label: "Agility", level: 1, exp: 0, expNeeded: 0 },
      int: { label: "Intelligence", level: 1, exp: 0, expNeeded: 0 },
      lck: { label: "Luck", level: 1, exp: 0, expNeeded: 0 },
      per: { label: "Perception", level: 1, exp: 0, expNeeded: 0 },
      str: { label: "Strength", level: 1, exp: 0, expNeeded: 0 },
    },

    job: {
      attack: {
        speed: 10, // Speed in game ticks to attack again.
        criticalDamage: 1.5,
        dmgModifiers: [{ name: "int", modifier: 0.2 }],
        variance: 0.1, // gives attacks a range of damage by 10% either up or down.
      },
    },

    stats: {
      health: { current: 5, max: 1 },
      stamina: { current: 1, max: 1 },
      mana: { current: 1, max: 1 },
    },
    reward: { exp: 0.3 },
  },

  toxicGamer: {
    prop: "toxicGamer",
    description: 'Colloquially known as "dumbass teammate", they do at least try harder than the feeder.',
    attrs: {
      agi: { label: "Agility", level: 1, exp: 0, expNeeded: 0 },
      int: { label: "Intelligence", level: 1, exp: 0, expNeeded: 0 },
      lck: { label: "Luck", level: 1, exp: 0, expNeeded: 0 },
      per: { label: "Perception", level: 1, exp: 0, expNeeded: 0 },
      str: { label: "Strength", level: 1, exp: 0, expNeeded: 0 },
    },

    job: {
      attack: {
        speed: 16, // Speed in game ticks to attack again.
        criticalDamage: 2.0,
        dmgModifiers: [
          { name: "int", modifier: 0.3 },
          { name: "luck", modifier: 0.1 },
        ],
        variance: 0.1, // gives attacks a range of damage by 10% either up or down.
      },
    },

    stats: {
      health: { current: 3, max: 1 },
      stamina: { current: 1, max: 1 },
      mana: { current: 1, max: 1 },
    },
    reward: { exp: 0.3 },
  },

  afk: {
    prop: "afk",
    description: "This person has completed checked out.",
    attrs: {
      agi: { label: "Agility", level: 1, exp: 0, expNeeded: 0 },
      int: { label: "Intelligence", level: 1, exp: 0, expNeeded: 0 },
      lck: { label: "Luck", level: 1, exp: 0, expNeeded: 0 },
      per: { label: "Perception", level: 1, exp: 0, expNeeded: 0 },
      str: { label: "Strength", level: 1, exp: 0, expNeeded: 0 },
    },

    job: {
      attack: {
        speed: 30, // Speed in game ticks to attack again.
        criticalDamage: 1.5,
        dmgModifiers: [{ name: "int", modifier: 0 }],
        variance: 0.1, // gives attacks a range of damage by 10% either up or down.
      },
    },

    stats: {
      health: { current: 3, max: 1 },
      stamina: { current: 1, max: 1 },
      mana: { current: 1, max: 1 },
    },
    reward: { exp: 0.3 },
  },
};
