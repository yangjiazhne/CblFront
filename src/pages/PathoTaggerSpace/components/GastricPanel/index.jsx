import React, {useState, useEffect, useRef} from 'react';
import {Tabs, Button, message, Col, Radio, Row, Divider, Checkbox, Space, Grid, Input, Tag, Select} from 'antd';
import {LeftOutlined, RightOutlined} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { searchTile } from '@/request/actions/tile'
import { examSlide } from '@/request/actions/slide'
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect';
import { STATIC_URL } from '@/constants'
import { drawAll, MoveAndResize, Move} from './help'
const { TextArea } = Input;

const GastricPanel = ({ isVisible, toggleVisibility, onHeatClick, pathoId }) => {
    const organ = localStorage.getItem('organ');
    const { projectDetails } = useSelector(state => state.project);

    const [slideCategory, setSlideCategory] = useState(projectDetails.category)

    const order = ['低', '高', '印绒', '腺'];
    const category = ['全部', ...order];
    if(organ === '胃'){
        category.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    }
    const [selectedCategory, setSelectedCategory] = useState(
        category.filter(c => c !== 'Total')
    );
    // const [selectedCategory, setSelectedCategory] = useState('全部');
    // const category = projectDetails.subCls.split(',')



    const [isGlobalHM, setIsGlobalHM] = useState(true)
    const [currentTile, setCurrentTile] = useState({})

    const ChangeTile = (tile) => {
        setCurrentTile(tile)
        MoveAndResize(tile)
        setIsGlobalHM(false)
    }
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

    const [categoryStats, setCategoryStats] = useState({});
    const [maxCategory, setMaxCategory] = useState('无');

    const fetchPosData = async() =>{
        const res = await searchTile(projectDetails.slideId)
        const tileList = res.data.content


        // 添加分类统计逻辑
        const stats = tileList.reduce((acc, tile) => {
            if (tile.cls) {
                acc[tile.cls] = (acc[tile.cls] || 0) + 1;
            }
            return acc;
        }, {});

        setCategoryStats(stats);

        // 计算最多类别
        const maxEntry = Object.entries(stats).reduce((max, [cls, count]) =>
            count > (max[1] || 0) ? [cls, count] : max, ['无', 0]);
        setMaxCategory(maxEntry[0]);


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

    useEffect(() => {
        setPosTile(tiles.filter(tile =>
            tile.category === '阳性' &&
            (selectedCategory === '全部' || tile.cls === selectedCategory)
        ));
    }, [selectedCategory, tiles]);



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
            '全部': '#94a3b8',
            '低': '#10B981',
            '高': '#3B82F6',
            '印绒': '#F59E0B',
            '腺': '#ed7d31'
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
        if(projectDetails.category === '阴性'){
            return
        }

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
        if (projectDetails.category === '阴性') return;

        const checkScroll = () => {
            if (scrollContainerRef.current) {
                checkScrollPosition();
            }
        };

        // 延迟绑定确保容器存在
        const timeoutId = setTimeout(() => {
            if (scrollContainerRef.current) {
                checkScrollPosition(); // 初始检查
                scrollContainerRef.current.addEventListener('scroll', checkScroll);
                window.addEventListener('resize', checkScroll);
            }
        }, 300); // 等待容器渲染

        return () => {
            clearTimeout(timeoutId);
            if (scrollContainerRef.current) {
                scrollContainerRef.current.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
        };
    }, [projectDetails.category]); // 添加依赖项



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

        // 输出点击位置的坐标

        // 如果需要处理点击位置的比例，可以计算百分比坐标
        const xPercent = (x / imgRect.width);
        const yPercent = (y / imgRect.height);

        Move(xPercent, yPercent)
    };
    const [selectedStatus, setSelectedStatus] = useState(projectDetails.status);
    const getStatusOptions = () => {
        if (![1,2].includes(selectedStatus)) { // 未审核状态
            return [
                { value: '一致', label: '一致' },
                { value: '不一致', label: '不一致' }
            ];
        }

        // 修改后的判断逻辑，将疑似视为阳性
        const isPositiveCategory = slideCategory === '阳性' || slideCategory === '疑似';

        return [{
            value: (selectedStatus === 1 && isPositiveCategory) ||
            (selectedStatus === 2 && !isPositiveCategory)
                ? '不一致' : '一致',
            label: (selectedStatus === 1 && isPositiveCategory) ||
            (selectedStatus === 2 && !isPositiveCategory)
                ? '不一致' : '一致',
        }];
    };

    const handleStatusChange = (value) => {
        let newStatus;
        const isPositiveCategory = slideCategory === '阳性' || slideCategory === '疑似';

        if (value === '一致') {
            newStatus = isPositiveCategory ? 2 : 1;
        } else {
            newStatus = isPositiveCategory ? 1 : 2;
        }
        setSelectedStatus(newStatus);
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
                        <div style={{ display: "flex", justifyContent:"space-around", alignItems: "center", gap: 10,paddingTop: 20, marginBottom: 10}}>
                            {/* 已有病理号标签 */}
                            <Tag style={{ fontSize: '14px', padding: '6px 8px' }} color="orange">{pathoId}</Tag>

                            {/* 已有slideCategory标签 */}
                            <Tag style={{ fontSize: '14px', padding: '6px 8px' }}
                                 color={
                                     slideCategory === '阴性' ? 'green' :
                                         slideCategory === '阳性' ? 'red' :
                                             slideCategory === '疑似' ? 'orange' : 'gray'
                                 }>
                                {slideCategory || '无'}
                            </Tag>

                            <div>
                                <Select
                                    style={{ width: 120, marginRight:'5px' }}
                                    value={
                                        [1, 2].includes(selectedStatus) ?
                                            ((selectedStatus === 1 && slideCategory === '阴性') ||  // 阴性保持原逻辑
                                                (selectedStatus === 2 && (slideCategory === '阳性' || slideCategory === '疑似'))) // 阳性或疑似
                                                ? '一致'
                                                : '不一致'
                                            : '未审核'
                                    }
                                    options={getStatusOptions()}
                                    onChange={value => handleStatusChange(value)}
                                />

                                {/* 操作按钮 */}
                                <Button
                                    type="primary"
                                    onClick={async () => {
                                        try {
                                            const res = await examSlide(
                                                projectDetails.slideId,
                                                slideCategory ,
                                                selectedStatus,
                                            );

                                            if (res.data.code === 200) {
                                                message.success('修改成功');
                                            }
                                        } catch (error) {
                                            message.error('操作失败');
                                        }
                                    }}
                                >
                                    {[1, 2].includes(projectDetails.status) ? '修改' : '确定'}
                                </Button>

                            </div>


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
                        </div>


                        {/* 替换原有复选按钮部分 */}
                        <div style={{ margin: '16px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16, fontWeight: 500 }}>病变类型:</span>
                                <div style={{ display: 'flex', gap: 20 }}>
                                    {category.map((cls) => {
                                        const count = cls === '全部'
                                            ? Object.values(categoryStats).reduce((a, b) => a + b, 0)
                                            : categoryStats[cls] || 0;

                                        return (
                                            <Button
                                                key={cls}
                                                shape="round"
                                                size="middle"
                                                style={{
                                                    border: `2px solid ${getScoreColor(cls)}`,
                                                    backgroundColor: selectedCategory === cls ? `${getScoreColor(cls)}1a` : 'transparent',
                                                    fontWeight: 600,
                                                    color: getScoreColor(cls),
                                                    position: 'relative',
                                                    padding: '4px 20px',
                                                    transition: 'all 0.2s',
                                                    ':hover': {
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                                disabled={
                                                    cls === '全部'
                                                        ? Object.values(categoryStats).reduce((a, b) => a + b, 0) === 0
                                                        : (categoryStats[cls] || 0) === 0
                                                }
                                                onClick={() => setSelectedCategory(cls)}
                                            >
                                                {cls}
                                                <span style={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    backgroundColor: getScoreColor(cls),
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    width: 24,
                                                    height: 24,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 12,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                  {count}
                                                </span>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>




                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 5, marginBottom: 5 }}>
                            <span style={{fontSize: '16px', fontWeight: 600}}>AI诊断结果:</span>
                            <TextArea
                                value={pathoReport}
                                placeholder="AI诊断结果"
                                autoSize={{ minRows: 1, maxRows: 5 }}
                                style={{ flex: 1 }}
                            />
                        </div>


                        {projectDetails.category === '阳性' && posTile.length > 0 && (
                            <>
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
                                    {/* 左右滚动箭头 */}
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

                                    {/* 滚动容器 */}
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
                                                        alt={`病理切片 ${index + 1}`}
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
                                                        #{index + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}



                        <Divider
                            style={{
                                margin: 0,
                                border: '0.5px solid #E2E8F0',
                                width: 'calc(100% + 32px)',
                                marginLeft: '-16px',
                            }}
                        />

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

export default GastricPanel;
