#usda 1.0
(
	customLayerData = {
		string creator = "Three.js USDZExporter"
	}
	metersPerUnit = 1
	upAxis = "Y"
)

def Xform "Root"
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
		token preliminary:anchoring:type = "plane"
		token preliminary:planeAnchoring:alignment = "horizontal"

def Xform "Object_52" (
	prepend references = @./geometries/Geometry_16.usda@</Geometry>
	prepend apiSchemas = ["MaterialBindingAPI"]
)
{
	matrix4d xformOp:transform = ( (1, 0, 0, 0), (0, -1.3435885648505064e-7, 1.0000001343588565, 0), (0, -1.0000001343588565, -1.3435885648505064e-7, 0), (0, 0, 0, 1) )
	uniform token[] xformOpOrder = ["xformOp:transform"]

	rel material:binding = </Materials/Material_16>
}


		}
	}
}

def "Materials"
{

	def Material "Material_16"
	{
		def Shader "PreviewSurface"
		{
			uniform token info:id = "UsdPreviewSurface"
			color3f inputs:diffuseColor.connect = </Materials/Material_16/Texture_10_diffuse.outputs:rgb>
			color3f inputs:emissiveColor.connect = </Materials/Material_16/Texture_6_emissive.outputs:rgb>
			normal3f inputs:normal.connect = </Materials/Material_16/Texture_8_normal.outputs:rgb>
			float inputs:occlusion.connect = </Materials/Material_16/Texture_7_occlusion.outputs:r>
			float inputs:roughness.connect = </Materials/Material_16/Texture_9_roughness.outputs:g>
			float inputs:metallic.connect = </Materials/Material_16/Texture_9_metallic.outputs:b>
			float inputs:opacity = 1
			int inputs:useSpecularWorkflow = 0
			token outputs:surface
		}

		token outputs:surface.connect = </Materials/Material_16/PreviewSurface.outputs:surface>


		def Shader "PrimvarReader_diffuse"
		{
			uniform token info:id = "UsdPrimvarReader_float2"
			float2 inputs:fallback = (0.0, 0.0)
			token inputs:varname = "st"
			float2 outputs:result
		}

		def Shader "Transform2d_diffuse"
		{
			uniform token info:id = "UsdTransform2d"
			token inputs:in.connect = </Materials/Material_16/PrimvarReader_diffuse.outputs:result>
			float inputs:rotation = 0.0000000
			float2 inputs:scale = (1, 1)
			float2 inputs:translation = (0, 0)
			float2 outputs:result
		}

		def Shader "Texture_10_diffuse"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_10_false.png@
			float2 inputs:st.connect = </Materials/Material_16/Transform2d_diffuse.outputs:result>
			float4 inputs:scale = (1, 1, 1, 1.0)
			token inputs:sourceColorSpace = "sRGB"
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			
		}

		def Shader "PrimvarReader_emissive"
		{
			uniform token info:id = "UsdPrimvarReader_float2"
			float2 inputs:fallback = (0.0, 0.0)
			token inputs:varname = "st"
			float2 outputs:result
		}

		def Shader "Transform2d_emissive"
		{
			uniform token info:id = "UsdTransform2d"
			token inputs:in.connect = </Materials/Material_16/PrimvarReader_emissive.outputs:result>
			float inputs:rotation = 0.0000000
			float2 inputs:scale = (1, 1)
			float2 inputs:translation = (0, 0)
			float2 outputs:result
		}

		def Shader "Texture_6_emissive"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_6_false.png@
			float2 inputs:st.connect = </Materials/Material_16/Transform2d_emissive.outputs:result>
			
			token inputs:sourceColorSpace = "sRGB"
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			
		}

		def Shader "PrimvarReader_normal"
		{
			uniform token info:id = "UsdPrimvarReader_float2"
			float2 inputs:fallback = (0.0, 0.0)
			token inputs:varname = "st"
			float2 outputs:result
		}

		def Shader "Transform2d_normal"
		{
			uniform token info:id = "UsdTransform2d"
			token inputs:in.connect = </Materials/Material_16/PrimvarReader_normal.outputs:result>
			float inputs:rotation = 0.0000000
			float2 inputs:scale = (1, 1)
			float2 inputs:translation = (0, 0)
			float2 outputs:result
		}

		def Shader "Texture_8_normal"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_8_false.png@
			float2 inputs:st.connect = </Materials/Material_16/Transform2d_normal.outputs:result>
			
			token inputs:sourceColorSpace = "raw"
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			
		}

		def Shader "PrimvarReader_occlusion"
		{
			uniform token info:id = "UsdPrimvarReader_float2"
			float2 inputs:fallback = (0.0, 0.0)
			token inputs:varname = "st"
			float2 outputs:result
		}

		def Shader "Transform2d_occlusion"
		{
			uniform token info:id = "UsdTransform2d"
			token inputs:in.connect = </Materials/Material_16/PrimvarReader_occlusion.outputs:result>
			float inputs:rotation = 0.0000000
			float2 inputs:scale = (1, 1)
			float2 inputs:translation = (0, 0)
			float2 outputs:result
		}

		def Shader "Texture_7_occlusion"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_7_false.png@
			float2 inputs:st.connect = </Materials/Material_16/Transform2d_occlusion.outputs:result>
			
			token inputs:sourceColorSpace = "raw"
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			
		}

		def Shader "PrimvarReader_roughness"
		{
			uniform token info:id = "UsdPrimvarReader_float2"
			float2 inputs:fallback = (0.0, 0.0)
			token inputs:varname = "st"
			float2 outputs:result
		}

		def Shader "Transform2d_roughness"
		{
			uniform token info:id = "UsdTransform2d"
			token inputs:in.connect = </Materials/Material_16/PrimvarReader_roughness.outputs:result>
			float inputs:rotation = 0.0000000
			float2 inputs:scale = (1, 1)
			float2 inputs:translation = (0, 0)
			float2 outputs:result
		}

		def Shader "Texture_9_roughness"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_9_false.png@
			float2 inputs:st.connect = </Materials/Material_16/Transform2d_roughness.outputs:result>
			
			token inputs:sourceColorSpace = "raw"
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			
		}

		def Shader "PrimvarReader_metallic"
		{
			uniform token info:id = "UsdPrimvarReader_float2"
			float2 inputs:fallback = (0.0, 0.0)
			token inputs:varname = "st"
			float2 outputs:result
		}

		def Shader "Transform2d_metallic"
		{
			uniform token info:id = "UsdTransform2d"
			token inputs:in.connect = </Materials/Material_16/PrimvarReader_metallic.outputs:result>
			float inputs:rotation = 0.0000000
			float2 inputs:scale = (1, 1)
			float2 inputs:translation = (0, 0)
			float2 outputs:result
		}

		def Shader "Texture_9_metallic"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_9_false.png@
			float2 inputs:st.connect = </Materials/Material_16/Transform2d_metallic.outputs:result>
			
			token inputs:sourceColorSpace = "raw"
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			
		}

	}

}



