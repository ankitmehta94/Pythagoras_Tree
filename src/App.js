import React, { useRef, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { a, useSpring, config } from "@react-spring/three";
import "./styles.css";

const edge_w = 1.0;
const edge_h = 1.5;
const levels = 15;
const maxMeshCount = totalMeshCount(levels);
const color = new THREE.Color("rgb(153,90,0)");

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
    <mesh receiveShadow rotation={[5, 0, 0]} position={[0, -1.5, 0]}>
      <planeBufferGeometry attach="geometry" args={[500, 500]} />
      <meshPhysicalMaterial clearcoat={1} attach="material" color="#212529" />
    </mesh>
  );
};
function Tree(props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
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
    scale: active
    // config: config.wobbly
  });
  console.log(lev);
  useEffect(() => {
    const baseMatrix = new THREE.Matrix4();
    // baseMatrix.makeTranslation(0, -125, 0);
    baseMatrix.setPosition(0, 0, 0);
    ref.current.setMatrixAt(0, baseMatrix);
    createNewMesh(0, ref, color);

    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
    console.log(ref.current);
  }, [ref]);

  return (
    <a.instancedMesh scale={scale} args={[null, null, 1000]} ref={ref}>
      <boxGeometry args={[edge_w, edge_h, edge_w]} />
      <meshPhongMaterial color={color} />
    </a.instancedMesh>
  );
}
const Wall = () => {
  return (
    <mesh receiveShadow position={[0, -1, -5]}>
      <planeBufferGeometry attach="geometry" args={[500, 500]} />
      <meshStandardMaterial attach="material" color="#383D43" />
    </mesh>
  );
};
export default function App() {
  return (
    <Canvas>
      <CameraController />
      <ambientLight />
      <pointLight position={[20, 35, 30]} />
      <Tree />
      <Floor />
      <Wall />
    </Canvas>
  );
}
