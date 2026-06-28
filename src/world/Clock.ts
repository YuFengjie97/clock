import {renderer, scene, camera} from '@/world/scene'
import * as THREE from 'three/webgpu'
import {pass, uniform} from 'three/tsl'
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { gui } from '@/utils/guiPane';
import { loader } from '@/utils/loadModel';
import { emitter } from '@/utils/emitter';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';


function setMat(mat: THREE.MeshStandardMaterial, name: string){
  const info = {
    clock_main_0:  [.9, .1], // 钟表外壳
    clock_main_1:  [.01, .6], // 纸
    second_hand_0: [.9, .0],
    minute_hand_0: [.8, .0],
    hour_hand_0:   [.5, .5],
    11_0:          [.9, .1], // 数字
    hourmark009_0: [.8, .1], // 标记
    middle_0:      [.9, .1]  // 中间的轴
  }

  if(!info[name]){
    mat.metalness = .9
    mat.roughness = .1
    return
  }

  mat.metalness = info[name][0]
  mat.roughness = info[name][1]
}

export async function Clock() {
  const gltf = await loader.loadAsync(import.meta.env.BASE_URL + 'model/clock.glb')
  const clockGroup = gltf.scene

  const icoGeo = new THREE.IcosahedronGeometry(10, 2)
  const icoPosAttr = icoGeo.getAttribute('position')
  
  const posMap = new Map<string, THREE.Vector3>()
  for (let i = 0; i < icoPosAttr.count; i++) {
    const p = new THREE.Vector3().fromBufferAttribute(icoPosAttr, i)
    posMap.set(p.toArray().toString(), p)
  }
  const posV3Arr: THREE.Vector3[] = []
  for(let p of posMap.values()){
    posV3Arr.push(p)
  }
  

  const baseTimeSpeed = 0.001
  const container = new THREE.Group()
  

  for (let i = 0; i < posV3Arr.length; i++) {
    const pos = posV3Arr[i]

    const clonedGroup = clockGroup.clone()
    clonedGroup.position.copy(pos)
    clonedGroup.lookAt(new THREE.Vector3(0,0,0))
    clonedGroup.scale.multiplyScalar(.6)
    
    const hue = i*.02

    clonedGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh

        // const hue = Math.random()

        const mat = new THREE.MeshStandardMaterial()

        const hueOffset = (hue + .23) % 1
        
        const col = new THREE.Color().setHSL(hueOffset, 1., .5)
        
        mat.color.copy(col)
        mat.metalness = 0.1
        mat.roughness = 0.9
        setMat(mat, `${mesh.name}`)
        
        mesh.material = mat

        const hR = Math.random() * 100
        const mR = Math.random() * 100
        const sR = Math.random() * 100

        if (mesh.name === "second_hand_0") {
          mesh.rotation.y = hR
          emitter.on('animate', ({ delta }) => {
            mesh.rotation.y += baseTimeSpeed * delta * 60 * 60
          })
        }
        if (mesh.name === "minute_hand_0") {
          mesh.rotation.y = mR
          emitter.on('animate', ({ delta }) => {
            mesh.rotation.y += baseTimeSpeed * delta * 60
          })
        }
        if (mesh.name === "hour_hand_0") {
          mesh.rotation.y = sR
          emitter.on('animate', ({ delta }) => {
            mesh.rotation.y += baseTimeSpeed * delta * 1
          })
        }

        
      }
    })


    container.add(clonedGroup)
  }

  scene.add(container)
  return container // 建议返回，方便后续可能的操作（比如销毁或整体旋转）
}