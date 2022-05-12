import * as THREE from 'three'
import { AppComponent } from '../app.component';

const GUIDELINE_RATIO: number = 0.1;
const COLOR: number = 0x777777;
const DETAIL: number = 50;

export class Moon {
    app: AppComponent;
    name: string;
    radius: number;
    detail: number;
    color: string;
    distance: number;
    inclination: number;
    speed: number;
    model: any;
    guideLine: any;
    angle: number = 0;
    textureMap: any;
    oldX: number = 0; oldY: number = 0; oldZ: number = 0;
    ring: any;
    arc: number = Math.PI/4
    rotationSpeed: number;
  
    constructor(app: AppComponent, name: string, radius: number, distance: number, inclination: number, speed: number, textureMap: any, rotationSpeed: number) {
      this.app = app
      this.name = name;
      this.radius = radius;
      this.detail = DETAIL;
      this.color = "#" + COLOR.toString(16);
      this.distance = distance;
      this.inclination = inclination;
      this.speed = speed;
      this.textureMap = textureMap;
      this.model = this.generateModel(radius, this.detail, COLOR, distance, textureMap)
      this.createGuideLine();
      this.ring = null;
      this.rotationSpeed = rotationSpeed;
      // this.showGuideLine()
    }
  
    createGuideLine(): void {
      let g = new THREE.TorusGeometry(this.distance, this.radius/GUIDELINE_RATIO, 20, 2000, this.arc)
      let m = new THREE.MeshBasicMaterial({
        color: this.color,
      });
  
      let t = new THREE.Mesh(g, m);
      t.rotation.x = this.app.rad(90)
      t.rotation.y = this.inclination/180*Math.PI
      t.position.set(0,0,0)
      this.guideLine = t
      if (this.app.useGuideLines) this.showGuideLine();
    }
  
    showGuideLine(): void {
      this.app.scene.add(this.guideLine);
    }

    removeGuideLine(): void {
      this.app.scene.remove(this.guideLine);
    }

    getInclination(): number {
      if (this.inclination > 180) return Math.round((this.inclination - 180)*1000)/1000
      return this.inclination
    }

    addRing(maxWidth: number, width: number, map: any) {
      const g = new THREE.TorusGeometry(maxWidth, width, 2, 400);
      const m = new THREE.MeshBasicMaterial({
        map: map
      });
      this.ring = new THREE.Mesh(g, m);
      this.ring.position.set(this.model.position.x, this.model.position.y, this.model.position.z)
      this.ring.rotation.x = this.app.rad(90)
      
      this.app.scene.add(this.ring)
    }

    generateModel(radius: number, detail: number, color: number, distance: number, textureMap: any): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(radius, detail, detail)
        const material = new THREE.MeshStandardMaterial({
          map: textureMap,
        });
      
        let m = new THREE.Mesh(geometry, material);
        m.position.set(distance, 0, 0)
        this.app.scene.add(m)
        return m;
    }
  }