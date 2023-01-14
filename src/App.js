import React, {
  useRef,
  useCallback,
  useEffect,
  useState,
  useLayoutEffect,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";
import DatGui, { DatColor, DatNumber, DatButton } from "react-dat-gui";
import "./styles.css";
import {
  useMatcapTexture,
  Text,
  useTexture,
  MeshReflectorMaterial,
  Reflector,
} from "@react-three/drei";
import NORM from "./NORM.jpeg";

const edge_w = 1.0;
const edge_h = 1.5;
const levels = 15;
const maxMeshCount = totalMeshCount(levels);

function Info() {
  <Text
    color={"#EC2D2D"}
    fontSize={12}
    maxWidth={200}
    lineHeight={1}
    letterSpacing={0.02}
    textAlign={"left"}
    font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
    anchorX="center"
    anchorY="middle"
    outlineWidth={2}
    outlineColor="red"
  >
    LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT, SED DO EIUSMOD
    TEMPOR INCIDIDUNT UT LABORE ET DOLORE MAGNA ALIQUA. UT ENIM AD MINIM VENIAM,
    QUIS NOSTRUD EXERCITATION ULLAMCO LABORIS NISI UT ALIQUIP EX EA COMMODO
    CONSEQUAT. DUIS AUTE IRURE DOLOR IN REPREHENDERIT IN VOLUPTATE VELIT ESSE
    CILLUM DOLORE EU FUGIAT NULLA PARIATUR. EXCEPTEUR SINT OCCAECAT CUPIDATAT
    NON PROIDENT, SUNT IN CULPA QUI OFFICIA DESERUNT MOLLIT ANIM ID EST LABORUM.
  </Text>;
}
function totalMeshCount(count) {
  let sum = 0;
  for (let index = 0; index < count; index++) {
    sum += Math.pow(2, index);
  }
  return sum;
}

const createNewMesh = (index, ref, color, lev) => {
  if (index < maxMeshCount) {
    //Initialization
    const right_mat = new THREE.Matrix4();
    const left_mat = new THREE.Matrix4();
    const right_new_mat_t0 = new THREE.Matrix4();
    const right_new_mat_t = new THREE.Matrix4();
    const right_new_mat_r = new THREE.Matrix4();
    const right_new_mat_r2 = new THREE.Matrix4();
    const right_new_mat_s = new THREE.Matrix4();
    const mat2 = new THREE.Matrix4();
    const left_new_mat_t0 = new THREE.Matrix4();
    const left_new_mat_t = new THREE.Matrix4();
    const left_new_mat_r = new THREE.Matrix4();
    const left_new_mat_r2 = new THREE.Matrix4();
    const left_new_mat_s = new THREE.Matrix4();

    // Copy Parent Matrix
    ref.current.getMatrixAt(index, mat2);

    // Colne Parent Color
    const left_col = color.clone();
    const right_col = color.clone();

    // Add Color Cariance
    right_col.g += 0.64 / levels;
    left_col.g += 0.64 / levels;

    // Make Right Transformations
    right_new_mat_t0.makeTranslation(-0.8, 0, 0);
    right_new_mat_t.makeTranslation(0, edge_h + 1.15, 0);
    right_new_mat_r.makeRotationZ(-Math.PI / 4);
    right_new_mat_r2.makeRotationY(Math.PI / 2);
    right_new_mat_s.makeScale(0.75, 0.75, 0.75);
    // Multiply Transformations onto matrix
    right_mat.multiply(right_new_mat_r2); //
    right_mat.multiply(right_new_mat_t0);
    right_mat.multiply(right_new_mat_r);
    right_mat.multiply(right_new_mat_s);
    right_mat.multiply(right_new_mat_t);
    right_mat.multiply(mat2);

    // copy right transformations to left
    left_new_mat_t0.copy(right_new_mat_t0);
    left_new_mat_r.copy(right_new_mat_r);
    left_new_mat_t.copy(right_new_mat_t);
    left_new_mat_r2.copy(right_new_mat_r2);
    left_new_mat_s.copy(right_new_mat_s);

    // Make Left Transformations
    left_new_mat_t0.makeTranslation(0.8, 0, 0);
    left_new_mat_t.makeTranslation(0, edge_h + 1.15, 0);
    left_new_mat_r.makeRotationZ(Math.PI / 4);
    left_new_mat_r2.makeRotationY(Math.PI / 2);
    left_new_mat_s.makeScale(0.75, 0.75, 0.75);
    // Multiply Transformations onto matrix
    left_mat.multiply(left_new_mat_r2); //
    left_mat.multiply(left_new_mat_t0);
    left_mat.multiply(left_new_mat_r);
    left_mat.multiply(left_new_mat_s);
    left_mat.multiply(left_new_mat_t);
    left_mat.multiply(mat2);
    //Calculate New Index
    const r_i = 2 * index + 1;
    const l_i = 2 * index + 2;

    //Set and Apply Recursion
    ref.current.setMatrixAt(r_i, right_mat);
    ref.current.setColorAt(r_i, right_col);
    createNewMesh(r_i, ref, right_col);

    ref.current.setMatrixAt(l_i, left_mat);
    ref.current.setColorAt(l_i, left_col);
    createNewMesh(l_i, ref, left_col);
  }
};
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

function Tree({ hexColor }) {
  // This reference gives us direct access to the THREE.Mesh object
  const color = new THREE.Color(hexColor);
  const ref = useRef();
  // const [bronzeShine] = useMatcapTexture(111, 1024);
  // const [matcapTexture] = useMatcapTexture(117, 1024);
  useFrame(({ clock: { elapsedTime } }) => {
    if (elapsedTime % 3 === 0) {
      setLev(lev + 1);
    }
    if (active < 1.7) setActive(active + 0.01);
  });
  const [active, setActive] = useState(0.01);
  const [lev, setLev] = useState(3);
  const { scale } = useSpring({
    scale: active,
    // config: config.wobbly
  });
  const [hovered, setHover] = useState(false);
  useEffect(() => {
    const baseMatrix = new THREE.Matrix4();
    // baseMatrix.makeTranslation(0, -125, 0);
    baseMatrix.setPosition(0, 0, 0);
    ref.current.setMatrixAt(0, baseMatrix);
    ref.current.setColorAt(0, color);
    createNewMesh(0, ref, color);

    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
  }, [ref]);

  return (
    <a.instancedMesh
      scale={scale}
      args={[null, null, 1000]}
      position={[0, 0, -1]}
      ref={ref}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[edge_w, edge_h, edge_w]} />
      <meshMatcapMaterial />
    </a.instancedMesh>
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

// TODO: Improve performance
// TODO: Sepeate components into files
// TODO: Add hovering text
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
        <Info />
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
      </DatGui>
    </>
  );
}
