import React, {useCallback, useEffect, useRef, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {Button, Spin, Modal, message} from 'antd';
import { fetchImageTileInfo } from '@/request/actions/image';
import styles from './PathoTaggerSpace.module.scss';
import {CanvasAnnotator, CLBCInferPanel, GastricPanel, InferencePanel} from './components';
import {HomeOutlined, LeftOutlined, MenuFoldOutlined, RightOutlined} from "@ant-design/icons";
import {useHistory, useLocation} from "react-router-dom";
import {useCombinedSlides, useSlideInfo} from "@/hooks/useSlides";
import { searchSlide, searchNearSlide } from '@/request/actions/slide';
import slide from '@/redux/reducers/slide';
import SliceList from "@/pages/PathoTaggerSpace/components/SliceList";
import { debounce } from 'lodash';

const PathoTaggerSpace = () => {
  const dispatch = useDispatch();
  const { pathoImgInfo, currentImage, projectDetails } = useSelector(state => state.project);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const pathoId = searchParams.get('pathoId'); // 获取 pathoId
  const organ = searchParams.get('organ'); // 获取 pathoId

  const [loading, setLoading] = useState(false);
  const [projectLoaded, setProjectLoaded] = useState(false);


    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });
  const [isSliceListVisible, setIsSliceListVisible] = useState(false);
  const { slides: routeSlides } = location.state || {};
  const [slides, setSlides] = useState(routeSlides || []);
  const [filters, setFilters] = useState({
    category: [],
    status: []
  });
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
    const debouncedFetch = useCallback(
        debounce(async (currentPage) => {
            try {
                const res = await searchSlide(
                    null,
                    [1.0],
                    filtersRef.current.status,
                    filtersRef.current.category,
                    null, null, null, null, null, null, null, null, null,
                    (currentPage - 1) * pagination.pageSize, // 使用分页参数
                    pagination.pageSize,
                    organ
                );

                if (res.data) {
                    setSlides(res.data.content);
                    setPagination(prev => ({
                        ...prev,
                        total: res.data.totalElements, // 假设后端返回总条数
                    }));
                }
            } catch (error) {
                console.error('数据获取失败:', error);
            }
        }, 300),
        [pagination.pageSize, organ]
    );
    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, current: page }));
        debouncedFetch(page);
    };
    const handlePageSizeChange = (current, size) => {
        setPagination(prev => ({
            ...prev,
            current: 1,  // 切换分页大小时重置到第一页
            pageSize: size
        }));
        debouncedFetch(1);  // 立即请求第一页数据
    };


    // 筛选条件变化时触发防抖请求
  useEffect(() => {
    if (isSliceListVisible) {
        setPagination(prev => ({ ...prev, current: 1 }));
        debouncedFetch(1);
    }
  }, [filters, isSliceListVisible]);

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, []);

  // 筛选器变化处理
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // 获取所有切片数据
  // useEffect(() => {
  //   if (location.state?.slides) {
  //     setSlides(location.state.slides);
  //   }
  // }, [location.state]);
  // useEffect(() => {
  //   if (isSliceListVisible) {
  //     fetchSlides();
  //   }
  // }, [isSliceListVisible, filters]);

  // 切换切片
  const switchSlide = (newPathoId) => {
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('pathoId', newPathoId);
    history.replace({
      pathname: location.pathname,
      search: queryParams.toString(),
    });
  };


  const handleHomeClick = () => {
    history.push('/mainPage');
  };

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


  /**
   * Todo
   * @param order
   * @returns {Promise<void>}
   */
  const switchImage = async (order) => {
    if (!pathoId) {
      message.error("当前没有图像！");
      return;
    }

    setLoading(true);
    try {
      const res = await searchNearSlide(pathoId, order, organ); // 需要实现该API请求

      console.log(res)

      if (!res.data || res.data === '-1') {
        message.error(order === -1 ? "已经是第一张图像！" : "已经是最后一张图像！");
        return;
      }

      const newPathoId = res.data.pathoId;
      const queryParams = new URLSearchParams(location.search);
      queryParams.set('pathoId', newPathoId);
      history.push({
        pathname: location.pathname,
        search: queryParams.toString(),
      });
    } catch (error) {
      message.error("切换失败，请重试！");
    } finally {
      setLoading(false);
    }
  };




  return (
      <>
        <Button
            type="primary"
            shape="circle"
            icon={<HomeOutlined />}
            style={{
              position: 'fixed',
              left: 20,
              top: '20%',  // 在列表按钮上方5%
              transform: 'translateY(-50%)',
              zIndex: 1001,
              width: 40,
              height: 40,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s',
              background: '#3B82F6',
              color: 'white',
              ':hover': {
                transform: 'translateY(-50%) scale(1.1)',
                background: '#2563EB'
              }
            }}
            onClick={handleHomeClick}
        />

        <Button
            type="primary"
            shape="circle"
            icon={<MenuFoldOutlined />}
            style={{
              position: 'fixed',
              left: 20,
              top: '30%',
              transform: 'translateY(-50%)',
              zIndex: 1001,
              width: 40,
              height: 40,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s',
              background: isSliceListVisible ? '#3B82F6' : '#fff',
              color: isSliceListVisible ? '#fff' : '#3B82F6',
              ':hover': {
                transform: 'translateY(-50%) scale(1.1)'
              }
            }}
            onClick={() => setIsSliceListVisible(!isSliceListVisible)}
        />

        {/* 新增切片列表组件 */}
        {isSliceListVisible && (
            <SliceList
                slides={slides}
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                filters={filters}
                onFilterChange={handleFilterChange}
                currentPathoId={pathoId}
                onSwitch={switchSlide}
                onClose={() => setIsSliceListVisible(false)}
            />
        )}

        <Spin spinning={loading}>
          {projectLoaded && currentImage && pathoImgInfo.url && (
            <>
              <Button.Group
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000
                  }}
              >
                <Button
                    onClick={() => switchImage(-1)}
                >
                  <LeftOutlined/>
                  上一张
                </Button>
                <Button
                    onClick={() => switchImage(1)}
                >
                  下一张
                  <RightOutlined/>
                </Button>
              </Button.Group>
              <div className={styles.container}>
                <div className={styles.viewContainer}>
                  <CanvasAnnotator coordinate1={coordinate1}/>
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
                      ImgSize={pathoImgInfo.size}
                  />
              )}
              {organ=== '胃' && (
                  <GastricPanel
                      isVisible={isPanelVisible}
                      toggleVisibility={togglePanel}
                      onHeatClick={handleHeatClick}
                      pathoId={pathoId}
                  />
              )}
            </>
          )}
        </Spin>



        <Button type="default" onClick={handleBackClick}  shape={"circle"} size={"large"} icon={<LeftOutlined />} style={{position: 'absolute', left: 20, bottom: 20}}/>

      </>
  );
};

export default PathoTaggerSpace;
