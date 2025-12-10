import * as THREE from 'three'

export class SceneManager {
  public scene: THREE.Scene
  private gridHelper!: THREE.GridHelper
  private axesHelper!: THREE.AxesHelper

  constructor() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x212121) // Dark grey background

    this.setupLights()
    this.setupHelpers()
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 10, 7)
    this.scene.add(directionalLight)
  }

  private setupHelpers() {
    this.gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x333333)
    this.scene.add(this.gridHelper)

    this.axesHelper = new THREE.AxesHelper(2)
    this.scene.add(this.axesHelper)
  }

  public add(object: THREE.Object3D) {
    this.scene.add(object)
  }

  public remove(object: THREE.Object3D) {
    this.scene.remove(object)
  }

  // Keep lights and helpers, remove loaded models
  public clearScene() {
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      const child = this.scene.children[i]
      if (
        child &&
        child !== this.gridHelper &&
        child !== this.axesHelper &&
        !(child instanceof THREE.Light)
      ) {
        this.scene.remove(child)
      }
    }
  }
}
