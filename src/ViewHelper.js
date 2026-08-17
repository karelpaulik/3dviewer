import {
	Color,
	CylinderGeometry,
	DataTexture,
	Euler,
	LinearFilter,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	OrthographicCamera,
	Quaternion,
	RGBAFormat,
	Raycaster,
	Sprite,
	SpriteMaterial,
	SRGBColorSpace,
	UnsignedByteType,
	Vector2,
	Vector3,
	Vector4
} from 'three';

/**
 * Overlay-oriented ViewHelper based on three/addons/helpers/ViewHelper.js.
 *
 * Axis heads are sprites whose RGBA is generated in a pixel buffer (no 2D
 * canvas, no fillText). Chrome Android otherwise inflates canvas fonts and
 * can upload opaque quads, which made the gizmo letters unreadable and the
 * discs look square.
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
		const size = new Vector2();

		const orthoCamera = new OrthographicCamera( - 2, 2, 2, - 2, 0, 4 );
		orthoCamera.position.set( 0, 0, 2 );

		const geometry = new CylinderGeometry( 0.04, 0.04, 0.8, 5 ).rotateZ( - Math.PI / 2 ).translate( 0.4, 0, 0 );

		const xAxis = new Mesh( geometry, getAxisMaterial( color1 ) );
		const yAxis = new Mesh( geometry, getAxisMaterial( color2 ) );
		const zAxis = new Mesh( geometry, getAxisMaterial( color3 ) );

		yAxis.rotation.z = Math.PI / 2;
		zAxis.rotation.y = - Math.PI / 2;

		this.add( xAxis );
		this.add( zAxis );
		this.add( yAxis );

		const posXAxisHelper = new Sprite( getHeadMaterial( color1 ) );
		const posYAxisHelper = new Sprite( getHeadMaterial( color2 ) );
		const posZAxisHelper = new Sprite( getHeadMaterial( color3 ) );
		const negMaterial = getHeadMaterial( color4 );
		negMaterial.opacity = 0.2;
		const negXAxisHelper = new Sprite( negMaterial );
		const negYAxisHelper = new Sprite( negMaterial );
		const negZAxisHelper = new Sprite( negMaterial );

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

		const point = new Vector3();
		const turnRate = 2 * Math.PI;

		this.render = function ( renderer ) {

			this.quaternion.copy( camera.quaternion ).invert();
			this.updateMatrixWorld();

			point.set( 0, 0, 1 );
			point.applyQuaternion( camera.quaternion );

			renderer.getSize( size );
			const width = size.x > 0 ? size.x : 128;
			const height = size.y > 0 ? size.y : 128;

			renderer.clearDepth();

			renderer.getViewport( viewport );
			renderer.setViewport( 0, 0, width, height );

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
			if ( rect.width < 1 || rect.height < 1 ) return false;

			mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
			mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

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

			const texture = makeHeadTexture( color, text );
			return new SpriteMaterial( {
				map: texture,
				toneMapped: false,
				transparent: true,
				alphaTest: 0.2,
				depthTest: true
			} );

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

const HEAD_TEXTURE_SIZE = 256;

function makeHeadTexture( color, text ) {

	const size = HEAD_TEXTURE_SIZE;
	const data = new Uint8Array( size * size * 4 );
	const hex = color.getHex();
	const cr = ( hex >> 16 ) & 255;
	const cg = ( hex >> 8 ) & 255;
	const cb = hex & 255;
	const cx = size * 0.5;
	const cy = size * 0.5;
	const discR = size * 0.38;

	fillDisc( data, size, cx, cy, discR, cr, cg, cb, 255 );

	if ( text ) {

		const letterColor = new Color( '#000000' );
		const lh = letterColor.getHex();
		const lr = ( lh >> 16 ) & 255;
		const lg = ( lh >> 8 ) & 255;
		const lb = lh & 255;
		strokeLetter( data, size, String( text ).toUpperCase().charAt( 0 ), cx, cy, discR, lr, lg, lb );

	}

	const texture = new DataTexture( data, size, size, RGBAFormat, UnsignedByteType );
	texture.needsUpdate = true;
	texture.colorSpace = SRGBColorSpace;
	texture.generateMipmaps = false;
	texture.minFilter = LinearFilter;
	texture.magFilter = LinearFilter;
	texture.flipY = true;
	return texture;

}

function fillDisc( data, size, cx, cy, radius, r, g, b, a ) {

	const aa = 1.25;

	for ( let y = 0; y < size; y ++ ) {

		for ( let x = 0; x < size; x ++ ) {

			const d = Math.hypot( x + 0.5 - cx, y + 0.5 - cy );
			let cover = 0;
			if ( d <= radius - aa ) cover = 1;
			else if ( d < radius + aa ) cover = ( radius + aa - d ) / ( 2 * aa );
			if ( cover <= 0 ) continue;

			const i = ( y * size + x ) * 4;
			data[ i ] = r;
			data[ i + 1 ] = g;
			data[ i + 2 ] = b;
			data[ i + 3 ] = Math.round( a * cover );

		}

	}

}

function strokeLetter( data, size, letter, cx, cy, discR, r, g, b ) {

	const h = discR * 0.42;
	const thickness = discR * 0.22;
	const a = 255;

	if ( letter === 'X' ) {

		strokeSegment( data, size, cx - h, cy - h, cx + h, cy + h, thickness, r, g, b, a );
		strokeSegment( data, size, cx + h, cy - h, cx - h, cy + h, thickness, r, g, b, a );

	} else if ( letter === 'Y' ) {

		strokeSegment( data, size, cx - h, cy - h, cx, cy - h * 0.05, thickness, r, g, b, a );
		strokeSegment( data, size, cx + h, cy - h, cx, cy - h * 0.05, thickness, r, g, b, a );
		strokeSegment( data, size, cx, cy - h * 0.05, cx, cy + h, thickness, r, g, b, a );

	} else if ( letter === 'Z' ) {

		strokeSegment( data, size, cx - h, cy - h, cx + h, cy - h, thickness, r, g, b, a );
		strokeSegment( data, size, cx + h, cy - h, cx - h, cy + h, thickness, r, g, b, a );
		strokeSegment( data, size, cx - h, cy + h, cx + h, cy + h, thickness, r, g, b, a );

	}

}

function strokeSegment( data, size, x0, y0, x1, y1, thickness, r, g, b, a ) {

	const dx = x1 - x0;
	const dy = y1 - y0;
	const len2 = dx * dx + dy * dy;
	const half = thickness * 0.5;
	const pad = half + 1.5;
	const minX = Math.max( 0, Math.floor( Math.min( x0, x1 ) - pad ) );
	const maxX = Math.min( size - 1, Math.ceil( Math.max( x0, x1 ) + pad ) );
	const minY = Math.max( 0, Math.floor( Math.min( y0, y1 ) - pad ) );
	const maxY = Math.min( size - 1, Math.ceil( Math.max( y0, y1 ) + pad ) );

	for ( let y = minY; y <= maxY; y ++ ) {

		for ( let x = minX; x <= maxX; x ++ ) {

			const px = x + 0.5;
			const py = y + 0.5;
			const t = len2 > 0 ? Math.max( 0, Math.min( 1, ( ( px - x0 ) * dx + ( py - y0 ) * dy ) / len2 ) ) : 0;
			const d = Math.hypot( px - ( x0 + t * dx ), py - ( y0 + t * dy ) );
			let cover = 0;
			if ( d <= half ) cover = 1;
			else if ( d < half + 1 ) cover = half + 1 - d;
			if ( cover <= 0 ) continue;

			blendPixel( data, ( y * size + x ) * 4, r, g, b, a * cover );

		}

	}

}

function blendPixel( data, i, r, g, b, srcA ) {

	const sa = srcA / 255;
	if ( sa <= 0 ) return;

	const da = data[ i + 3 ] / 255;
	const outA = sa + da * ( 1 - sa );
	if ( outA <= 0 ) return;

	data[ i ] = Math.round( ( r * sa + data[ i ] * da * ( 1 - sa ) ) / outA );
	data[ i + 1 ] = Math.round( ( g * sa + data[ i + 1 ] * da * ( 1 - sa ) ) / outA );
	data[ i + 2 ] = Math.round( ( b * sa + data[ i + 2 ] * da * ( 1 - sa ) ) / outA );
	data[ i + 3 ] = Math.round( outA * 255 );

}

export { ViewHelper };
