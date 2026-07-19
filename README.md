# Seatline NYC

A Mint-authored 3D ticket-booking preview for *The Odyssey* in New York City.
Choose a theater, showtime, and individual seat, then move directly into the
seated camera view before continuing to the exhibitor.

## Experience

- Browse a dated New York listing snapshot for AMC Lincoln Square 13, Regal
  Times Square, and Alamo Drafthouse Downtown Brooklyn.
- Compare IMAX 70mm, RPX, and dine-in auditorium layouts.
- Select seats with accessible, companion, occupied, and available states.
- See each chair's true 3D screen angle, screen fill, distance, and centering.
- Click seats in either the 2D map or the 3D auditorium.
- Review an estimated total, then open the theater's live listing to confirm
  current inventory and checkout.
- Use the full flow on desktop, tablet, or mobile.

## Mint Asset Policy

All visible production assets are Mint-created: three auditorium shells, two
screen formats, two chair styles, an aisle beacon, and the original mythic sea
projection image. Three.js only loads, clones, scales, places, lights, and
renders those assets and moves the camera.

See [MINT_ASSET_MANIFEST.md](./MINT_ASSET_MANIFEST.md) for the asset contract,
provenance, validation, and runtime paths. See
[GAME_WORKFLOW.md](./GAME_WORKFLOW.md) for the project rules.

## Listing Data

The interface is a July 18, 2026 preview snapshot derived from public theater
listings and official film-format information. It is not a live inventory,
reservation, or checkout API. Showtime prices and remaining-seat counts are
clearly labeled as preview data.

## Local Development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Build and test:

```bash
npm run build
npm test
```

## Project Structure

```text
app/SeatlineNYC.tsx             Booking UI, 3D scene, seat interaction, camera
app/seatlineData.ts             Typed New York theater preview database
app/seatlineMintAssets.ts       Authoritative Mint runtime map
public/models/seatline/         Mint auditorium, screen, chair, and fixture GLBs
public/images/seatline/         Mint projection artwork and review previews
MINT_ASSET_MANIFEST.md          Asset contract, provenance, and validation
```

## License

The code is licensed under MIT. Generated assets may have separate rights under
their Mint generation terms; verify those terms before redistributing the
asset files.
