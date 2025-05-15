import React, {useState, useEffect, useRef} from 'react';
import {Tabs, Button, message, Col, Radio, Row, Divider, Checkbox, Space, Grid, Input} from 'antd';
import {LeftOutlined, RightOutlined} from '@ant-design/icons';
import PanelHeader from './PanelHeader';
import { useSelector, useDispatch } from 'react-redux';
import { searchTile } from '@/request/actions/tile'
import { examSlide } from '@/request/actions/slide'
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect';
import { STATIC_URL } from '@/constants'
import { drawAll, MoveAndResize, Move} from './help'
const { TextArea } = Input;

const InferencePanel = ({ isVisible, toggleVisibility, onHeatClick, pathoId }) => {
    const organ = localStorage.getItem('organ');
    const { projectDetails } = useSelector(state => state.project);

    const [slideCategory, setSlideCategory] = useState(projectDetails.category)

    const order = ['ASC-US', 'ASC-H', 'LSIL', 'HSIL', 'AGC'];

    const category = projectDetails.subCls.split(',')
    if(organ === '宫颈'){
        category.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    }

    const [isGlobalHM, setIsGlobalHM] = useState(true)
    const [currentTile, setCurrentTile] = useState({})

    const ChangeTile = (tile) => {
        setCurrentTile(tile)
        MoveAndResize(tile)
        setIsGlobalHM(false)
    }

    const counts = [
        (projectDetails.threeCounts * 100).toFixed(2),
        (projectDetails.fourCounts * 100).toFixed(2),
        (projectDetails.fiveCounts * 100).toFixed(2)
    ];
    
    const areas = [
        (projectDetails.threeAreas * 100).toFixed(2),
        (projectDetails.fourAreas * 100).toFixed(2),
        (projectDetails.fiveAreas * 100).toFixed(2)
    ];
    

    const pathoReport = projectDetails.supplementaryReport
    

    const [hmSize, setHmSize] = useState({ width: 0, height: 0 });
    const heatmapUrl = STATIC_URL + projectDetails.heatMap.split("projects")[1];
    useEffect(() => {
        // 创建一个新的图片对象
        const img = new Image();
        
        // 当图片加载完成后，获取宽高并更新状态
        img.onload = () => {
          setHmSize({ width: img.width, height: img.height });
        };

      
        // 设置图片源
        img.src = heatmapUrl;
      
        // 如果图片已经缓存，直接加载
        if (img.complete) {
          img.onload();
        }
    }, [heatmapUrl]);


    const [selectCategory, setSelectCategory] = useState(category)
    const [indeterminate, setIndeterminate] = useState(true);
    const [checkAll, setCheckAll] = useState(true);
    const categoryChange = (list) => {
        setSelectCategory(list);
        setIndeterminate(!!list.length && list.length < category.length);
        setCheckAll(list.length === category.length);
    };
    const categoryAllChange = (e) => {
        setSelectCategory(e.target.checked ? category : []);
        setIndeterminate(false);
        setCheckAll(e.target.checked);
    };


    const [tiles, setTiles] = useState([])
    const [posTile, setPosTile] = useState([])
    const [negTile, setNegTile] = useState([])


    const fetchPosData = async() =>{
        const res = await searchTile(projectDetails.slideId)
        const tileList = res.data.content

        const updatedTileList = tileList.map(tile => {
            const match = tile.coordinate.match(/\((\d+),\s*(\d+)\)/);
            return {
                ...tile,
                tileUrl: STATIC_URL + tile.tileUrl.split("projects")[1],
                left: match ? parseInt(match[1], 10) : null,
                top: match ? parseInt(match[2], 10) : null
            };
        });

        setTiles(updatedTileList)

        // 按 category 进行分类
        setPosTile(updatedTileList.filter(tile => 
            tile.category === '阳性' && tile.cls && selectCategory.includes(tile.cls)
        ));
        setNegTile(updatedTileList.filter(tile => tile.category === '阴性'));

    }

    useEffect(() => {
        drawAll(posTile)
    }, [posTile])

    useEffect(() => {
        fetchPosData()
    }, [pathoId]);

    useDidUpdateEffect(() => {
        setPosTile(tiles.filter(tile => 
            tile.category === '阳性' && tile.cls && selectCategory.includes(tile.cls)
        ));
    }, [selectCategory])



    const categorizedTiles = tiles.reduce((acc, tile) => {
        const { category } = tile;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(tile);
        return acc;
    }, {});

    const categories = Object.keys(categorizedTiles);

    const handleTileClick = (coordinate) => {
        if (onTileClick) {
            onTileClick(coordinate);
        }
    };


    const [selectedScores, setSelectedScores] = useState([]);
    const allScoresSelected = selectedScores.length === 3;
    const handleScoreChange = (values) => {
        setSelectedScores(values);
    };
    const handleSelectAll = (e) => {
        setSelectedScores(e.target.checked ? ['3', '4', '5'] : []);
    };
    const getScoreColor = (score) => {
        const colors = {
            '3': '#10B981',  // emerald
            '4': '#3B82F6',  // blue
            '5': '#F59E0B',   // amber
            'ASC-US': '#10B981',  // emerald
            'ASC-H': '#3B82F6',  // blue
            'LSIL': '#F59E0B',   // amber
            'HSIL': '#ed7d31',   // amber
            "AGC": '#e41908'
        };
        return colors[score] || '#CBD5E0';
    };

    // const composition = { three: 15, four: 30, five: 55 };
    // const area = { positive: 40, suspect: 35, negative: 25 };


    // 在组件内部添加以下代码
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const scrollContainerRef = useRef(null);

    // 检测滚动位置
    const checkScrollPosition = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
    };

    // 滚动控制函数
    const scrollTo = (direction) => {
        const container = scrollContainerRef.current;
        const scrollAmount = container.clientWidth * 0.8; // 每次滚动80%的可见宽度

        container.scrollTo({
            left: direction === 'left'
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        container.addEventListener('scroll', checkScrollPosition);
        window.addEventListener('resize', checkScrollPosition);

        return () => {
            container.removeEventListener('scroll', checkScrollPosition);
            window.removeEventListener('resize', checkScrollPosition);
        };
    }, []);

    const updateResult = async() => {
        const statusMap = {'阴性':1, '阳性':2, '疑似':3, '未审核':4}
        try {
            const res = await examSlide(projectDetails.slideId, slideCategory, statusMap[slideCategory]);
            
            // 如果返回的 code 是 200，弹出成功提示
            if (res.data.code === 200) {
                message.success('更新成功!');
            } else {
                message.error('更新失败，请重试');
            }
        } catch (error) {
            message.error('请求失败，请检查网络');
        }

    }

    /**
     * 获取 热力图坐标
     */
    const imgRef = useRef(null);
    const handleImageClick = (e) => {
        // 获取图像的实际尺寸
        const img = imgRef.current;
        const imgRect = img.getBoundingClientRect();

        // 计算点击的相对坐标
        const x = e.clientX - imgRect.left;
        const y = e.clientY - imgRect.top;

        // 计算百分比坐标
        const xPercent = (x / imgRect.width);
        const yPercent = (y / imgRect.height);

        Move(xPercent, yPercent)
    };

    return (
        <div style={{display: 'flex',
            flexDirection: 'column'}}>
            {!isVisible && (
                <Button
                    type="primary"
                    shape="round"
                    size="small"
                    icon={<LeftOutlined />}
                    onClick={toggleVisibility}
                    style={{
                        height: '20%',
                        position: 'fixed',
                        top: '40%',
                        right: 0,
                        fontSize: 'large',
                        color: 'whitesmoke',
                        border: 'none',
                    }}
                />
            )}
            <div
                className={`panel-container ${isVisible ? 'visible' : 'hidden'}`}
                style={{
                    // minHeight: 'min-content', // 关键布局属性
                    flexDirection: 'column',

                    position: 'fixed',
                    top: 2,
                    right: isVisible ? 0 : '-35%',
                    width: '35%',
                    height: '100%',
                    transition: 'right 0.3s',
                    backgroundColor: '#fff',
                    boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    overflowY: 'auto',
                }}
            >
                {isVisible && (
                    <div className="panel-content" style={{ padding: '0 30px',flexShrink:0 }}>
                        {/* {isLoading && <div>加载中...</div>}
                        {error && <div>加载失败：{error.message}</div>} */}

                        <Row align="middle" gutter={16} style={{ marginBottom: 16,paddingLeft:30,gap:5   }}>
                            <Col style={{fontSize:16}}>AI诊断结果：</Col>
                            <Col>
                                <Radio.Group
                                    value={slideCategory}
                                    onChange={(e) => setSlideCategory(e.target.value)}
                                >
                                    <Radio.Button value="阴性" style={{ color: '#1890ff' , fontSize:14}}>阴性</Radio.Button>
                                    <Radio.Button value="阳性" style={{ color: '#ff4d4f' ,fontSize:14}}>阳性</Radio.Button>
                                    <Radio.Button value="疑似" style={{ color: '#faad14' ,fontSize:14}}>疑似</Radio.Button>
                                </Radio.Group>
                            </Col>
                            <Col>
                                <Button type="primary" size={"middle"} onClick={updateResult}>确认</Button>
                            </Col>

                            <Col>
                                <Button
                                    type="text"
                                    size={'middle'}
                                    shape="circle"
                                    icon={<RightOutlined />}
                                    onClick={toggleVisibility}
                                    style={{
                                        fontSize: "16px",
                                        color: "#000",
                                        border: "groove",
                                    }}
                                />
                            </Col>
                        </Row>


                        { organ === '前列腺' && (
                            <Col flex="auto" style={{margin: '0px 0'}}>
                                <Space size={8}>
                                    <Col style={{
                                        paddingLeft:20,
                                        fontSize: 16    ,
                                        color: '#2D3748',
                                        fontWeight: 500,
                                        letterSpacing: 0.2
                                    }}>
                                        {organ === '前列腺' ? 'Gleason评分' : '诊断类别'}
                                    </Col>
                                    <Checkbox.Group
                                        value={selectCategory}
                                        onChange={categoryChange}
                                        style={{ display: 'flex'  }}
                                    >
                                        {category.map(score => (
                                            <Checkbox
                                                key={score}
                                                value={score.toString()}
                                                style={{
                                                    // 移除边框相关样式
                                                    padding: '5px 8px',
                                                    backgroundColor: selectCategory.includes(score.toString())
                                                        ? `${getScoreColor(score)}1a`
                                                        : 'transparent',
                                                    borderRadius: 6,
                                                    transition: 'all 0.2s',
                                                    fontSize: 15,
                                                    // 隐藏原生复选框
                                                    '& .ant-checkbox': {
                                                        display: 'none'
                                                    }
                                                }}
                                            >
                                                <span style={{
                                                    color: getScoreColor(score),
                                                    fontWeight: 600,
                                                    position: 'relative',
                                                    paddingLeft: 24,
                                                    '::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: '50%',
                                                        border: `2px solid ${getScoreColor(score)}`,
                                                        backgroundColor: selectedScores.includes(score.toString())
                                                            ? getScoreColor(score)
                                                            : 'transparent'
                                                    }
                                                }}>
                                                {score}
                                                </span>
                                            </Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                    <Checkbox
                                        // checked={allScoresSelected}
                                        // indeterminate={!allScoresSelected && selectedScores.length > 0}
                                        onChange={categoryAllChange}
                                        indeterminate={indeterminate}
                                        checked={checkAll}
                                        style={{
                                            '& .ant-checkbox': {
                                                display: 'none'
                                            },
                                            '& .ant-checkbox-wrapper': {
                                                paddingLeft: 24
                                            }
                                        }}
                                    >
                                    <span style={{
                                        color: '#4A5568',
                                        fontSize: 16  ,
                                        fontWeight: 500,
                                        position: 'relative',
                                        '::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: -20,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 16,
                                            height: 16,
                                            border: '2px solid #CBD5E0',
                                            borderRadius: 4
                                        }
                                    }}>
                                        全选
                                    </span>
                                    </Checkbox>
                                </Space>
                            </Col>
                        )}

                        { organ !== "前列腺" && (
                           <Col flex="auto" style={{marginTop: '15px'}}>
                            <Row gutter={[16, 16]} align="top">
                                {/* 左侧标题 */}
                                <Col span={5} style={{ fontSize: 17, color: '#2D3748', fontWeight: 500, letterSpacing: 0.2  }}>
                                    {organ === '前列腺' ? 'Gleason评分' : '诊断类别'}
                                </Col>
                                
                                {/* 右侧复选框组 */}
                                <Col span={19}>
                                <Row gutter={[16, 16]} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <Checkbox.Group
                                        value={selectCategory}
                                        onChange={categoryChange}
                                        style={{ display: 'flex', flexWrap: 'wrap' }} // 使checkbox能够换行
                                    >
                                        {category.map(score => (
                                            <Col key={score} span={8}> {/* 每行最多显示3个checkbox，调整span的值可以控制列数 */}
                                                <Checkbox
                                                    value={score.toString()}
                                                    style={{
                                                        padding: '6px 12px',
                                                        paddingRight: '4px',
                                                        backgroundColor: selectCategory.includes(score.toString())
                                                            ? `${getScoreColor(score)}1a`
                                                            : 'transparent',
                                                        borderRadius: 6,
                                                        transition: 'all 0.2s',
                                                        fontSize: 17,
                                                        marginTop: '5px'
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: getScoreColor(score),
                                                            fontWeight: 600,
                                                            position: 'relative',
                                                        }}
                                                    >
                                                        {score}
                                                    </span>
                                                </Checkbox>
                                            </Col>
                                        ))}
                                    </Checkbox.Group>
                                    
                                    <Col span={8}>
                                        <Checkbox
                                            onChange={categoryAllChange}
                                            indeterminate={indeterminate}
                                            checked={checkAll}
                                            style={{
                                                '& .ant-checkbox': { display: 'none' },
                                                '& .ant-checkbox-wrapper': { paddingLeft: 24 },
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color: '#4A5568',
                                                    fontSize: 17,
                                                    fontWeight: 500,
                                                    position: 'relative',
                                                    marginTop: 8,
                                                }}
                                            >
                                                全选
                                            </span>
                                        </Checkbox>
                                    </Col>
                                </Row>

                                </Col>
                            </Row>
                        </Col>
                        
                        )}

                        { organ === '前列腺' && (
                            <>
                            <Col span={50}>
                            <div style={{
                                paddingLeft:20,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '5px 8px',
                                borderRadius: 8,
                            }}>
                                <span style={{
                                    fontSize: 15,
                                    color: '#4A5568',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap'
                                }}>成分占比：</span>
                                <div style={{
                                    display: 'flex',
                                    paddingLeft:20,
                                    gap: 10,
                                }}>
                                    {[
                                        { value: counts[0], color: '#10B981', label: '3' },
                                        { value: counts[1], color: '#3B82F6', label: '4' },
                                        { value: counts[2], color: '#F59E0B', label: '5' }
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: `${item.color}1a`,
                                                borderRadius: 6,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4
                                            }}
                                        >
                                            <div style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                backgroundColor: item.color
                                            }} />
                                            <span style={{
                                                fontSize: 15,
                                                color: item.color,
                                                fontWeight: 600
                                            }}>{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            </Col>

                            <Col span={50}>
                                <div style={{
                                    paddingLeft:20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '5px 8px',
                                    borderRadius: 8,
                                }}>
                                <span style={{
                                    fontSize: 15,
                                    color: '#4A5568',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap'
                                }}>面积占比：</span>
                                    <div style={{
                                        display: 'flex',
                                        paddingLeft:20,
                                        gap: 10,
                                    }}>
                                        {[
                                            { value: areas[0], color: '#10B981', label: '3' },
                                            { value: areas[1], color: '#3B82F6', label: '4' },
                                            { value: areas[2], color: '#F59E0B', label: '5' }
                                        ].map((item, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: `${item.color}1a`,
                                                    borderRadius: 6,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 4
                                                }}
                                            >
                                                <div style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    backgroundColor: item.color
                                                }} />
                                                <span style={{
                                                    fontSize: 15,
                                                    color: item.color,
                                                    fontWeight: 600
                                                }}>{item.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                            </>
                        )}

                        <Row gutter={[16, 16]} align="top">
                            {/* 左侧标题 */}
                            <Col span={5} style={{ fontSize: 16, color: '#2D3748', fontWeight: 500, letterSpacing: 0.2, paddingTop: '30px' }}>
                                AI诊断结果
                            </Col>

                            {/* 右侧 TextArea */}
                            <Col span={19}>
                                <TextArea
                                    value={pathoReport}
                                    placeholder="Pathological diagnosis report"
                                    autoSize={{
                                        minRows: 2,
                                        maxRows: 8,
                                    }}
                                    style={{ marginTop: 16, marginBottom: 16 }}
                                />
                            </Col>
                        </Row>
                        {/*<TextArea*/}
                        {/*    value={"AI诊断结果:   "+pathoReport}*/}
                        {/*    placeholder="AI诊断结果"*/}
                        {/*    autoSize={{*/}
                        {/*        minRows: 2,*/}
                        {/*        maxRows: 8,*/}
                        {/*    }}*/}
                        {/*    style={{ marginTop: 16, marginBottom: 16}}*/}
                        {/*/>*/}


                        <Divider
                            style={{
                                margin: 0,
                                border: '0.5px solid #E2E8F0',
                                width: 'calc(100% + 32px)',
                                marginLeft: '-16px',
                            }}
                        />


                        <div style={{
                            position: 'relative',
                            '--hover-scale': 1.05,
                            '--active-scale': 0.98
                        }}>
                            {/* 左侧箭头 */}
                            {showLeftArrow && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: 16,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 10,
                                        cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.9)',
                                        borderRadius: '50%',
                                        width: 32,
                                        height: 32,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        transition: 'opacity 0.3s',
                                        ':hover': {
                                            background: '#fff',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                        }
                                    }}
                                    onClick={() => scrollTo('left')}
                                >
                                    <LeftOutlined style={{ color: '#3B82F6', fontSize: 16 }} />
                                </div>
                            )}

                            {/* 右侧箭头 */}
                            {showRightArrow && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        right: 16,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 10,
                                        cursor: 'pointer',
                                        background: 'rgba(255,255,255,0.9)',
                                        borderRadius: '50%',
                                        width: 32,
                                        height: 32,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        transition: 'opacity 0.3s',
                                        ':hover': {
                                            background: '#fff',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                        }
                                    }}
                                    onClick={() => scrollTo('right')}
                                >
                                    <RightOutlined style={{ color: '#3B82F6', fontSize: 16 }} />
                                </div>
                            )}

                            {/* 滚动容器（保持原有代码，添加ref） */}
                            <div
                                ref={scrollContainerRef}
                                style={{
                                    width: '100%',
                                    overflowX: 'auto',
                                    padding: '16px 0',
                                    WebkitOverflowScrolling: 'touch',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    '&::-webkit-scrollbar': { display: 'none' }
                                }}
                                onWheel={(e) => {
                                    // 横向滚轮控制
                                    if (e.deltaY !== 0) {
                                        e.currentTarget.scrollLeft += e.deltaY * 2
                                    }
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    gap: '16px',
                                    padding: '0 24px',
                                    flexWrap: 'nowrap'
                                }}>
                                    {posTile.map((tile, index) => (
                                        <div
                                            key={tile.tileId}
                                            style={{
                                                width: 100,
                                                height: 100,
                                                flexShrink: 0,
                                                borderRadius: 8,
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                                ':hover': {
                                                    transform: 'scale(var(--hover-scale))',
                                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
                                                },
                                                ':active': {
                                                    transform: 'scale(var(--active-scale))'
                                                }
                                            }}
                                        >
                                            <img
                                                src={tile.tileUrl}
                                                alt={`病理切片 ${index +1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: 8,
                                                    transition: 'opacity 0.3s ease',
                                                    position: 'relative',
                                                    zIndex: 1,
                                                    border: `3px solid ${getScoreColor(tile.cls)}`
                                                }}
                                                onClick={() => ChangeTile(tile)}
                                                onError={(e) => {
                                                    e.target.style.opacity = 0
                                                }}
                                            />
                                            {/* 序号标签 */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 4,
                                                right: 4,
                                                background: 'rgba(0, 0, 0, 0.6)',
                                                color: 'white',
                                                fontSize: 10,
                                                padding: '2px 6px',
                                                borderRadius: 4,
                                                zIndex: 2
                                            }}>
                                                #{index+1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>


                        <Divider
                            style={{
                                margin: 0,
                                border: '0.5px solid #E2E8F0',
                                width: 'calc(100% + 32px)',
                                marginLeft: '-16px',
                            }}
                        />

                        <div style={{padding:'12px 0'}}>

                        </div>

                        {(isGlobalHM || organ !== '宫颈' )&& (
                            <img
                                ref={imgRef}
                                src={heatmapUrl}
                                style={{
                                    width: '100%',
                                    // height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 8,
                                    transition: 'opacity 0.3s ease',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                                onClick={handleImageClick}
                                onLoad={() => console.log('Heatmap image loaded')}
                            />
                        )}

                        {!isGlobalHM && organ === '宫颈' && currentTile?.tileUrl && (
                            <>
                                <Button type="primary" onClick={() => setIsGlobalHM(true)} style={{marginBottom: '10px'}}>查看全局热力图</Button>
                                <img
                                    src={currentTile.tileUrl}
                                    style={{
                                        width: '100%',
                                        // height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        transition: 'opacity 0.3s ease',
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                    onLoad={() => console.log('Heatmap image loaded')}
                                />
                            </>
                        )}
                        

                    </div>
                )}
            </div>
        </div>
    );
};

export default InferencePanel;
