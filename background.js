class WebGLBackground {
    constructor() {
        this.container = document.getElementById('fluid-bg');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.objects = [];
        this.mouse = new THREE.Vector2(0, 0);
        this.targetMouse = new THREE.Vector2(0, 0);

        this.init();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);

        // Advanced Glass Spheres
        const geometry = new THREE.SphereGeometry(1, 64, 64);

        for (let i = 0; i < 6; i++) {
            const material = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0,
                roughness: 0.05,
                transmission: 0.95, // Glass transparency
                thickness: 0.5,
                ior: 1.5,
                opacity: 0.3,
                transparent: true,
                clearcoat: 1.0,
                specularIntensity: 1.0
            });

            const sphere = new THREE.Mesh(geometry, material);
            const scale = 1 + Math.random() * 2;
            sphere.scale.set(scale, scale, scale);

            sphere.position.set(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5
            );

            // Custom dynamic properties
            sphere.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01,
                    (Math.random() - 0.5) * 0.01
                ),
                rotationVelocity: new THREE.Vector2(
                    (Math.random() - 0.5) * 0.005,
                    (Math.random() - 0.5) * 0.005
                )
            };

            this.scene.add(sphere);
            this.objects.push(sphere);
        }

        this.camera.position.z = 8;
    }

    addEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth mouse follow
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        // Animate objects
        this.objects.forEach(obj => {
            obj.position.add(obj.userData.velocity);
            obj.rotation.x += obj.userData.rotationVelocity.x;
            obj.rotation.y += obj.userData.rotationVelocity.y;

            // Boundaries
            if (Math.abs(obj.position.x) > 10) obj.userData.velocity.x *= -1;
            if (Math.abs(obj.position.y) > 7) obj.userData.velocity.y *= -1;

            // Mouse interaction (gentle repulsion/attraction)
            const dist = obj.position.distanceTo(new THREE.Vector3(this.mouse.x * 5, this.mouse.y * 3, 0));
            if (dist < 4) {
                obj.position.lerp(new THREE.Vector3(this.mouse.x * 6, this.mouse.y * 4, 0), 0.005);
            }
        });

        // Gently tilt camera based on mouse
        this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouse.y * 0.5 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    new WebGLBackground();
});
