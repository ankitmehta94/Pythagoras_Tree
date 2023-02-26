import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";

const edge_w = 1.0;
const edge_h = 1.5;
const levels = 15;
const maxMeshCount = totalMeshCount(levels);

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
export default function Tree({ hexColor }) {
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
