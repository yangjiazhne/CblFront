import React, { useLayoutEffect, useEffect, useMemo, useRef, useState } from 'react'
import '@/lib/fabric/fabric'
import '@/lib/fabric/fabric_eraser_brush'
import { useDispatch, useSelector } from 'react-redux'
import useQuery from '@/hooks/useQuery'
import { Input, Button, Modal, Spin, Tooltip, message, Space, Tag } from 'antd'
import styles from './index.module.scss'
import { fabricObjAddEvent } from './fabricObjAddEvent'
import { zoomHandler, animationHandler, animationEndHandler } from './handler'
import OpenSeadragon from '@/lib/openseadragon-fabricjs-overlay/openseadragon-fabricjs-overlay'
import { searchAnnotation, updateAnnotation } from '@/request/actions/annotation'
import store from "@/redux/store";

// @ts-ignore
const fabric = window.fabric
const { TextArea } = Input;
const zoomLevels = [
  { value: 40, className: styles.choose6 },
  { value: 20, className: styles.choose5 },
  { value: 10, className: styles.choose4 },
  { value: 4,  className: styles.choose3 },
  { value: 2,  className: styles.choose2 },
  { value: 1,  className: styles.choose1 },
];

const CanvasAnnotator = ({
                           setChangeSession,
                           coordinate
                         }) => {
  // 初始化openSeadragon图片查看器
  // 初始化 openSeadragon
  const initOpenSeaDragon = () => {
    return OpenSeadragon({
      id: 'openSeaDragon',
      // 装有各种按钮名称的文件夹 images 地址，即库文件中的 images 文件夹
      prefixUrl: `${window.location.protocol}//${window.location.host}/openseadragon/images/`,

      // 是否显示导航控制
      showNavigationControl: false,
      // navigationControlAnchor: 'TOP_LEFT',

      // 是否显示导航窗口
      showNavigator: true,
      autoHideControls: false,
      // 以下都是导航配置
      navigatorPosition: 'TOP_LEFT',
      navigatorAutoFade: false,
      navigatorHeight: '80px',
      navigatorWidth: '160px',
      navigatorBackground: '#fefefe',
      navigatorBorderColor: '#000000',
      navigatorDisplayRegionColor: '#FF0000',

      minScrollDeltaTime: 30,
      zoomPerSecond: 0.1,
      // 具体图像配置
      tileSources: {
        Image: {
          // 指令集
          xmlns: 'http://schemas.microsoft.com/deepzoom/2008',
          Url: pathoImgInfo.url,
          // 相邻图片直接重叠的像素值
          Overlap: pathoImgInfo.overlap,
          // 每张切片的大小
          TileSize: pathoImgInfo.tileSize,
          Format: pathoImgInfo.format,
          Size: {
            Width: pathoImgInfo.size.width,
            Height: pathoImgInfo.size.height,
          },
        },
      },
      // 至少 20% 显示在可视区域内
      visibilityRatio: 0.2,
      // 开启调试模式
      debugMode: false,
      // 是否允许水平拖动
      panHorizontal: true,
      // 初始化默认放大倍数，按home键也返回该层
      defaultZoomLevel: 1,
      // 最小允许放大倍数
      minZoomLevel: 0.7,
      // 最大允许放大倍数
      maxZoomLevel: 150,
      animationTime: 1, // 设置默认的动画时间为1秒
      // zoomInButton: 'zoom-in',
      // zoomOutButton: 'zoom-out',
      // // 设置鼠标单击不可放大
      gestureSettingsMouse: {
        clickToZoom: false,
      },
    })
  }


  const dispatch = useDispatch()


  const windowWidth = (window.innerWidth * 80) / 100
  const windowHeight = 700

  const {
    pathoImgInfo,
    currentImage,
  } = useSelector(
      // @ts-ignore
      state => state.project
  )

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  const [zooming, setZooming] = useState(false)
  const [viewer, setViewer] = useState(null) // 图片查看器
  // 注册的监听事件为闭包环境，拿不到useState中的最新值，故使用useRef
  // canvas全局的辅助变量
  const canvasInstance = useRef(null)

  const [loadingInfo, setLoadingInfo] = useState({ flag: true, text: '加载中...' })

  // 控制object的【删除、编辑】按钮的【位置、显示】
  const [position, setPosition] = useState({ left: 0, top: 0, display: 'none', type: '' })

  const extractCoordinate = (coordinate) => {
    const match = coordinate.match(/\(([^)]+)\)/);
    if (match) {
      const [x, y] = match[1].split(",").map((num) => num.trim());
      return { x: parseFloat(x), y: parseFloat(y) };
    }
    return null;
  };

  // 初始化openSeadragon 图片查看器  和  canvas overlay
  useLayoutEffect(() => {
    const _viewer = initOpenSeaDragon()
    setViewer(_viewer)

    dispatch({
      type: 'UPDATE_CURRENT_VIEWER',
      payload: _viewer,
    })

    const overlay = _viewer.fabricjsOverlay({
      scale: 1000,
    })
    canvasInstance.current = overlay.fabricCanvas()
    canvasInstance.current.set({
      selection: false, // 禁止多选
      willReadFrequently: true, // 高频读取
    })

    dispatch({
      type: 'UPDATE_CURRENT_CANVAS',
      payload: canvasInstance.current,
    })

    return () => {
      canvasInstance.current.dispose()
      _viewer.destroy()
    }
  }, [pathoImgInfo])

  useEffect(() => {
    if (!canvasInstance.current) return
    canvasInstance.current.off()
    fabric.Object.prototype.transparentCorners = false
    fabric.Object.prototype.cornerColor = 'blue'
    fabric.Object.prototype.cornerStyle = 'circle'

    // 注册监听事件
    fabricObjAddEvent(
        canvasInstance.current,
        setPosition,
    )
  }, [pathoImgInfo])

  // 根据当前放大倍数，调整参数
  useEffect(() => {
    if (!viewer) return
    // 添加事件监听器
    viewer.addHandler('zoom', function (event) {
      zoomHandler(event, dispatch, setZooming)
    })
    viewer.addHandler('animation', function(event) {
      animationHandler(event, dispatch, setZooming, setPosition)
    })
    viewer.addHandler('animation-finish', function (event) {
      animationEndHandler(event, dispatch, setZooming, setPosition)
    })
    return () => {
      viewer.removeAllHandlers('zoom')
      viewer.removeAllHandlers('animation-finish')
    }
  }, [viewer])


  // 画布初始化，显示之前的标注信息


  useEffect(() => {
    if (!currentImage) return
    setLoadingInfo({ flag: true, text: '图片加载中...' })
    canvasInstance.current.clear()
    canvasInstance.current.setViewportTransform([1, 0, 0, 1, 0, 0])

    //改变画布的视口位置
    setLoadingInfo({ flag: false, text: '' })

  }, [currentImage])

  useEffect(() => {
    if (!viewer) return
    if (!canvasInstance.current) return
    let currentCanvas = canvasInstance.current
    currentCanvas.discardActiveObject()
    currentCanvas.renderAll()

  }, [viewer])


  const draw = (position) =>{

  }

  const move = (position) => {
    
  }

  const drawAndMove = (position, color) => {
    const { project } = store.getState();
    const { currentCanvas, pathoImgInfo, currentViewer } = project;

    currentCanvas.remove(...currentCanvas.getObjects());
    currentCanvas.renderAll();

    const scale = pathoImgInfo.size.width / 1000;

    const pos = extractCoordinate(position); // 提取坐标
    const left = pos.x / scale;
    const top = pos.y / scale;
    const width = 700/scale;
    const height = 700/scale;

    const rect = new fabric.Rect({
      left,
      top,
      width,
      height,
      fill: 'transparent',
      stroke: color,
      strokeWidth: 2,
    });

    currentCanvas.add(rect);

    const viewportPoint = currentViewer.viewport.imageToViewportCoordinates(
        pos.x + width,
        pos.y + height / 2
    );

    currentViewer.viewport.panTo(viewportPoint);
    currentViewer.viewport.zoomTo(10);
  };


  useEffect(() => {
    if (coordinate) {
      drawAndMove(coordinate);
    }
  }, [coordinate]);

  const setZoom = size => {
    viewer.viewport.zoomTo(size);
    viewer.viewport.applyConstraints();
  }

  return (
      <div className={styles.canvasWrap}>
        <Spin spinning={loadingInfo.flag} tip={loadingInfo.text}>
          <div
              style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
              id="openSeaDragon"
          ></div>
        </Spin>
        {viewer && <div className={styles.zoomBtn}>
          <div className={styles.rbLabel}>{`${viewer.viewport.getZoom(true).toFixed(1)}x`}</div>
          <div onClick={() => {
            viewer.viewport.goHome()
            viewer.viewport.applyConstraints()
          }}  className={`${styles.rbChoice} ${styles.choose7}`}>1:1</div>
          {zoomLevels.map(level => (
              <div
                  key={level.value}
                  onClick={() => {
                    setZoom(level.value);
                  }}
                  className={`${styles.rbChoice} ${level.className}`}
              >
                {level.value}
              </div>
          ))}
        </div>}
      </div>
  )
}

export default CanvasAnnotator
