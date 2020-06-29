import * as THREE from 'three'

export default class DoubleHelixTimeline {
  constructor(){
    this.init()
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    
    renderer.setSize( window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  }
}