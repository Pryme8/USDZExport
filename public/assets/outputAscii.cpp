#usda 1.0
(
    customLayerData = {
        string creator = "Babylon.js USDZExport"
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

def Xform "Object_4" (
    prepend references = @./geometries/Geometry_4.usda@</Geometry>
    prepend apiSchemas = ["MaterialBindingAPI"]
)
{
    matrix4d xformOp:transform = ( (-1, 0, 0, 0), (0, -1.3435885648505064e-7, -1.0000001192092896, 0), (0, -1.0000001192092896, 1.3435885648505064e-7, 0), (0, 0, 0, 1) )
    uniform token[] xformOpOrder = ["xformOp:transform"]
    rel material:binding = </Materials/Material_6>
}


		}
	}
}

def "Materials"
{

	def Material "Material_6"
	{
		def Shader "PreviewSurface"
		{
			uniform token info:id = "UsdPreviewSurface"
			color3f inputs:diffuseColor.connect = </Materials/Material_6/Texture_11_diffuse.outputs:rgb>
			float inputs:opacity.connect = </Materials/Material_6/Texture_11_diffuse.outputs:a>
			float inputs:opacityThreshold = 0.4
			color3f inputs:emissiveColor.connect = </Materials/Material_6/Texture_10_emissive.outputs:rgb>
			normal3f inputs:normal.connect = </Materials/Material_6/Texture_8_normal.outputs:rgb>
			float inputs:occlusion.connect = </Materials/Material_6/Texture_9_occlusion.outputs:r>
			float inputs:roughness = 1
			float inputs:metallic = 0
			float inputs:opacity = 1
			int inputs:useSpecularWorkflow = 0
			token outputs:surface
		}

		token outputs:surface.connect = </Materials/Material_6/PreviewSurface.outputs:surface>


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
			token inputs:in.connect = </Materials/Material_6/PrimvarReader_diffuse.outputs:result>
			float inputs:rotation = 0.0000000
			float2 inputs:scale = (1, 1)
			float2 inputs:translation = (0, 0)
			float2 outputs:result
		}
		def Shader "Texture_11_diffuse"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_11_false.png@
			float2 inputs:st.connect = </Materials/Material_6/Transform2d_diffuse.outputs:result>
			float4 inputs:scale = (1, 1, 1, 1.0)
			token inputs:sourceColorSpace = "sRGB"
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			float outputs:a
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
			token inputs:in.connect = </Materials/Material_6/PrimvarReader_emissive.outputs:result>
			float inputs:rotation = 0.0000000
			float2 inputs:scale = (1, 1)
			float2 inputs:translation = (0, 0)
			float2 outputs:result
		}
		def Shader "Texture_10_emissive"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_10_false.png@
			float2 inputs:st.connect = </Materials/Material_6/Transform2d_emissive.outputs:result>
			
			token inputs:sourceColorSpace = "sRGB"
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			float outputs:a
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
			token inputs:in.connect = </Materials/Material_6/PrimvarReader_normal.outputs:result>
			float inputs:rotation = 0.0000000
			float2 inputs:scale = (1, 1)
			float2 inputs:translation = (0, 0)
			float2 outputs:result
		}
		def Shader "Texture_8_normal"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_8_false.png@
			float2 inputs:st.connect = </Materials/Material_6/Transform2d_normal.outputs:result>
			
			token inputs:sourceColorSpace = "sRGB"
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			float outputs:a
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
			token inputs:in.connect = </Materials/Material_6/PrimvarReader_occlusion.outputs:result>
			float inputs:rotation = 0.0000000
			float2 inputs:scale = (1, 1)
			float2 inputs:translation = (0, 0)
			float2 outputs:result
		}
		def Shader "Texture_9_occlusion"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_9_false.png@
			float2 inputs:st.connect = </Materials/Material_6/Transform2d_occlusion.outputs:result>
			
			token inputs:sourceColorSpace = "sRGB"
			token inputs:wrapS = "repeat"
			token inputs:wrapT = "repeat"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			float outputs:a
		}
	}

}