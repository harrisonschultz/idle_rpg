import { secondaryAttributes, getAnyJob } from "./Character/Character.js";

export const effects = {
   opportunistic: {
      label: "Opportunistic",
      key: "opportunistic",
      type: "criticalChance",
      func: (data) => 100,
      duration: 25,
   },
   flameLash: {
      label: "Flame Lash",
      key: "flameLash",
      type: "stat",
      func: (data) => {
         const { stat, char } = data;
         if (stat.key === "health") {
            console.log(
               "Losing health",
               `${stat.current}/${stat.max} ${stat.current - stat.max * getAnyJob("student").level.level}`
            );
            // Lose 1% health per tick
            return stat.current - stat.max * getAnyJob("student").level.level;
         }
      },
      duration: 80,
   },
};
