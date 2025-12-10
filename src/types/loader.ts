import * as THREE from 'three'

// Interface for what a loader returns
export interface LoadedModel {
  scene: THREE.Object3D
  animations?: THREE.AnimationClip[]
}

// Interface for a generic loader strategy (future proofing)
export interface IModelLoader {
  load(url: string, file: File): Promise<LoadedModel>
  canLoad(extension: string): boolean
}
