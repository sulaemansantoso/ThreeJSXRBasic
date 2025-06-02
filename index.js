import * as THREE from 'three';
import { XRButton } from './node_modules/three/examples/jsm/webxr/XRButton.js';
import {XRControllerModelFactory} from './node_modules/three/examples/jsm/webxr/XRControllerModelFactory.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.xr.enabled = true;
renderer.setAnimationLoop( animate );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const raycaster = new THREE.Raycaster();
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 3;

const controllerModelFactory = new XRControllerModelFactory();
const grip1 = renderer.xr.getControllerGrip( 0 );
grip1.add( controllerModelFactory.createControllerModel( grip1 ) );
scene.add( grip1 );

const grip2 = renderer.xr.getControllerGrip( 1 );
grip2.add( controllerModelFactory.createControllerModel( grip2 ) );
scene.add( grip2 );

const controller1 = renderer.xr.getController( 0 );
controller1.addEventListener('selectstart', onSelectStart);
controller1.addEventListener('selectend', onSelectEnd);
controller1.addEventListener('connected', onControllerConnected);
controller1.addEventListener('disconnected',()=>{
  controller1.remove(this.children[0]);
});

scene.add( controller1 );
function onControllerConnected(event) {
  const targetRayMode = event.data.targetRayMode;

  if ((targetRayMode == 'tracked-pointer') || (targetRayMode == 'gaze') ){
    controller1.add( buildController(event.data));
  }
}

function buildController(data) {
  let geometry, material;

  if (data.targetRayMode == 'tracked-pointer') {
    geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(
      [ 0, 0, 0, 0, 0, - 1 ],3  
    ));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(
      [ 0.5, 0.5, 0.5, 0,0,0 ],3
    ));
    material = new THREE.LineBasicMaterial( { vertexColors: true } );
    return new THREE.Line( geometry, material );

  }
  else if (data.targetRayMode == 'gaze') {
    
    geometry = new THREE.RingGeometry( 0.02, 0.04, 32 ).translate(0,0,-1);
    material = new THREE.MeshBasicMaterial( { color: 0xffff00, opacity: 0.5, transparent:true } );
    return new THREE.Mesh( geometry, material );
  }
}



function onSelectStart() {
				this.userData.isSelecting = true;
}
function onSelectEnd() {
			this.userData.isSelecting = false;
	}




function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
window.addEventListener( 'resize', onWindowResize, false );
document.body.appendChild( XRButton.createButton( renderer ) );


let chosen_object;

function animate() {
  requestAnimationFrame( animate );
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  raycaster.setFromXRController( controller1 );
  const intersect = raycaster.intersectObjects( scene.children , false);
  if (intersect.length > 0) {
    if ( chosen_object != intersect[0].object ) {
      if ( chosen_object ) chosen_object.material.color.set( 0x00ff00 );
      chosen_object = intersect[0].object;
    }
    else {
      chosen_object.material.color.set( 0xff0000 );
      chosen_object = null;
    }
  }

  renderer.render( scene, camera );
}
// animate();