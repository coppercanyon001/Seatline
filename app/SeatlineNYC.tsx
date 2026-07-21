"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildSeats,
  DATES,
  getSightline,
  THEATERS,
  type Seat,
  type Theater,
} from "./seatlineData";
import { SEATLINE_MINT_ASSETS as ASSETS } from "./seatlineMintAssets";

type SceneController = {
  focusSeat: (seatId: string) => void;
  overview: () => void;
};

function TheaterPreview({
  theater,
  seats,
  selectedSeatId,
  onSelectSeat,
}: {
  theater: Theater;
  seats: Seat[];
  selectedSeatId: string;
  onSelectSeat: (seatId: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<SceneController | null>(null);
  const [initialSeatId] = useState(selectedSeatId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSeatView, setIsSeatView] = useState(true);

  useEffect(() => {
    controllerRef.current?.focusSeat(selectedSeatId);
  }, [selectedSeatId]);

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;
    let frame = 0;
    let cleanup = () => undefined;
    const canvas = canvasRef.current;
    setLoading(true);
    setError("");

    void (async () => {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import(
          "three/addons/loaders/GLTFLoader.js"
        );
        if (disposed) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x07090e);
        scene.fog = new THREE.FogExp2(0x07090e, 0.018);

        const camera = new THREE.PerspectiveCamera(50, 1, 0.08, 120);
        const renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.24;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.localClippingEnabled = true;
        const screenPlaneZ = theater.screenZ + theater.screenWallOffset;

        scene.add(new THREE.AmbientLight(0x7181aa, 2));
        scene.add(new THREE.HemisphereLight(0xa9bce4, 0x321916, 2.15));
        const warmLight = new THREE.DirectionalLight(0xffc786, 3.2);
        warmLight.position.set(-8, theater.roomHeight, 10);
        warmLight.castShadow = true;
        warmLight.shadow.mapSize.set(1024, 1024);
        scene.add(warmLight);
        const rimLight = new THREE.DirectionalLight(0x6c7dff, 2);
        rimLight.position.set(10, 8, -8);
        scene.add(rimLight);

        const loader = new GLTFLoader();
        const [shellGltf, screenGltf, chairGltf, beaconGltf] =
          await Promise.all([
            loader.loadAsync(ASSETS.shells[theater.shell]),
            loader.loadAsync(ASSETS.screens[theater.screen]),
            loader.loadAsync(ASSETS.chairs[theater.chair]),
            loader.loadAsync(ASSETS.fixtures.aisleBeacon),
          ]);
        if (disposed) return;

        const prepare = (object: import("three").Object3D) => {
          object.traverse((child) => {
            const mesh = child as import("three").Mesh;
            if (!mesh.isMesh) return;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.frustumCulled = false;
          });
          return object;
        };

        const fitWidth = (
          object: import("three").Object3D,
          width: number,
        ) => {
          const root = new THREE.Group();
          root.add(object);
          object.updateMatrixWorld(true);
          const before = new THREE.Box3().setFromObject(object);
          const size = before.getSize(new THREE.Vector3());
          object.scale.setScalar(width / Math.max(size.x, 0.001));
          object.updateMatrixWorld(true);
          const after = new THREE.Box3().setFromObject(object);
          const center = after.getCenter(new THREE.Vector3());
          object.position.set(-center.x, -after.min.y, -center.z);
          return prepare(root);
        };

        const shell = fitWidth(shellGltf.scene, theater.roomWidth);
        shell.rotation.y = Math.PI;
        shell.traverse((child) => {
          const mesh = child as import("three").Mesh;
          if (!mesh.isMesh) return;
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          materials.forEach((material) => {
            material.side = THREE.DoubleSide;
            material.needsUpdate = true;
          });
        });
        scene.add(shell);
        shell.updateMatrixWorld(true);
        const shellBounds = new THREE.Box3().setFromObject(shell);

        const floorRaycaster = new THREE.Raycaster();
        const floorOrigin = new THREE.Vector3();
        const floorDirection = new THREE.Vector3(0, -1, 0);
        const floorAt = (x: number, z: number, fallback: number) => {
          floorOrigin.set(x, theater.roomHeight * 0.76, z);
          floorRaycaster.set(floorOrigin, floorDirection);
          floorRaycaster.near = 0;
          floorRaycaster.far = theater.roomHeight;
          const hit = floorRaycaster
            .intersectObject(shell, true)
            .find(
              (entry) =>
                entry.point.y >= 0 &&
                entry.point.y < theater.roomHeight * 0.72,
            );
          return hit ? hit.point.y + 0.04 : fallback;
        };

        const screenHeight = theater.screenWidth / theater.screenAspect;
        const screen = fitWidth(screenGltf.scene, theater.screenWidth);
        const authoredScreenAspect = theater.screen === "imax" ? 1.481 : 1.448;
        screen.scale.y *= authoredScreenAspect / theater.screenAspect;
        screen.scale.z = theater.screenDepthScale;
        screen.position.set(0, theater.screenBaseY, screenPlaneZ);
        screen.traverse((child) => {
          const mesh = child as import("three").Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = theater.screenDepthScale > 0.1;
          mesh.receiveShadow = false;
          mesh.renderOrder = 1;
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          materials.forEach((material) => {
            material.depthTest = true;
            material.depthWrite = true;
            material.polygonOffset = true;
            material.polygonOffsetFactor = -2;
            material.polygonOffsetUnits = -2;
            material.clippingPlanes = theater.screenBottomCrop
              ? [
                  new THREE.Plane(
                    new THREE.Vector3(0, 1, 0),
                    -(theater.screenBaseY +
                      screenHeight * theater.screenBottomCrop),
                  ),
                ]
              : null;
            material.needsUpdate = true;
          });
        });
        scene.add(screen);

        const chairTemplate = fitWidth(chairGltf.scene, theater.chairWidth);
        const seatRoots = new Map<string, import("three").Object3D>();
        const seatPositions = new Map<string, import("three").Vector3>();
        for (const seat of seats) {
          const chair = chairTemplate.clone(true);
          const groundY = floorAt(seat.x, seat.z, seat.y);
          chair.position.set(seat.x, groundY, seat.z);
          seatPositions.set(seat.id, chair.position.clone());
          chair.userData.seatId = seat.id;
          chair.userData.baseScale = 1;
          chair.traverse((child) => {
            const mesh = child as import("three").Mesh;
            if (mesh.isMesh) mesh.renderOrder = 2;
            child.userData.seatId = seat.id;
            child.userData.selectable = seat.status !== "occupied";
          });
          const occupiedAngle =
            seat.status === "occupied"
              ? ((seat.columnIndex % 3) - 1) * 0.018
              : 0;
          const chairFacing = theater.chair === "cinema" ? 0 : Math.PI;
          chair.rotation.y = chairFacing + occupiedAngle;
          seatRoots.set(seat.id, chair);
          scene.add(chair);
        }

        const beaconTemplate = fitWidth(beaconGltf.scene, 0.27);
        for (let row = 1; row < theater.rows; row += 2) {
          const y = theater.seatBaseY + row * theater.rowRise;
          const z = theater.baseZ + row * theater.rowSpacing - 0.25;
          for (const x of [-theater.roomWidth * 0.43, theater.roomWidth * 0.43]) {
            const beacon = beaconTemplate.clone(true);
            beacon.position.set(x, y, z);
            beacon.traverse((child) => {
              const mesh = child as import("three").Mesh;
              if (mesh.isMesh) mesh.renderOrder = 2;
            });
            scene.add(beacon);
            const light = new THREE.PointLight(0xffb65b, 1.6, 2.8, 2);
            light.position.set(x, y + 0.25, z);
            scene.add(light);
          }
        }

        const targetPosition = new THREE.Vector3();
        const targetLook = new THREE.Vector3();
        const currentLook = new THREE.Vector3();
        const screenCenterY =
          theater.screenBaseY +
          screenHeight * (0.5 + theater.screenBottomCrop * 0.5);
        const isTallScreen = theater.screenAspect <= 1.5;
        const selectedLight = new THREE.PointLight(0xffc46a, 0, 3.2, 2);
        scene.add(selectedLight);

        const setOverview = (instant = false) => {
          setIsSeatView(false);
          const overviewZ = Math.min(
            theater.roomDepth * 0.22,
            shellBounds.max.z - 1.5,
          );
          const overviewFloorY = floorAt(
            0,
            overviewZ,
            theater.seatBaseY + theater.rows * theater.rowRise,
          );
          targetPosition.set(0, overviewFloorY + 4.6, overviewZ);
          targetLook.set(0, screenCenterY, screenPlaneZ);
          camera.fov = 58;
          camera.updateProjectionMatrix();
          selectedLight.intensity = 0;
          seatRoots.forEach((root) => {
            root.visible = true;
          });
          if (instant) {
            camera.position.copy(targetPosition);
            currentLook.copy(targetLook);
          }
        };

        const focusSeat = (seatId: string, instant = false) => {
          const seat = seats.find((candidate) => candidate.id === seatId);
          if (!seat) return;
          const seatPosition =
            seatPositions.get(seatId) ??
            new THREE.Vector3(seat.x, seat.y, seat.z);
          setIsSeatView(true);
          targetPosition.set(
            seatPosition.x,
            seatPosition.y + (isTallScreen ? 1.88 : 1.68),
            seatPosition.z - 0.22,
          );
          targetLook.set(0, screenCenterY, screenPlaneZ);
          camera.fov = isTallScreen ? 72 : 66;
          camera.updateProjectionMatrix();
          selectedLight.position.set(
            seatPosition.x,
            seatPosition.y + 0.75,
            seatPosition.z - 0.3,
          );
          selectedLight.intensity = 6;
          seatRoots.forEach((root, id) => {
            root.userData.targetScale = id === seatId ? 1.08 : 1;
            root.visible = id !== seatId;
          });
          if (instant) {
            camera.position.copy(targetPosition);
            currentLook.copy(targetLook);
          }
        };

        controllerRef.current = {
          focusSeat: (seatId) => focusSeat(seatId),
          overview: () => setOverview(),
        };
        focusSeat(initialSeatId, true);

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const handlePointer = (event: PointerEvent) => {
          const bounds = canvas.getBoundingClientRect();
          pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
          pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster
            .intersectObjects(scene.children, true)
            .find((entry) => entry.object.userData.selectable);
          const seatId = hit?.object.userData.seatId as string | undefined;
          if (seatId) onSelectSeat(seatId);
        };
        canvas.addEventListener("pointerdown", handlePointer);

        const resize = () => {
          const bounds = canvas.getBoundingClientRect();
          if (!bounds.width || !bounds.height) return;
          renderer.setSize(bounds.width, bounds.height, false);
          camera.aspect = bounds.width / bounds.height;
          camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", resize);
        resize();

        let lastFrameTime = performance.now();
        const render = () => {
          if (disposed) return;
          const frameTime = performance.now();
          const delta = Math.min((frameTime - lastFrameTime) / 1000, 0.05);
          lastFrameTime = frameTime;
          const smoothing = 1 - Math.exp(-delta * 5.4);
          camera.position.lerp(targetPosition, smoothing);
          currentLook.lerp(targetLook, smoothing);
          camera.lookAt(currentLook);
          seatRoots.forEach((root) => {
            const target = (root.userData.targetScale as number | undefined) ?? 1;
            const next = THREE.MathUtils.lerp(root.scale.x, target, smoothing);
            root.scale.setScalar(next);
          });
          renderer.render(scene, camera);
          frame = requestAnimationFrame(render);
        };
        render();
        setLoading(false);

        cleanup = () => {
          window.removeEventListener("resize", resize);
          canvas.removeEventListener("pointerdown", handlePointer);
          cancelAnimationFrame(frame);
          scene.traverse((object) => {
            const mesh = object as import("three").Mesh;
            if (!mesh.isMesh) return;
            mesh.geometry?.dispose();
            const materials = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            materials.forEach((material) => material.dispose());
          });
          renderer.dispose();
        };
      } catch (reason) {
        console.error(reason);
        if (!disposed) {
          setError("The 3D auditorium could not be opened.");
          setLoading(false);
        }
      }
    })();

    return () => {
      disposed = true;
      controllerRef.current = null;
      cleanup();
    };
  }, [initialSeatId, onSelectSeat, seats, theater]);

  return (
    <div className="seatline-preview">
      <canvas
        ref={canvasRef}
        className="seatline-canvas"
        aria-label={`Interactive 3D sightline preview for ${theater.name}`}
      />
      <div className="seatline-preview-top">
        <span className="seatline-live-dot" />
        <span>{isSeatView ? "VIEW FROM YOUR SEAT" : "AUDITORIUM OVERVIEW"}</span>
        <b>3D</b>
      </div>
      <button
        className="seatline-overview-button"
        type="button"
        onClick={() => controllerRef.current?.overview()}
      >
        OVERVIEW
      </button>
      {!isSeatView && (
        <button
          className="seatline-return-button"
          type="button"
          onClick={() => controllerRef.current?.focusSeat(selectedSeatId)}
        >
          RETURN TO {selectedSeatId}
        </button>
      )}
      {loading && (
        <div className="seatline-loading">
          <span />
          <p>Opening {theater.auditorium}</p>
          <small>Loading Mint theater assets</small>
        </div>
      )}
      {error && <div className="seatline-error">{error}</div>}
      <div className="seatline-canvas-hint">Select a seat on the map or in the room</div>
    </div>
  );
}

export default function SeatlineNYC() {
  const [theaterId, setTheaterId] = useState(THEATERS[0].id);
  const theater = THEATERS.find((entry) => entry.id === theaterId) ?? THEATERS[0];
  const seats = useMemo(() => buildSeats(theater), [theater]);
  const [showtimeId, setShowtimeId] = useState(theater.showtimes[1].id);
  const [selectedSeatId, setSelectedSeatId] = useState(theater.defaultSeat);
  const [dateId, setDateId] = useState<(typeof DATES)[number]["id"]>(DATES[0].id);
  const [bookingOpen, setBookingOpen] = useState(false);

  const selectedSeat =
    seats.find((seat) => seat.id === selectedSeatId) ??
    seats.find((seat) => seat.status !== "occupied")!;
  const showtime =
    theater.showtimes.find((entry) => entry.id === showtimeId) ??
    theater.showtimes[0];
  const selectedDate =
    DATES.find((entry) => entry.id === dateId) ?? DATES[0];
  const sightline = getSightline(theater, selectedSeat);

  const handleTheater = (next: Theater) => {
    setTheaterId(next.id);
    setSelectedSeatId(next.defaultSeat);
    setShowtimeId(next.showtimes[Math.min(1, next.showtimes.length - 1)].id);
    setBookingOpen(false);
  };

  const handleSeat = useCallback((seatId: string) => {
    const seat = seats.find((entry) => entry.id === seatId);
    if (!seat || seat.status === "occupied") return;
    setSelectedSeatId(seatId);
  }, [seats]);

  const taxes = 3.18;
  const total = showtime.price + taxes;

  return (
    <main className="seatline-app">
      <header className="seatline-header">
        <a className="seatline-brand" href="#" aria-label="Seatline NYC home">
          <span className="seatline-brand-mark">S</span>
          <span>
            <strong>SEATLINE</strong>
            <small>NEW YORK</small>
          </span>
        </a>
        <div className="seatline-location">
          <span>NYC</span>
          <strong>NEW YORK, NY</strong>
        </div>
        <div className="seatline-steps" aria-label="Booking progress">
          <span className="is-done">1</span><b>MOVIE</b>
          <i />
          <span className="is-active">2</span><b>SEATS</b>
          <i />
          <span>3</span><b>CHECKOUT</b>
        </div>
        <button className="seatline-account" type="button" aria-label="Account menu">
          LO
        </button>
      </header>

      <section className="seatline-workspace">
        <aside className="seatline-sidebar">
          <div className="seatline-movie">
            <div className="seatline-poster" aria-hidden="true">
              {/* Mint-authored original art, kept separate from official film key art. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ASSETS.images.mythicSea} alt="" />
              <span>R</span>
            </div>
            <div>
              <p>NOW PLAYING</p>
              <h1>THE ODYSSEY</h1>
              <div className="seatline-meta">
                <span>2 HR 52 MIN</span>
                <span>MYTHIC EPIC</span>
                <span>2026</span>
              </div>
            </div>
          </div>

          <div className="seatline-section">
            <div className="seatline-section-title">
              <span>01</span>
              <div>
                <small>CHOOSE A</small>
                <h2>NEW YORK THEATER</h2>
              </div>
            </div>
            <div className="seatline-theaters">
              {THEATERS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={entry.id === theater.id ? "is-active" : ""}
                  onClick={() => handleTheater(entry)}
                >
                  <span className="seatline-radio" />
                  <span>
                    <strong>{entry.shortName}</strong>
                    <small>{entry.neighborhood} · {entry.distance}</small>
                  </span>
                  <b>{entry.format}</b>
                </button>
              ))}
            </div>
          </div>

          <div className="seatline-section seatline-showtime-section">
            <div className="seatline-section-title">
              <span>02</span>
              <div>
                <small>CHOOSE A</small>
                <h2>SHOWTIME</h2>
              </div>
            </div>
            <div className="seatline-dates" aria-label="Select date">
              {DATES.map((date) => (
                <button
                  key={date.id}
                  type="button"
                  className={dateId === date.id ? "is-active" : ""}
                  onClick={() => setDateId(date.id)}
                >
                  <small>{date.day}</small>
                  <strong>{date.date}</strong>
                </button>
              ))}
              <span>JUL</span>
            </div>
            <div className="seatline-showtimes">
              {theater.showtimes.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={entry.id === showtime.id ? "is-active" : ""}
                  onClick={() => setShowtimeId(entry.id)}
                >
                  <strong>{entry.time}</strong>
                  <small>{entry.period}</small>
                  <span>{entry.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="seatline-source-note">
            <span>PREVIEW DATA · JUL 22, 2026</span>
            <p>Availability and prices are a booking-demo snapshot. Check live inventory before purchase.</p>
          </div>
        </aside>

        <section className="seatline-main">
          <div className="seatline-main-head">
            <div>
              <span>{theater.auditorium} · {theater.format}</span>
              <h2>CHOOSE YOUR SIGHTLINE</h2>
              <p>{theater.name} · {theater.address}</p>
            </div>
            <div className="seatline-format-card">
              <span>FORMAT</span>
              <strong>{theater.format}</strong>
              <small>{theater.formatNote}</small>
            </div>
          </div>

          <div className="seatline-stage">
            <TheaterPreview
              key={theater.id}
              theater={theater}
              seats={seats}
              selectedSeatId={selectedSeatId}
              onSelectSeat={handleSeat}
            />

            <div className="seatline-seat-panel">
              <div className="seatline-screen-label">
                <span />
                <small>SCREEN</small>
              </div>
              <div
                className="seatline-seat-map"
                style={{ "--seat-columns": theater.columns } as React.CSSProperties}
              >
                {seats.map((seat) => (
                  <button
                    key={seat.id}
                    type="button"
                    className={[
                      `is-${seat.status}`,
                      seat.id === selectedSeatId ? "is-selected" : "",
                      theater.aislesAfter.includes(seat.columnIndex)
                        ? "is-after-aisle"
                        : "",
                    ].join(" ")}
                    disabled={seat.status === "occupied"}
                    aria-label={`Row ${seat.row}, seat ${seat.number}, ${seat.status}`}
                    aria-pressed={seat.id === selectedSeatId}
                    onClick={() => handleSeat(seat.id)}
                  >
                    <span>{seat.number}</span>
                  </button>
                ))}
              </div>
              <div className="seatline-legend">
                <span><i className="available" />AVAILABLE</span>
                <span><i className="selected" />SELECTED</span>
                <span><i className="occupied" />TAKEN</span>
                <span><i className="accessible" />ACCESSIBLE</span>
              </div>
            </div>
          </div>

          <div className="seatline-selection">
            <div className="seatline-seat-number">
              <small>YOUR SEAT</small>
              <strong>{selectedSeat.id}</strong>
              <span>ROW {selectedSeat.row} · SEAT {selectedSeat.number}</span>
            </div>
            <div className="seatline-sightline">
              <div>
                <small>SIGHTLINE</small>
                <strong>{sightline.rating}</strong>
              </div>
              <span><i style={{ width: `${sightline.centering}%` }} /></span>
              <b>{sightline.centering}% CENTERED</b>
            </div>
            <div className="seatline-spec">
              <small>SCREEN FILL</small>
              <strong>{sightline.screenFill}%</strong>
            </div>
            <div className="seatline-spec">
              <small>DISTANCE</small>
              <strong>{sightline.distance} FT</strong>
            </div>
            <div className="seatline-price">
              <small>1 TICKET</small>
              <strong>${showtime.price.toFixed(2)}</strong>
            </div>
            <button
              className="seatline-reserve"
              type="button"
              onClick={() => setBookingOpen(true)}
            >
              RESERVE {selectedSeat.id}
              <span>CONTINUE TO SUMMARY</span>
            </button>
          </div>
        </section>
      </section>

      {bookingOpen && (
        <div className="seatline-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
          <button
            className="seatline-modal-backdrop"
            type="button"
            aria-label="Close booking summary"
            onClick={() => setBookingOpen(false)}
          />
          <div className="seatline-modal-card">
            <button
              className="seatline-modal-close"
              type="button"
              onClick={() => setBookingOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <p>YOUR ODYSSEY AWAITS</p>
            <h2 id="booking-title">SEAT {selectedSeat.id} LOOKS GREAT.</h2>
            <div className="seatline-ticket">
              <div>
                <small>THE ODYSSEY</small>
                <strong>{theater.name}</strong>
                <span>{theater.auditorium} · {theater.format}</span>
              </div>
              <div>
                <small>JUL {selectedDate.date} · {showtime.time} {showtime.period}</small>
                <strong>ROW {selectedSeat.row} / SEAT {selectedSeat.number}</strong>
                <span>{sightline.rating} sightline · {sightline.centering}% centered</span>
              </div>
            </div>
            <div className="seatline-total">
              <span>Ticket <b>${showtime.price.toFixed(2)}</b></span>
              <span>Estimated taxes & fees <b>${taxes.toFixed(2)}</b></span>
              <strong>ESTIMATED TOTAL <b>${total.toFixed(2)}</b></strong>
            </div>
            <a href={theater.sourceUrl} target="_blank" rel="noreferrer">
              CHECK LIVE SEATS AT THE THEATER ↗
            </a>
            <small className="seatline-modal-note">
              Seatline is a 3D preview. Final inventory, price, and checkout are provided by the theater.
            </small>
          </div>
        </div>
      )}
    </main>
  );
}
