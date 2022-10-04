import React, { useRef, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { a, useSpring, config } from "@react-spring/three";
import "./styles.css";
import {
  useMatcapTexture,
  Text,
  useTexture,
  MeshReflectorMaterial,
} from "@react-three/drei";
import NORM from "./NORM.jpeg";

const edge_w = 1.0;
const edge_h = 1.5;
const levels = 15;
const maxMeshCount = totalMeshCount(levels);
const color = new THREE.Color("rgb(153,90,0)");

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
// TODO: Add floor texture

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
const CameraController = () => {
  const { camera, gl } = useThree();
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);

    controls.minDistance = 3;
    controls.maxDistance = 20;
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  return null;
};
const Floor = () => {
  return (
    <mesh position={[0, -1.1, 0]} rotation={[Math.PI / -2, 0, 0]}>
      <planeGeometry args={[200, 200, 75, 75]} />
      <meshBasicMaterial wireframe color="red" side={THREE.DoubleSide} />
    </mesh>
  );
};
function Tree(props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  const [bronzeShine] = useMatcapTexture(111, 1024);
  const [matcapTexture] = useMatcapTexture(117, 1024);
  useFrame(({ clock: { elapsedTime } }) => {
    // console.log(elapsedTime, "elapsedTime");
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
  console.log(lev);
  useEffect(() => {
    const baseMatrix = new THREE.Matrix4();
    // baseMatrix.makeTranslation(0, -125, 0);
    baseMatrix.setPosition(0, 0, 0);
    ref.current.setMatrixAt(0, baseMatrix);
    ref.current.setColorAt(0, color);
    createNewMesh(0, ref, color);

    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
    console.log(ref.current);
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
      <meshMatcapMaterial matcap={hovered ? matcapTexture : bronzeShine} />
    </a.instancedMesh>
  );
}
const Wall = () => {
  const normal = useTexture(NORM);
  const normalScale = 0.5;
  const _normalScale = React.useMemo(
    () => new THREE.Vector2(normalScale || 0),
    [normalScale]
  );
  return (
    <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 5, -6]}>
      <planeGeometry args={[10, 10]} />
      <MeshReflectorMaterial
        resolution={1024}
        mirror={0.75}
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
        normalMap={normal}
        normalScale={_normalScale}
      />
    </mesh>
  );
};
export default function App() {
  return (
    <Canvas>
      <CameraController />
      <ambientLight />
      <directionalLight position={[1, 1, 1]} castShadow={true} />
      <Tree />
      <Info />
      <Floor />
      <Wall />
    </Canvas>
  );
}
