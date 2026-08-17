import {
	CanvasTexture,
	CircleGeometry,
	Color,
	CylinderGeometry,
	Euler,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	OrthographicCamera,
	Quaternion,
	Raycaster,
	SRGBColorSpace,
	Vector2,
	Vector3,
	Vector4
} from 'three';

/**
 * ViewHelper based on three/addons/helpers/ViewHelper.js.
 * Axis heads are CircleGeometry meshes billboarded toward the gizmo camera
 * instead of Sprites (Chrome Android GLES stretches Sprite quads).
 *
 * @augments Object3D
 */
class ViewHelper extends Object3D {

	constructor( camera, domElement ) {

		super();

		this.isViewHelper = true;
		this.animating = false;
		this.center = new Vector3();

		const color1 = new Color( '#ff4466' );
		const color2 = new Color( '#88ff44' );
		const color3 = new Color( '#4488ff' );
		const color4 = new Color( '#000000' );

		const options = {};

		const interactiveObjects = [];
		const raycaster = new Raycaster();
		const mouse = new Vector2();
		const dummy = new Object3D();
		const billboard = new Quaternion();
		const axisHeads = [];

		const orthoCamera = new OrthographicCamera( - 2, 2, 2, - 2, 0, 4 );
		orthoCamera.position.set( 0, 0, 2 );

		const geometry = new CylinderGeometry( 0.04, 0.04, 0.8, 5 ).rotateZ( - Math.PI / 2 ).translate( 0.4, 0, 0 );
		const headGeometry = new CircleGeometry( 0.32, 48 );

		const xAxis = new Mesh( geometry, getAxisMaterial( color1 ) );
		const yAxis = new Mesh( geometry, getAxisMaterial( color2 ) );
		const zAxis = new Mesh( geometry, getAxisMaterial( color3 ) );

		yAxis.rotation.z = Math.PI / 2;
		zAxis.rotation.y = - Math.PI / 2;

		this.add( xAxis );
		this.add( zAxis );
		this.add( yAxis );

		const posXAxisHelper = new Mesh( headGeometry, getHeadMaterial( color1 ) );
		const posYAxisHelper = new Mesh( headGeometry, getHeadMaterial( color2 ) );
		const posZAxisHelper = new Mesh( headGeometry, getHeadMaterial( color3 ) );
		const negMaterial = getHeadMaterial( color4 );
		negMaterial.transparent = true;
		negMaterial.opacity = 0.2;
		const negXAxisHelper = new Mesh( headGeometry, negMaterial );
		const negYAxisHelper = new Mesh( headGeometry, negMaterial );
		const negZAxisHelper = new Mesh( headGeometry, negMaterial );

		posXAxisHelper.position.x = 1;
		posYAxisHelper.position.y = 1;
		posZAxisHelper.position.z = 1;
		negXAxisHelper.position.x = - 1;
		negYAxisHelper.position.y = - 1;
		negZAxisHelper.position.z = - 1;

		posXAxisHelper.userData.type = 'posX';
		posYAxisHelper.userData.type = 'posY';
		posZAxisHelper.userData.type = 'posZ';
		negXAxisHelper.userData.type = 'negX';
		negYAxisHelper.userData.type = 'negY';
		negZAxisHelper.userData.type = 'negZ';

		this.add( posXAxisHelper );
		this.add( posYAxisHelper );
		this.add( posZAxisHelper );
		this.add( negXAxisHelper );
		this.add( negYAxisHelper );
		this.add( negZAxisHelper );

		interactiveObjects.push( posXAxisHelper );
		interactiveObjects.push( posYAxisHelper );
		interactiveObjects.push( posZAxisHelper );
		interactiveObjects.push( negXAxisHelper );
		interactiveObjects.push( negYAxisHelper );
		interactiveObjects.push( negZAxisHelper );

		axisHeads.push(
			posXAxisHelper, posYAxisHelper, posZAxisHelper,
			negXAxisHelper, negYAxisHelper, negZAxisHelper
		);

		const point = new Vector3();
		const dim = 128;
		const turnRate = 2 * Math.PI;

		this.render = function ( renderer ) {

			this.quaternion.copy( camera.quaternion ).invert();
			billboard.copy( this.quaternion ).invert();
			for ( let i = 0; i < axisHeads.length; i ++ ) {

				axisHeads[ i ].quaternion.copy( billboard );

			}
			this.updateMatrixWorld();

			point.set( 0, 0, 1 );
			point.applyQuaternion( camera.quaternion );

			const x = domElement.offsetWidth - dim;
			const y = renderer.isWebGPURenderer ? domElement.offsetHeight - dim : 0;

			renderer.clearDepth();

			renderer.getViewport( viewport );
			renderer.setViewport( x, y, dim, dim );

			renderer.render( this, orthoCamera );

			renderer.setViewport( viewport.x, viewport.y, viewport.z, viewport.w );

		};

		const targetPosition = new Vector3();
		const targetQuaternion = new Quaternion();

		const q1 = new Quaternion();
		const q2 = new Quaternion();
		const viewport = new Vector4();
		let radius = 0;

		this.handleClick = function ( event ) {

			if ( this.animating === true ) return false;

			const rect = domElement.getBoundingClientRect();
			const offsetX = rect.left + ( domElement.offsetWidth - dim );
			const offsetY = rect.top + ( domElement.offsetHeight - dim );
			mouse.x = ( ( event.clientX - offsetX ) / ( rect.right - offsetX ) ) * 2 - 1;
			mouse.y = - ( ( event.clientY - offsetY ) / ( rect.bottom - offsetY ) ) * 2 + 1;

			raycaster.setFromCamera( mouse, orthoCamera );

			const intersects = raycaster.intersectObjects( interactiveObjects );

			if ( intersects.length > 0 ) {

				const intersection = intersects[ 0 ];
				const object = intersection.object;

				prepareAnimationData( object, this.center );

				this.animating = true;

				return true;

			}

			return false;

		};

		this.setLabels = function ( labelX, labelY, labelZ ) {

			options.labelX = labelX;
			options.labelY = labelY;
			options.labelZ = labelZ;

			updateLabels();

		};

		this.setLabelStyle = function ( font, color, radius ) {

			options.font = font;
			options.color = color;
			options.radius = radius;

			updateLabels();

		};

		this.update = function ( delta ) {

			const step = delta * turnRate;

			q1.rotateTowards( q2, step );
			camera.position.set( 0, 0, 1 ).applyQuaternion( q1 ).multiplyScalar( radius ).add( this.center );

			camera.quaternion.rotateTowards( targetQuaternion, step );

			if ( q1.angleTo( q2 ) === 0 ) {

				this.animating = false;

			}

		};

		this.dispose = function () {

			geometry.dispose();
			headGeometry.dispose();

			xAxis.material.dispose();
			yAxis.material.dispose();
			zAxis.material.dispose();

			disposeHeadMaterial( posXAxisHelper.material );
			disposeHeadMaterial( posYAxisHelper.material );
			disposeHeadMaterial( posZAxisHelper.material );
			disposeHeadMaterial( negMaterial );

		};

		function disposeHeadMaterial( material ) {

			material.map?.dispose();
			material.dispose();

		}

		function prepareAnimationData( object, focusPoint ) {

			switch ( object.userData.type ) {

				case 'posX':
					targetPosition.set( 1, 0, 0 );
					targetQuaternion.setFromEuler( new Euler( 0, Math.PI * 0.5, 0 ) );
					break;

				case 'posY':
					targetPosition.set( 0, 1, 0 );
					targetQuaternion.setFromEuler( new Euler( - Math.PI * 0.5, 0, 0 ) );
					break;

				case 'posZ':
					targetPosition.set( 0, 0, 1 );
					targetQuaternion.setFromEuler( new Euler() );
					break;

				case 'negX':
					targetPosition.set( - 1, 0, 0 );
					targetQuaternion.setFromEuler( new Euler( 0, - Math.PI * 0.5, 0 ) );
					break;

				case 'negY':
					targetPosition.set( 0, - 1, 0 );
					targetQuaternion.setFromEuler( new Euler( Math.PI * 0.5, 0, 0 ) );
					break;

				case 'negZ':
					targetPosition.set( 0, 0, - 1 );
					targetQuaternion.setFromEuler( new Euler( 0, Math.PI, 0 ) );
					break;

				default:
					console.error( 'ViewHelper: Invalid axis.' );

			}

			radius = camera.position.distanceTo( focusPoint );
			targetPosition.multiplyScalar( radius ).add( focusPoint );

			dummy.position.copy( focusPoint );

			dummy.lookAt( camera.position );
			q1.copy( dummy.quaternion );

			dummy.lookAt( targetPosition );
			q2.copy( dummy.quaternion );

		}

		function getAxisMaterial( color ) {

			return new MeshBasicMaterial( { color: color, toneMapped: false } );

		}

		function getHeadMaterial( color, text ) {

			const material = new MeshBasicMaterial( {
				color: color,
				toneMapped: false,
				depthTest: true
			} );

			if ( text ) {

				material.map = makeLabelTexture( text );

			}

			return material;

		}

		function makeLabelTexture( text ) {

			const { font = '24px Arial', color: labelColor = '#000000' } = options;

			const canvas = document.createElement( 'canvas' );
			canvas.width = 64;
			canvas.height = 64;

			const context = canvas.getContext( '2d' );
			context.fillStyle = '#ffffff';
			context.fillRect( 0, 0, 64, 64 );

			context.font = font;
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillStyle = labelColor;
			context.fillText( text, 32, 32 );

			const texture = new CanvasTexture( canvas );
			texture.colorSpace = SRGBColorSpace;
			return texture;

		}

		function updateLabels() {

			disposeHeadMaterial( posXAxisHelper.material );
			disposeHeadMaterial( posYAxisHelper.material );
			disposeHeadMaterial( posZAxisHelper.material );

			posXAxisHelper.material = getHeadMaterial( color1, options.labelX );
			posYAxisHelper.material = getHeadMaterial( color2, options.labelY );
			posZAxisHelper.material = getHeadMaterial( color3, options.labelZ );

		}

	}

}

export { ViewHelper };
