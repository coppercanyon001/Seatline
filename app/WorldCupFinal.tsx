"use client";

import { useEffect, useRef, useState } from "react";
import {
  WORLD_CUP_MINT_ASSETS as ASSETS,
  type WorldCupCharacterKey,
} from "./worldCupMintAssets";

type Phase = "loading" | "menu" | "playing" | "goal" | "finished" | "error";
type Team = "spain" | "argentina";
type Command = "up" | "down" | "left" | "right" | "sprint" | "shoot";
type Ui = {
  phase: Phase;
  spain: number;
  argentina: number;
  seconds: number;
  extraTime: boolean;
  status: string;
  loading: string;
  sound: boolean;
  shotCharge: number;
  activePlayer: number;
  winner: Team | "draw" | null;
};
type Controller = {
  start: () => void;
  restart: () => void;
  toggleSound: () => void;
  press: (command: Command) => void;
  release: (command: Command) => void;
  pass: () => void;
  tackle: () => void;
  switchPlayer: () => void;
};

const MATCH_SECONDS = 150;
const FIELD_HALF_X = 15;
const FIELD_HALF_Z = 10.8;
const GOAL_HALF_Z = 2.15;
const INITIAL_UI: Ui = {
  phase: "loading",
  spain: 0,
  argentina: 0,
  seconds: MATCH_SECONDS,
  extraTime: false,
  status: "The final is assembling…",
  loading: "Loading Mint stadium assets…",
  sound: true,
  shotCharge: 0,
  activePlayer: 7,
  winner: null,
};

const formatTime = (seconds: number) => {
  if (seconds < 0) return "GOLDEN GOAL";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.max(0, seconds % 60).toString().padStart(2, "0")}`;
};

export default function WorldCupFinal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const [ui, setUi] = useState<Ui>(INITIAL_UI);

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;
    let animationFrame = 0;
    let runtimeCleanup = () => undefined;
    const timers: number[] = [];
    const held = new Set<Command>();

    const audio = Object.fromEntries(
      Object.entries(ASSETS.audio).map(([name, source]) => [name, new Audio(source)]),
    ) as Record<keyof typeof ASSETS.audio, HTMLAudioElement>;
    audio.crowd.loop = true;
    audio.crowd.volume = 0.28;
    audio.whistle.volume = 0.72;
    audio.kick.volume = 0.55;
    audio.goal.volume = 0.76;
    audio.save.volume = 0.72;
    audio.victory.volume = 0.66;
    let sound = true;
    const playSound = (name: keyof typeof ASSETS.audio, restart = true) => {
      if (!sound) return;
      const clip = audio[name];
      if (restart) clip.currentTime = 0;
      void clip.play().catch(() => undefined);
    };
    const later = (callback: () => void, delay: number) => {
      const id = window.setTimeout(callback, delay);
      timers.push(id);
      return id;
    };

    void (async () => {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
        const { clone: cloneSkeleton } = await import("three/addons/utils/SkeletonUtils.js");
        if (disposed || !canvasRef.current) return;

        type Player = {
          team: Team;
          role: "outfield" | "goalkeeper";
          number: number;
          root: import("three").Group;
          mixer: import("three").AnimationMixer;
          actions: Record<string, import("three").AnimationAction>;
          currentAction: string;
          velocity: import("three").Vector3;
          facing: import("three").Vector3;
          home: import("three").Vector3;
          actionLock: number;
          possessionSince: number;
          cooldown: number;
        };
        type Spectator = {
          team: Team;
          root: import("three").Group;
          mixer: import("three").AnimationMixer;
          actions: Record<string, import("three").AnimationAction>;
          currentAction: string;
        };

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x09162f);
        scene.fog = new THREE.Fog(0x09162f, 38, 86);
        const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 120);
        camera.position.set(-13, 17, 24);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;

        scene.add(new THREE.HemisphereLight(0xffe3a1, 0x14224a, 2.15));
        const keyLight = new THREE.DirectionalLight(0xffd27c, 3.8);
        keyLight.position.set(-12, 25, 14);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(2048, 2048);
        keyLight.shadow.camera.left = -30;
        keyLight.shadow.camera.right = 30;
        keyLight.shadow.camera.top = 24;
        keyLight.shadow.camera.bottom = -20;
        scene.add(keyLight);
        const blueRim = new THREE.DirectionalLight(0x79bfff, 2.2);
        blueRim.position.set(16, 13, -20);
        scene.add(blueRim);
        const warmRim = new THREE.DirectionalLight(0xff665e, 1.35);
        warmRim.position.set(-20, 7, -10);
        scene.add(warmRim);

        const manager = new THREE.LoadingManager();
        manager.onProgress = (_url, loaded, total) => {
          if (!disposed) {
            setUi((value) => ({
              ...value,
              loading: `Opening the final · ${loaded}/${total} Mint assets`,
            }));
          }
        };
        const loader = new GLTFLoader(manager);
        const characterEntries = Object.entries(ASSETS.characters) as [
          WorldCupCharacterKey,
          (typeof ASSETS.characters)[WorldCupCharacterKey],
        ][];
        const paths = [
          ...Object.values(ASSETS.world),
          ...characterEntries.flatMap(([, character]) => [
            character.model,
            ...Object.values(character.animations),
          ]),
        ];
        const loaded = await Promise.all(
          [...new Set(paths)].map(async (path) => [path, await loader.loadAsync(path)] as const),
        );
        if (disposed) return;
        const gltfs = new Map(loaded);
        const sourceScene = (path: string) => cloneSkeleton(gltfs.get(path)!.scene);

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
        const fitWidth = (object: import("three").Object3D, width: number) => {
          const root = new THREE.Group();
          root.add(object);
          object.updateMatrixWorld(true);
          const before = new THREE.Box3().setFromObject(object);
          const scale = width / Math.max(before.getSize(new THREE.Vector3()).x, 0.001);
          object.scale.setScalar(scale);
          object.updateMatrixWorld(true);
          const after = new THREE.Box3().setFromObject(object);
          const center = after.getCenter(new THREE.Vector3());
          object.position.set(-center.x, -after.min.y, -center.z);
          return prepare(root);
        };
        const fitHeight = (object: import("three").Object3D, height: number) => {
          const root = new THREE.Group();
          root.add(object);
          object.updateMatrixWorld(true);
          const before = new THREE.Box3().setFromObject(object);
          const scale = height / Math.max(before.getSize(new THREE.Vector3()).y, 0.001);
          object.scale.setScalar(scale);
          object.updateMatrixWorld(true);
          const after = new THREE.Box3().setFromObject(object);
          const center = after.getCenter(new THREE.Vector3());
          object.position.set(-center.x, -after.min.y, -center.z);
          return prepare(root);
        };
        const fitLargest = (object: import("three").Object3D, size: number) => {
          const root = new THREE.Group();
          root.add(object);
          object.updateMatrixWorld(true);
          const before = new THREE.Box3().setFromObject(object);
          const extent = before.getSize(new THREE.Vector3());
          object.scale.setScalar(size / Math.max(extent.x, extent.y, extent.z, 0.001));
          object.updateMatrixWorld(true);
          const after = new THREE.Box3().setFromObject(object);
          const center = after.getCenter(new THREE.Vector3());
          object.position.set(-center.x, -after.min.y, -center.z);
          return prepare(root);
        };

        const stadium = new THREE.Group();
        scene.add(stadium);
        const pitch = fitWidth(sourceScene(ASSETS.world.pitch), FIELD_HALF_X * 2);
        pitch.position.y = -0.055;
        pitch.traverse((child) => {
          const mesh = child as import("three").Mesh;
          if (mesh.isMesh) mesh.castShadow = false;
        });
        stadium.add(pitch);
        pitch.updateMatrixWorld(true);
        const pitchSurfaceY = new THREE.Box3().setFromObject(pitch).max.y;
        const playerSurfaceY = pitchSurfaceY + 0.035;
        const ballGroundY = pitchSurfaceY + 0.07;

        const addStand = (corner: boolean, x: number, z: number, rotation: number) => {
          const stand = fitWidth(
            sourceScene(corner ? ASSETS.world.cornerStand : ASSETS.world.straightStand),
            corner ? 10.6 : 18.4,
          );
          stand.position.set(x, corner ? 0.08 : 0, z);
          stand.rotation.y = rotation;
          stadium.add(stand);
        };
        for (const x of [-18, 0, 18]) {
          addStand(false, x, -14.7, 0);
          addStand(false, x, 14.7, Math.PI);
          addStand(false, x, -21.1, 0);
          addStand(false, x, 21.1, Math.PI);
        }
        for (const z of [-8.6, 8.6]) {
          addStand(false, -19.2, z, Math.PI / 2);
          addStand(false, 19.2, z, -Math.PI / 2);
          addStand(false, -25.7, z, Math.PI / 2);
          addStand(false, 25.7, z, -Math.PI / 2);
        }
        addStand(true, -18, -13.3, Math.PI / 4);
        addStand(true, 18, -13.3, -Math.PI / 4);
        addStand(true, -18, 13.3, (3 * Math.PI) / 4);
        addStand(true, 18, 13.3, (-3 * Math.PI) / 4);
        addStand(true, -24.4, -19.5, Math.PI / 4);
        addStand(true, 24.4, -19.5, -Math.PI / 4);
        addStand(true, -24.4, 19.5, (3 * Math.PI) / 4);
        addStand(true, 24.4, 19.5, (-3 * Math.PI) / 4);

        const leftGoal = fitHeight(sourceScene(ASSETS.world.goal), 2.45);
        leftGoal.position.set(-15.05, pitchSurfaceY, 0);
        leftGoal.rotation.y = -Math.PI / 2;
        stadium.add(leftGoal);
        const rightGoal = fitHeight(sourceScene(ASSETS.world.goal), 2.45);
        rightGoal.position.set(15.05, pitchSurfaceY, 0);
        rightGoal.rotation.y = Math.PI / 2;
        stadium.add(rightGoal);

        for (const [x, z, rotation] of [
          [-14.8, -10.5, 0],
          [-14.8, 10.5, Math.PI / 2],
          [14.8, -10.5, -Math.PI / 2],
          [14.8, 10.5, Math.PI],
        ] as const) {
          const flag = fitHeight(sourceScene(ASSETS.world.cornerFlag), 1.25);
          flag.position.set(x, pitchSurfaceY + 0.02, z);
          flag.rotation.y = rotation;
          stadium.add(flag);
        }

        const celebrationRoot = new THREE.Group();
        scene.add(celebrationRoot);
        const trophy = fitHeight(sourceScene(ASSETS.world.trophy), 2.6);
        trophy.position.set(0, pitchSurfaceY + 0.1, 0);
        celebrationRoot.add(trophy);
        const confettiLeft = fitLargest(sourceScene(ASSETS.world.confetti), 6.5);
        confettiLeft.position.set(-4.5, pitchSurfaceY + 2.8, 0);
        celebrationRoot.add(confettiLeft);
        const confettiRight = fitLargest(sourceScene(ASSETS.world.confetti), 6.5);
        confettiRight.position.set(4.5, pitchSurfaceY + 2.8, 0);
        confettiRight.rotation.y = Math.PI;
        celebrationRoot.add(confettiRight);
        celebrationRoot.visible = false;

        const normalizeClip = (clip: import("three").AnimationClip) => {
          const normalized = clip.clone();
          for (const track of normalized.tracks) {
            if (!/(^|\\.)Hips\\.position$/i.test(track.name)) continue;
            const values = track.values;
            if (values.length < 3) continue;
            const x = values[0];
            const z = values[2];
            for (let index = 0; index < values.length; index += 3) {
              values[index] = x;
              values[index + 2] = z;
            }
          }
          return normalized;
        };
        const playerRoot = new THREE.Group();
        scene.add(playerRoot);
        const players: Player[] = [];
        const spectatorRoot = new THREE.Group();
        scene.add(spectatorRoot);
        const spectators: Spectator[] = [];
        const createPlayer = (
          key: WorldCupCharacterKey,
          team: Team,
          role: Player["role"],
          number: number,
          x: number,
          z: number,
        ) => {
          const character = ASSETS.characters[key];
          const root = fitHeight(sourceScene(character.model), role === "goalkeeper" ? 2.3 : 2.24);
          root.position.set(x, playerSurfaceY, z);
          root.rotation.y = team === "spain" ? Math.PI / 2 : -Math.PI / 2;
          playerRoot.add(root);
          const mixer = new THREE.AnimationMixer(root);
          const actions: Record<string, import("three").AnimationAction> = {};
          for (const [name, path] of Object.entries(character.animations)) {
            const source = gltfs.get(path)!.animations[0];
            const action = mixer.clipAction(normalizeClip(source), root);
            if (!["idle", "run"].includes(name)) {
              action.setLoop(THREE.LoopOnce, 1);
              action.clampWhenFinished = true;
            }
            actions[name] = action;
          }
          actions.idle.reset().play();
          const player: Player = {
            team,
            role,
            number,
            root,
            mixer,
            actions,
            currentAction: "idle",
            velocity: new THREE.Vector3(),
            facing: new THREE.Vector3(team === "spain" ? 1 : -1, 0, 0),
            home: new THREE.Vector3(x, playerSurfaceY, z),
            actionLock: 0,
            possessionSince: 0,
            cooldown: 0,
          };
          players.push(player);
          return player;
        };

        const spain = [
          createPlayer("spainOutfield", "spain", "outfield", 7, -5.5, 0),
          createPlayer("spainOutfield", "spain", "outfield", 10, -1.8, -5.3),
          createPlayer("spainOutfield", "spain", "outfield", 8, -1.8, 5.3),
        ];
        const argentina = [
          createPlayer("argentinaOutfield", "argentina", "outfield", 10, 5.4, 0),
          createPlayer("argentinaOutfield", "argentina", "outfield", 11, 1.9, -5.3),
          createPlayer("argentinaOutfield", "argentina", "outfield", 7, 1.9, 5.3),
        ];
        const spainKeeper = createPlayer("spainGoalkeeper", "spain", "goalkeeper", 1, -13.9, 0);
        const argentinaKeeper = createPlayer("argentinaGoalkeeper", "argentina", "goalkeeper", 23, 13.9, 0);
        let controlled = spain[0];

        const createSpectator = (
          team: Team,
          x: number,
          y: number,
          z: number,
          rotation: number,
          height: number,
        ) => {
          const key: WorldCupCharacterKey =
            team === "spain" ? "spainOutfield" : "argentinaOutfield";
          const character = ASSETS.characters[key];
          const root = fitHeight(sourceScene(character.model), height);
          root.position.set(x, y, z);
          root.rotation.y = rotation;
          spectatorRoot.add(root);
          const mixer = new THREE.AnimationMixer(root);
          const actions: Record<string, import("three").AnimationAction> = {};
          for (const name of ["idle", "victory"] as const) {
            const source = gltfs.get(character.animations[name])!.animations[0];
            const action = mixer.clipAction(normalizeClip(source), root);
            if (name === "victory") {
              action.setLoop(THREE.LoopRepeat, 2);
              action.clampWhenFinished = true;
            }
            actions[name] = action;
          }
          actions.idle.reset().play();
          spectators.push({ team, root, mixer, actions, currentAction: "idle" });
        };
        const supporterXs = [-24, -18, -12, -6, 0, 6, 12, 18, 24];
        const sideRows = [
          { z: 12.45, y: 2.35, height: 1.16 },
          { z: 14.1, y: 3.55, height: 1.2 },
          { z: 15.75, y: 4.75, height: 1.24 },
        ] as const;
        sideRows.forEach((row, rowIndex) => {
          supporterXs.forEach((x, index) => {
            const team: Team = (index + rowIndex) % 2 === 0 ? "spain" : "argentina";
            createSpectator(team, x, row.y, -row.z, 0, row.height);
            createSpectator(
              team === "spain" ? "argentina" : "spain",
              x,
              row.y,
              row.z,
              Math.PI,
              row.height,
            );
          });
        });
        const endSupporterZs = [-8, -4, 0, 4, 8];
        const endRows = [
          { x: 18.15, y: 2.4, height: 1.16 },
          { x: 20.15, y: 4.05, height: 1.22 },
        ] as const;
        endRows.forEach((row, rowIndex) => {
          endSupporterZs.forEach((z, index) => {
            const team: Team = (index + rowIndex) % 2 === 0 ? "spain" : "argentina";
            createSpectator(team, -row.x, row.y, z, Math.PI / 2, row.height);
            createSpectator(
              team === "spain" ? "argentina" : "spain",
              row.x,
              row.y,
              z,
              -Math.PI / 2,
              row.height,
            );
          });
        });
        const playSpectatorAction = (spectator: Spectator, name: "idle" | "victory") => {
          if (spectator.currentAction === name) return;
          spectator.actions[name].reset().fadeIn(0.18).play();
          spectator.actions[spectator.currentAction]?.fadeOut(0.18);
          spectator.currentAction = name;
        };
        const setSpectatorMood = (winner: Team | "all" | null) => {
          spectators.forEach((spectator) => {
            const action =
              winner && (winner === "all" || spectator.team === winner)
                ? "victory"
                : "idle";
            playSpectatorAction(spectator, action);
          });
        };

        const ball = fitLargest(sourceScene(ASSETS.world.football), 0.46);
        ball.position.set(0, ballGroundY, 0);
        scene.add(ball);
        const ballLight = new THREE.PointLight(0xffefaa, 1.35, 5.5, 2);
        scene.add(ballLight);
        const ballVelocity = new THREE.Vector3();
        let ballOwner: Player | null = null;
        let lastTouch: Team = "spain";
        let phase: Phase = "menu";
        let scores: Record<Team, number> = { spain: 0, argentina: 0 };
        let secondsLeft = MATCH_SECONDS;
        let extraTime = false;
        let goalPause = 0;
        let shotCharge = 0;
        let lastUiSecond = MATCH_SECONDS;
        let clockAccumulator = 0;
        let elapsed = 0;

        const actionDuration = (player: Player, name: string) =>
          player.actions[name]?.getClip().duration ?? 0.6;
        const playAction = (player: Player, name: string, lock = false) => {
          const next = player.actions[name];
          if (!next || player.currentAction === name) return;
          const previous = player.actions[player.currentAction];
          next.reset().fadeIn(0.12).play();
          previous?.fadeOut(0.12);
          player.currentAction = name;
          if (lock) player.actionLock = elapsed + Math.min(actionDuration(player, name), 1.2);
        };
        const updateMovementAction = (player: Player) => {
          if (player.actionLock > elapsed || phase === "finished") return;
          playAction(player, player.velocity.lengthSq() > 0.08 ? "run" : "idle");
        };
        const setFacing = (player: Player, direction: import("three").Vector3) => {
          if (direction.lengthSq() < 0.001) return;
          player.facing.copy(direction).setY(0).normalize();
          player.root.rotation.y = Math.atan2(player.facing.x, player.facing.z);
        };
        const moveToward = (player: Player, target: import("three").Vector3, speed: number, delta: number) => {
          const direction = target.clone().sub(player.root.position).setY(0);
          if (direction.length() < 0.16) {
            player.velocity.set(0, 0, 0);
            return;
          }
          direction.normalize();
          player.velocity.copy(direction).multiplyScalar(speed);
          player.root.position.addScaledVector(player.velocity, delta);
          setFacing(player, direction);
        };
        const clampPlayer = (player: Player) => {
          const keeperLimit = player.role === "goalkeeper" ? GOAL_HALF_Z + 0.35 : FIELD_HALF_Z - 0.45;
          player.root.position.z = THREE.MathUtils.clamp(player.root.position.z, -keeperLimit, keeperLimit);
          if (player.role === "goalkeeper") {
            const anchor = player.team === "spain" ? -13.9 : 13.9;
            player.root.position.x = THREE.MathUtils.clamp(player.root.position.x, anchor - 0.55, anchor + 0.55);
          } else {
            player.root.position.x = THREE.MathUtils.clamp(player.root.position.x, -14.3, 14.3);
          }
        };
        const nearest = (team: Team, target: import("three").Vector3, includeKeeper = false) =>
          players
            .filter((player) => player.team === team && (includeKeeper || player.role === "outfield"))
            .sort(
              (a, b) =>
                a.root.position.distanceToSquared(target) - b.root.position.distanceToSquared(target),
            )[0];
        const giveBall = (player: Player) => {
          ballOwner = player;
          player.possessionSince = elapsed;
          ballVelocity.set(0, 0, 0);
          lastTouch = player.team;
        };
        const releaseBall = (
          player: Player,
          direction: import("three").Vector3,
          speed: number,
          lift = 0,
        ) => {
          if (ballOwner !== player) return;
          ballOwner = null;
          lastTouch = player.team;
          const normalized = direction.clone().setY(0).normalize();
          ball.position.copy(player.root.position).addScaledVector(normalized, 0.75);
          ball.position.y = ballGroundY + 0.05;
          ballVelocity.copy(normalized).multiplyScalar(speed);
          ballVelocity.y = lift;
          playAction(player, "kick", true);
          playSound("kick");
        };
        const passBall = (player: Player) => {
          if (ballOwner !== player) return;
          const teammates = players
            .filter((candidate) => candidate.team === player.team && candidate !== player && candidate.role === "outfield")
            .sort(
              (a, b) =>
                a.root.position.distanceToSquared(player.root.position) -
                b.root.position.distanceToSquared(player.root.position),
            );
          const target = teammates.find((candidate) => {
            const ahead = candidate.root.position.x - player.root.position.x;
            return player.team === "spain" ? ahead > -1 : ahead < 1;
          }) ?? teammates[0];
          if (!target) return;
          const lead = target.root.position.clone().addScaledVector(target.velocity, 0.18);
          releaseBall(player, lead.sub(player.root.position), 8.4, 0.42);
          if (player.team === "spain") {
            controlled = target;
            setUi((value) => ({ ...value, activePlayer: target.number, status: "Pass and move!" }));
          }
        };
        const shootBall = (player: Player, charge: number) => {
          if (ballOwner !== player) return;
          const goalX = player.team === "spain" ? 16 : -16;
          const targetZ = THREE.MathUtils.clamp(
            player.root.position.z * -0.24 + (Math.random() - 0.5) * 1.1,
            -GOAL_HALF_Z + 0.3,
            GOAL_HALF_Z - 0.3,
          );
          const target = new THREE.Vector3(goalX, 0, targetZ);
          releaseBall(player, target.sub(player.root.position), 8.7 + charge * 5.1, 0.7 + charge * 0.65);
        };
        const tackle = (player: Player) => {
          if (player.actionLock > elapsed) return;
          playAction(player, "tackle", true);
          player.root.position.addScaledVector(player.facing, 0.46);
          if (
            ballOwner &&
            ballOwner.team !== player.team &&
            ballOwner.root.position.distanceTo(player.root.position) < 1.25
          ) {
            const victim = ballOwner;
            playAction(victim, "hit", true);
            ballOwner = null;
            ball.position.copy(victim.root.position);
            ball.position.y = ballGroundY;
            ballVelocity.copy(player.facing).multiplyScalar(2.8);
            later(() => {
              if (phase === "playing") giveBall(player);
            }, 170);
          }
        };

        const resetPositions = (kickoff: Team) => {
          for (const player of players) {
            player.root.position.copy(player.home);
            player.velocity.set(0, 0, 0);
            player.actionLock = 0;
            setFacing(player, new THREE.Vector3(player.team === "spain" ? 1 : -1, 0, 0));
          }
          ball.position.set(0, ballGroundY, 0);
          ballVelocity.set(0, 0, 0);
          setSpectatorMood(null);
          giveBall(kickoff === "spain" ? spain[0] : argentina[0]);
          controlled = spain[0];
          setUi((value) => ({ ...value, activePlayer: controlled.number }));
        };
        const finishMatch = (winner: Team | "draw") => {
          phase = "finished";
          ballOwner = null;
          held.clear();
          celebrationRoot.visible = winner === "spain";
          setSpectatorMood(winner === "draw" ? null : "all");
          players.forEach((player) => {
            player.velocity.set(0, 0, 0);
            if (player.team === winner) playAction(player, "victory", true);
            else playAction(player, "hit", true);
          });
          playSound("whistle");
          if (winner === "spain") playSound("victory");
          setUi((value) => ({
            ...value,
            phase: "finished",
            winner,
            status:
              winner === "spain"
                ? "Spain are champions!"
                : winner === "argentina"
                  ? "Argentina take the trophy."
                  : "The final ends level.",
            shotCharge: 0,
          }));
        };
        const scoreGoal = (team: Team) => {
          if (phase !== "playing") return;
          scores = { ...scores, [team]: scores[team] + 1 };
          phase = "goal";
          goalPause = elapsed + 2.25;
          ballOwner = null;
          ballVelocity.set(0, 0, 0);
          playSound("goal");
          setSpectatorMood("all");
          players
            .filter((player) => player.team === team && player.role === "outfield")
            .forEach((player) => playAction(player, "victory", true));
          setUi((value) => ({
            ...value,
            phase: "goal",
            spain: scores.spain,
            argentina: scores.argentina,
            status: team === "spain" ? "GOAL SPAIN!" : "GOAL ARGENTINA!",
          }));
          if (extraTime) {
            later(() => finishMatch(team), 1550);
          }
        };
        const startMatch = (resetScore: boolean) => {
          if (resetScore) scores = { spain: 0, argentina: 0 };
          secondsLeft = MATCH_SECONDS;
          lastUiSecond = MATCH_SECONDS;
          clockAccumulator = 0;
          extraTime = false;
          phase = "playing";
          celebrationRoot.visible = false;
          setSpectatorMood(null);
          resetPositions("spain");
          playSound("whistle");
          playSound("crowd", false);
          setUi((value) => ({
            ...value,
            phase: "playing",
            spain: scores.spain,
            argentina: scores.argentina,
            seconds: MATCH_SECONDS,
            extraTime: false,
            winner: null,
            status: "Kick-off — Spain attack to the right",
            shotCharge: 0,
          }));
        };

        const updateUser = (delta: number) => {
          const direction = new THREE.Vector3(
            (held.has("up") ? 1 : 0) - (held.has("down") ? 1 : 0),
            0,
            (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0),
          );
          if (direction.lengthSq() > 0) {
            direction.normalize();
            const speed = held.has("sprint") ? 6.1 : 4.45;
            controlled.velocity.copy(direction).multiplyScalar(speed);
            controlled.root.position.addScaledVector(controlled.velocity, delta);
            setFacing(controlled, direction);
          } else {
            controlled.velocity.multiplyScalar(Math.max(0, 1 - delta * 13));
          }
          clampPlayer(controlled);
          if (held.has("shoot") && ballOwner === controlled) {
            shotCharge = Math.min(1, shotCharge + delta * 0.78);
            setUi((value) =>
              Math.abs(value.shotCharge - shotCharge) > 0.04
                ? { ...value, shotCharge }
                : value,
            );
          }
        };
        const updateOutfieldAi = (delta: number) => {
          const looseTarget = ballOwner?.root.position ?? ball.position;
          for (const team of ["spain", "argentina"] as Team[]) {
            const squad = team === "spain" ? spain : argentina;
            const chaser = nearest(team, looseTarget);
            for (const player of squad) {
              if (player === controlled) continue;
              player.cooldown = Math.max(0, player.cooldown - delta);
              if (ballOwner === player) {
                const goal = new THREE.Vector3(team === "spain" ? 15.5 : -15.5, 0, 0);
                const distance = Math.abs(goal.x - player.root.position.x);
                const opponent = nearest(team === "spain" ? "argentina" : "spain", player.root.position);
                if (distance < 8.4 && player.cooldown <= 0) {
                  shootBall(player, 0.52 + Math.random() * 0.3);
                  player.cooldown = 1.5;
                } else if (
                  opponent.root.position.distanceTo(player.root.position) < 1.45 &&
                  player.cooldown <= 0
                ) {
                  passBall(player);
                  player.cooldown = 1.2;
                } else {
                  const lane = goal.clone();
                  lane.z = THREE.MathUtils.clamp(player.root.position.z * 0.72, -6.8, 6.8);
                  moveToward(player, lane, 3.7, delta);
                }
              } else if (
                ballOwner &&
                ballOwner.team !== team &&
                player === chaser
              ) {
                moveToward(player, ballOwner.root.position, 4.25, delta);
                if (player.root.position.distanceTo(ballOwner.root.position) < 1.1 && player.cooldown <= 0) {
                  tackle(player);
                  player.cooldown = 1.25;
                }
              } else if (!ballOwner && player === chaser) {
                moveToward(player, ball.position, 4.1, delta);
              } else {
                const shift = THREE.MathUtils.clamp(ball.position.x * 0.18, -2.3, 2.3);
                const target = player.home.clone();
                target.x += shift;
                moveToward(player, target, 3.1, delta);
              }
              clampPlayer(player);
            }
          }
        };
        const updateKeeper = (keeper: Player, delta: number) => {
          keeper.cooldown = Math.max(0, keeper.cooldown - delta);
          const ownSide = keeper.team === "spain" ? -1 : 1;
          const target = new THREE.Vector3(
            ownSide * 13.9,
            playerSurfaceY,
            THREE.MathUtils.clamp(ball.position.z, -1.85, 1.85),
          );
          if (ballOwner === keeper) {
            keeper.velocity.set(0, 0, 0);
            if (elapsed - keeper.possessionSince > 0.72) {
              const teammate = nearest(keeper.team, keeper.root.position);
              releaseBall(keeper, teammate.root.position.clone().sub(keeper.root.position), 8.2, 0.65);
              keeper.cooldown = 1;
            }
          } else {
            moveToward(keeper, target, 3.5, delta);
            const distance = keeper.root.position.distanceTo(ball.position);
            const dangerous =
              (keeper.team === "spain" && ballVelocity.x < -0.4) ||
              (keeper.team === "argentina" && ballVelocity.x > 0.4) ||
              ballOwner?.team !== keeper.team;
            if (distance < 1.18 && dangerous && keeper.cooldown <= 0) {
              giveBall(keeper);
              playAction(keeper, "save", true);
              playSound("save");
              keeper.cooldown = 1.25;
            }
          }
          clampPlayer(keeper);
        };
        const updateBall = (delta: number) => {
          if (ballOwner) {
            const front = ballOwner.facing.clone().multiplyScalar(0.58);
            ball.position.copy(ballOwner.root.position).add(front);
            ball.position.y = ballGroundY;
            ball.rotation.x += delta * ballOwner.velocity.length() * 2;
            return;
          }
          ballVelocity.y -= 5.6 * delta;
          ball.position.addScaledVector(ballVelocity, delta);
          ball.rotation.z -= ballVelocity.x * delta * 2.7;
          ball.rotation.x += ballVelocity.z * delta * 2.7;
          if (ball.position.y <= ballGroundY) {
            ball.position.y = ballGroundY;
            ballVelocity.y = Math.abs(ballVelocity.y) > 1.2 ? Math.abs(ballVelocity.y) * 0.34 : 0;
            const drag = Math.max(0, 1 - delta * 1.05);
            ballVelocity.x *= drag;
            ballVelocity.z *= drag;
          }
          if (Math.abs(ball.position.z) > FIELD_HALF_Z) {
            ball.position.z = THREE.MathUtils.clamp(ball.position.z, -FIELD_HALF_Z, FIELD_HALF_Z);
            ballVelocity.z *= -0.64;
          }
          const inGoalMouth =
            Math.abs(ball.position.z) < GOAL_HALF_Z &&
            ball.position.y < pitchSurfaceY + 2.7;
          if (ball.position.x > FIELD_HALF_X + 0.18) {
            if (inGoalMouth) scoreGoal("spain");
            else {
              ball.position.x = FIELD_HALF_X;
              ballVelocity.x *= -0.62;
            }
          } else if (ball.position.x < -FIELD_HALF_X - 0.18) {
            if (inGoalMouth) scoreGoal("argentina");
            else {
              ball.position.x = -FIELD_HALF_X;
              ballVelocity.x *= -0.62;
            }
          }
          if (phase !== "playing") return;
          const candidates = [...players].sort(
            (a, b) =>
              a.root.position.distanceToSquared(ball.position) -
              b.root.position.distanceToSquared(ball.position),
          );
          const candidate = candidates[0];
          if (
            candidate &&
            candidate.root.position.distanceTo(ball.position) < (candidate.role === "goalkeeper" ? 1 : 0.72) &&
            ball.position.y < ballGroundY + 0.75 &&
            ballVelocity.length() < 7.2
          ) {
            giveBall(candidate);
            if (candidate.team === "spain" && candidate.role === "outfield") {
              controlled = candidate;
              setUi((value) => ({ ...value, activePlayer: candidate.number }));
            }
          }
        };
        const resolvePlayerSpacing = () => {
          for (let a = 0; a < players.length; a += 1) {
            for (let b = a + 1; b < players.length; b += 1) {
              const delta = players[b].root.position.clone().sub(players[a].root.position).setY(0);
              const distance = delta.length();
              if (distance > 0 && distance < 0.58) {
                delta.normalize().multiplyScalar((0.58 - distance) * 0.5);
                if (players[a].role === "outfield") players[a].root.position.addScaledVector(delta, -1);
                if (players[b].role === "outfield") players[b].root.position.add(delta);
              }
            }
          }
        };
        const updateClock = (delta: number) => {
          if (extraTime) return;
          clockAccumulator += delta;
          if (clockAccumulator < 1) return;
          const ticks = Math.floor(clockAccumulator);
          clockAccumulator -= ticks;
          secondsLeft = Math.max(0, secondsLeft - ticks);
          if (secondsLeft !== lastUiSecond) {
            lastUiSecond = secondsLeft;
            setUi((value) => ({ ...value, seconds: secondsLeft }));
          }
          if (secondsLeft === 0) {
            if (scores.spain === scores.argentina) {
              extraTime = true;
              playSound("whistle");
              setUi((value) => ({
                ...value,
                extraTime: true,
                seconds: -1,
                status: "Golden goal — next score wins!",
              }));
            } else {
              finishMatch(scores.spain > scores.argentina ? "spain" : "argentina");
            }
          }
        };
        const switchPlayer = () => {
          if (phase !== "playing") return;
          const options = [...spain].sort(
            (a, b) =>
              a.root.position.distanceToSquared(ball.position) -
              b.root.position.distanceToSquared(ball.position),
          );
          const next = options.find((player) => player !== controlled) ?? options[0];
          controlled.velocity.set(0, 0, 0);
          controlled = next;
          setUi((value) => ({
            ...value,
            activePlayer: next.number,
            status: `Controlling Spain #${next.number}`,
          }));
        };

        controllerRef.current = {
          start: () => startMatch(true),
          restart: () => startMatch(true),
          toggleSound: () => {
            sound = !sound;
            if (!sound) {
              Object.values(audio).forEach((clip) => clip.pause());
            } else if (phase === "playing") {
              playSound("crowd", false);
            }
            setUi((value) => ({ ...value, sound }));
          },
          press: (command) => held.add(command),
          release: (command) => {
            held.delete(command);
            if (command === "shoot") {
              if (ballOwner === controlled) shootBall(controlled, Math.max(0.2, shotCharge));
              shotCharge = 0;
              setUi((value) => ({ ...value, shotCharge: 0 }));
            }
          },
          pass: () => passBall(controlled),
          tackle: () => tackle(controlled),
          switchPlayer,
        };

        const keyMap: Record<string, Command | undefined> = {
          w: "up",
          arrowup: "up",
          s: "down",
          arrowdown: "down",
          a: "left",
          arrowleft: "left",
          d: "right",
          arrowright: "right",
          shift: "sprint",
          k: "shoot",
          " ": "shoot",
        };
        const onKeyDown = (event: KeyboardEvent) => {
          const key = event.key.toLowerCase();
          const command = keyMap[key];
          if (command) {
            event.preventDefault();
            held.add(command);
          }
          if (event.repeat) return;
          if (key === "j") passBall(controlled);
          if (key === "l") tackle(controlled);
          if (key === "q") switchPlayer();
          if (new URLSearchParams(location.search).has("qa")) {
            if (key === "g") scoreGoal("spain");
            if (key === "h") scoreGoal("argentina");
            if (key === "v") {
              scores = { spain: 2, argentina: 1 };
              setUi((value) => ({ ...value, spain: 2, argentina: 1 }));
              finishMatch("spain");
            }
            if (key === "x") {
              scores = { spain: 1, argentina: 1 };
              secondsLeft = 1;
              setUi((value) => ({ ...value, spain: 1, argentina: 1, seconds: 1 }));
            }
          }
        };
        const onKeyUp = (event: KeyboardEvent) => {
          const command = keyMap[event.key.toLowerCase()];
          if (!command) return;
          held.delete(command);
          if (command === "shoot") {
            if (ballOwner === controlled) shootBall(controlled, Math.max(0.2, shotCharge));
            shotCharge = 0;
            setUi((value) => ({ ...value, shotCharge: 0 }));
          }
        };
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

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
        runtimeCleanup = () => {
          observer.disconnect();
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("keyup", onKeyUp);
          renderer.dispose();
        };

        setUi((value) => ({
          ...value,
          phase: "menu",
          loading: "Final ready",
          status: "A nation waits. One match decides everything.",
        }));

        let previousFrame = performance.now();
        const cameraTarget = new THREE.Vector3();
        const desiredCamera = new THREE.Vector3();
        const render = () => {
          if (disposed) return;
          animationFrame = requestAnimationFrame(render);
          const now = performance.now();
          const delta = Math.min((now - previousFrame) / 1000, 0.05);
          previousFrame = now;
          elapsed += delta;

          if (phase === "playing") {
            updateUser(delta);
            updateOutfieldAi(delta);
            updateKeeper(spainKeeper, delta);
            updateKeeper(argentinaKeeper, delta);
            updateBall(delta);
            resolvePlayerSpacing();
            updateClock(delta);
          } else if (phase === "goal" && elapsed >= goalPause) {
            phase = "playing";
            resetPositions(lastTouch === "spain" ? "argentina" : "spain");
            setUi((value) => ({
              ...value,
              phase: "playing",
              status: extraTime ? "Golden goal continues" : "Back to the centre",
            }));
          } else if (phase === "menu") {
            ball.rotation.y += delta * 0.8;
          }

          for (const player of players) {
            updateMovementAction(player);
            player.mixer.update(delta);
          }
          for (const spectator of spectators) {
            spectator.mixer.update(delta);
          }
          ballLight.position.copy(ball.position);
          ballLight.position.y += 0.65;
          if (celebrationRoot.visible) {
            celebrationRoot.rotation.y = Math.sin(elapsed * 0.7) * 0.08;
          }

          const focus =
            phase === "finished"
              ? new THREE.Vector3(0, 1.2, 0)
              : controlled.root.position.clone().lerp(ball.position, 0.48);
          cameraTarget.lerp(focus, 1 - Math.exp(-delta * 3.2));
          if (phase === "finished") {
            desiredCamera.set(-9.5, 9.7, 14);
          } else if (phase === "menu") {
            desiredCamera.set(-16, 20, 29);
          } else {
            desiredCamera.set(
              THREE.MathUtils.clamp(cameraTarget.x - 8.7, -18, 2.5),
              12.4,
              THREE.MathUtils.clamp(cameraTarget.z + 12.2, 9.5, 14.8),
            );
          }
          camera.position.lerp(desiredCamera, 1 - Math.exp(-delta * 2.4));
          camera.lookAt(
            cameraTarget.x,
            phase === "finished" ? pitchSurfaceY + 1.2 : pitchSurfaceY + 0.85,
            cameraTarget.z,
          );
          renderer.render(scene, camera);
        };
        render();

      } catch (error) {
        console.error(error);
        if (!disposed) {
          setUi((value) => ({
            ...value,
            phase: "error",
            status: "The stadium could not open.",
            loading: error instanceof Error ? error.message : "Unknown loading error",
          }));
        }
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      runtimeCleanup();
      timers.forEach((timer) => clearTimeout(timer));
      Object.values(audio).forEach((clip) => {
        clip.pause();
        clip.src = "";
      });
      controllerRef.current = null;
    };
  }, []);

  const holdProps = (command: Command) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      controllerRef.current?.press(command);
    },
    onPointerUp: () => controllerRef.current?.release(command),
    onPointerCancel: () => controllerRef.current?.release(command),
    onPointerLeave: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.buttons === 0) controllerRef.current?.release(command);
    },
  });

  return (
    <main className="final-game">
      <canvas ref={canvasRef} className="final-canvas" aria-label="Spain versus Argentina 3D football final" />

      {ui.phase !== "loading" && ui.phase !== "menu" && ui.phase !== "error" && (
        <>
          <header className="final-scoreboard" aria-live="polite">
            <div className="final-team final-spain">
              <span className="final-flag" aria-hidden="true"><i /><i /><i /></span>
              <b>SPAIN</b>
              <strong>{ui.spain}</strong>
            </div>
            <div className="final-clock">
              <small>{ui.extraTime ? "FINAL · EXTRA TIME" : "WORLD FINAL"}</small>
              <b>{formatTime(ui.seconds)}</b>
            </div>
            <div className="final-team final-argentina">
              <strong>{ui.argentina}</strong>
              <b>ARGENTINA</b>
              <span className="final-flag" aria-hidden="true"><i /><i /><i /></span>
            </div>
          </header>
          <div className={`final-callout ${ui.phase === "goal" ? "is-goal" : ""}`}>{ui.status}</div>
          <button className="final-sound" onClick={() => controllerRef.current?.toggleSound()}>
            {ui.sound ? "SOUND ON" : "SOUND OFF"}
          </button>
          <div className="final-active">ACTIVE · SPAIN #{ui.activePlayer}</div>
          <div className="final-charge" aria-label={`Shot power ${Math.round(ui.shotCharge * 100)} percent`}>
            <span style={{ width: `${Math.round(ui.shotCharge * 100)}%` }} />
          </div>

          <section className="final-touch" aria-label="Match controls">
            <div className="final-dpad">
              <button className="up" aria-label="Run forward" {...holdProps("up")}>▲</button>
              <button className="left" aria-label="Run left" {...holdProps("left")}>◀</button>
              <button className="right" aria-label="Run right" {...holdProps("right")}>▶</button>
              <button className="down" aria-label="Run back" {...holdProps("down")}>▼</button>
            </div>
            <div className="final-actions">
              <button className="switch" onClick={() => controllerRef.current?.switchPlayer()}>SWITCH<small>Q</small></button>
              <button className="pass" onClick={() => controllerRef.current?.pass()}>PASS<small>J</small></button>
              <button className="tackle" onClick={() => controllerRef.current?.tackle()}>TACKLE<small>L</small></button>
              <button className="shoot" {...holdProps("shoot")}>SHOOT<small>HOLD K</small></button>
            </div>
          </section>
        </>
      )}

      {ui.phase === "loading" && (
        <section className="final-overlay final-loading">
          <div className="final-ball-loader" aria-hidden="true">◆</div>
          <p>{ui.loading}</p>
        </section>
      )}

      {ui.phase === "menu" && (
        <section className="final-overlay final-menu">
          <p className="final-eyebrow">ONE NIGHT · ONE TROPHY · ONE FINAL</p>
          <h1><span>FINAL</span> WHISTLE</h1>
          <div className="final-versus">
            <strong className="spain">SPAIN</strong>
            <i>VS</i>
            <strong className="argentina">ARGENTINA</strong>
          </div>
          <p className="final-intro">
            Lead Spain through 150 seconds of arcade football. Pass into space,
            tackle cleanly, and charge your shot. A draw goes to golden goal.
          </p>
          <button className="final-primary" onClick={() => controllerRef.current?.start()}>
            PLAY THE FINAL
          </button>
          <p className="final-keys">WASD / ARROWS MOVE · SHIFT SPRINT · J PASS · HOLD K SHOOT · L TACKLE · Q SWITCH</p>
        </section>
      )}

      {ui.phase === "finished" && (
        <section className="final-overlay final-result">
          <p className="final-eyebrow">FULL TIME</p>
          <h1>
            {ui.winner === "spain"
              ? "SPAIN ARE CHAMPIONS"
              : ui.winner === "argentina"
                ? "ARGENTINA WIN THE FINAL"
                : "ALL SQUARE"}
          </h1>
          <div className="final-result-score">{ui.spain}<span>—</span>{ui.argentina}</div>
          <p>{ui.status}</p>
          <button className="final-primary" onClick={() => controllerRef.current?.restart()}>
            REMATCH
          </button>
        </section>
      )}

      {ui.phase === "error" && (
        <section className="final-overlay final-result">
          <p className="final-eyebrow">LOAD ERROR</p>
          <h1>THE FINAL NEEDS A RESTART</h1>
          <p>{ui.loading}</p>
          <button className="final-primary" onClick={() => location.reload()}>RELOAD STADIUM</button>
        </section>
      )}

      <footer className="final-credit">ORIGINAL GAME · WORLD, PLAYERS, ANIMATION & AUDIO CREATED WITH MINT</footer>
    </main>
  );
}
