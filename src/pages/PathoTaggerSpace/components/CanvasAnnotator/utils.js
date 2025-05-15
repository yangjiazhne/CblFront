/*
 * @Author: Azhou
 * @Date: 2021-09-17 18:23:48
 * @LastEditors: Azhou
 * @LastEditTime: 2021-09-18 21:00:18
 */
import '@/lib/fabric/fabric'

// @ts-ignore
const fabric = window.fabric

// define a function that can locate the controls.
// this function will be used both for drawing and for interaction.  该函数在controls定义时和移动时都会被调用
export function polygonPositionHandler(dim, finalMatrix, fabricObject) {
  var x = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x,
    y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y

  fabricObject.canvas.fire('custom:modifyPolygon', { target: fabricObject })
  return fabric.util.transformPoint(
    { x: x, y: y },
    fabric.util.multiplyTransformMatrices(
      fabricObject.canvas.viewportTransform,
      fabricObject.calcTransformMatrix()
    )
  )
}

// define a function that will define what the control does
// this function will be called on every mouse move after a control has been
// clicked and is being dragged.
// The function receive as argument the mouse event, the current trasnform object
// and the current position in canvas coordinate
// transform.target is a reference to the current object being transformed,
export function actionHandler(eventData, transform, x, y) {
  var polygon = transform.target,
    currentControl = polygon.controls[polygon.__corner],
    mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
    polygonBaseSize = polygon._getNonTransformedDimensions(),
    size = polygon._getTransformedDimensions(0, 0),
    finalPointPosition = {
      x: (mouseLocalPosition.x * polygonBaseSize.x) / size.x + polygon.pathOffset.x,
      y: (mouseLocalPosition.y * polygonBaseSize.y) / size.y + polygon.pathOffset.y,
    }
  polygon.points[currentControl.pointIndex] = finalPointPosition
  return true
}

// define a function that can keep the polygon in the same position when we change its
// width/height/top/left.
export function anchorWrapper(anchorIndex, fn) {
  return function (eventData, transform, x, y) {
    var fabricObject = transform.target,
      absolutePoint = fabric.util.transformPoint(
        {
          x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
          y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y,
        },
        fabricObject.calcTransformMatrix()
      ),
      actionPerformed = fn(eventData, transform, x, y),
      newDim = fabricObject._setPositionDimensions({}),
      polygonBaseSize = fabricObject._getNonTransformedDimensions(),
      newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
      newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y
    fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5)
    return actionPerformed
  }
}


//绘制矩形
export const drawRectangle = options => {
  const { beginPoint, endPoint, color, label, strokeWidth = 1, isfinish = true, id, tagInfo } = options
  let left = beginPoint.x < endPoint.x ? beginPoint.x : endPoint.x
  let top = beginPoint.y < endPoint.y ? beginPoint.y : endPoint.y
  const rect = new fabric.Rect({
    id: id || Date.now(),
    label,
    left: left,
    top: top,
    width: Math.abs(endPoint.x - beginPoint.x),
    height: Math.abs(endPoint.y - beginPoint.y),
    // fill: color,
    color: color,
    // stroke: '#1ae04e',
    fill: false,
    stroke: color,
    strokeWidth: strokeWidth,
    // opacity: 0.4,
    opacity: 1,
    erasable: false,
    perPixelTargetFind: true,
    strokeUniform: true,
    tagInfo
  })

  if(!isfinish) rect.set('strokeDashArray', [strokeWidth * 10,strokeWidth * 5,strokeWidth * 5,strokeWidth * 5])

  return rect
}
