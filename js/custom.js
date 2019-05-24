
Physijs.scripts.worker = 'lib/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';
function rand(min, max){
    return parseInt(Math.random() * (max - min) + min);
};

function init(){
    var frameID;
    var isSimulating = false;
    var gravity = document.getElementById('gravity');
    var rst = document.getElementById('reset');
    
    gravity.addEventListener('mousedown', function(e){
        isSimulating = !isSimulating;
    });

    rst.addEventListener('click', function(e){
        window.location.reload();
    });

    var renderer = new THREE.WebGLRenderer({ 
        antialias: true
    });
    
    var domEl = document.getElementById('threecontainer');

    renderer.setSize(domEl.offsetWidth, domEl.offsetHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    domEl.appendChild(renderer.domElement);

    var camera = new THREE.PerspectiveCamera( 55, domEl.offsetWidth / domEl.offsetHeight, 0.01, 1000 ); 
    var scene = new Physijs.Scene();
	scene.setGravity(new THREE.Vector3( 0, -70, 0 ));

    var spheregeometry = new THREE.SphereGeometry(4, 20, 20);
   
    var marbletextures = ['img/marble.jpg','img/marble2.jpg','img/marble3.jpg','img/marble4.jpg'];
    // var axesHelper = new THREE.AxesHelper( 50 );
    // scene.add( axesHelper );

     for (var x=-25; x<=25; x+=20){
        for (var y=25; y<=55; y+=15){
            for (var z=-25; z<=25; z+=20){
                var material = Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({
                        color: 0xffffff,
                        specular: 0xffffff,
                        shininess: 600,
                        map: new THREE.TextureLoader().load( marbletextures[rand(0,marbletextures.length)] )
                    }), 0.1, .6
                );
                var sphere = new Physijs.SphereMesh(spheregeometry, material);
                sphere.castShadow = true;
                sphere.position.set(x,y,z);
                scene.add(sphere);
            }
        }
     }

    var clothtexture = new THREE.TextureLoader().load( 'img/cloth3.jpg', function(){
        renderer.render( scene, camera );
    });
    clothtexture.wrapS = clothtexture.wrapT = THREE.RepeatWrapping;
    clothtexture.repeat.set( 2, 2 );

    var planegeometry = new THREE.PlaneGeometry( 250, 250, 50, 50 );
    planegeometry.verticesNeedUpdate = true;
    var planematerial = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
            side:THREE.DoubleSide,
            map:clothtexture,
           wireframe:false
        }),
        0.3, //reibung
        .8 //restitution
    );

    var NoiseGen = new SimplexNoise;

    for ( var i = 0; i < planegeometry.vertices.length; i++ ) {
        var vertex = planegeometry.vertices[i];    
        vertex.z = NoiseGen.noise( vertex.x / 100, vertex.y / 100 ) * 14;    
    }
    planegeometry.computeFaceNormals();
    planegeometry.computeVertexNormals();

    var plane = new Physijs.HeightfieldMesh(planegeometry, planematerial, 0, 50,50);
    plane.position.set(0,-50,0);
    plane.rotation.set(Math.PI/180 * 90, Math.PI/180 * -5, Math.PI/180 * 10);
    plane.receiveShadow = true;

    var ambientlight = new THREE.AmbientLight(0xffffff, .6);
    var light = new THREE.PointLight( 0xffffff, .5 );
    light.castShadow = true;
    light.position.set(-15,50,35);
    
    camera.position.set(75,50,140);
    camera.lookAt(scene.position);

    scene.add(plane);
    scene.add(light);
    scene.add(ambientlight);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = .3;
    controls.maxDistance = 200;
    controls.enableZoom = true;
    controls.autoRotate = false;

    var simulate = function(){
        //planegeometry.verticesNeedUpdate = true;
        renderer.render( scene, camera );
        scene.rotation.y += 0.001;
        if(isSimulating){
            scene.simulate();
            gravity.innerHTML = 'zero gravity';
        }
        else{
            gravity.innerHTML = 'apply gravity';
            cancelAnimationFrame(frameID);
            scene.onSimulationResume();
        }
        requestAnimationFrame( simulate );
    }

    simulate();

};

window.onload = init;
