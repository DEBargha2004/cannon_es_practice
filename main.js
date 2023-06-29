import './style.css'

import * as t from 'three'
import * as physics from 'cannon-es'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const renderer = new t.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true

const world = new physics.World({
  gravity: new physics.Vec3(0, -9.81, 0)
})
const timeStep = 1 / 60

const scene = new t.Scene()
const camera = new t.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
)
camera.position.set(0, 5, 15)

const orbit = new OrbitControls(camera, renderer.domElement)

const directionalLight = new t.DirectionalLight(0xffffff, 1)
directionalLight.position.set(10, 20, 10)
scene.add(directionalLight)
directionalLight.castShadow = true
directionalLight.shadow.camera.top = 20
directionalLight.shadow.camera.bottom = -20
directionalLight.shadow.camera.left = -20
directionalLight.shadow.camera.right = 20
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.mapSize.width = 2048

// const ShadowHelper = new t.CameraHelper(directionalLight.shadow.camera)
// scene.add(ShadowHelper)

const ambientLight = new t.AmbientLight(0xffffff, 0.4)
scene.add(ambientLight)

const planeGeo = new t.PlaneGeometry(30, 30,100,100)
const planeMat = new t.MeshStandardMaterial({
  color: 0xffffff,
  side: t.DoubleSide,
  wireframe: false
})
const planeMesh = new t.Mesh(planeGeo, planeMat)
// planeMesh.rotateX(-Math.PI/2)
scene.add(planeMesh)
planeMesh.receiveShadow = true

const planePhysicsMat = new physics.Material()
const planeBody = new physics.Body({
  shape: new physics.Box(new physics.Vec3(15, 15, 0.1)),
  type: physics.Body.STATIC,
  material : planePhysicsMat
})
planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)

world.addBody(planeBody)

const sphereGeo = new t.SphereGeometry(2)
const sphereMat = new t.MeshStandardMaterial({
  color: 0xffffff,
  wireframe: false
})
const sphereMesh = new t.Mesh(sphereGeo, sphereMat)
scene.add(sphereMesh)
sphereMesh.castShadow = true

const sphereBody = new physics.Body({
  shape: new physics.Sphere(2),
  mass: 10,
  velocity: new physics.Vec3(3, 0, 0)
})
sphereBody.position.set(0,2,0)
// sphereBody.linearDamping = 0.5
world.addBody(sphereBody)

const cubeGeo = new t.BoxGeometry(2,2,2)
const cubeMat = new t.MeshStandardMaterial({
  color : 0xffffff
})
const cubeMesh = new t.Mesh(cubeGeo,cubeMat)
cubeMesh.position.set(8,1,0)
scene.add(cubeMesh)
cubeMesh.castShadow = true

const boxPhysicsMat = new physics.Material()
const boxBody = new physics.Body({
  shape : new physics.Box(new physics.Vec3(1,1,1)),
  mass : 5,
  position : new physics.Vec3(10,1,0),
  material : boxPhysicsMat,
  velocity : new physics.Vec3(0,5,0)
})
world.addBody(boxBody)

const planeBoxContactMat = new physics.ContactMaterial(
  planePhysicsMat,
  boxPhysicsMat,
  {
    friction : 0.1,
    restitution : 0.9
  }
)

world.addContactMaterial(planeBoxContactMat)

function animate () {
  world.step(timeStep)

  planeMesh.position.copy(planeBody.position)
  planeMesh.quaternion.copy(planeBody.quaternion)

  sphereMesh.position.copy(sphereBody.position)
  sphereMesh.quaternion.copy(sphereBody.quaternion)

  cubeMesh.position.copy(boxBody.position)
  cubeMesh.quaternion.copy(boxBody.quaternion)

  renderer.render(scene, camera)
}
renderer.setAnimationLoop(animate)

window.addEventListener('resize', e => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
})

document.getElementById('root').appendChild(renderer.domElement)
