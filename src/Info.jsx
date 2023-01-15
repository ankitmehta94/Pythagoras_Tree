import React, { useRef, useCallback } from "react";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { useFrame, extend } from "@react-three/fiber";
import myFont from "./static/fonts/helvetiker_regular.typeface.json";

extend({ TextGeometry });
export default function Info({ cameraRef }) {
  const font = new FontLoader().parse(myFont);
  const textGeometryRef1 = useRef();
  const textGeometryRef2 = useRef();
  const textMeshRef1 = useRef();
  const textMeshRef2 = useRef();
  useFrame(({ clock: { elapsedTime } }) => {
    if (elapsedTime < 1) {
      textGeometryRef1.current.center();
      textGeometryRef2.current.center();
    } else {
      //   console.log(cameraRef.current);
      textMeshRef1.current.lookAt(cameraRef.current.object.position);
      textMeshRef2.current.lookAt(cameraRef.current.object.position);
    }
  }, []);

  const goToFractalWebsite = useCallback(() => {
    window.open(
      "https://andrew.wang-hoyer.com/experiments/fractals/",
      "_blank"
    );
  }, []);
  return (
    <React.Fragment>
      <mesh
        position={[0, 12, 0]}
        ref={textMeshRef1}
        onClick={goToFractalWebsite}
      >
        <textGeometry
          ref={textGeometryRef1}
          args={[
            "This is a tribute to Andrew Wang Hoyer's Fractal Website",
            { font, size: 1, height: 1 },
          ]}
        />
        <meshLambertMaterial attach="material" color={"gold"} />
      </mesh>
      <mesh
        position={[0, 10, 0]}
        ref={textMeshRef2}
        onClick={goToFractalWebsite}
      >
        <textGeometry
          ref={textGeometryRef2}
          args={[
            "which inspired me to make the browser my canvas",
            { font, size: 1, height: 1 },
          ]}
        />
        <meshLambertMaterial attach="material" color={"gold"} />
      </mesh>
    </React.Fragment>
  );
}
