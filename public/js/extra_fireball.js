import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
//import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';

const _VS = `
varying vec2 vertexUv;
varying vec3 vertexNormal;

void main() {
    vertexUv = uv;
    vertexNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const _FS = `
uniform sampler2D globeTexture;

varying vec2 vertexUv;
varying vec3 vertexNormal;
 
void main() {
    float intensity = 1.05 - dot(vertexNormal, vec3(0.0, 0.0, 1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
    gl_FragColor = vec4(atmosphere + texture2D(globeTexture, vertexUv).xyz, 1.0);
}
`;
const _AS = `
varying vec3 vertexNormal;

void main() {
    vertexNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const _AF = `
varying vec3 vertexNormal;

void main() {
    float intensity = pow(0.5 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0 * intensity);
}
`;

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const scene = new THREE.Scene();
const camera = new THREE
.PerspectiveCamera( 75, 
    sizes.width / sizes.height, 
    0.1, 
    1000 
);

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50), 
    new THREE.ShaderMaterial({
         vertexShader: _VS,
         fragmentShader: _FS,
         uniforms: {
            globeTexture: { value: new THREE.TextureLoader().load('../images/earth.jpg') }
         }
    })
);

scene.add(sphere);

const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(5, 50, 50), 
    new THREE.ShaderMaterial({
         vertexShader: _VS,
         fragmentShader: _FS
    })
);
atmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(atmosphere);

camera.position.z = 15;

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

const renderer = new THREE.WebGLRenderer({
    antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate()