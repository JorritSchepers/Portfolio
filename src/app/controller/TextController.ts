import { AppComponent } from "../app.component";
import * as THREE from 'three';
import { TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import { ConvexGeometry} from 'three/examples/jsm/geometries/ConvexGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { C } from "../model/constants";
import { BoxGeometry, BufferGeometry, Mesh, MeshBasicMaterial, TextureLoader } from "three";

const SNOW = 0xfffafa
const YELLOW = 0xDAC39E 
const NO_URL = "SATURN";

type coords = {
    x: number,
    y: number,
    z: number
}

type map = {
    key: string,
    mesh: THREE.Mesh
}

export class TextController {
    app: AppComponent;
    menu: map[] = [];

    constructor(app: AppComponent) {
        this.app = app;
    }

    init(): void {
        this.initMenu();
        this.initAboutMeText();
        this.initProjectsText();
        this.initContactMeText();
    }

    private initMenu() {
        this.addText("Jorrit Schepers", this.app.miniPos.name, 155, 180, NO_URL)
        this.addText("Software Developer", this.app.miniPos.title, 25, 180)
        this.addText("About me", this.app.miniPos.aboutMe, 5, 180)
        this.addText("Projects", this.app.miniPos.projects, 5, 180)
        this.addText("Contact me", this.app.miniPos.contactMe, 5, 180)
    }

    private updateMenu(key: string, mesh: THREE.Mesh) {
        this.menu.push({key: key, mesh: mesh})
    }

    private initAboutMeText() {
        const y = 1700
        this.addText("About me", {
          x: this.app.titan.model.position.x - C.RADIUS.titan * 1.2,
          y: this.app.titan.model.position.y + y,
          z: this.app.titan.model.position.z 
        }, 350, 0, NO_URL)
        this.addParagrapgh(
          [
            "My name is Jorrit Schepers and I'm currently studying Software",
            "Development at the HAN in the Netherlands.",
            "",
            "Besides coding websites and writing software, I like",
            "travelling, indoor and outdoor climbing and everything",
            "alpine related. Naast mijn studie ben ik veel bezig met",
            "het bouwen van mijn eigen websites en met name het ",
            "bouwen van een simulatie van ons zonnenstelsel!",
            "",
            "%./assets/cv-jorrit-schepers.pdf%CV"
          ], {
            x: this.app.titan.model.position.x - C.RADIUS.titan * 1.3,
            y: this.app.titan.model.position.y + y - 500,
            z: this.app.titan.model.position.z 
          }, 100, 0)
    }

    private addText(text: string, coords: coords, size: number, angle: number, url?: string) {
        const app = this.app
        const tc = this;
        let color = SNOW
        if (url) color = YELLOW
        new FontLoader().load("./assets/M PLUS 1 Light_Regular.json", function (font) {
          const g = new TextGeometry(text, {
            font: font,
            size: size,
            height: 0.1
          })
          const m = new THREE.MeshBasicMaterial({
            color: color
          })
          const mesh = new THREE.Mesh(g, m)
          mesh.position.set(coords.x - 10, coords.y - (size/2), coords.z)
          mesh.rotateY(app.rad(angle))
          tc.updateMenu(text, mesh)
          app.scene.add(mesh)
        });
        
        if (url != null && url != NO_URL) {
          const g = new BoxGeometry (size*text.length*2, size*2, 1)
          const m = new MeshBasicMaterial({
            color: 0x00ff00
          })
          m.transparent = true;
          m.opacity = 0
          const box = new Mesh(g, m)
          box.position.set(coords.x, coords.y, coords.z)
          box.rotateY(app.rad(angle))
          this.app.backs.push({
            back: box,
            url: url
          })
          this.app.scene.add(box)
        }
    }

    private addParagrapgh(text: string[], coords: coords, size: number, angle: number) {
        const margin = 100;
        let y = coords.y
        text.forEach((t) => {
          if (t.charAt(0) == "%") {
            let url = t.split("%")
            this.addText(url[2], {
              x: coords.x,
              y: y,
              z: coords.z
            }, size, angle, url[1])
            y = y - size - margin;
          } else {
            this.addText(t, {
              x: coords.x,
              y: y,
              z: coords.z
            }, size, angle)
            y = y - size - margin;
          }
        }) 
      }

    private addProject(title: string, img: string, text: string[], coords: coords, size: number, angle: number, link: string) {
        const titleSize = 400;
        const imgSize = 2000;
        const imgMargin = 300;
        this.addText(title, coords, titleSize, angle, NO_URL)
        this.addImage(imgSize*1.7, imgSize, img, {
          x: coords.x - imgSize * 4 ,
          y: coords.y - imgSize / 2 + titleSize / 2,
          z: coords.z,
        },  angle)
        this.addParagrapgh(text, {
          x: coords.x,
          y: coords.y - titleSize,
          z: coords.z,
        }, size, angle)
    }

    private initProjectsText(): void {
        const y = 4500
        const margin = 1200
        const projectSize = 3000;
        this.addText("Projects", {
          x: this.app.rhea.model.position.x - C.RADIUS.rhea * 1.2,
          y: this.app.rhea.model.position.y + y,
          z: this.app.rhea.model.position.z 
        }, 600, 180, NO_URL)
    
        // SolarSim
        this.addProject("SolarSim", "./assets/Solarsim.png", [
          "A 1:1 ratio space simulation where you can design ",
          "your own solarsystems or glans at the more than 7000",
          "stars in the night sky!",
          "",
          "%https://jorritschepers.github.io%Website",
          "%https://github.com/JorritSchepers/SolarSim%GitHub"
        ], {
          x: this.app.rhea.model.position.x - C.RADIUS.rhea * 0.6,
          y: this.app.rhea.model.position.y + y - margin,
          z: this.app.rhea.model.position.z 
        }, 171, 180, "https://jorritschepers.github.io") // 171
    
        // Windows XP
        this.addProject("Windows XP", "./assets/WindowsXP.png", [
          "I recreated Windows XP using Angular as a fun",
          "side project.",
          "",
          "",
          "",
          "%https://github.com/JorritSchepers/MyWebsite%GitHub Repo"
        ], {
          x: this.app.rhea.model.position.x - C.RADIUS.rhea * 0.6,
          y: this.app.rhea.model.position.y + y - margin - projectSize,
          z: this.app.rhea.model.position.z 
        }, 171, 180, "https://jorritschepers.github.io")
    
        // Kucheza
        this.addProject("Educational Game", "./assets/Kucheza.png", [
          "As a school project, we made an educational",
          "water management game for African farmers.",
          "",
          "%https://github.com/JorritSchepers/KuchezaAngularFrontend%GitHub Repo (front end)",
          "",
          "%https://github.com/JorritSchepers/KuchezaJavaBackend%GitHub Repo (back end)",
        ], {
          x: this.app.rhea.model.position.x - C.RADIUS.rhea * 0.6,
          y: this.app.rhea.model.position.y + y - margin - projectSize * 2,
          z: this.app.rhea.model.position.z 
        }, 171, 180, "https://jorritschepers.github.io")
    }

  private initContactMeText(): void {
    const y = 1200
    const angle = 297
    this.addText("Contact me", {
      x: this.app.lapetus.model.position.x + 1000,
      y: this.app.lapetus.model.position.y + y,
      z: this.app.lapetus.model.position.z + 700
    }, 216, angle - 20, NO_URL)

    this.addParagrapgh(
      [
        "Do you have any questions about how I made ",
        "this website or you just want to contact me?",
        "",
        "Feel free to send me an email!",
        "",
        "%mailto%jorrit.schepers1@gmail.com",
      ], {
        x: this.app.lapetus.model.position.x + 1000,
        y: this.app.lapetus.model.position.y + y - 300,
        z: this.app.lapetus.model.position.z + 700
      }, 60, angle - 20
    )

    const ratio = 0.7
    const coords = {
      x: this.app.lapetus.model.position.x - 1000, 
      y: this.app.lapetus.model.position.y + 500, 
      z: this.app.lapetus.model.position.z - 1100, 
    }
    this.addImage(1536 * ratio, 2049 * ratio, './assets/Jorrit Schepers.JPG', coords,  angle + 20)
  }
    
  private addImage(width: number, height: number, img: string, coords: coords, angle: number) {
    const g = new BoxGeometry(width, height, 1)
    const m = new MeshBasicMaterial({
      map: new TextureLoader().load(img) 
    })
    const mesh = new Mesh(g, m)
    mesh.position.set(
      coords.x,
      coords.y,
      coords.z
    )
    mesh.rotateY(this.app.rad(angle))
    this.app.scene.add(mesh)
  }
}