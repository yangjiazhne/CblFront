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

// drawAll 函数修改
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
    console.log(pathoImgInfo.size.width)

    // 图像 --> 画布 坐标转换scale
    const scale = SlideWidth / 1000;


    // 遍历 tiles 并绘制每个方框
    tiles.forEach((tile) => {
        // console.log(tile);
        const left = tile.left / scale
        const top = tile.top / scale
        const right = tile.right / scale
        const bottom = tile.bottom / scale

        const width = right - left
        const height = bottom - top
        // const minSize = 5; // 最小5像素
        // const displayWidth = Math.max(width, minSize)
        // const displayHeight = Math.max(height, minSize)
        // const displayWidth = width
        // const displayHeight = height

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
            opacity: 0.8,
            strokeLineJoin: 'round',
            erasable: false,
            shape: 'rect',
            selectable: false,    // 禁用选中
            hasControls: false,   // 禁用控制点，防止拖动和缩放
            // hoverCursor: 'grab',  // 设置默认鼠标样式
            hoverCursor: 'pointer',
            strokeDashArray: [0.5, 0.1]
        });

        // console.log(rect)
        rect.set({
            data: {
                score: tile.cls,
                coordinates: `(${tile.left},${tile.top})-(${tile.right},${tile.bottom})`
            }
        });

        // rect.setCoords();
        currentCanvas.add(rect);
    })
}

export const drawFatherBox = (tile, fatherBox) => {
    const { project } = store.getState()
    const { 
        currentCanvas,  //当前画布  用于画方框
        strokeWidth,    // 线宽
        pathoImgInfo,   // Slide信息
    } = project

    if(fatherBox.current){
        currentCanvas.remove(fatherBox.current)
    }

    // 获取图像信息用于坐标转换
    // 画布宽度固定1000， 高度与原图高度成比例
    const SlideWidth = pathoImgInfo.size.width
    console.log(pathoImgInfo.size.width)

    // 图像 --> 画布 坐标转换scale
    const scale = SlideWidth / 1000;
    const left = tile.facher_left / scale
    const top = tile.facher_top / scale
    const right = tile.facher_right / scale
    const bottom = tile.facher_bottom / scale

    const width = right - left
    const height = bottom - top
    // const minSize = 5; // 最小5像素
    // const displayWidth = Math.max(width, minSize)
    // const displayHeight = Math.max(height, minSize)
    // const displayWidth = width
    // const displayHeight = height

    const color = '#8000f9'

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
        opacity: 0.8,
        strokeLineJoin: 'round',
        erasable: false,
        shape: 'rect',
        selectable: false,    // 禁用选中
        hasControls: false,   // 禁用控制点，防止拖动和缩放
        // hoverCursor: 'grab',  // 设置默认鼠标样式
        hoverCursor: 'pointer',
    });

    fatherBox.current = rect

    // rect.setCoords();
    currentCanvas.add(rect);
    currentCanvas.renderAll();

}

export const MoveAndResize = (tile, fatherBox) => {
    const { project } = store.getState()
    const { 
        currentViewer   //当前openseadragon viewer  用于移动视图
    } = project

    drawFatherBox(tile, fatherBox)

    const viewportPoint = currentViewer.viewport.imageToViewportCoordinates(
        tile.facher_right,
        tile.facher_top + (tile.facher_bottom-tile.facher_top)/2
    );

    let zoomScale = 10

    const width = tile.facher_right - tile.facher_left
    const height = tile.facher_bottom - tile.facher_top

    if (Math.max(height, width) <= 350){
        zoomScale = 50
    }else if(Math.max(height, width) <= 600){
        zoomScale = 20
    }else if(Math.max(height, width) <= 1000){
        zoomScale = 10
    }else if(Math.max(height, width) <= 2000){
        zoomScale = 5
    }

    currentViewer.viewport.panTo(viewportPoint);
    currentViewer.viewport.zoomTo(zoomScale);

}

// export const drawAll = (tiles) => {
//     const { project } = store.getState()
//     const { currentCanvas,  //当前画布  用于画方框
//         strokeWidth,
//         pathoImgInfo,   // Slide信息
//         currentViewer   //当前openseadragon viewer  用于移动视图
//     } = project
//
//     // 先清除所有标注
//     currentCanvas.remove(...currentCanvas.getObjects())
//     currentCanvas.renderAll()
//
//     // 获取图像信息用于坐标转换
//     // 画布宽度固定1000， 高度与原图高度成比例
//     const SlideWidth = pathoImgInfo.size.width
//     console.log(pathoImgInfo.size.width)
//
//     // 图像 --> 画布 坐标转换scale
//     const scale = SlideWidth / 1000;
//
//
//     // 遍历 tiles 并绘制每个方框
//     tiles.forEach((tile) => {
//         console.log(tile);
//         const left = tile.left / scale
//         const top = tile.top / scale
//         const right = tile.right / scale
//         const bottom = tile.bottom / scale
//
//         const width = right - left
//         const height = bottom - top
//         const minSize = 5; // 最小5像素
//         const displayWidth = Math.max(width, minSize)
//         const displayHeight = Math.max(height, minSize)
//
//         const color = getScoreColor(tile.cls)
//
//         // 绘制方框
//         const rect = new fabric.Rect({
//             id: Date.now(),
//             left: left,   // 坐标转换
//             top: top,     // 坐标转换
//             width: displayWidth,
//             height: displayHeight,
//             fill: false,
//             stroke: color,
//             strokeWidth: strokeWidth,
//             opacity: 0.8,
//             strokeLineJoin: 'round',
//             erasable: false,
//             shape: 'rect',
//             selectable: false,    // 禁用选中
//             hasControls: false,   // 禁用控制点，防止拖动和缩放
//             // hoverCursor: 'grab',  // 设置默认鼠标样式
//             hoverCursor: 'pointer'
//         });
//
//         // console.log(rect)
//         rect.set({
//             data: {
//                 score: tile.cls,
//                 coordinates: `(${tile.left},${tile.top})-(${tile.right},${tile.bottom})`
//             }
//         });
//
//         // rect.setCoords();
//         currentCanvas.add(rect);
//     })
// }
//
// export const MoveAndResize = (tile) => {
//     const { project } = store.getState()
//     const { currentCanvas,  //当前画布  用于画方框
//         strokeWidth,
//         pathoImgInfo,   // Slide信息
//         currentViewer   //当前openseadragon viewer  用于移动视图
//     } = project
//
//     const viewportPoint = currentViewer.viewport.imageToViewportCoordinates(
//         tile.right,
//         tile.top + (tile.bottom-tile.top)/2
//     );
//
//     currentViewer.viewport.panTo(viewportPoint);
//     currentViewer.viewport.zoomTo(10);
//
// }


// export const MoveAndResize = (tile) => {
//     const { project } = store.getState()
//     const { pathoImgInfo, currentViewer } = project
//
//     // 有效性验证函数
//     const isValidTile = (t) => {
//         if (!t) return false
//         const requiredFields = ['left', 'right', 'top', 'bottom']
//         const imgWidth = pathoImgInfo.size.width
//         const imgHeight = pathoImgInfo.size.height
//
//         return requiredFields.every(field =>
//             typeof t[field] === 'number' &&
//             t[field] >= 0 &&
//             (field.includes('left|right') ? t[field] <= imgWidth : t[field] <= imgHeight)
//         )
//     }
//
//     // 生成随机坐标
//     const generateRandomViewport = () => {
//         const SAFE_MARGIN = 0.1  // 10% 边距
//         const MAX_ZOOM = 5       // 随机视图的最大缩放级别
//
//         const randomX = Math.random() * (1 - SAFE_MARGIN*2) + SAFE_MARGIN
//         const randomY = Math.random() * (1 - SAFE_MARGIN*2) + SAFE_MARGIN
//
//         return {
//             point: currentViewer.viewport.imageToViewportCoordinates(
//                 pathoImgInfo.size.width * randomX,
//                 pathoImgInfo.size.height * randomY
//             ),
//             zoom: Math.min(MAX_ZOOM, currentViewer.viewport.getMaxZoom() * 0.5)
//         }
//     }
//
//     // 主逻辑
//     let viewportConfig
//     if (isValidTile(tile)) {
//         // 有效坐标计算
//         const centerX = (tile.left + tile.right) / 2
//         const centerY = (tile.top + tile.bottom) / 2
//         const tileWidth = tile.right - tile.left
//
//         viewportConfig = {
//             point: currentViewer.viewport.imageToViewportCoordinates(centerX, centerY),
//             zoom: Math.min(
//                 10,
//                 currentViewer.viewport.getMaxZoom() * 0.8,
//                 1000 / (tileWidth / pathoImgInfo.size.width)
//             )
//         }
//     } else {
//         console.warn('Invalid tile coordinates, using random viewport', tile)
//         viewportConfig = generateRandomViewport()
//     }
//
//     // 平滑过渡动画
//     currentViewer.viewport.animate({
//         center: viewportConfig.point,
//         zoom: viewportConfig.zoom
//     }, {
//         duration: 800,
//         easing: OpenSeadragon.SpringEasing(5)
//     })
// }

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