"use client";

import { useEffect, useRef, useState } from "react";
import { MINT_WORLD } from "./mintWorld";

type Phase = "loading" | "ready" | "playing" | "won" | "lost" | "error";
type Direction = "forward" | "back" | "left" | "right";

type Grocery = {
  id: string;
  name: string;
  emoji: string;
  path: string;
};

type GameUi = {
  phase: Phase;
  level: number;
  timeLeft: number;
  totalTime: number;
  required: Grocery[];
  collected: string[];
  musicOn: boolean;
  loadingText: string;
  toast: string;
};

type GameController = {
  start: () => void;
  toggleMusic: () => void;
  setDirection: (direction: Direction, pressed: boolean) => void;
};

const GROCERIES: Grocery[] = [
  { id: "eggs", name: "Eggs", emoji: "🥚", path: "/mint-assets/models/eggs.glb" },
  { id: "milk", name: "Milk", emoji: "🥛", path: "/mint-assets/models/milk.glb" },
  { id: "bread", name: "Bread", emoji: "🍞", path: "/mint-assets/models/bread.glb" },
  { id: "carrots", name: "Carrots", emoji: "🥕", path: "/mint-assets/models/carrots.glb" },
  { id: "steak", name: "Steak", emoji: "🥩", path: "/mint-assets/models/steak.glb" },
  { id: "bananas", name: "Bananas", emoji: "🍌", path: "/mint-assets/models/bananas.glb" },
  { id: "cereal", name: "Cereal", emoji: "🥣", path: "/mint-assets/models/cereal.glb" },
  { id: "apples", name: "Apples", emoji: "🍎", path: "/mint-assets/models/apples.glb" },
  { id: "cheese", name: "Cheese", emoji: "🧀", path: "/mint-assets/models/cheese.glb" },
  { id: "orange-juice", name: "Orange juice", emoji: "🍊", path: "/mint-assets/models/orange-juice.glb" },
];

const MODEL_PATHS: Record<string, string> = {
  grandma: "/mint-assets/models/grandma.glb",
  cart: "/mint-assets/models/cart.glb",
  shelfStraight: "/mint-assets/models/shelf-straight.glb",
  shelfCorner: "/mint-assets/models/shelf-corner.glb",
  checkout: "/mint-assets/models/checkout.glb",
  doors: "/mint-assets/models/exit-doors.glb",
  exitSign: "/mint-assets/models/exit-sign.glb",
  floor: "/mint-assets/models/tile-floor.glb",
  lights: "/mint-assets/models/ceiling-lights.glb",
  ...Object.fromEntries(GROCERIES.map((item) => [item.id, item.path])),
};

const SHELF_LAYOUT = [
  { type: "straight", x: -6.35, z: 4.35, yaw: Math.PI / 2 },
  { type: "straight", x: -6.35, z: 0.2, yaw: Math.PI / 2 },
  { type: "straight", x: -6.35, z: -4.0, yaw: Math.PI / 2 },
  { type: "straight", x: 0, z: 4.6, yaw: Math.PI / 2 },
  { type: "straight", x: 0, z: 0.25, yaw: Math.PI / 2 },
  { type: "straight", x: 0, z: -4.05, yaw: Math.PI / 2 },
  { type: "straight", x: 6.35, z: 4.35, yaw: Math.PI / 2 },
  { type: "straight", x: 6.35, z: 0, yaw: Math.PI / 2 },
  { type: "straight", x: 6.35, z: -3.65, yaw: Math.PI / 2 },
  { type: "straight", x: -3.75, z: 6.15, yaw: 0 },
  { type: "corner", x: -5.55, z: 6.15, yaw: 0 },
  { type: "straight", x: 3.75, z: 2.2, yaw: 0 },
  { type: "corner", x: 5.55, z: 2.2, yaw: Math.PI },
  { type: "straight", x: -3.75, z: -1.9, yaw: 0 },
  { type: "corner", x: -5.55, z: -1.9, yaw: Math.PI },
  { type: "straight", x: -11.55, z: 4.45, yaw: Math.PI / 2 },
  { type: "straight", x: -11.55, z: 0.3, yaw: Math.PI / 2 },
  { type: "straight", x: -11.55, z: -3.85, yaw: Math.PI / 2 },
  { type: "straight", x: 11.55, z: 4.45, yaw: -Math.PI / 2 },
  { type: "straight", x: 11.55, z: 0.3, yaw: -Math.PI / 2 },
  { type: "straight", x: 11.55, z: -3.85, yaw: -Math.PI / 2 },
] as const;

const SPAWN_CANDIDATES = [
  [-9.1, 6.65], [-2.0, 7.15], [3.1, 6.7], [9.25, 6.7],
  [-9.2, 2.45], [-3.25, 4.25], [3.1, 4.55], [9.2, 3.15],
  [-9.25, -1.7], [-3.2, 1.3], [3.25, 0], [9.2, -0.9],
  [-9.15, -6.05], [-3.2, -4.45], [3.15, -3.2], [9.2, -4.9],
  [-4.3, -6.45], [0.1, -6.45], [3.2, -6.45],
] as const;

const INITIAL_UI: GameUi = {
  phase: "loading",
  level: 1,
  timeLeft: 75,
  totalTime: 75,
  required: [],
  collected: [],
  musicOn: true,
  loadingText: "Opening the Mint grocery store…",
  toast: "",
};

const shuffle = <T,>(items: readonly T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function GrandmasGroceryTrip() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<GameController | null>(null);
  const [ui, setUi] = useState<GameUi>(INITIAL_UI);

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;
    let animationFrame = 0;
    let runtimeCleanup = () => undefined;
    const timers: number[] = [];
    const pressed = { forward: false, back: false, left: false, right: false };
    const music = new Audio("/mint-assets/audio/store-music.mp3");
    const chime = new Audio("/mint-assets/audio/cha-ching.mp3");
    music.loop = true;
    music.volume = 0.2;
    chime.volume = 0.78;

    void (async () => {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
        const { SparkRenderer, SplatMesh } = await import("@sparkjsdev/spark");
        if (disposed || !canvasRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#f4efd9");
        scene.fog = new THREE.FogExp2(0xf4efd9, 0.012);
        const camera = new THREE.PerspectiveCamera(54, 1, 0.05, 120);
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.06;

        scene.add(new THREE.HemisphereLight(0xfff8dc, 0xb3d9ce, 2.2));
        const sun = new THREE.DirectionalLight(0xfff1cf, 2.6);
        sun.position.set(5, 9, 4);
        scene.add(sun);

        const spark = new SparkRenderer({ renderer });
        scene.add(spark);
        const worldRoot = new THREE.Group();
        worldRoot.rotation.set(...MINT_WORLD.rotation);
        scene.add(worldRoot);
        const splat = new SplatMesh({
          url: MINT_WORLD.runtimeUrl,
          paged: true,
          lod: false,
        });
        worldRoot.add(splat);

        setUi((value) => ({ ...value, loadingText: "Unpacking 19 Mint models…" }));
        const manager = new THREE.LoadingManager();
        manager.onProgress = (_url, loaded, total) => {
          if (!disposed) setUi((value) => ({ ...value, loadingText: `Stocking the store · ${loaded}/${total}` }));
        };
        const loader = new GLTFLoader(manager);
        const entries = Object.entries(MODEL_PATHS);
        const loadedModels = await Promise.all(
          entries.map(async ([key, path]) => [key, (await loader.loadAsync(path)).scene] as const),
        );
        const templates = new Map<string, import("three").Object3D>(loadedModels);
        const [, colliderGltf] = await Promise.all([
          splat.initialized,
          loader.loadAsync(MINT_WORLD.colliderUrl),
        ]);
        if (disposed) return;

        const worldCollider = colliderGltf.scene;
        worldCollider.visible = false;
        worldRoot.add(worldCollider);
        const rawWorldBounds = new THREE.Box3().setFromObject(worldCollider);
        const rawWorldSize = rawWorldBounds.getSize(new THREE.Vector3());
        const rawWorldCenter = rawWorldBounds.getCenter(new THREE.Vector3());
        const worldScale = new THREE.Vector3(
          MINT_WORLD.playableWidth / Math.max(rawWorldSize.x, 0.001),
          MINT_WORLD.playableHeight / Math.max(rawWorldSize.y, 0.001),
          MINT_WORLD.playableDepth / Math.max(rawWorldSize.z, 0.001),
        );
        worldRoot.scale.copy(worldScale);
        worldRoot.position.set(
          -rawWorldCenter.x * worldScale.x,
          MINT_WORLD.splatFloorY - rawWorldBounds.min.y * worldScale.y,
          -rawWorldCenter.z * worldScale.z,
        );

        const fitBox = (key: string, width: number, height: number, depth: number) => {
          const wrapper = new THREE.Group();
          const model = templates.get(key)?.clone(true);
          if (!model) return wrapper;
          wrapper.add(model);
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          model.scale.set(
            width / Math.max(size.x, 0.001),
            height / Math.max(size.y, 0.001),
            depth / Math.max(size.z, 0.001),
          );
          model.updateMatrixWorld(true);
          const fitted = new THREE.Box3().setFromObject(model);
          const center = fitted.getCenter(new THREE.Vector3());
          model.position.x -= center.x;
          model.position.y -= fitted.min.y;
          model.position.z -= center.z;
          return wrapper;
        };

        const fitHeight = (key: string, height: number) => {
          const wrapper = new THREE.Group();
          const model = templates.get(key)?.clone(true);
          if (!model) return wrapper;
          wrapper.add(model);
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const scale = height / Math.max(size.y, 0.001);
          model.scale.setScalar(scale);
          model.updateMatrixWorld(true);
          const fitted = new THREE.Box3().setFromObject(model);
          const center = fitted.getCenter(new THREE.Vector3());
          model.position.set(model.position.x - center.x, model.position.y - fitted.min.y, model.position.z - center.z);
          return wrapper;
        };

        const fitMax = (key: string, maxSize: number) => {
          const wrapper = new THREE.Group();
          const model = templates.get(key)?.clone(true);
          if (!model) return wrapper;
          wrapper.add(model);
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const scale = maxSize / Math.max(size.x, size.y, size.z, 0.001);
          model.scale.setScalar(scale);
          model.updateMatrixWorld(true);
          const fitted = new THREE.Box3().setFromObject(model);
          const center = fitted.getCenter(new THREE.Vector3());
          model.position.set(model.position.x - center.x, model.position.y - fitted.min.y, model.position.z - center.z);
          return wrapper;
        };

        const gameRoot = new THREE.Group();
        scene.add(gameRoot);

        const floorTemplate = fitBox("floor", MINT_WORLD.playableWidth / 6, 0.03, MINT_WORLD.playableDepth / 4);
        for (let x = 0; x < 6; x += 1) {
          for (let z = 0; z < 4; z += 1) {
            const tile = floorTemplate.clone(true);
            tile.position.set(
              -MINT_WORLD.playableWidth / 2 + (x + 0.5) * (MINT_WORLD.playableWidth / 6),
              MINT_WORLD.splatFloorY + 0.005,
              -MINT_WORLD.playableDepth / 2 + (z + 0.5) * (MINT_WORLD.playableDepth / 4),
            );
            gameRoot.add(tile);
          }
        }

        const lightTemplate = fitBox("lights", 3.1, 0.16, 1.05);
        for (const x of [-8, 0, 8]) {
          for (const z of [-4.6, 1.1, 6.1]) {
            const light = lightTemplate.clone(true);
            light.position.set(x, 7.08, z);
            gameRoot.add(light);
          }
        }

        type Rect = { x: number; z: number; halfX: number; halfZ: number; kind: string };
        const colliders: Rect[] = [];
        const addRect = (x: number, z: number, width: number, depth: number, yaw: number, kind: string) => {
          const turned = Math.abs(Math.sin(yaw)) > 0.5;
          colliders.push({ x, z, halfX: (turned ? depth : width) / 2, halfZ: (turned ? width : depth) / 2, kind });
        };

        for (const placement of SHELF_LAYOUT) {
          const corner = placement.type === "corner";
          const shelf = corner
            ? fitBox("shelfCorner", 1.2, 2.72, 1.2)
            : fitBox("shelfStraight", 3.55, 2.72, 0.92);
          shelf.position.set(placement.x, MINT_WORLD.floorSurfaceY, placement.z);
          shelf.rotation.y = placement.yaw;
          gameRoot.add(shelf);
          addRect(placement.x, placement.z, corner ? 1.2 : 3.55, corner ? 1.2 : 0.92, placement.yaw, "shelf");
        }

        const checkout = fitBox("checkout", 3.5, 1.32, 1.35);
        checkout.position.set(5.65, MINT_WORLD.floorSurfaceY, -6.45);
        checkout.rotation.y = Math.PI;
        gameRoot.add(checkout);
        addRect(5.65, -6.45, 3.5, 1.35, 0, "checkout");

        const doors = fitBox("doors", 3.2, 3.05, 0.42);
        doors.position.set(9.75, MINT_WORLD.floorSurfaceY, -8.38);
        gameRoot.add(doors);
        const exitSign = fitBox("exitSign", 1.45, 0.62, 0.3);
        exitSign.position.set(9.75, 3.15, -8.13);
        gameRoot.add(exitSign);

        const exitMaterial = new THREE.MeshStandardMaterial({
          color: 0xffd75e,
          emissive: 0xff4f68,
          emissiveIntensity: 0.85,
          transparent: true,
          opacity: 0.86,
          side: THREE.DoubleSide,
        });
        const exitRing = new THREE.Mesh(new THREE.RingGeometry(0.86, 1.24, 40), exitMaterial);
        exitRing.rotation.x = -Math.PI / 2;
        exitRing.position.set(9.25, MINT_WORLD.floorSurfaceY + 0.075, -6.35);
        gameRoot.add(exitRing);

        const playerRig = new THREE.Group();
        const grandma = fitHeight("grandma", 1.72);
        grandma.position.set(0, MINT_WORLD.floorSurfaceY, 0.58);
        grandma.rotation.y = Math.PI;
        playerRig.add(grandma);
        const cart = fitBox("cart", 1.02, 1.25, 1.55);
        cart.position.set(0, MINT_WORLD.floorSurfaceY, -0.92);
        cart.rotation.y = Math.PI;
        playerRig.add(cart);
        playerRig.position.set(0, 0, 7.15);
        gameRoot.add(playerRig);

        const groceryRoot = new THREE.Group();
        const cartItemsRoot = new THREE.Group();
        gameRoot.add(groceryRoot);
        playerRig.add(cartItemsRoot);

        const circleHitsRect = (x: number, z: number, radius: number, rect: Rect) => {
          const nearestX = Math.max(rect.x - rect.halfX, Math.min(x, rect.x + rect.halfX));
          const nearestZ = Math.max(rect.z - rect.halfZ, Math.min(z, rect.z + rect.halfZ));
          return (x - nearestX) ** 2 + (z - nearestZ) ** 2 < radius ** 2;
        };
        const pointBlocked = (x: number, z: number, radius = 0.5) => {
          if (x < -12.35 + radius || x > 12.35 - radius || z < -8.35 + radius || z > 8.35 - radius) return true;
          return colliders.some((rect) => circleHitsRect(x, z, radius, rect));
        };

        const reachableKeys = new Set<string>();
        const grid = 0.5;
        const keyFor = (x: number, z: number) => `${Math.round(x / grid)},${Math.round(z / grid)}`;
        const queue: Array<[number, number]> = [[0, 7]];
        reachableKeys.add(keyFor(0, 7));
        for (let index = 0; index < queue.length && index < 8000; index += 1) {
          const [x, z] = queue[index];
          for (const [dx, dz] of [[grid, 0], [-grid, 0], [0, grid], [0, -grid]] as const) {
            const nx = x + dx;
            const nz = z + dz;
            const key = keyFor(nx, nz);
            if (reachableKeys.has(key) || pointBlocked(nx, nz, 0.62)) continue;
            reachableKeys.add(key);
            queue.push([nx, nz]);
          }
        }
        const reachableSpawns = SPAWN_CANDIDATES.filter(([x, z]) =>
          !pointBlocked(x, z, 0.72) && reachableKeys.has(keyFor(x, z)),
        );
        if (reachableSpawns.length < GROCERIES.length) throw new Error("Not enough validated reachable grocery spawns");

        let phase: Phase = "ready";
        let level = 1;
        let timeLeft = 75;
        let totalTime = 75;
        let required: Grocery[] = [];
        let collected = new Set<string>();
        let running = false;
        let musicOn = true;
        let toastTimer = 0;
        let checkoutMessageCooldown = 0;
        let lastUiPush = 0;
        const pickupObjects = new Map<string, import("three").Group>();

        const pushUi = (extra: Partial<GameUi> = {}) => {
          if (disposed) return;
          setUi((value) => ({
            ...value,
            phase,
            level,
            timeLeft,
            totalTime,
            required,
            collected: [...collected],
            musicOn,
            loadingText: "Mint assets ready",
            ...extra,
          }));
        };

        const toast = (message: string) => {
          window.clearTimeout(toastTimer);
          pushUi({ toast: message });
          toastTimer = window.setTimeout(() => pushUi({ toast: "" }), 1700);
          timers.push(toastTimer);
        };

        const clearGroup = (group: import("three").Group) => {
          while (group.children.length) group.remove(group.children[0]);
        };

        const beginRound = () => {
          clearGroup(groceryRoot);
          clearGroup(cartItemsRoot);
          pickupObjects.clear();
          collected = new Set<string>();
          const count = Math.min(4 + (level - 1) * 2, GROCERIES.length);
          required = shuffle(GROCERIES).slice(0, count);
          const spots = shuffle(reachableSpawns).slice(0, count);
          required.forEach((item, index) => {
            const pickup = fitMax(item.id, 0.68);
            const [x, z] = spots[index];
            pickup.position.set(x, MINT_WORLD.floorSurfaceY + 0.28, z);
            pickup.userData.baseY = pickup.position.y;
            pickup.userData.offset = Math.random() * Math.PI * 2;
            const halo = new THREE.Mesh(
              new THREE.TorusGeometry(0.43, 0.035, 8, 28),
              new THREE.MeshBasicMaterial({ color: 0xffd75e, transparent: true, opacity: 0.78 }),
            );
            halo.rotation.x = Math.PI / 2;
            halo.position.y = 0.08;
            pickup.add(halo);
            groceryRoot.add(pickup);
            pickupObjects.set(item.id, pickup);
          });
          totalTime = 75 + (level - 1) * 14;
          timeLeft = totalTime;
          playerRig.position.set(0, 0, 7.15);
          playerRig.rotation.y = 0;
          phase = "playing";
          running = true;
          if (musicOn) void music.play().catch(() => undefined);
          toast(`Level ${level}: Grandma needs ${count} things!`);
          pushUi();
        };

        const collectItem = (item: Grocery) => {
          if (collected.has(item.id)) return;
          collected.add(item.id);
          const pickup = pickupObjects.get(item.id);
          if (pickup) groceryRoot.remove(pickup);
          pickupObjects.delete(item.id);
          chime.currentTime = 0;
          void chime.play().catch(() => undefined);
          const mini = fitMax(item.id, 0.23);
          const index = collected.size - 1;
          const column = index % 3;
          const row = Math.floor(index / 3);
          mini.position.set((column - 1) * 0.22, 0.67 + row * 0.1, -0.92 + row * 0.08);
          mini.rotation.y = index * 0.7;
          cartItemsRoot.add(mini);
          toast(`${item.name} acquired. Extremely legal.`);
          pushUi();
        };

        const finishRound = () => {
          if (!running) return;
          running = false;
          phase = "won";
          exitMaterial.color.set(0x5ff2c4);
          exitMaterial.emissive.set(0x27c99a);
          toast("Checkout complete! Grandma escapes!");
          pushUi();
          const nextLevelTimer = window.setTimeout(() => {
            if (disposed) return;
            level += 1;
            beginRound();
          }, 1900);
          timers.push(nextLevelTimer);
        };

        controllerRef.current = {
          start: () => {
            if (phase === "loading" || phase === "error") return;
            beginRound();
          },
          toggleMusic: () => {
            musicOn = !musicOn;
            if (musicOn && running) void music.play().catch(() => undefined);
            else music.pause();
            pushUi();
          },
          setDirection: (direction, isPressed) => {
            pressed[direction] = isPressed;
          },
        };

        const resize = () => {
          if (!canvasRef.current) return;
          const width = canvasRef.current.clientWidth;
          const height = canvasRef.current.clientHeight;
          renderer.setSize(width, height, false);
          camera.aspect = width / Math.max(height, 1);
          camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(canvasRef.current);
        resize();

        const keyMap: Record<string, Direction> = {
          w: "forward", arrowup: "forward",
          s: "back", arrowdown: "back",
          a: "left", arrowleft: "left",
          d: "right", arrowright: "right",
        };
        const onKey = (event: KeyboardEvent, down: boolean) => {
          if (down && new URLSearchParams(window.location.search).has("qa")) {
            if (event.key.toLowerCase() === "q") {
              required.forEach((item) => collectItem(item));
              return;
            }
            if (event.key.toLowerCase() === "e") {
              playerRig.position.set(9.25, 0, -6.35);
              return;
            }
          }
          const direction = keyMap[event.key.toLowerCase()];
          if (!direction) return;
          event.preventDefault();
          pressed[direction] = down;
        };
        const keyDown = (event: KeyboardEvent) => onKey(event, true);
        const keyUp = (event: KeyboardEvent) => onKey(event, false);
        const releaseControls = () => Object.keys(pressed).forEach((key) => { pressed[key as Direction] = false; });
        window.addEventListener("keydown", keyDown, { passive: false });
        window.addEventListener("keyup", keyUp, { passive: false });
        window.addEventListener("blur", releaseControls);
        window.addEventListener("pointerup", releaseControls);

        pushUi({ phase: "ready" });
        phase = "ready";

        let lastFrameTime = performance.now();
        let elapsed = 0;
        const forward = new THREE.Vector3();
        const desiredCamera = new THREE.Vector3();
        const cameraTarget = new THREE.Vector3();
        const candidate = new THREE.Vector3();
        camera.position.set(0, 3.6, 11.7);

        const render = (now: number) => {
          if (disposed) return;
          const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
          lastFrameTime = now;
          elapsed += dt;

          if (running) {
            const turn = (pressed.left ? 1 : 0) - (pressed.right ? 1 : 0);
            const drive = (pressed.forward ? 1 : 0) - (pressed.back ? 1 : 0);
            playerRig.rotation.y += turn * 2.05 * dt * (drive < 0 ? -0.72 : 1);
            forward.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRig.rotation.y);
            const speed = drive >= 0 ? 3.65 : 2.25;
            if (drive !== 0) {
              const moveX = forward.x * drive * speed * dt;
              const moveZ = forward.z * drive * speed * dt;
              const testMove = (x: number, z: number) => {
                const cartX = x + forward.x * 0.92;
                const cartZ = z + forward.z * 0.92;
                return !pointBlocked(x, z, 0.58) && !pointBlocked(cartX, cartZ, 0.55);
              };
              if (testMove(playerRig.position.x + moveX, playerRig.position.z)) playerRig.position.x += moveX;
              if (testMove(playerRig.position.x, playerRig.position.z + moveZ)) playerRig.position.z += moveZ;
            }

            grandma.position.y = MINT_WORLD.floorSurfaceY + Math.sin(elapsed * 9) * 0.018 * Math.abs(drive);
            grandma.rotation.z = THREE.MathUtils.lerp(grandma.rotation.z, -turn * 0.055, 0.12);
            cart.rotation.z = THREE.MathUtils.lerp(cart.rotation.z, turn * 0.035, 0.1);

            for (const item of required) {
              if (collected.has(item.id)) continue;
              const pickup = pickupObjects.get(item.id);
              if (!pickup) continue;
              pickup.rotation.y += dt * 0.85;
              pickup.position.y = pickup.userData.baseY + Math.sin(elapsed * 2.4 + pickup.userData.offset) * 0.11;
              const cartPointX = playerRig.position.x + forward.x * 0.85;
              const cartPointZ = playerRig.position.z + forward.z * 0.85;
              if ((pickup.position.x - cartPointX) ** 2 + (pickup.position.z - cartPointZ) ** 2 < 1.35 ** 2) collectItem(item);
            }

            exitRing.rotation.z += dt * 0.5;
            const complete = collected.size === required.length && required.length > 0;
            exitMaterial.color.set(complete ? 0x5ff2c4 : 0xffd75e);
            exitMaterial.emissive.set(complete ? 0x27c99a : 0xff4f68);
            const exitDistance = Math.hypot(playerRig.position.x - 9.25, playerRig.position.z + 6.35);
            checkoutMessageCooldown -= dt;
            if (exitDistance < 1.38) {
              if (complete) finishRound();
              else if (checkoutMessageCooldown <= 0) {
                toast(`Grandma forgot ${required.length - collected.size} item${required.length - collected.size === 1 ? "" : "s"}!`);
                checkoutMessageCooldown = 2.2;
              }
            }

            timeLeft = Math.max(0, timeLeft - dt);
            if (timeLeft <= 0) {
              running = false;
              phase = "lost";
              music.pause();
              toast("The store closed. Grandma demands a recount.");
              pushUi();
            } else if (elapsed - lastUiPush > 0.16) {
              lastUiPush = elapsed;
              pushUi();
            }
          }

          forward.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRig.rotation.y);
          cameraTarget.set(playerRig.position.x, 1.15, playerRig.position.z - 0.35);
          desiredCamera.set(
            playerRig.position.x - forward.x * 4.9,
            3.55,
            playerRig.position.z - forward.z * 4.9,
          );
          desiredCamera.x = THREE.MathUtils.clamp(desiredCamera.x, -11.95, 11.95);
          desiredCamera.z = THREE.MathUtils.clamp(desiredCamera.z, -7.95, 7.95);
          candidate.copy(desiredCamera);
          camera.position.lerp(candidate, 1 - Math.exp(-dt * 7.5));
          camera.lookAt(cameraTarget);
          renderer.render(scene, camera);
          animationFrame = requestAnimationFrame(render);
        };
        animationFrame = requestAnimationFrame(render);

        runtimeCleanup = () => {
          observer.disconnect();
          window.removeEventListener("keydown", keyDown);
          window.removeEventListener("keyup", keyUp);
          window.removeEventListener("blur", releaseControls);
          window.removeEventListener("pointerup", releaseControls);
        };
      } catch (error) {
        console.error("Grandma's Grocery Trip failed to load", error);
        if (!disposed) setUi((value) => ({ ...value, phase: "error", loadingText: "The Mint stockroom jammed" }));
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      runtimeCleanup();
      timers.forEach((timer) => window.clearTimeout(timer));
      music.pause();
      chime.pause();
      controllerRef.current = null;
    };
  }, []);

  const setDirection = (direction: Direction, pressed: boolean) => {
    controllerRef.current?.setDirection(direction, pressed);
  };
  const collected = new Set(ui.collected);
  const timePercent = Math.max(0, Math.min(100, (ui.timeLeft / Math.max(ui.totalTime, 1)) * 100));
  const startLabel = ui.phase === "ready" ? "Start trip" : ui.phase === "lost" ? "Restart trip" : "Restart";

  return (
    <main className="game-shell" data-phase={ui.phase}>
      <canvas ref={canvasRef} className="game-canvas" aria-label="Grandma’s Grocery Trip 3D game" />

      <header className="game-header">
        <div className="brand-lockup">
          <span className="brand-kicker">Grandma’s</span>
          <strong>Grocery Trip</strong>
        </div>
        <div className="header-stats">
          <span>LEVEL <b>{ui.level}</b></span>
          <span>CART <b>{ui.collected.length}/{ui.required.length || Math.min(4 + (ui.level - 1) * 2, 10)}</b></span>
        </div>
        <div className="header-actions">
          <button type="button" onClick={() => controllerRef.current?.toggleMusic()} aria-pressed={ui.musicOn}>
            {ui.musicOn ? "♪ Music on" : "♪ Music off"}
          </button>
          <button type="button" className="start-button" onClick={() => controllerRef.current?.start()} disabled={ui.phase === "loading" || ui.phase === "error"}>
            {startLabel}
          </button>
        </div>
      </header>

      <section className="timer-card" aria-label={`${Math.ceil(ui.timeLeft)} seconds remaining`}>
        <div><span>STORE CLOSES IN</span><strong>{Math.ceil(ui.timeLeft)}s</strong></div>
        <div className="timer-track"><i style={{ width: `${timePercent}%` }} /></div>
      </section>

      <section className="grocery-list" aria-label="Grocery list">
        <div className="list-heading"><span>THE LIST</span><b>{ui.collected.length}/{ui.required.length || "—"}</b></div>
        {ui.required.length ? (
          <ul>
            {ui.required.map((item) => (
              <li key={item.id} className={collected.has(item.id) ? "collected" : ""}>
                <span className="item-emoji" aria-hidden="true">{item.emoji}</span>
                <span>{item.name}</span>
                <i aria-label={collected.has(item.id) ? "Collected" : "Needed"}>{collected.has(item.id) ? "✓" : "○"}</i>
              </li>
            ))}
          </ul>
        ) : <p className="list-empty">Start the trip to reveal Grandma’s demands.</p>}
      </section>

      <div className="keyboard-hint" aria-hidden="true">
        <span><kbd>W</kbd><kbd>↑</kbd> Go</span>
        <span><kbd>A</kbd><kbd>D</kbd> Turn</span>
        <span><kbd>S</kbd><kbd>↓</kbd> Reverse</span>
      </div>

      <section className="touch-controls" aria-label="Touch controls">
        <button
          type="button"
          aria-label="Move forward"
          onPointerDown={() => setDirection("forward", true)}
          onPointerUp={() => setDirection("forward", false)}
          onPointerLeave={() => setDirection("forward", false)}
        >▲</button>
        <div>
          <button type="button" aria-label="Turn left" onPointerDown={() => setDirection("left", true)} onPointerUp={() => setDirection("left", false)} onPointerLeave={() => setDirection("left", false)}>◀</button>
          <button type="button" aria-label="Reverse" onPointerDown={() => setDirection("back", true)} onPointerUp={() => setDirection("back", false)} onPointerLeave={() => setDirection("back", false)}>▼</button>
          <button type="button" aria-label="Turn right" onPointerDown={() => setDirection("right", true)} onPointerUp={() => setDirection("right", false)} onPointerLeave={() => setDirection("right", false)}>▶</button>
        </div>
      </section>

      {ui.toast && <div className="game-toast" role="status">{ui.toast}</div>}

      {(ui.phase === "loading" || ui.phase === "ready" || ui.phase === "lost" || ui.phase === "error") && (
        <section className="game-modal" aria-live="polite">
          <div className="modal-card">
            <span className="modal-sticker" aria-hidden="true">🛒</span>
            <p className="modal-kicker">A very serious errand</p>
            <h1>Grandma’s<br /><em>Grocery Trip</em></h1>
            {ui.phase === "loading" && <p>{ui.loadingText}</p>}
            {ui.phase === "ready" && <p>Find every item, push the cart to checkout, and beat the clock.</p>}
            {ui.phase === "lost" && <p>The store closed with Grandma still in aisle chaos.</p>}
            {ui.phase === "error" && <p>The Mint world could not be loaded. Refresh to try again.</p>}
            {ui.phase !== "loading" && ui.phase !== "error" && (
              <button type="button" onClick={() => controllerRef.current?.start()}>{startLabel}</button>
            )}
            <small>WASD / arrows · touch controls · headphones encouraged</small>
          </div>
        </section>
      )}

      {ui.phase === "won" && (
        <section className="level-up" aria-live="assertive">
          <span>CHA-CHING!</span>
          <strong>Level {ui.level + 1} incoming</strong>
          <p>Grandma’s list is getting longer.</p>
        </section>
      )}
    </main>
  );
}
