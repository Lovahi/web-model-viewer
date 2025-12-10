import { GLTFLoader, OBJLoader, FBXLoader, ColladaLoader, TGALoader } from 'three-stdlib'
import * as THREE from 'three'
import type { LoadedModel } from '@/types'

export class LoaderManager {
  private gltfLoader: GLTFLoader
  private objLoader: OBJLoader
  private fbxLoader: FBXLoader
  private colladaLoader: ColladaLoader
  private loadingManager: THREE.LoadingManager
  private objectURLs: string[] = []

  constructor() {
    this.loadingManager = new THREE.LoadingManager()

    // Register handlers
    this.loadingManager.addHandler(/\.tga$/i, new TGALoader(this.loadingManager))

    this.gltfLoader = new GLTFLoader(this.loadingManager)
    this.objLoader = new OBJLoader(this.loadingManager)
    this.fbxLoader = new FBXLoader(this.loadingManager)
    this.colladaLoader = new ColladaLoader(this.loadingManager)
  }

  public async loadModel(
    url: string,
    file: File,
    extraFiles?: Map<string, File>,
    onTextureMissing?: (filename: string) => void,
  ): Promise<LoadedModel> {
    this.setupLoadingManager(extraFiles, onTextureMissing)
    const extension = this.getExtension(file.name)

    switch (extension) {
      case 'gltf':
      case 'glb':
        return this.loadGLTF(url)
      case 'obj':
        return this.loadOBJ(url)
      case 'fbx':
        return this.loadFBX(url)
      case 'dae':
        return this.loadCollada(url)
      default:
        throw new Error(`Unsupported file extension: ${extension}`)
    }
  }

  private getExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  private loadGLTF(url: string): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          resolve({
            scene: gltf.scene,
            animations: gltf.animations,
          })
        },
        undefined,
        (error) => {
          reject(error)
        },
      )
    })
  }

  private loadOBJ(url: string): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      this.objLoader.load(
        url,
        (object) => {
          resolve({
            scene: object,
            animations: [],
          })
        },
        undefined,
        (error) => {
          reject(error)
        },
      )
    })
  }

  private loadFBX(url: string): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      this.fbxLoader.load(
        url,
        (object) => {
          resolve({
            scene: object,
            animations: object.animations,
          })
        },
        undefined,
        (error) => {
          reject(error)
        },
      )
    })
  }

  private loadCollada(url: string): Promise<LoadedModel> {
    return new Promise((resolve, reject) => {
      this.colladaLoader.load(
        url,
        (collada) => {
          resolve({
            scene: collada.scene,
            animations: [], // Collada animations are potentially handled differently or baked in scene
          })
        },
        undefined,
        (error) => {
          reject(error)
        },
      )
    })
  }

  private setupLoadingManager(
    extraFiles?: Map<string, File>,
    onTextureMissing?: (filename: string) => void,
  ) {
    // Revoke previous URLs
    this.objectURLs.forEach((url) => URL.revokeObjectURL(url))
    this.objectURLs = []

    this.loadingManager.setURLModifier((url) => {
      if (!extraFiles) return url

      let normalizedUrl = url.replace(/\\/g, '/')
      normalizedUrl = normalizedUrl.replace(/^file:\/\/\/?/, '')

      // Handle blob:.../path/to/file case where threejs resolves absolute path against blob base
      const lastPart = normalizedUrl.split('/').pop()
      if (!lastPart) return url

      let filename = lastPart
      try {
        filename = decodeURIComponent(lastPart)
      } catch (e) {
        // ignore
      }

      // 1. Try exact match
      if (extraFiles.has(filename)) {
        const file = extraFiles.get(filename)!
        const objectUrl = URL.createObjectURL(file)
        this.objectURLs.push(objectUrl)
        return objectUrl
      }

      // 2. Try case-insensitive match
      const lowerFilename = filename.toLowerCase()
      for (const [key, file] of extraFiles) {
        if (key.toLowerCase() === lowerFilename) {
          const objectUrl = URL.createObjectURL(file)
          this.objectURLs.push(objectUrl)
          return objectUrl
        }
      }

      // Only warn if this looks like a texture file (has image extension)
      const textureExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tga', 'webp', 'svg']
      const fileExtension = filename.split('.').pop()?.toLowerCase()
      const isLikelyTexture = fileExtension && textureExtensions.includes(fileExtension)

      // Skip warning for blob URLs without extensions (likely model file itself or embedded resources)
      if (isLikelyTexture) {
        console.warn(
          `Texture not found in dropped files: '${filename}' (Original URL: ${url}).\nMake sure to drop the texture files along with the model if they are linked!`,
        )

        if (onTextureMissing) {
          onTextureMissing(filename)
        }
      }

      return url
    })
  }

  public dispose() {
    this.objectURLs.forEach((url) => URL.revokeObjectURL(url))
    this.objectURLs = []
  }
}
