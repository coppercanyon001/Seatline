"use client";

import { useEffect, useRef, useState } from "react";
import { MINT_WORLD } from "./mintWorld";

type Calibration = {
  bounds: string;
  scale: string;
  status: "waiting" | "loading" | "ready" | "error";
};

const INITIAL: Calibration = {
  bounds: "Waiting for Mint",
  scale: "—",
  status: MINT_WORLD.runtimeUrl ? "loading" : "waiting",
};

export default function CalibrationView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [calibration, setCalibration] = useState<Calibration>(INITIAL);

  useEffect(() => {
    if (!canvasRef.current || !MINT_WORLD.runtimeUrl) return;
    let disposed = false;
    let renderer: import("three").WebGLRenderer | undefined;
    let frame = 0;

    void (async () => {
      try {
        setCalibration((value) => ({ ...value, status: "loading" }));
        const THREE = await import("three");
        const { SparkRenderer, SplatMesh } = await import("@sparkjsdev/spark");
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
        if (disposed || !canvasRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#160f2b");
        const camera = new THREE.PerspectiveCamera(52, 1, 0.05, 1000);
        camera.position.set(0, 4.1, 11.5);
        camera.lookAt(0, 2.2, -2.5);

        renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current,
          antialias: true,
          alpha: false,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const spark = new SparkRenderer({ renderer });
        scene.add(spark);
        const worldRoot = new THREE.Group();
        worldRoot.rotation.set(...MINT_WORLD.rotation);
        scene.add(worldRoot);
        const shell = new SplatMesh({
          url: MINT_WORLD.runtimeUrl,
          paged: true,
          lod: false,
        });
        worldRoot.add(shell);
        const [, colliderGltf] = await Promise.all([
          shell.initialized,
          new GLTFLoader().loadAsync(MINT_WORLD.colliderUrl),
        ]);
        if (disposed) return;

        const collider = colliderGltf.scene;
        collider.visible = false;
        worldRoot.add(collider);
        const localBounds = new THREE.Box3().setFromObject(collider);
        const rawSize = localBounds.getSize(new THREE.Vector3());
        const safe = (value: number) => Math.max(value, 0.001);
        const worldScale = new THREE.Vector3(
          MINT_WORLD.playableWidth / safe(rawSize.x),
          MINT_WORLD.playableHeight / safe(rawSize.y),
          MINT_WORLD.playableDepth / safe(rawSize.z),
        );
        worldRoot.scale.copy(worldScale);
        const localCenter = localBounds.getCenter(new THREE.Vector3());
        worldRoot.position.set(
          -localCenter.x * worldScale.x,
          MINT_WORLD.splatFloorY - localBounds.min.y * worldScale.y,
          -localCenter.z * worldScale.z,
        );
        worldRoot.updateMatrixWorld(true);

        const calibratedBounds = new THREE.Box3().setFromObject(collider);
        const calibratedSize = calibratedBounds.getSize(new THREE.Vector3());
        setCalibration({
          bounds: `${calibratedSize.x.toFixed(1)} × ${calibratedSize.z.toFixed(1)} × ${calibratedSize.y.toFixed(1)} m`,
          scale: `${worldScale.x.toFixed(2)} / ${worldScale.y.toFixed(2)} / ${worldScale.z.toFixed(2)}`,
          status: "ready",
        });

        const floor = new THREE.GridHelper(
          Math.max(MINT_WORLD.playableWidth, MINT_WORLD.playableDepth),
          26,
          0xffd75e,
          0x5ff2c4,
        );
        floor.position.y = MINT_WORLD.floorSurfaceY + 0.012;
        scene.add(floor);

        const perimeter = new THREE.LineSegments(
          new THREE.EdgesGeometry(
            new THREE.BoxGeometry(
              MINT_WORLD.playableWidth,
              MINT_WORLD.playableHeight,
              MINT_WORLD.playableDepth,
            ),
          ),
          new THREE.LineBasicMaterial({ color: 0xff5f78, transparent: true, opacity: 0.9 }),
        );
        perimeter.position.y = MINT_WORLD.playableHeight / 2;
        scene.add(perimeter);

        const resize = () => {
          if (!renderer || !canvasRef.current) return;
          const { clientWidth, clientHeight } = canvasRef.current;
          renderer.setSize(clientWidth, clientHeight, false);
          camera.aspect = clientWidth / Math.max(clientHeight, 1);
          camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(canvasRef.current);
        resize();

        const start = performance.now();
        const render = (now: number) => {
          if (disposed || !renderer) return;
          const elapsed = (now - start) * 0.00008;
          camera.position.x = Math.sin(elapsed) * 1.6;
          camera.lookAt(0, 2.1, -2.2);
          renderer.render(scene, camera);
          frame = requestAnimationFrame(render);
        };
        frame = requestAnimationFrame(render);

        return () => observer.disconnect();
      } catch (error) {
        console.error("Mint world calibration failed", error);
        setCalibration((value) => ({ ...value, status: "error" }));
      }
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      renderer?.dispose();
    };
  }, []);

  const ready = calibration.status === "ready";
  const message = {
    waiting: "Mint is finishing the grocery-store world…",
    loading: "Loading the final Mint splat into Spark…",
    ready: "World shell calibrated",
    error: "World calibration needs attention",
  }[calibration.status];

  return (
    <main className="calibration-page">
      <canvas ref={canvasRef} className="calibration-canvas" aria-label="Mint store world calibration preview" />
      <header className="calibration-header">
        <div>
          <p className="eyebrow">Grandma’s Grocery Trip</p>
          <h1>Store calibration</h1>
        </div>
        <div className={`status-pill status-${calibration.status}`}>
          <span aria-hidden="true" />
          {message}
        </div>
      </header>

      <section className="calibration-panel" aria-label="Calibration checklist">
        <p className="panel-kicker">Milestone 01</p>
        <h2>Empty world shell</h2>
        <p className="panel-copy">
          Gameplay stays locked until the Mint splat is grounded, contained, and facing the right way.
        </p>
        <dl className="calibration-readout">
          <div><dt>Bounds</dt><dd>{calibration.bounds}</dd></div>
          <div><dt>Floor Y</dt><dd>{MINT_WORLD.floorSurfaceY.toFixed(2)}</dd></div>
          <div><dt>World scale</dt><dd>{calibration.scale}</dd></div>
          <div><dt>Front</dt><dd>Coral line · −Z</dd></div>
          <div><dt>Back</dt><dd>Grandma spawn · +Z</dd></div>
        </dl>
        <div className="calibration-checks">
          <p className={ready ? "passed" : "pending"}>Four enclosed walls</p>
          <p className={ready ? "passed" : "pending"}>Ceiling and even lighting</p>
          <p className={ready ? "passed" : "pending"}>No shelves, signs, or products</p>
          <p className={ready ? "passed" : "pending"}>Opaque contained storefront</p>
        </div>
      </section>

      <div className="orientation-legend" aria-label="World orientation">
        <span><i className="front-dot" /> Front / checkout</span>
        <span><i className="back-dot" /> Back / Grandma</span>
      </div>
    </main>
  );
}
