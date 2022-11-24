import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import fs from "fs";
import { JSDOM } from "jsdom";
import Canvas from "canvas";
import gl from "gl";
import request from "request";
import { Blob, FileReader } from "vblob";
global.Blob = Blob;
global.FileReader = FileReader;

const gls = gl(1200, 800, { preserveDrawingBuffer: true }); //headless-gl
// Create a DOM
const { window } = new JSDOM();
global.document = window.document;

let requests = request.defaults({ encoding: null });

export async function GenerateGLB(props) {
  const card = {
    width: 40,
    height: 60,
    thick: 0.6,
  };
  var glbPath;
  // init scene
  let scene = new THREE.Scene();
  scene.background = new THREE.Color(0x123456);

  // init camera
  let camera = new THREE.PerspectiveCamera(45, 1200 / 800, 0.1, 10000);
  camera.position.set(-1, 1, 10);
  camera.lookAt(scene.position);

  scene.add(camera);

  // init renderer
  let renderer = new THREE.WebGLRenderer({ context: gls });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const frontMaterial = await generateMaterial(props.frontImageUrl);

  let frontPlane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(card.width, card.height),
    frontMaterial
  );
  frontPlane.overdraw = true;
  frontPlane.position.set(0, 0, card.thick / 2.0 + 0.001);
  scene.add(frontPlane);

  const backMaterial = await generateMaterial(props.backImageUrl);

  let backPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(card.width, card.height),
    backMaterial
  );
  backPlane.overdraw = true;
  backPlane.position.set(0, 0, -card.thick / 2.0 - 0.001);
  scene.add(backPlane);

  const geometry = new THREE.BoxBufferGeometry(
    card.width,
    card.height,
    card.thick
  );
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  glbPath = await exportGLTF(scene);
  return glbPath;
}

const exportGLTF = async (input) => {
  const gltfExporter = new GLTFExporter();
  const options = {
    trs: false,
    onlyVisible: false,
    trunteDrawRange: true,
    binary: false,
    forcePowerOfTwoTextures: false,
    maxTextureSize: 2048 || Infinity,
  };
  return new Promise((resolve, reject) => {
    gltfExporter.parse(
      input,
      function (result) {
        const output = JSON.stringify(result, null, 2);
        const nowDate = new Date().getTime();
        var path = "public/" + nowDate + ".gltf";
        fs.writeFile(path, output, (error) => {
          if (error) {
            console.log("An error has occurred ", error);
            reject(error);
          }
          console.log("Data written successfully to disk", path);
          resolve(path);
        });
      },
      options
    );
  });
};

function generateMaterial(url) {
  return new Promise(function (resolve, reject) {
    requests(url, function (error, response, data) {
      if (!error && response.statusCode == 200) {
        var image = new Canvas.Image();
        image.src = data;
        var texture = new THREE.Texture(image);
        texture.needsUpdate = true;
        const setMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        resolve(setMaterial);
      } else {
        response = "error";
        reject(response);
      }
    });
  });
}
