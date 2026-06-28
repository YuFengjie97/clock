import * as THREE from 'three/webgpu'
import { scene } from './scene'
import { emitter } from '@/utils/emitter'

export function setLight(){
  const amb = new THREE.AmbientLight(0xffffff, 2.2)
  scene.add(amb)

  // const l = new THREE.PointLight(0xfffffff, 2.21, 10, 1)
  // const l = new THREE.DirectionalLight(0xffffff, 10)
  // emitter.on("animate",({delta, elapsed}) => {
  //   l.target.position.set(
  //     Math.sin(elapsed),
  //     Math.cos(elapsed),
  //     Math.sin(elapsed)
  //   )
  // })

  const l = new THREE.HemisphereLight(0x00ff00, 0xff0000, 5)
  scene.add(l)
}