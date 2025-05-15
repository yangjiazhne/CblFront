import '@/lib/fabric/fabric'
import store from '@/redux/store'
import OpenSeadragon from '@/lib/openseadragon-fabricjs-overlay/openseadragon-fabricjs-overlay'
// @ts-ignore
const fabric = window.fabric

const getScoreColor = (score) => {
    const colors = {
        '3': '#10B981',  // emerald
        '4': '#3B82F6',  // blue
        '5': '#F59E0B',   // amber
        'ASC-US': '#f19e9c',  // emerald
        'ASC-H': '#eb473f',  // blue
        'LSIL': '#ec706b',   // amber
        'HSIL': '#bb261a',   // amber
        "AGC": '#e41908',
        'AGC-NOS':'#3a75ae',
        'NILM':'#519e3d'
    };
    return colors[score] || '#CBD5E0';
};

export const drawAll = (tiles) => {
    const { project } = store.getState()
    const { currentCanvas,  //当前画布  用于画方框
            strokeWidth,
            pathoImgInfo,   // Slide信息
            currentViewer   //当前openseadragon viewer  用于移动视图
          } = project

    // 先清除所有标注
    currentCanvas.remove(...currentCanvas.getObjects())
    currentCanvas.renderAll()

    // 获取图像信息用于坐标转换
    // 画布宽度固定1000， 高度与原图高度成比例
    const SlideWidth = pathoImgInfo.size.width

    // 图像 --> 画布 坐标转换scale
    const scale = SlideWidth / 1000;

     // 遍历 tiles 并绘制每个方框
    tiles.forEach((tile) => {

        const left = tile.left / scale
        const top = tile.top / scale
        const width = 224 / scale;
        const height = 224 / scale;

        const color = getScoreColor(tile.cls)

        // 绘制方框
        const rect = new fabric.Rect({
            id: Date.now(),
            left: left,   // 坐标转换
            top: top,     // 坐标转换
            width: width,
            height: height,
            fill: false,
            stroke: color,
            strokeWidth: strokeWidth,
            opacity: 1,
            erasable: false,
            shape: 'rect',
            selectable: false,    // 禁用选中
            hasControls: false,   // 禁用控制点，防止拖动和缩放
            hoverCursor: 'grab',  // 设置默认鼠标样式
        });

        // console.log(rect)

        rect.setCoords();
        currentCanvas.add(rect);
    })
  }

  export const MoveAndResize = (tile) => {
    const { project } = store.getState()
    const { currentCanvas,  //当前画布  用于画方框
            strokeWidth,
            pathoImgInfo,   // Slide信息
            currentViewer   //当前openseadragon viewer  用于移动视图
          } = project
    
    const viewportPoint = currentViewer.viewport.imageToViewportCoordinates(
        tile.left + 224,
        tile.top + 224 / 2
    );

    currentViewer.viewport.panTo(viewportPoint);
    currentViewer.viewport.zoomTo(10);
  
  }

  export const Move = (x, y) => {
    const { project } = store.getState()
    const { pathoImgInfo,   // Slide信息
            currentViewer   //当前openseadragon viewer  用于移动视图
          } = project

    const left = pathoImgInfo.size.width * x;
    const top = pathoImgInfo.size.height * y;
    
    const viewportPoint = currentViewer.viewport.imageToViewportCoordinates(
        left,
        top
    );

    currentViewer.viewport.panTo(viewportPoint);
    currentViewer.viewport.zoomTo(10);
  
  }