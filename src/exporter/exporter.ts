import { VertexBuffer } from "@babylonjs/core/Buffers/buffer";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Matrix, Vector2 } from "@babylonjs/core/Maths/math";
import { AbstractMesh } from "@babylonjs/core/Meshes";
import { Scene } from "@babylonjs/core/scene";
import { strToU8, zipSync } from "fflate";

export class USDZExport {
  static Precision: number = 7;

  static async Parse(scene: Scene, options: any = {}) {
    options = {
      ar: {
        anchoring: { type: "plane" },
        planeAnchoring: { alignment: "horizontal" },
      },
      quickLookCompatible: false,
      ...options,
    };

    const files = {};
    const modelFileName = `${options?.modelName || "model"}.usda`;
    files[modelFileName] = null;

    let output = USDZExport.BuildHeader();
    output += USDZExport.BuildSceneStart(options);

    const materials = {};
    const textures = {};

    let sharedMat = null;

    scene.getActiveMeshes().forEach((mesh) => {
      //Add More Materials at somepoint
      if (mesh.material === null) {
        if (sharedMat === null) {
          sharedMat = new StandardMaterial(`default.mat`, scene);
        }
        mesh.material = sharedMat;
      }

      switch (mesh.material.getClassName()) {
        case "StandardMaterial":
          const geometryFileName =
            "geometries/Geometry_" + mesh.uniqueId + ".usda";
          if (!(geometryFileName in files)) {
            const meshObject = USDZExport.BuildMesh(mesh);
            files[geometryFileName] =
              USDZExport.BuildUSDFileAsString(meshObject);
          }

          if (!(mesh.material.uniqueId in materials)) {
            materials[mesh.material.uniqueId] = mesh.material;
          }

          output += USDZExport.BuildXform(mesh, mesh.material);

          break;
      }
    });

    if (scene.activeCameras.length) {
      scene.activeCameras.forEach((camera) => {
        console.log(camera);
        output += USDZExport.BuildCamera(camera);
      });
    } else {
      output += USDZExport.BuildCamera(scene.activeCamera);
    }

    output += USDZExport.BuildSceneEnd();

    output += USDZExport.BuildMaterials(
      materials,
      textures,
      options.quickLookCompatible
    );

    files[modelFileName] = strToU8(output);

    output = null;

    for (const id in textures) {
      const texture = textures[id];
      const canvas = USDZExport.ImageToCanvas(texture.image, texture.flipY);
      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png", 1)
      );
      files[`textures/Texture_${id}.png`] = new Uint8Array(
        await blob.arrayBuffer()
      );
    }

    // 64 byte alignment
    // https://github.com/101arrowz/fflate/issues/39#issuecomment-777263109
    let offset = 0;
    for (const filename in files) {
      const file = files[filename];
      const headerSize = 34 + filename.length;
      offset += headerSize;
      const offsetMod64 = offset & 63;

      if (offsetMod64 !== 4) {
        const padLength = 64 - offsetMod64;
        const padding = new Uint8Array(padLength);
        files[filename] = [file, { extra: { 12345: padding } }];
      }

      offset = file.length;
    }

    return zipSync( files, { level: 0 } );
  }

  static BuildHeader() {
    return `#usda 1.0
(
    customLayerData = {
        string creator = "Babylon.js USDZExport"
    }
    metersPerUnit = 1
    upAxis = "Y"
)
`;
  }

  static BuildSceneStart(options) {
    return `def Xform "Root"
{
    def Scope "Scenes" (
        kind = "sceneLibrary"
    )
    {
        def Xform "Scene" (
            customData = {
                bool preliminary_collidesWithEnvironment = 0
                string sceneName = "Scene"
            }
            sceneName = "Scene"
        )
        {
        token preliminary:anchoring:type = "${options.ar.anchoring.type}"
        token preliminary:planeAnchoring:alignment = "${options.ar.planeAnchoring.alignment}"
`;
  }

  static BuildSceneEnd() {
    return `
		}
	}
}
`;
  }

  static BuildMesh(mesh: AbstractMesh) {
    const name = mesh.name;
    const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
    const count = positions.length;

    //Need to support no normals.
    const normals = mesh.getVerticesData(VertexBuffer.NormalKind);
    const normalCount = normals.length;

    return `
	def Mesh "${name}"
	{
		int[] faceVertexCounts = [${USDZExport.BuildMeshVertexCount(count)}]
		int[] faceVertexIndices = [${USDZExport.BuildMeshVertexIndices(mesh)}]
		normal3f[] normals = [${USDZExport.BuildVector3Array(normals, normalCount)}] (
			interpolation = "vertex"
		)
        		point3f[] points = [${USDZExport.BuildVector3Array(positions, count)}]
${USDZExport.BuildPrimvars(mesh)}
		uniform token subdivisionScheme = "none"
	}
`;
  }

  static BuildMeshVertexCount(positionCount) {
    return Array(positionCount / 3)
      .fill(3)
      .join(", ");
  }

  static BuildMeshVertexIndices(mesh: AbstractMesh) {
    const indices = mesh.getIndices();
    const array = [];

    for (let i = 0; i < indices.length; i++) {
      array.push(indices[i]);
    }

    return array.join(", ");
  }

  static BuildVector3Array(attribute, count) {
    if (attribute === undefined) {
      console.warn("USDZExporter: Normals missing.");
      return Array(count).fill("(0, 0, 0)").join(", ");
    }

    const array = [];

    for (let i = 0; i < count; i += 3) {
      const x = attribute[i];
      const y = attribute[i + 1];
      const z = attribute[i + 2];
      array.push(
        `(${x.toPrecision(USDZExport.Precision)}, ${y.toPrecision(
          USDZExport.Precision
        )}, ${z.toPrecision(USDZExport.Precision)})`
      );
    }

    return array.join(", ");
  }

  static BuildVector2Array(attribute, count) {
    if (attribute.lenght) {
      console.warn("USDZExporter: UVs missing.");
      return Array(count).fill("(0, 0)").join(", ");
    }

    const array = [];

    for (let i = 0; i < attribute.count; i += 2) {
      const x = attribute[i];
      const y = attribute[i + 1];
      array.push(
        `(${x.toPrecision(USDZExport.Precision)}, ${
          1 - y.toPrecision(USDZExport.Precision)
        })`
      );
    }

    return array.join(", ");
  }

  static BuildPrimvars(mesh: AbstractMesh) {
    let output = "";
    const count = mesh.getVerticesData(VertexBuffer.PositionKind).length;
    output += USDZExport.BuildUV(
      mesh.getVerticesData(VertexBuffer.UVKind),
      0,
      count
    );
    output += USDZExport.BuildUV(
      mesh.getVerticesData(VertexBuffer.UV2Kind),
      1,
      count
    );
    output += USDZExport.BuildUV(
      mesh.getVerticesData(VertexBuffer.UV3Kind),
      2,
      count
    );
    output += USDZExport.BuildUV(
      mesh.getVerticesData(VertexBuffer.UV4Kind),
      3,
      count
    );
    // output += USDZExport.BuildUV(mesh.getVerticesData(VertexBuffer.UV5Kind))
    // output += USDZExport.BuildUV(mesh.getVerticesData(VertexBuffer.UV6Kind))
    return output;
  }

  static BuildUV(uv, id, count) {
    let output = "";

    if (uv?.lenght > 0) {
      output += `
		texCoord2f[] primvars:st${id} = [${USDZExport.BuildVector2Array(uv, count)}] (
			interpolation = "vertex"
		)`;
    }

    return output;
  }

  static BuildXform(mesh: AbstractMesh, material) {
    const name = "Object_" + mesh.uniqueId;
    const mat = mesh.getWorldMatrix();
    const transform = USDZExport.BuildMatrix(mat);

    if (mat.determinant() < 0) {
      console.warn(
        "BABYLON.USDZExport: USDZ does not support negative scales",
        mesh
      );
    }

    return `def Xform "${name}" (
    prepend references = @./geometries/Geometry_${mesh.uniqueId}.usda@</Geometry>
    prepend apiSchemas = ["MaterialBindingAPI"]
)
{
    matrix4d xformOp:transform = ${transform}
    uniform token[] xformOpOrder = ["xformOp:transform"]
    rel material:binding = </Materials/Material_${material.uniqueId}>
}
`;
  }

  static BuildMatrix(matrix: Matrix) {
    const array = matrix.toArray();
    return `( ${USDZExport.BuildMatrixRow(
      array,
      0
    )}, ${USDZExport.BuildMatrixRow(array, 4)}, ${USDZExport.BuildMatrixRow(
      array,
      8
    )}, ${USDZExport.BuildMatrixRow(array, 12)} )`;
  }

  static BuildMatrixRow(array, offset) {
    return `(${array[offset + 0]}, ${array[offset + 1]}, ${
      array[offset + 2]
    }, ${array[offset + 3]})`;
  }

  public static FilmGauge: number = 35;
  public static Focus: number = 10;

  static BuildCamera(camera: Camera) {
    const name = `${camera.name}_${camera.uniqueId}`;
    const mat = camera.getWorldMatrix();

    const transform = USDZExport.BuildMatrix(mat);

    if (mat.determinant() < 0) {
      console.warn(
        "BABYLON.USDZExport: USDZ does not support negative scales",
        camera
      );
    }

    if (camera.mode === Camera.ORTHOGRAPHIC_CAMERA) {
      return `def Camera "${name}"
            {
                matrix4d xformOp:transform = ${transform}
                uniform token[] xformOpOrder = ["xformOp:transform"]
                float2 clippingRange = (${camera.minZ.toPrecision(
                  USDZExport.Precision
                )}, ${camera.maxZ.toPrecision(USDZExport.Precision)})
                float horizontalAperture = ${(
                  (Math.abs(camera.orthoLeft) + Math.abs(camera.orthoRight)) *
                  10
                ).toPrecision(USDZExport.Precision)}
                float verticalAperture = ${(
                  (Math.abs(camera.orthoTop) + Math.abs(camera.orthoBottom)) *
                  10
                ).toPrecision(USDZExport.Precision)}
                token projection = "orthographic"
            }`;
    } else {
      return `def Camera "${name}"
            {
                matrix4d xformOp:transform = ${transform}
                uniform token[] xformOpOrder = ["xformOp:transform"]
                float2 clippingRange = (${camera.minZ.toPrecision(
                  USDZExport.Precision
                )}, ${camera.maxZ.toPrecision(USDZExport.Precision)})
                float focalLength = ${camera.fov.toPrecision(
                  USDZExport.Precision
                )}
                float focusDistance = ${
                  USDZExport.Focus.toPrecision(
                    USDZExport.Precision
                  ) /*THIS IS PROBABLY WRONG*/
                }
                float horizontalAperture = ${
                  USDZExport.FilmGauge.toPrecision(
                    USDZExport.Precision
                  ) /*THIS IS PROBABLY WRONG*/
                } 
                token projection = "perspective"
                float verticalAperture = ${
                  USDZExport.FilmGauge.toPrecision(
                    USDZExport.Precision
                  ) /*THIS IS PROBABLY WRONG*/
                }
            }`;
    }
  }

  static BuildMaterials(materials, textures, quickLookCompatible = false) {
    const array = [];
    for (const uuid in materials) {
      const material = materials[uuid];

      array.push(
        USDZExport.BuildMaterialFromStandard(
          material,
          textures,
          quickLookCompatible
        )
      );
    }

    return `def "Materials"
{
${array.join("")}
}
`;
  }

  static BuildMaterialFromStandard(
    material: StandardMaterial,
    textures,
    quickLookCompatible = false
  ) {
    // https://graphics.pixar.com/usd/docs/UsdPreviewSurface-Proposal.html

    const pad = "			";
    const inputs = [];
    const samplers = [];

    function buildTexture(texture: Texture, mapType, color = undefined) {
      const id = texture.uniqueId + "_" + texture.invertY;

      textures[id] = texture;

      const uv = texture.coordinatesIndex;

      /* TODO CHECK THIS */
      const WRAPPINGS = [
        "clamp", // ClampToEdgeWrapping
        "repeat", // RepeatWrapping
        "mirror", // MirroredRepeatWrapping
      ];

      const repeat = new Vector2(
        texture.wrapU === Texture.CLAMP_ADDRESSMODE ? 0 : 1,
        texture.wrapV === Texture.CLAMP_ADDRESSMODE ? 0 : 1
      );
      const offset = new Vector2(texture.uOffset, texture.vOffset);
      const rotation = 0; /*TODO, remember what value this is*/

      // rotation is around the wrong point. after rotation we need to shift offset again so that we're rotating around the right spot
      const xRotationOffset = Math.sin(rotation);
      const yRotationOffset = Math.cos(rotation);

      // texture coordinates start in the opposite corner, need to correct
      offset.y = 1 - offset.y - repeat.y;

      // turns out QuickLook is buggy and interprets texture repeat inverted/applies operations in a different order.
      // Apple Feedback: 	FB10036297 and FB11442287
      if (quickLookCompatible) {
        // This is NOT correct yet in QuickLook, but comes close for a range of models.
        // It becomes more incorrect the bigger the offset is
        offset.x = offset.x / repeat.x;
        offset.y = offset.y / repeat.y;

        offset.x += xRotationOffset / repeat.x;
        offset.y += yRotationOffset - 1;
      } else {
        // results match glTF results exactly. verified correct in usdview.
        offset.x += xRotationOffset * repeat.x;
        offset.y += (1 - yRotationOffset) * repeat.y;
      }

      return `
		def Shader "PrimvarReader_${mapType}"
		{
			uniform token info:id = "UsdPrimvarReader_float2"
			float2 inputs:fallback = (0.0, 0.0)
			token inputs:varname = "${uv}"
			float2 outputs:result
		}
		def Shader "Transform2d_${mapType}"
		{
			uniform token info:id = "UsdTransform2d"
			token inputs:in.connect = </Materials/Material_${
        material.id
      }/PrimvarReader_${mapType}.outputs:result>
			float inputs:rotation = ${(rotation * (180 / Math.PI)).toFixed(
        USDZExport.Precision
      )}
			float2 inputs:scale = ${USDZExport.BuildVector2(repeat)}
			float2 inputs:translation = ${USDZExport.BuildVector2(offset)}
			float2 outputs:result
		}
		def Shader "Texture_${texture.uniqueId}_${mapType}"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_${id}.png@
			float2 inputs:st.connect = </Materials/Material_${
        material.id
      }/Transform2d_${mapType}.outputs:result>
			${
        color !== undefined
          ? "float4 inputs:scale = " + USDZExport.BuildColor4(color)
          : ""
      }
			token inputs:sourceColorSpace = "${"sRGB" /* TODO CHECK THIS */}"
			token inputs:wrapS = "${WRAPPINGS[texture.wrapU] /* TODO CHECK THIS */}"
			token inputs:wrapT = "${WRAPPINGS[texture.wrapV] /* TODO CHECK THIS */}"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			${
        material.needAlphaTesting
          ? "float outputs:a"
          : "" /* TODO NEED A BETTER CHECK */
      }
		}`;
    }

    if (!material.cullBackFaces) {
      console.warn(
        "BABYLON.USDZExport: USDZ does not support double sided materials",
        material
      );
    }

    if (material.diffuseTexture !== null) {
      inputs.push(
        `${pad}color3f inputs:diffuseColor.connect = </Materials/Material_${material.uniqueId}/Texture_${material.diffuseTexture.uniqueId}_diffuse.outputs:rgb>`
      );

      if (material.useAlphaFromDiffuseTexture) {
        inputs.push(
          `${pad}float inputs:opacity.connect = </Materials/Material_${material.uniqueId}/Texture_${material.diffuseTexture.uniqueId}_diffuse.outputs:a>`
        );
      } else if (material.needAlphaTesting) {
        inputs.push(
          `${pad}float inputs:opacity.connect = </Materials/Material_${material.uniqueId}/Texture_${material.diffuseTexture.uniqueId}_diffuse.outputs:a>`
        );
        inputs.push(
          `${pad}float inputs:opacityThreshold = ${material.alphaCutOff}`
        );
      }

      samplers.push(
        buildTexture(
          material.diffuseTexture as Texture,
          "diffuse",
          material.diffuseColor
        )
      );
    } else {
      inputs.push(
        `${pad}color3f inputs:diffuseColor = ${USDZExport.BuildColor(
          material.diffuseColor
        )}`
      );
    }

    if (material.emissiveTexture !== null) {
      inputs.push(
        `${pad}color3f inputs:emissiveColor.connect = </Materials/Material_${material.uniqueId}/Texture_${material.emissiveTexture.uniqueId}_emissive.outputs:rgb>`
      );
      samplers.push(
        buildTexture(material.emissiveTexture as Texture, "emissive")
      );
    } else if (material.emissiveColor) {
      inputs.push(
        `${pad}color3f inputs:emissiveColor = ${USDZExport.BuildColor(
          material.emissiveColor
        )}`
      );
    }

    if (material.bumpTexture !== null) {
      inputs.push(
        `${pad}normal3f inputs:normal.connect = </Materials/Material_${material.uniqueId}/Texture_${material.bumpTexture.uniqueId}_normal.outputs:rgb>`
      );
      samplers.push(buildTexture(material.bumpTexture as Texture, "normal"));
    }

    if (material.ambientTexture !== null) {
      inputs.push(
        `${pad}float inputs:occlusion.connect = </Materials/Material_${material.uniqueId}/Texture_${material.ambientTexture.uniqueId}_occlusion.outputs:r>`
      );
      samplers.push(
        buildTexture(material.ambientTexture as Texture, "occlusion")
      );
    }

    // if ( material.roughnessMap !== null && material.roughness === 1 ) {

    // 	inputs.push( `${ pad }float inputs:roughness.connect = </Materials/Material_${ material.id }/Texture_${ material.roughnessMap.id }_roughness.outputs:g>` );

    // 	samplers.push( buildTexture( material.roughnessMap, 'roughness' ) );

    // } else {

    // 	inputs.push( `${ pad }float inputs:roughness = ${ material.roughness }` );

    // }
    // 	if ( material.metalnessMap !== null && material.metalness === 1 ) {

    // 		inputs.push( `${ pad }float inputs:metallic.connect = </Materials/Material_${ material.id }/Texture_${ material.metalnessMap.id }_metallic.outputs:b>` );

    // 		samplers.push( buildTexture( material.metalnessMap, 'metallic' ) );

    // 	} else {

    // 		inputs.push( `${ pad }float inputs:metallic = ${ material.metalness }` );

    // 	}

    //TODO: Convert all this to PBRMaterial
    inputs.push(`${pad}float inputs:roughness = ${1}`);
    inputs.push(`${pad}float inputs:metallic = ${0}`);

    if (material.opacityTexture !== null) {
      inputs.push(
        `${pad}float inputs:opacity.connect = </Materials/Material_${material.uniqueId}/Texture_${material.opacityTexture.uniqueId}_opacity.outputs:r>`
      );
      inputs.push(`${pad}float inputs:opacityThreshold = 0.0001`);
      samplers.push(
        buildTexture(material.opacityTexture as Texture, "opacity")
      );
    } else {
      inputs.push(`${pad}float inputs:opacity = ${material.alpha}`);
    }

    // 	if ( material.isMeshPhysicalMaterial ) {
    // 		inputs.push( `${ pad }float inputs:clearcoat = ${ material.clearcoat }` );
    // 		inputs.push( `${ pad }float inputs:clearcoatRoughness = ${ material.clearcoatRoughness }` );
    // 		inputs.push( `${ pad }float inputs:ior = ${ material.ior }` );
    // 	}

    return `
	def Material "Material_${material.uniqueId}"
	{
		def Shader "PreviewSurface"
		{
			uniform token info:id = "UsdPreviewSurface"
${inputs.join("\n")}
			int inputs:useSpecularWorkflow = 0
			token outputs:surface
		}
		token outputs:surface.connect = </Materials/Material_${
      material.uniqueId
    }/PreviewSurface.outputs:surface>
${samplers.join("\n")}
	}
`;
  }

  static BuildColor(color) {
    return `(${color.r}, ${color.g}, ${color.b})`;
  }

  static BuildColor4(color) {
    return `(${color.r}, ${color.g}, ${color.b}, 1.0)`;
  }

  static BuildVector2(vector) {
    return `(${vector.x}, ${vector.y})`;
  }

  static BuildUSDFileAsString(dataToInsert) {
    let output = USDZExport.BuildHeader();
    output += dataToInsert;
    return strToU8(output);
  }

  static ImageToCanvas(image, flipY): HTMLCanvasElement {
    if (
      (typeof HTMLImageElement !== "undefined" &&
        image instanceof HTMLImageElement) ||
      (typeof HTMLCanvasElement !== "undefined" &&
        image instanceof HTMLCanvasElement) ||
      (typeof OffscreenCanvas !== "undefined" &&
        image instanceof OffscreenCanvas) ||
      (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap)
    ) {
      const scale = 1024 / Math.max(image.width, image.height);

      const canvas = document.createElement("canvas");
      canvas.width = image.width * Math.min(1, scale);
      canvas.height = image.height * Math.min(1, scale);

      const context = canvas.getContext("2d");

      // TODO: We should be able to do this in the UsdTransform2d?

      if (flipY === true) {
        context.translate(0, canvas.height);
        context.scale(1, -1);
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      return canvas;
    } else {
      throw new Error(
        "BABYLON.USDZExport: No valid image data found. Unable to process texture."
      );
    }
  }
}
