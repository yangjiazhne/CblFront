import '@/lib/fabric/fabric'

// @ts-ignore
const fabric = window.fabric

// 注册canvas监听事件
// 这些传入的参数都有什么作用呢
export const fabricObjAddEvent = (
  canvas, // fabric canvas
  setPosition, // 设置每个物体右侧控制标志的位置
) => {
  canvas.on({
    'selection:created': o => {
      // 拖拽模式下不允许选中object
      if (o.selected.length > 1)
        // 已禁用了canvas的多选
        return
      
      const bl = o.selected[0].aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)

      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.selected[0].type,
      })
    },
    'selection:updated': o => {
      if (o.selected.length > 1) return
      
      const bl = o.selected[0].aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)

      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.selected[0].type,
      })
    },
    'selection:cleared': o => {
      setPosition({ left: 0, top: 0, display: 'none' })
    },
    'object:removed': o => {
    },
    'object:modified': o => {
      const bl = o.target.aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)
      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.target.type,
      })
    },
    'object:scaling': o => {
      const bl = o.target.aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)
      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.target.type,
      })
    },
    'object:moving': o => {
      const bl = o.target.aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)
      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.target.type,
      })
    },
    'object:rotating': o => {
      const bl = o.target.aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)
      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.target.type,
      })
    },
    'object:skewing': o => {
      const bl = o.target.aCoords.bl
      const _relativeBl = fabric.util.transformPoint(bl, canvas.viewportTransform)
      setPosition({
        left: _relativeBl.x,
        top: _relativeBl.y,
        display: 'block',
        type: o.target.type,
      })
    },
    'mouse:move': o => {
      canvas.defaultCursor = 'grab'
    },
  })
}
