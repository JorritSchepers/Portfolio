import { AppComponent } from "../app.component";
import { Stars } from "../../assets/starsJson";
import * as THREE from 'three';

export class NightSkyController {
    app: AppComponent;

    constructor(app: AppComponent) {
        this.app = app;    
    }

    public init(): void {
        new Stars().stars.forEach((s: any) => {
            const threshold = 5;
            const red = "rgb(255, 150, 150)"
            const blue = "rgb(180, 180, 255)"
            let colorString = red
            if (s.mag < threshold) colorString = blue
            const size = (1/s.mag) * 30000000000 // 30B
            const g = new THREE.SphereGeometry(size, 10, 10);
            const m = new THREE.MeshBasicMaterial( {color: colorString} );
            const planet = new THREE.Mesh(g, m);
            planet.position.set(s.x, s.y, s.z)
            if (s.mag < threshold) planet.layers.enable(1)
            this.app.scene.add(planet)
        })
    }
}
