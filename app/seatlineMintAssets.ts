export const SEATLINE_MINT_ASSETS = {
  shells: {
    monument: "/models/seatline-v2/lincoln-imax-auditorium.glb",
    midtown: "/models/seatline-v2/times-square-premium-auditorium.glb",
    brooklyn: "/models/seatline-v2/times-square-premium-auditorium.glb",
  },
  screens: {
    imax: "/models/seatline/imax-screen.glb",
    wide: "/models/seatline-v2/wide-blank-screen.glb",
  },
  chairs: {
    cinema: "/models/seatline-v2/premium-recliner.glb",
    dineIn: "/models/seatline-v2/dine-in-recliner.glb",
  },
  fixtures: {
    aisleBeacon: "/models/seatline-v2/aisle-beacon.glb",
  },
  images: {
    mythicSea: "/images/seatline/mythic-sea-tableau.png",
  },
} as const;

export type SeatlineShellKey = keyof typeof SEATLINE_MINT_ASSETS.shells;
export type SeatlineScreenKey = keyof typeof SEATLINE_MINT_ASSETS.screens;
export type SeatlineChairKey = keyof typeof SEATLINE_MINT_ASSETS.chairs;
