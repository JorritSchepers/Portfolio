import { Component } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { BoxGeometry, Mesh, MeshBasicMaterial, SphereGeometry, TextureLoader, Vector2 } from 'three';
import { Moon } from './model/moon.model';
import { NightSkyController } from './controller/NightSkyController';
import { TextController } from './controller/TextController';
import { C } from './model/constants';

const SPEED_MUL = 1
const CAMERA_FLY_SPEED = 50 / SPEED_MUL // Higher = slower
const TARGET_FLY_SPEED = 40 / SPEED_MUL // Higher = slower
const BG_COLOR = new THREE.Color( 0x000000 );
const FOV = 70;

type coords = {
  x: number,
  y: number,
  z: number
}

const CAMERA_START_POS = {
  x: -90000, 
  y: -32000,
  z: -70000,
}

const CAMERA_LOOK = {
  x: CAMERA_START_POS.x, 
  y: CAMERA_START_POS.y, 
  z: CAMERA_START_POS.z + 10000, 
}

const CAMERA_START_POS_MOBILE = {
  x: -101363, 
  y: -26000,
  z: -185452,
}

const CAMERA_LOOK_MOBILE = {
  x: -74750, 
  y: -26000, 
  z: -79000, 
}

const TITAN_MAP = new THREE.TextureLoader().load('./assets/maps/titan-map.jpg')
const RHEA_MAP = new THREE.TextureLoader().load('./assets/maps/rhea-map.jpg')
const LAPETUS_MAP = new THREE.TextureLoader().load('./assets/maps/lapetus-map.jpg')
const SATURN_MAP = new THREE.TextureLoader().load('./assets/maps/saturn-map.jpg')
const RING_MAP = new THREE.TextureLoader().load('./assets/maps/rings.png')

const SATURN_ROTATION_SPEED = 10.5;
const SATURN_INCLINATION = 26.73 - 5.51
const TIME_SPEED = 0;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  scene: THREE.Scene = new THREE.Scene();;
  camera: any;
  renderer: any;
  controls: any;

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2()

  nightSky = new NightSkyController(this);
  tc = new TextController(this);
  
  saturn = this.generateSaturn(58232, SATURN_INCLINATION, SATURN_MAP);
  ring = this.generateRing(136780, 136780-74500, RING_MAP, SATURN_INCLINATION)
  titan = new Moon(this, "Titan", C.RADIUS.titan/2, 1221870, 0.349, 16, TITAN_MAP, 0);
  rhea = new Moon(this, "Rhea", C.RADIUS.rhea/2, 527108, 0.327, 4.5, RHEA_MAP, 0);
  lapetus = new Moon(this, "Lapetus", C.RADIUS.lapetus/2, 3560820, 15.470, 79, LAPETUS_MAP, 0);

  currentPage = "";

  day = 65; 
  minis: any = [];
  minisBack: any = [];
  backs: any = [];
  useGuideLines = false;

  flashlight: any;

  moonTarget = "Saturn";
  cameraMoving = false;

  mobile = false;

  pos: any = null;
  miniPos: any;
  look: any = null;

  constructor() {
    this.checkMobile();
    this.initThree(this.pos, this.look);
    this.nightSky.init();
    this.initMinis();
    this.tc.init();
  }

  private initMinis() {
    const list = [
      new THREE.TextureLoader().load('./assets/maps/titan-map.jpg'),
      new THREE.TextureLoader().load('./assets/maps/rhea-map.jpg'),
      new THREE.TextureLoader().load('./assets/maps/lapetus-map.jpg'),
    ]

    list.forEach((i) => {
      const g = new SphereGeometry(5, 50, 50)
      const m = new THREE.MeshStandardMaterial({
        map: i
      })
      this.minis.push(new Mesh(g, m))

      const g2 = new BoxGeometry(50, 10 ,1)
      const m2 = new MeshBasicMaterial({
        color: 0x00ff00
      })
      m2.transparent = true;
      m2.opacity = 0
      this.minisBack.push(new Mesh(g2, m2))
    });

    const mx = 73
    const my = -22
    const mz = 100

    this.miniPos = {
      name: {
        x: this.pos.x - mx + 420,
        y: this.pos.y + my + 600,
        z: this.pos.z + mz + 900
      },
      title: {
        x: this.pos.x - mx - 210,
        y: this.pos.y + my + 210,
        z: this.pos.z + mz + 400
      },
      aboutMe: {
        x: this.pos.x - mx + 76,
        y: this.pos.y + my + 34,
        z: this.pos.z + mz
      },
      contactMe: {
        x: this.pos.x - mx,
        y: this.pos.y + my,
        z: this.pos.z + mz
      },
      projects: {
        x: this.pos.x - mx + 35,
        y: this.pos.y + my + 17,
        z: this.pos.z + mz
      },
    }

    this.minis[0].position.set(this.miniPos.aboutMe.x, this.miniPos.aboutMe.y, this.miniPos.aboutMe.z)
    this.minis[1].position.set(this.miniPos.projects.x, this.miniPos.projects.y, this.miniPos.projects.z)
    this.minis[2].position.set(this.miniPos.contactMe.x, this.miniPos.contactMe.y, this.miniPos.contactMe.z)

    this.minisBack[0].position.set(this.miniPos.aboutMe.x - 25, this.miniPos.aboutMe.y, this.miniPos.aboutMe.z)
    this.minisBack[1].position.set(this.miniPos.projects.x - 25, this.miniPos.projects.y, this.miniPos.projects.z)
    this.minisBack[2].position.set(this.miniPos.contactMe.x - 25, this.miniPos.contactMe.y, this.miniPos.contactMe.z)

    this.minis.forEach((mini: any) => this.scene.add(mini))
    this.minisBack.forEach((mini: any) => this.scene.add(mini))
  }

  private checkMobile() {
    if (window.innerWidth >= 768) {
      this.pos = CAMERA_START_POS
      this.look = CAMERA_LOOK
      return;
    }
    this.pos = CAMERA_START_POS_MOBILE;
    this.look = CAMERA_LOOK_MOBILE;
    this.mobile = true;
  }

  private initThree(pos: coords, look: coords): void {
    this.camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 500000000000000000);
    if (!this.mobile) this.camera.zoom = window.innerWidth / 1512
    this.camera.position.set(pos.x, pos.y, pos.z)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true, 
      logarithmicDepthBuffer: true
    });
    this.scene.background = BG_COLOR
    this.renderer.setPixelRatio (window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls = controls;
    this.controls.target.set(look.x, look.y, look.z)
    this.controls.enableDamping = true
    this.controls.enableZoom = false; 
    this.controls.enablePan = false; 
    this.controls.enableRotate = false; 
    this.initSun();
    document.body.appendChild(this.renderer.domElement);
    let app = this
    window.addEventListener( 'pointermove', (event) => {
      this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    });
    window.addEventListener( 'click', (event) => {
      this.pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      this.click();
    });
    var animate = function () {
      app.hamster();
      requestAnimationFrame(animate);
    };

    animate();
  }

  private click() {
    this.raycaster.setFromCamera( this.pointer, this.camera );

    const intersects = this.raycaster.intersectObjects( this.scene.children );
    this.removeFlashlight()
    for ( let i = 0; i < intersects.length; i ++ ) {
      const mesh = intersects[ i ].object
      if (this.tc.menu.length == 0) return
      if (mesh == this.getMesh("About me") || mesh == this.minis[0] || mesh == this.minisBack[0]) {
        this.flyToMoon("titan")
      } else if (mesh == this.getMesh("Projects") || mesh == this.minis[1] || mesh == this.minisBack[1]) {
        this.flyToMoon("rhea")
      } else if (mesh == this.getMesh("Contact me") || mesh == this.minis[2] || mesh == this.minisBack[2]) {
        this.flyToMoon("lapetus")
      } else {
        const url = this.isBack(mesh)
        if (url) {
          if (url == "mailto") {
            const email = document.createElement("a");
            email.href = "mailto:jorrit.schepers1@mail.com";
            email.click();
          } else window.open(url);
        }
      }
    }
  }

  private isBack(mesh: any) {
    for (let i = 0; i < this.backs.length; i++) {
      if (this.backs[i].back == mesh) return this.backs[i].url
    }
    return null;
  }

  private initSun(): void {
    let sun = new THREE.PointLight(0xffffff);
    sun.position.x = -1000000000
    this.flashlight = new THREE.PointLight(0xffffff);
    this.flashlight.position.set(0,0,0)
    this.flashlight.distance = 25;
    this.flashlight.decay = 0.1;
    // const pointLightHelper = new THREE.PointLightHelper( this.flashlight, 20 );
    // this.scene.add( pointLightHelper );
    this.scene.add(this.flashlight)
    this.scene.add(sun)
  }

  private hamster(): void { // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    this.controls.update()
    this.onWindowResize();

    this.day += TIME_SPEED / 120
    this.moveMoons([this.titan, this.rhea, this.lapetus]);
    this.rotateMesh(this.saturn, SATURN_ROTATION_SPEED);
    
    // console.log("Camera: (" + Math.round(camera.position.x) + ", " + Math.round(camera.position.y) + ", " + Math.round(camera.position.z) + ")")
    // console.log("Target: (" + Math.round(this.controls.target.x) + ", " + Math.round(this.controls.target.y) + ", " + Math.round(this.controls.target.z) + ")")
    
    if (this.cameraMoving) this.moveCameraToPlanet(this.moonTarget, this.pos, this.look);

    this.checkMouseHover()

    this.renderer.render(this.scene, this.camera);
  }

  private checkMouseHover(): void {
    if (this.tc.menu.length == 0) return
    this.raycaster.setFromCamera( this.pointer, this.camera );

    const intersects = this.raycaster.intersectObjects( this.scene.children );
    this.removeFlashlight()
    document.body.style.cursor = 'default';    const scale = 1.2
    for ( let i = 0; i < intersects.length; i ++ ) {
      const mesh = intersects[ i ].object
      if (mesh == this.getMesh("About me") || mesh == this.minis[0] || mesh == this.minisBack[0]) {
        this.addFlashlight("aboutMe")
      } else if (mesh == this.getMesh("Projects") || mesh == this.minis[1] || mesh == this.minisBack[1]) {
        this.addFlashlight("projects")
      } else if (mesh == this.getMesh("Contact me") || mesh == this.minis[2] || mesh == this.minisBack[2]) {
        this.addFlashlight("contactMe")
      } else if (this.isBack(mesh)) {
        document.body.style.cursor = 'pointer';
      }
    }
  }

  private getMesh(key: string): THREE.Mesh {
    for (let i = 0; i < this.tc.menu.length; i++) {
      const element = this.tc.menu[i];
      if (element.key == key) return element.mesh
    }
    return this.tc.menu[0].mesh;
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  private generateSaturn(radius: number, inclination: number, map: THREE.Texture): THREE.Mesh {
    const g = new THREE.SphereGeometry(radius, 60, 60)
    const m = new THREE.MeshStandardMaterial({
      map: map
    })
    let s = new Mesh(g, m)
    s.rotation.z = this.rad(inclination)
    this.scene.add(s)
    return s;
  }

  private generateRing(maxWidth: number, width: number, map: THREE.Texture, inclination: number): THREE.Mesh {
    const g = new THREE.TorusGeometry(maxWidth, width, 2, 400);
    const m = new THREE.MeshBasicMaterial({
      map: map,
      // color: 0xaaaaaa
    });
    let r = new THREE.Mesh(g, m);
    r.rotation.x = this.rad(90)
    r.rotation.y = this.rad(inclination)
    this.scene.add(r)
    return r
  }

  public rad(x: number): number {
    return x / 180 * Math.PI
  }

  private rotateMesh(mesh: THREE.Mesh, speed: number) {
    mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), speed/24*this.rad(0.01)*3)
  }

  private moveMoons(moons: Moon[]): void {
    moons.forEach((moon) => {
      moon.oldX = moon.model.position.x;
      moon.oldY = moon.model.position.y;
      moon.oldZ = moon.model.position.z;
      moon.angle = this.day / moon.speed * 360 % 360;
      let ratio = Math.cos(this.rad(moon.inclination))
      moon.model.position.set(
        Math.sin(this.rad(moon.angle)) * ratio * moon.distance,
        Math.sin(this.rad(moon.angle)) * moon.distance * Math.sin(this.rad(moon.inclination)),
        Math.cos(this.rad(moon.angle)) * moon.distance
      )
      moon.guideLine.rotation.z = (this.rad(moon.angle) - (Math.PI / 2)) * -1
    });
  }

  public flyToMoon(moonName: string): void {
    this.cameraMoving = true;
    this.moonTarget = moonName;
    this.currentPage = ""
  }

  private moveCameraToPlanet(moonName: string, pos: coords, look: coords): void {
    let moon: any = null;
    switch (moonName) {
      case "titan":
        moon = this.titan;
        break;
      case "rhea":
        moon = this.rhea;
        break;
      case "lapetus":
        moon = this.lapetus;
        break;
    }

    let cameraTarget = [0,0,0]
    let targetTarget = [0,0,0]
    if (moon == null) {
      cameraTarget = [pos.x, pos.y, pos.z]
      targetTarget = [look.x, look.y, look.z]
    } else {
      switch (moon) {
        case this.titan:
          cameraTarget = [462488, 2678, 1134002]
          targetTarget = [464324, 2544, 1127809]
          break;
        case this.rhea:
          cameraTarget = [175375, 1284, -503561]
          targetTarget = [175463, 1553, -493659]
          break;
        case this.lapetus:
          cameraTarget = [-3081307, -851713, 1573344]
          targetTarget = [-3079151, -851730, 1572246]
          break;
      }
  }
    this.camera.position.x += (cameraTarget[0] - this.camera.position.x) / CAMERA_FLY_SPEED
    this.camera.position.y += (cameraTarget[1] - this.camera.position.y) / CAMERA_FLY_SPEED
    this.camera.position.z += (cameraTarget[2] - this.camera.position.z) / CAMERA_FLY_SPEED
  
    this.controls.target.x += (targetTarget[0] - this.controls.target.x) / TARGET_FLY_SPEED
    this.controls.target.y += (targetTarget[1] - this.controls.target.y) / TARGET_FLY_SPEED
    this.controls.target.z += (targetTarget[2] - this.controls.target.z) / TARGET_FLY_SPEED

    if (cameraTarget[0] - this.camera.position.x <= 1 && cameraTarget[0] - this.camera.position.x >= -1) {
      this.cameraMoving = false;
      this.currentPage = moonName
    }
  }

  addFlashlight(moonName: string) {
    document.body.style.cursor = 'pointer';
    const x = 15;
    switch (moonName) {
      case "aboutMe":
        this.flashlight.position.x = this.miniPos.aboutMe.x + x;
        this.flashlight.position.y = this.miniPos.aboutMe.y;
        this.flashlight.position.z = this.miniPos.aboutMe.z - x;
        break;
      case "projects":
        this.flashlight.position.x = this.miniPos.projects.x + x;
        this.flashlight.position.y = this.miniPos.projects.y;
        this.flashlight.position.z = this.miniPos.projects.z - x;
        break;
      case "contactMe":
        this.flashlight.position.x = this.miniPos.contactMe.x + x;
        this.flashlight.position.y = this.miniPos.contactMe.y;
        this.flashlight.position.z = this.miniPos.contactMe.z - x;
    }
  } 

  removeFlashlight() {
    this.flashlight.position.set(0,0,0)
  }
}