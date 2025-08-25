<template>
    <div class="layout-box">
        <a-spin :loading="loading" tip="正在初始化" style="height: 100%;width: 100%">
            <a-layout style="height: 100%">
                <a-layout-header>
                    <headerBar/>
                </a-layout-header>
                <a-layout>
                    <leftPanel/>
                    <a-layout-content >
                        <a-layout class="editor-box">
                            <a-layout-content class="dea-main-container" >
                                <div style="background-color: #fff">
                                    <canvas-edit/>
                                </div>
                            </a-layout-content>
                            <footerBar/>
                        </a-layout>
                    </a-layout-content>
                    <rightPanel/>
                </a-layout>
            </a-layout>
        </a-spin>
    </div>
</template>

<script setup lang="ts">

import HeaderBar from '@/views/Editor/layouts/header/headerBar.vue'
import LeftPanel from '@/views/Editor/layouts/panel/leftPanel'
import RightPanel from '@/views/Editor/layouts/panel/rightPanel'
import FooterBar from '@/views/Editor/layouts/footer/footerBar.vue'
import CanvasEdit from "@/views/Editor/layouts/canvasEdit/canvasEdit.vue";
import {getActiveCore} from '@/views/Editor/core'
import {appInstance, useEditor} from '@/views/Editor/app'
import {EditorMain} from '@/views/Editor/app/editor'
import {Image} from "leafer-ui"
import {getDefaultName} from "@/views/Editor/utils/utils"


const route = useRoute()
const position = ref('1')
const loading = ref(true)

// 设置背景图片（作为独立的图片元素）
const setBackgroundImage = async (bgImageUrl: string) => {
    try {
        console.log('📦 setBackgroundImage called with URL:', bgImageUrl)
        
        console.log('🔍 Getting editor instance...')
        const editorInstance = useEditor()
        console.log('📋 Editor instance:', editorInstance)
        
        if (!editorInstance) {
            console.error('❌ useEditor() returned undefined')
            return
        }
        
        const { canvas } = editorInstance
        console.log('🎨 Canvas instance:', canvas)
        
        if (!canvas) {
            console.error('❌ Canvas is not ready')
            return
        }

        console.log('🖼️ Creating Image element directly (like fileOper.vue)...')
        // 直接创建Image元素（和插入图片功能一样，不预加载尺寸）
        const image = new Image({
            name: getDefaultName(canvas.contentFrame),
            url: bgImageUrl,
            editable: true,
            x: 0,
            y: 0
            // 让leafer-ui自动处理尺寸
        })
        console.log('✅ Image element created:', image)
        
        console.log('➕ Adding image to canvas...')
        // 添加图片到画布
        canvas.add(image)
        console.log('✅ Image added to canvas')
        
        // 等待图片加载完成，然后调整画布尺寸
        console.log('⏳ Waiting for image to load...')
        
        // 使用一个定时器来检查图片是否加载完成
        const checkImageLoaded = () => {
            setTimeout(() => {
                console.log('🔍 Checking image dimensions...')
                console.log('📐 Image width:', image.width)
                console.log('📐 Image height:', image.height)
                
                if (image.width && image.height && image.width > 0 && image.height > 0) {
                    console.log('✅ Image loaded with dimensions:', image.width, 'x', image.height)
                    
                    // 调整画布尺寸以适应图片
                    const newWidth = Math.max(image.width, 800)
                    const newHeight = Math.max(image.height, 600)
                    
                    console.log('🔧 Adjusting canvas size to:', newWidth, 'x', newHeight)
                    canvas.contentFrame.width = newWidth
                    canvas.contentFrame.height = newHeight
                    
                    console.log('🔍 Zooming to fit...')
                    // 重新适应画布大小
                    canvas.zoomToFit()
                    console.log('✅ Canvas resized and zoom to fit completed')
                    
                    console.log('🎉 Background image setup completed successfully!')
                } else {
                    console.log('⏳ Image still loading, checking again...')
                    checkImageLoaded() // 递归检查
                }
            }, 100) // 每100ms检查一次
        }
        
        checkImageLoaded()
        
        console.log('🚀 Image loading process initiated')
    } catch (error) {
        console.error('💥 Failed to load background image:', error)
        console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack available')
    }
}

onBeforeMount(() => {
    loading.value = false
    const { service } = getActiveCore()
    appInstance.editor = service.createInstance(EditorMain)
    appInstance.editor.startup()
    
    console.log('🔍 Editor component mounted')
    console.log('📍 Current route:', route.fullPath)
    console.log('📝 Route query:', route.query)
    
    // 检查URL参数中是否有bgImage
    nextTick(() => {
        const bgImageUrl = route.query.bgImage as string
        console.log('🔄 In nextTick - Route query:', route.query)
        console.log('🖼️ bgImage parameter:', bgImageUrl)
        
        if (bgImageUrl) {
            console.log('✅ Detected bgImage parameter:', bgImageUrl)
            // 等待编辑器完全初始化后再设置背景图片
            setTimeout(() => {
                console.log('🚀 Starting to load background image...')
                setBackgroundImage(bgImageUrl)
            }, 1000) // 增加延迟时间
        } else {
            console.log('❌ No bgImage parameter found in URL')
            console.log('🔍 Available query keys:', Object.keys(route.query))
        }
    })
})

onBeforeUnmount(() => {
    appInstance.editor.dispose()
    appInstance.editor = null!
})

</script>
<style>

</style>
<style lang="less" scoped>
@import "./styles/layouts";
.editor-box{
  height: calc(100vh - @contentLayoutPadding*2);
}
.dea-main-container {
    background-color: #f1f2f4;
    max-width: 100%;
    padding: @contentLayoutPadding;
    overflow: hidden;
    height: 100%;
    position: relative;
}
/*马赛克背景样式，和.contentBox一起使用，用起来有点晃眼*/
.dea-main-container-wrap{
    --offsetX: 0px;
    --offsetY: 0px;
    --size: 14px;
    --color: #dedcdc;
    background-image: linear-gradient(45deg,var(--color) 25%,transparent 0,transparent 75%,var(--color) 0),linear-gradient(45deg,var(--color) 25%,transparent 0,transparent 75%,var(--color) 0);
    background-position: var(--offsetX) var(--offsetY),calc(var(--size) + var(--offsetX)) calc(var(--size) + var(--offsetY));
    background-size: calc(var(--size) * 2) calc(var(--size) * 2);
}

.layout-box {
    height: 100vh;
    overflow: hidden;
}
</style>
