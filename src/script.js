import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'


import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import { DotScreenShader } from './CustomShader.js';

import smallVertexShader from './shaders/SmallSphere/smallVertexShader.glsl'
import smallFragmentShader from './shaders/SmallSphere/smallFragmentShader.glsl'
import vertexShader from './shaders/BigSphere/vertexShader.glsl';
import fragmentShader from './shaders/BigSphere/fragmentShader.glsl'

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(result){
        var r= parseInt(result[1], 16);
        var g= parseInt(result[2], 16);
        var b= parseInt(result[3], 16);
        return [r,g,b];//return 23,14,45 -> reformat if needed 
    } 
    return null;
  }

let baseColor = new THREE.Vector3(120, 158, 113);
let accentColor = new THREE.Vector3(0, 0, 0);
let secondColor = new THREE.Vector3(224, 148, 66);
// Debug
const parameters = {
    baseColor: "#789E71",
    accentColor: "#000000",
    secondColor: "#E09442",
}
const gui = new dat.GUI()

gui.addColor(parameters, 'baseColor').onChange(()=> {
    baseColor = new THREE.Vector3(...hexToRgb(parameters.baseColor))
    material.uniforms.uBaseColor.value = baseColor
})
gui.addColor(parameters, 'accentColor').onChange(()=> {
    accentColor = new THREE.Vector3(...hexToRgb(parameters.accentColor))
    material.uniforms.uAccentColor.value = accentColor
})
gui.addColor(parameters, 'secondColor').onChange(()=> {
    secondColor = new THREE.Vector3(...hexToRgb(parameters.secondColor))
    material.uniforms.uSecondColor.value = secondColor
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//???
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipMapLinearFilter,
    encoding: THREE.sRGBEncoding
})

///???
const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget)

// Large Sphere
const geometry = new THREE.SphereBufferGeometry(1.5, 128, 128);

// Materials
const material = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        uBaseColor: { value: baseColor },
        uAccentColor: { value: accentColor },
        uSecondColor: { value: secondColor },
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
})

// Mesh
const sphere = new THREE.Mesh(geometry, material)
scene.add(sphere)

//Small Sphere
const smallSphereGeo = new THREE.SphereBufferGeometry(0.2, 128, 128)

const smallSphereMat = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        tCube: { value: 0 }
    },
    vertexShader: smallVertexShader,
    fragmentShader: smallFragmentShader,
})

const smallSphere = new THREE.Mesh(smallSphereGeo, smallSphereMat)

smallSphere.position.set(0, 0, 0)

scene.add(smallSphere)

// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1)

pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4

scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    composer.setSize(sizes.width, sizes.height)

})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 0.5
scene.add(camera)

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
// Postprocessing
let composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const effect1 = new ShaderPass(DotScreenShader);
effect1.uniforms['scale'].value = 4;
composer.addPass(effect1);

composer.setSize(sizes.width, sizes.height)

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () => {

    const elapsedTime = clock.getElapsedTime()
    material.uniforms.time.value = elapsedTime

    // Update Orbital Controls
    controls.update()
    // sphere.rotation.y += 0.008
    sphere.rotation.y += 0.008

    // Render
    //Something to do with WebGLCubeRenderTarget
    //Looks like a common pattern to render two scenes???
    composer.render(scene, camera)
    smallSphere.visible = false;
    cubeCamera.update(renderer, scene)
    smallSphere.visible = true;
    smallSphereMat.uniforms.tCube.value = cubeRenderTarget.texture

    

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()