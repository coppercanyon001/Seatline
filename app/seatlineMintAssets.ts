export const SEATLINE_MINT_ASSETS = {
  shells: {
    monument: "/models/seatline/monument-imax-shell.glb",
    midtown: "/models/seatline/midtown-grand-shell.glb",
    brooklyn: "/models/seatline/brooklyn-table-shell.glb",
  },
  screens: {
    imax: "/models/seatline/imax-screen.glb",
    wide: "/models/seatline/wide-screen.glb",
  },
  chairs: {
    cinema: "/models/seatline/cinema-recliner.glb",
    dineIn: "/models/seatline/dine-in-recliner.glb",
  },
  fixtures: {
    aisleBeacon: "/models/seatline/aisle-beacon.glb",
  },
  images: {
    mythicSea: "/images/seatline/mythic-sea-tableau.png",
  },
} as const;

export type SeatlineShellKey = keyof typeof SEATLINE_MINT_ASSETS.shells;
export type SeatlineScreenKey = keyof typeof SEATLINE_MINT_ASSETS.screens;
export type SeatlineChairKey = keyof typeof SEATLINE_MINT_ASSETS.chairs;
