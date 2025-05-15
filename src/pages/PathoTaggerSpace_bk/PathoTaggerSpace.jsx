import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Button, Spin, Modal, message} from 'antd';
import { fetchImageTileInfo } from '@/request/actions/image';
import styles from './PathoTaggerSpace.module.scss';
import {CanvasAnnotator, CLBCInferPanel, InferencePanel} from './components';
import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import {useHistory, useLocation} from "react-router-dom";
import {useCombinedSlides, useSlideInfo} from "@/hooks/useSlides";
// import InferPanel from "@/pages/PathoTaggerSpace/components/InferPanel";
import { searchSlide } from '@/request/actions/slide';
import slide from '@/redux/reducers/slide';

const PathoTaggerSpace = () => {
  const dispatch = useDispatch();
  const organ = localStorage.getItem('organ');
  const { pathoImgInfo, currentImage, projectDetails } = useSelector(state => state.project);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const pathoId = searchParams.get('pathoId'); // 获取 pathoId


  const [loading, setLoading] = useState(false);
  const [projectLoaded, setProjectLoaded] = useState(false);

  //初始化：根据projectId和imageName获取大图的信息
  const fetchData = async () => {
    setLoading(true);
    // 先获取病理图信息
    const res = await searchSlide(pathoId)

    if(!res.data){
      Modal.error({
        title: '提示',
        content: '您的登录已过期，请重新登陆',
        onOk: () => {
          dispatch({
            type: 'UPDATE_USER_LOGIN',
            payload: false,
          })
          window.location.href = "/#/entryPage";
          window.sessionStorage.clear()
        }
      })
      return
    }

    const pathoInfo = res.data.content[0]
    dispatch({
      type: 'UPDATE_PROJECT_DETAIL',
      payload: pathoInfo
    });

    const urlParts = pathoInfo.slideUrl.split('/');

    const projectId = urlParts[urlParts.length - 2]
    const imageName = urlParts[urlParts.length - 1]

    try {
      dispatch({ type: 'UPDATE_CURRENT_IMAGE', payload: imageName });

      const pathoImgInfo = await fetchImageTileInfo(projectId, imageName);

      dispatch({ type: 'UPDATE_PATHOIMGINFO', payload: { ...pathoImgInfo } });
    } catch (error) {
      dispatch({
        type: 'UPDATE_PATHOIMGINFO',
        payload: {
          url: '',
          overlap: '',
          tileSize: '',
          format: '',
          size: { width: 0, height: 0 },
        },
      });
    } finally {
      setProjectLoaded(true);
      setLoading(false);
    }
  };

  //初始化大图信息
  useEffect(() => {
    if (pathoId) {
      fetchData();
    }
    return () => {
      dispatch({ type: 'CLEAR_PROJECT_STATE' });
    };
  }, [pathoId]);

  //右侧pannel是否显示按钮
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  //patch的坐标信息
  const [coordinate1, setCoordinate1] = useState(null);
  const [coordinate2, setCoordinate2] = useState(null);

  const handleHeatClick = (coordinate) => {
    setCoordinate1(coordinate);
  };
  const history = useHistory();
  //返回按钮
  const handleBackClick = () => {
    history.push(`/diagnostic?organ=${organ}`);
  };

  const switchImage = async (order) => {
    if (!currentImage) {
      message.error("当前没有任何图像！")
      return;
    }
  
    const changePathoId = '12' // 通过接口拿到

    if (changePathoId === '-1') {
      if(order === -1){
        message.error("已经是第一张图像！")
      }else{
        message.error("已经是最后一张图像！")
      }
      return;
    }

    const currentHash = window.location.hash
    const hashParts = currentHash.split('?')
    let newHash = hashParts[0] 
    let queryParams = new URLSearchParams(hashParts[1] || '')
    queryParams.set("pathoId", changePathoId)
  
    // 重新构建哈希部分
    newHash = `${newHash}?${queryParams.toString()}`
  
    // 更新 URL 的哈希部分并刷新页面
    window.location.hash = newHash
  };
  

  return (
      <>
        <Spin spinning={loading}>
          {projectLoaded && currentImage && pathoImgInfo.url && (
            <>
              <div className={styles.container}>
                <div className={styles.viewContainer}>
                  <CanvasAnnotator coordinate1={coordinate1} coordinate2={coordinate2} />
                </div>
              </div>
              {organ === '前列腺' && (
                  <InferencePanel
                      isVisible={isPanelVisible}
                      toggleVisibility={togglePanel}
                      onHeatClick={handleHeatClick}
                      pathoId={pathoId}
                  />
              )}
              {organ === '宫颈' && (
                  <CLBCInferPanel
                      isVisible={isPanelVisible}
                      toggleVisibility={togglePanel}
                      pathoId={pathoId}
                  />
              )}
            </>
          )}
        </Spin>

        <div className={styles.changeImagePrev} onClick={() => switchImage(-1)}>
          上一张
        </div>

        <div className={styles.changeImageNext} onClick={() => switchImage(1)}>
          下一张
        </div>

        <Button type="default" onClick={handleBackClick}  shape={"circle"} size={"large"} icon={<LeftOutlined />} style={{position: 'absolute', left: 20, bottom: 20}}/>

      </>
  );
};

export default PathoTaggerSpace;
