import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Info from "./Info";
import DatGui, {
  DatColor,
  DatNumber,
  DatButton,
  DatFolder,
} from "react-dat-gui";
import "./styles.css";
import {
  OrbitControls,
  useTexture,
  MeshReflectorMaterial,
  Reflector,
} from "@react-three/drei";
import NORM from "./static/textures/NORM.jpeg";
import Tree from "./Tree";

function Ground(props) {
  const [floor, normal] = useTexture([NORM, NORM]);
  return (
    <Reflector resolution={1024} args={[60, 60]} {...props}>
      {(Material, props) => (
        <Material
          color="#f0f0f0"
          metalness={0}
          roughnessMap={floor}
          normalMap={normal}
          normalScale={[2, 2]}
          {...props}
        />
      )}
    </Reflector>
  );
}

const WallRight = ({ x = 7, y = 5, z = -1.2, s }) => {
  const normal = useTexture(NORM);
  const normalScale = 1;
  const _normalScale = React.useMemo(
    () => new THREE.Vector2(normalScale || 0),
    [normalScale]
  );
  return (
    <mesh rotation={[0, 0, Math.PI / 2]} position={[x, y, z]}>
      <planeGeometry args={[s, s]} />
      <MeshReflectorMaterial
        resolution={1024}
        mirror={0.5}
        mixBlur={10}
        mixStrength={2}
        blur={blur || [0, 0]}
        minDepthThreshold={0.8}
        maxDepthThreshold={1.2}
        depthScale={0}
        depthToBlurRatioBias={0.2}
        debug={0}
        distortion={0}
        color="#a0a0a0"
        metalness={0.5}
        side={THREE.DoubleSide}
        roughness={1}
        normalMap={normal}
        normalScale={_normalScale}
      />
    </mesh>
  );
};
const WallLeft = ({ x = 7, y = 5, z = -1.2, s }) => {
  const normal = useTexture(NORM);
  const normalScale = 0.5;
  const _normalScale = React.useMemo(
    () => new THREE.Vector2(normalScale || 0),
    [normalScale]
  );
  return (
    <mesh rotation={[0, Math.PI / 2, 0]} position={[x, y, z]}>
      <planeGeometry args={[s, s]} width={100} height={100} />
      <MeshReflectorMaterial
        resolution={1024}
        mirror={0.5}
        mixBlur={10}
        mixStrength={2}
        blur={blur || [0, 0]}
        minDepthThreshold={0.8}
        maxDepthThreshold={1.2}
        depthScale={0}
        depthToBlurRatioBias={0.2}
        debug={0}
        distortion={0}
        color="#a0a0a0"
        metalness={0.5}
        roughness={1}
        side={THREE.DoubleSide}
        normalMap={normal}
        normalScale={_normalScale}
      />
    </mesh>
  );
};

const CameraController = ({ opts, cameraRef }) => {
  useFrame(({ clock: { elapsedTime } }) => {
    if (elapsedTime < 1)
      cameraRef.current.object.position.set(18797, 8.615, 17.361);
  }, []);
  return (
    <OrbitControls
      maxDistance={opts.maxZoom}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0}
      minAzimuthAngle={Math.PI / 11}
      maxAzimuthAngle={Math.PI / 2.5}
      target={[0, 0, 0]}
      ref={cameraRef}
    />
  );
};

// TODO: Add hovering text
// TODO: Hide Dat.GUI
// TODO: Improve performance
// TODO: Sepeate components into files
export default function App() {
  const cameraRef = useRef();

  const [opts, setOpts] = useState({
    l_x: -25.1,
    l_y: 23.2,
    l_z: -0.4,
    r_x: -0.4,
    r_y: 23.2,
    r_z: -25.1,
    r_s: 75,
    l_s: 75,
    camera_x: 2,
    camera_y: 0,
    camera_z: 0,
    light_x: 7,
    hexColor: "#73532A",
    light_y: 7,
    light_z: 7,
    maxZoom: 27,
    checkDistance: () => {
      console.log(cameraRef.current);
    },
  });

  return (
    <>
      <Canvas>
        <CameraController opts={opts} cameraRef={cameraRef} />

        <ambientLight />
        <directionalLight
          position={[opts.light_x, opts.light_y, opts.light_z]}
          castShadow={true}
        />
        <Tree hexColor={opts.hexColor} />
        <Info cameraRef={cameraRef} />
        <Ground
          mirror={1}
          blur={[500, 100]}
          mixBlur={12}
          mixStrength={1.5}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          position-y={-1.6}
        />
        {/* <Floor /> */}
        <WallRight x={opts.r_x} y={opts.r_y} s={opts.r_s} z={opts.r_z} />
        <WallLeft x={opts.l_x} y={opts.l_y} s={opts.l_s} z={opts.l_z} />
      </Canvas>

      <DatGui data={opts} onUpdate={setOpts}>
        <DatFolder title="Controls" closed>
          <DatColor path="hexColor" label="Color" />
          <DatNumber path="l_x" min={-50} max={50} step={0.1} />
          <DatNumber path="l_y" min={-50} max={50} step={0.1} />
          <DatNumber path="l_z" min={-50} max={50} step={0.1} />
          <DatNumber path="l_s" min={0} max={100} step={0.1} />
          <DatNumber path="r_x" min={-50} max={50} step={0.1} />
          <DatNumber path="r_y" min={-50} max={50} step={0.1} />
          <DatNumber path="r_z" min={-50} max={50} step={0.1} />
          <DatNumber path="r_s" min={0} max={100} step={0.1} />
          <DatNumber path="light_x" min={-100} max={100} step={0.1} />
          <DatNumber path="light_y" min={-100} max={100} step={0.1} />
          <DatNumber path="light_z" min={-100} max={100} step={0.1} />
          <DatNumber path="camera_x" min={-100} max={100} step={0.1} />
          <DatNumber path="camera_y" min={-100} max={100} step={0.1} />
          <DatNumber path="camera_z" min={-100} max={100} step={0.1} />
          <DatNumber path="minZoom" min={0} max={50} step={0.1} />
          <DatNumber path="maxZoom" min={0} max={50} step={0.1} />
          <DatButton onClick={opts.checkDistance} label="Check Distance" />
        </DatFolder>
      </DatGui>
    </>
  );
}
