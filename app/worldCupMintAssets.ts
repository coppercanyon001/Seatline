export const WORLD_CUP_MINT_ASSETS = {
  world: {
    pitch: "/models/world-cup-final/pitch.glb",
    straightStand: "/models/world-cup-final/straight-stand.glb",
    cornerStand: "/models/world-cup-final/corner-stand.glb",
    goal: "/models/world-cup-final/goal.glb",
    football: "/models/world-cup-final/football.glb",
    cornerFlag: "/models/world-cup-final/corner-flag.glb",
    trophy: "/models/world-cup-final/trophy.glb",
    confetti: "/models/world-cup-final/confetti.glb",
    teamDugout: "/models/world-cup-final/team-dugout.glb",
    pitchsideBoard: "/models/world-cup-final/pitchside-board.glb",
    equipmentStation: "/models/world-cup-final/equipment-station.glb",
  },
  characters: {
    spainOutfield: {
      model: "/models/world-cup-final/players/spain-outfield.glb",
      animations: {
        idle: "/animations/world-cup-final/spain-outfield/idle.glb",
        run: "/animations/world-cup-final/spain-outfield/run.glb",
        kick: "/animations/world-cup-final/spain-outfield/kick.glb",
        tackle: "/animations/world-cup-final/spain-outfield/tackle.glb",
        hit: "/animations/world-cup-final/spain-outfield/hit.glb",
        victory: "/animations/world-cup-final/spain-outfield/victory.glb",
      },
    },
    argentinaOutfield: {
      model: "/models/world-cup-final/players/argentina-outfield.glb",
      animations: {
        idle: "/animations/world-cup-final/argentina-outfield/idle.glb",
        run: "/animations/world-cup-final/argentina-outfield/run.glb",
        kick: "/animations/world-cup-final/argentina-outfield/kick.glb",
        tackle: "/animations/world-cup-final/argentina-outfield/tackle.glb",
        hit: "/animations/world-cup-final/argentina-outfield/hit.glb",
        victory: "/animations/world-cup-final/argentina-outfield/victory.glb",
      },
    },
    spainGoalkeeper: {
      model: "/models/world-cup-final/players/spain-goalkeeper.glb",
      animations: {
        idle: "/animations/world-cup-final/spain-goalkeeper/idle.glb",
        run: "/animations/world-cup-final/spain-goalkeeper/run.glb",
        kick: "/animations/world-cup-final/spain-goalkeeper/kick.glb",
        save: "/animations/world-cup-final/spain-goalkeeper/save.glb",
        hit: "/animations/world-cup-final/spain-goalkeeper/hit.glb",
        victory: "/animations/world-cup-final/spain-goalkeeper/victory.glb",
      },
    },
    argentinaGoalkeeper: {
      model: "/models/world-cup-final/players/argentina-goalkeeper.glb",
      animations: {
        idle: "/animations/world-cup-final/argentina-goalkeeper/idle.glb",
        run: "/animations/world-cup-final/argentina-goalkeeper/run.glb",
        kick: "/animations/world-cup-final/argentina-goalkeeper/kick.glb",
        save: "/animations/world-cup-final/argentina-goalkeeper/save.glb",
        hit: "/animations/world-cup-final/argentina-goalkeeper/hit.glb",
        victory: "/animations/world-cup-final/argentina-goalkeeper/victory.glb",
      },
    },
  },
  fans: {
    redScarf: {
      model: "/models/world-cup-final/fans/red-scarf.glb",
      animations: {
        idle: "/animations/world-cup-final/fans/red-scarf/idle.glb",
        cheer: "/animations/world-cup-final/fans/red-scarf/cheer.glb",
      },
    },
    skyJacket: {
      model: "/models/world-cup-final/fans/sky-jacket.glb",
      animations: {
        idle: "/animations/world-cup-final/fans/sky-jacket/idle.glb",
        cheer: "/animations/world-cup-final/fans/sky-jacket/cheer.glb",
      },
    },
    yellowCap: {
      model: "/models/world-cup-final/fans/yellow-cap.glb",
      animations: {
        idle: "/animations/world-cup-final/fans/yellow-cap/idle.glb",
        cheer: "/animations/world-cup-final/fans/yellow-cap/cheer.glb",
      },
    },
    blueScarf: {
      model: "/models/world-cup-final/fans/blue-scarf.glb",
      animations: {
        idle: "/animations/world-cup-final/fans/blue-scarf/idle.glb",
        cheer: "/animations/world-cup-final/fans/blue-scarf/cheer.glb",
      },
    },
  },
  audio: {
    crowd: "/audio/world-cup-final/crowd-ambience.mp3",
    whistle: "/audio/world-cup-final/referee-whistle.mp3",
    kick: "/audio/world-cup-final/ball-kick.mp3",
    goal: "/audio/world-cup-final/goal-roar.mp3",
    save: "/audio/world-cup-final/save-impact.mp3",
    victory: "/audio/world-cup-final/victory-sting.mp3",
  },
} as const;

export type WorldCupCharacterKey = keyof typeof WORLD_CUP_MINT_ASSETS.characters;
export type WorldCupFanKey = keyof typeof WORLD_CUP_MINT_ASSETS.fans;
