import {IMLeaferCanvas, MLeaferCanvas} from '@/views/Editor/core/canvas/mLeaferCanvas'
import {Disposable} from '@/views/Editor/utils/lifecycle'
import {IKeybindingService, KeybindingService} from '@/views/Editor/core/keybinding/keybindingService'
import {Platform, Point, Rect, Box} from "leafer-ui";
import {Flow} from "@leafer-in/flow";
import IconfontDeleteSvg from '@/assets/icons/iconfont-delete.svg?raw'
import IconfontCopySvg from '@/assets/icons/iconfont-copy.svg?raw'
import IconfontAiSvg from '@/assets/icons/iconfont-ai.svg?raw'
import {EditorEvent} from "@leafer-in/editor";
import {IEventListener} from "@leafer-ui/interface";
import {Message} from "@arco-design/web-vue";
import {segmentImage} from "@/api/editor/segment";

const baseHeight: number = 30
const baseWidth: number = 30
const basePadding: number = 10

export class FollowButton extends Disposable {

    public pointer: Point | undefined

    constructor(
        @IMLeaferCanvas private readonly canvas: MLeaferCanvas,
        @IKeybindingService private readonly keybinding: KeybindingService,
    ) {
        super()
        const btnBox = new Flow({
            flowAlign: 'center',
            fill: '#ffffff',
            height: baseHeight + basePadding,
            cornerRadius: 5,
            stroke: 'rgb(229,229,229)',
        })

        const btnSeparate = new Box({
            around: 'center',
            width: 11,
            padding: basePadding / 2,
        })
        const separate = new Rect({
            width: 1,
            x: 6,
            height: baseHeight / 2,
            stroke: 'rgb(215,215,215)',
        })
        btnSeparate.add(separate)

        const btnCopy = this.createBtn(Platform.toURL(IconfontCopySvg, 'svg'), function () {
            keybinding.trigger('mod+c')
            keybinding.trigger('mod+v')
        })
        const btnDelete = this.createBtn(Platform.toURL(IconfontDeleteSvg, 'svg'), function () {
            keybinding.trigger('del')
        })
        const btnAi = this.createBtn(Platform.toURL(IconfontAiSvg, 'svg'), async () => {
            await this.handleAiSegmentation();
        })
        const aiSpt = btnSeparate.clone()
        btnBox.add(btnAi)
        btnBox.add(aiSpt)
        btnBox.add(btnCopy)
        btnBox.add(btnSeparate.clone())
        btnBox.add(btnDelete)
        btnBox.width = btnBox.width + basePadding
        canvas.app.editor.buttons.add(btnBox)

        canvas.app.editor.on(EditorEvent.SELECT, (arg) => {
            btnAi.visible = aiSpt.visible = !canvas.activeObjectIsType("Image", "Image2") ? 0 : true
            const totalWidth = btnBox.children.reduce((acc, curr) => acc + (curr.visible !== 0 ? curr.width : 0), 0);
            btnBox.width = totalWidth + basePadding
        })
    }

    private createBtn(imgUrl: string, tapEvent: IEventListener): Rect {
        return new Rect({
            width: baseWidth,
            height: baseHeight,
            cursor: 'pointer',
            cornerRadius: 5,
            hoverStyle: {
                fill: [
                    {
                        type: 'solid',
                        color: 'rgba(215,215,215,0.5)'
                    },
                    {
                        type: "image",
                        mode: 'fit',
                        url: imgUrl,
                        padding: basePadding / 2
                    },
                ],
            },
            fill: {
                type: "image",
                mode: 'fit',
                url: imgUrl,
                padding: basePadding / 2
            },
            event: {
                tap: tapEvent,
            },
        })
    }

    private async handleAiSegmentation() {
        let loadingMessage: any = null;
        try {
            // 获取当前选中的图片对象
            const activeObject = this.canvas.getActiveObject();
            if (!activeObject || !this.canvas.activeObjectIsType("Image", "Image2")) {
                Message.warning('请先选择一个图片');
                return;
            }

            loadingMessage = Message.loading('AI抠图处理中，请稍候...');
            
            // 获取图片URL
            const imageUrl = (activeObject as any).url;
            if (!imageUrl) {
                Message.error('无法获取图片信息');
                return;
            }

            // 从URL获取文件
            const file = await this.urlToFile(imageUrl);
            
            // 调用分割API
            const response = await segmentImage(file);
            
            if (response.data && response.data.code === 10000) {
                const segmentedImageUrl = response.data.data;
                
                // 替换图片URL
                (activeObject as any).url = segmentedImageUrl;
                activeObject.forceRender();

                Message.success('AI抠图完成！');
            } else {
                Message.error('AI抠图失败：' + (response.data?.message || '未知错误'));
            }
        } catch (error: any) {
            console.error('AI抠图失败:', error);
            let errorMessage = 'AI抠图失败，请重试';
            
            if (error.message === 'Network Error') {
                errorMessage = '网络连接失败，请检查服务器是否启动（localhost:8080）';
            } else if (error.response) {
                errorMessage = `服务器错误：${error.response.status} ${error.response.data?.message || ''}`;
            } else if (error.message) {
                errorMessage = `请求失败：${error.message}`;
            }
            
            Message.error(errorMessage);
        } finally {
            if (loadingMessage) {
                loadingMessage.close();
            }
        }
    }

    private async urlToFile(url: string): Promise<File> {
        const response = await fetch(url);
        const blob = await response.blob();
        const filename = url.split('/').pop() || 'image.jpg';
        return new File([blob], filename, { type: blob.type });
    }
}
