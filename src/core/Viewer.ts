import * as THREE from 'three'
import { SceneManager } from './SceneManager'
import { LoaderManager } from './LoaderManager'
import type { ViewerOptions } from '@/types'

export class Viewer {
  private container: HTMLElement
  private renderer: THREE.WebGLRenderer
  private camera: THREE.PerspectiveCamera
  private sceneManager: SceneManager
  private loaderManager: LoaderManager
  private animationId: number | null = null
  private resizeObserver: ResizeObserver
  private key: number = 0

  constructor(container: HTMLElement, options: ViewerOptions = {}) {
    this.container = container
    this.sceneManager = new SceneManager()
    this.loaderManager = new LoaderManager()

    // Setup Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    )
    this.camera.position.set(5, 5, 5)
    this.camera.lookAt(0, 0, 0)

    // Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: options.antialias ?? true,
      alpha: options.alpha ?? true,
    })
    this.renderer.setPixelRatio(options.pixelRatio ?? window.devicePixelRatio)
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    if (options.backgroundColor) {
      this.renderer.setClearColor(options.backgroundColor)
    }

    container.appendChild(this.renderer.domElement)

    // Setup Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.onResize())
    this.resizeObserver.observe(container)

    // Start Loop
    this.startLoop()
  }

  private onResize() {
    if (!this.container) return
    const width = this.container.clientWidth
    const height = this.container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }

  private loop = () => {
    this.animationId = requestAnimationFrame(this.loop)
    this.render()
  }

  private startLoop() {
    this.loop()
  }

  private stopLoop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  private render() {
    this.renderer.render(this.sceneManager.scene, this.camera)
  }

  public async loadModelFromFiles(
    files: FileList | File[],
    callbacks?: { onTextureMissing?: (filename: string) => void; onError?: (error: any) => void },
  ) {
    try {
      const fileList = Array.from(files)
      if (fileList.length === 0) return

      const fileMap = new Map<string, File>()
      fileList.forEach((f) => fileMap.set(f.name, f))

      const mainFile = fileList.find((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase()
        return ext && ['gltf', 'glb', 'obj', 'fbx', 'dae'].includes(ext)
      })

      if (!mainFile) {
        console.warn('No supported model file found in drop')
        return
      }

      const url = URL.createObjectURL(mainFile)

      this.sceneManager.clearScene()

      const result = await this.loaderManager.loadModel(
        url,
        mainFile,
        fileMap,
        callbacks?.onTextureMissing,
      )
      this.sceneManager.add(result.scene)

      URL.revokeObjectURL(url)
      console.log('Model loaded', result)
    } catch (error) {
      console.error('Error loading model', error)
      if (callbacks?.onError) {
        callbacks.onError(error)
      }
    }
  }

  public dispose() {
    this.stopLoop()
    this.loaderManager.dispose()
    this.resizeObserver.disconnect()
    this.renderer.dispose()
    this.container.removeChild(this.renderer.domElement)
  }
}
