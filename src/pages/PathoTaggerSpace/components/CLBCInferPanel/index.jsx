import React, {useState, useEffect, useRef} from 'react';
import {
    Button,
    message,
    Col,
    Row,
    Divider,
    Input,
    Tag,
    Select,
    Pagination
} from 'antd';
import {LeftOutlined, RightOutlined} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { searchTile } from '@/request/actions/tile'
import { examSlide } from '@/request/actions/slide'
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect';
import { STATIC_URL } from '@/constants'
import { drawAll, MoveAndResize, Move} from './help'
const { TextArea } = Input;

const CLBCInferPanel = ({ isVisible, toggleVisibility, pathoId,ImgSize }) => {
    const organ = localStorage.getItem('organ');
    const { projectDetails } = useSelector(state => state.project);

    const [slideCategory, setSlideCategory] = useState(projectDetails.category)
    // const heatmapUrl = STATIC_URL + projectDetails.heatMap.split("projects")[1];

    const [posTile, setPosTile] = useState([]);
    const [negTile, setNegTile] = useState([]);

    // const order = ['ASC-US', 'ASC-H', 'LSIL', 'HSIL', 'AGC'];
    const order = ['HSIL','ASC-H', 'LSIL','ASC-US','AGC-NOS','NILM'];

    const category = ['Total', ...order];
    if(organ === '宫颈'){
        category.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    }
    const [selectCategory, setSelectCategory] = useState(
        category.filter(c => c !== 'Total')
    );

    // useEffect(() => {
    //     // 创建一个新的图片对象
    //     const img = new Image();

    //     // 当图片加载完成后，获取宽高并更新状态
    //     img.onload = () => {
    //         setHmSize({ width: img.width, height: img.height });
    //     };


    //     // 设置图片源
    //     img.src = heatmapUrl;

    //     // 如果图片已经缓存，直接加载
    //     if (img.complete) {
    //         img.onload();
    //     }
    // }, [heatmapUrl]);
    useEffect(() => {
        drawAll(posTile)
    }, [posTile])

    useEffect(() => {
        fetchPosData()
    }, [pathoId]);

    useDidUpdateEffect(() => {
        // 当选择分类变化时重置到第一页
        setCurrentPage(1);
        setPosTile(
            tiles.filter(tile =>
                tile.category === '阳性' &&
                tile.cls &&
                (selectCategory.length === category.length - 1 ? true : selectCategory.includes(tile.cls))
            )
        );
    }, [selectCategory]);

// 修改原有分类变化effect
    useDidUpdateEffect(() => {
        const filteredTiles = tiles.filter(tile => {
            const shouldInclude = tile.category === '阳性' && tile.cls;

            // 如果是"全选"（所有子类都被选中）状态下的过滤逻辑
            if (selectCategory.length === category.length - 1) { // -1 排除"Total"本身
                return shouldInclude;
            }
            return shouldInclude && selectCategory.includes(tile.cls);
        });

        setPosTile(filteredTiles);
    }, [selectCategory]);

    const fatherBox = useRef(null);

    const [isGlobalHM, setIsGlobalHM] = useState(true)
    const [currentTile, setCurrentTile] = useState({})

    const [categoryStats, setCategoryStats] = useState({});
    const [selectedStatus, setSelectedStatus] = useState(projectDetails.status);
    const [maxCategory, setMaxCategory] = useState('无');
    const [hmSize, setHmSize] = useState({ width: 0, height: 0 });
    // 新增分页状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [tiles, setTiles] = useState([]);

    const ChangeTile = (tile) => {
        setCurrentTile(tile)
        MoveAndResize(tile, fatherBox)
        setIsGlobalHM(false)
    }

    const handleCategoryClick = (cls) => {
        if (cls === 'Total') {
            setSelectCategory(category.filter(c => c !== 'Total'));
        } else {
            setSelectCategory([cls]);
        }
    };

    const pathoReport = projectDetails.supplementaryReport

    // 分页处理
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // 当前显示的切片
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentTiles = posTile.slice(startIndex, endIndex);


    const fetchPosData = async () => {
        const res = await searchTile(projectDetails.slideId)
        const tileList = res.data.content

        // 分类统计逻辑保持不变
        const stats = tileList.reduce((acc, tile) => {
            if (tile.cls) acc[tile.cls] = (acc[tile.cls] || 0) + 1
            return acc
        }, {})
        setCategoryStats(stats)

        // 计算最多类别
        const maxEntry = Object.entries(stats).reduce((max, [cls, count]) =>
            count > (max[1] || 0) ? [cls, count] : max, ['无', 0])
        setMaxCategory(maxEntry[0])

        // 修改坐标解析部分
        const updatedTileList = tileList.map(tile => {
            // 匹配四坐标格式 (xxxx, yyyy, zzzz, aaaa)
            // console.log(tile.coordinate)
            const match = tile.coordinate.match(/\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)&\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)/)
            // console.log(match)

            return {
                ...tile,
                tileUrl: STATIC_URL + tile.tileUrl.split("projects")[1],
                left: match ? parseFloat(match[1]) : null,
                top: match ? parseFloat(match[2]) : null,
                right: match ? parseFloat(match[3]) : null,
                bottom: match ? parseFloat(match[4]) : null,
                facher_left: match ? parseFloat(match[5]) : null,
                facher_top: match ? parseFloat(match[6]) : null,
                facher_right: match ? parseFloat(match[7]) : null,
                facher_bottom: match ? parseFloat(match[8]) : null,
            }
        })

        setTiles(updatedTileList)

        // 按 category 进行分类
        setPosTile(updatedTileList.filter(tile =>
            tile.category === '阳性' && tile.cls && selectCategory.includes(tile.cls)
        ))
        setNegTile(updatedTileList.filter(tile => tile.category === '阴性'))
    }

    // const fetchPosData = async () => {
    //     const res = await searchTile(projectDetails.slideId)
    //     const tileList = res.data.content
    //
    //     // // 获取病理图尺寸
    //     // const { width: slideWidth, height: slideHeight } = ImgSize
    //     // // 正确写法（直接赋值）
    //     // // const slideWidth = 700
    //     // // const slideHeight = 700
    //     //
    //     // // 处理坐标数据
    //     // const updatedTileList = tileList.map(tile => {
    //     //     // 坐标校验函数
    //     //     const isValidCoord = (val, max) =>
    //     //         typeof val === 'number' && val >= 0 && val <= max
    //     //
    //     //     // 生成随机矩形坐标
    //     //     const generateRandomRect = () => {
    //     //         const MIN_SIZE = 50   // 最小矩形尺寸
    //     //         const MAX_SIZE = 500  // 最大矩形尺寸
    //     //
    //     //         // 生成随机位置（留出最大尺寸空间）
    //     //         const left = Math.random() * (slideWidth - MAX_SIZE)
    //     //         const top = Math.random() * (slideHeight - MAX_SIZE)
    //     //
    //     //         // 生成随机尺寸
    //     //         const width = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE
    //     //         const height = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE
    //     //
    //     //         return {
    //     //             left,
    //     //             top,
    //     //             right: Math.min(left + width, slideWidth),
    //     //             bottom: Math.min(top + height, slideHeight)
    //     //         }
    //     //     }
    //     //
    //     //     // 校验现有坐标
    //     //     let coords = { left: null, top: null, right: null, bottom: null }
    //     //     try {
    //     //         const hasValidCoords = (
    //     //             isValidCoord(tile.left, slideWidth) &&
    //     //             isValidCoord(tile.top, slideHeight) &&
    //     //             isValidCoord(tile.right, slideWidth) &&
    //     //             isValidCoord(tile.bottom, slideHeight) &&
    //     //             tile.right > tile.left &&
    //     //             tile.bottom > tile.top
    //     //         )
    //     //
    //     //         coords = hasValidCoords ? tile : generateRandomRect()
    //     //     } catch (e) {
    //     //         console.warn('坐标解析异常，生成随机坐标', e)
    //     //         coords = generateRandomRect()
    //     //     }
    //     //
    //     //     // 保留原始坐标字段解析逻辑（如果存在）
    //     //     if (tile.coordinate) {
    //     //         const match = tile.coordinate.match(/$(\d+),\s*(\d+)$/)
    //     //         if (match) {
    //     //             coords.left = parseInt(match[1], 10)
    //     //             coords.top = parseInt(match[2], 10)
    //     //             coords.right = coords.left + 100  // 默认100x100矩形
    //     //             coords.bottom = coords.top + 100
    //     //         }
    //     //     }
    //     //
    //     //     return {
    //     //         ...tile,
    //     //         tileUrl: STATIC_URL + (tile.tileUrl?.split("projects")[1] || ''),
    //     //         ...coords
    //     //     }
    //     // })
    //
    //     // 分类统计逻辑保持不变
    //     const stats = updatedTileList.reduce((acc, t) => {
    //         t.cls && (acc[t.cls] = (acc[t.cls] || 0) + 1)
    //         return acc
    //     }, {})
    //
    //     setCategoryStats(stats)
    //     setMaxCategory(
    //         Object.entries(stats).reduce((max, [cls, count]) =>
    //             count > (max[1] || 0) ? [cls, count] : max, ['无', 0])[0]
    //     )
    //
    //     // 设置分类数据
    //     setTiles(updatedTileList)
    //     setPosTile(updatedTileList.filter(t =>
    //         t.category === '阳性' && t.cls && selectCategory.includes(t.cls)
    //     ))
    //     setNegTile(updatedTileList.filter(t => t.category === '阴性'))
    // }

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
            'NILM':'#519e3d',
            'Total': '#3B82F6', // blue
        };
        return colors[score] || '#CBD5E0';
    };

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
        <div>
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
                    position: 'fixed',
                    top: 0,
                    right: isVisible ? 0 : '-35%',
                    width: '35%',
                    height: '100%',
                    transition: 'right 0.3s',
                    backgroundColor: '#fff',
                    boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}
            >
                {/* hedear*/}
                <div style={{ display: "flex", justifyContent:"space-around", alignItems: "center", gap: 10,paddingTop: 30}}>
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

                    <Tag style={{ fontSize: '14px', padding: '6px 8px' }} color={getScoreColor(maxCategory)}>
                        {maxCategory}
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
                </div>

                {isVisible && (
                    <div className="panel-content" style={{ padding: '8px' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 16, marginBottom: 16, padding: '0 15px' }}>
                            <span style={{fontSize: '16px', fontWeight: 600}}>AI诊断结果:</span>
                            <TextArea
                                value={pathoReport}
                                placeholder="AI诊断结果"
                                autoSize={{ minRows: 1, maxRows: 5 }}
                                style={{ flex: 1 }}
                            />
                        </div>
   
                        <Divider
                            style={{
                                margin: 0,
                                border: '0.5px solid #E2E8F0',
                                width: 'calc(100% + 32px)',
                                marginLeft: '-16px',
                            }}
                        />

                        <Row gutter={16} style={{ marginTop: 16, height: 'calc(100vh - 200px)', // 根据实际界面高度调整
                            position: 'relative'  }}>
                            {/* 左侧类别选择 */}
                            <Col span={6}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 30,height: 'calc(100% - 50px)'}}>
                                    {category.map(cls => (
                                        <Button
                                            key={cls}
                                            shape="round"
                                            size="large"
                                            style={{
                                                margin:'0 4px',
                                                border: `2px solid ${
                                                    cls === 'Total' ? '#1890ff' : getScoreColor(cls)
                                                }`,
                                                opacity: (cls === 'Total'
                                                    ? Object.values(categoryStats).reduce((a, b) => a + b, 0) === 0
                                                    : (categoryStats[cls] || 0) === 0) ? 0.6 : 1, // 添加透明度变化
                                                position: 'relative',
                                                fontWeight: 600,
                                                backgroundColor: (cls === 'Total' && selectCategory.length===6) ? '#1890ff4d'
                                                                                 : (selectCategory.includes(cls)&& selectCategory.length!==6) ? `#${getScoreColor(cls).replace(/^#/, '')}4d` 
                                                                                                                : 'transparent',
                                                color:  cls === 'Total' ? '#1890ff' : getScoreColor(cls),
                                                transition: 'all 0.2s',
                                                ':hover': {
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                            disabled={
                                                cls === 'Total'
                                                    ? Object.values(categoryStats).reduce((a, b) => a + b, 0) === 0
                                                    : (categoryStats[cls] || 0) === 0
                                            }
                                            onClick={() => handleCategoryClick(cls)}
                                        >
                                            {cls}

                                            <span style={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                backgroundColor: cls === 'Total' ? '#1890ff' : getScoreColor(cls),
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: 30,
                                                height: 30,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 12,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}>
                                                {cls === 'Total'
                                                    ? category
                                                        .filter(c => c !== 'Total') // 排除"Total"自身
                                                        .reduce((total, clsName) => total + (categoryStats[clsName] || 0), 0)
                                                    : categoryStats[cls] || 0}
                                            </span>


                                        </Button>
                                    ))}
                                </div>

                                <div  style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                }}>
                                    <Button
                                        type="text"
                                        size={'large'}
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
                            </Col>

                            <Col>
                                <Divider
                                    type="vertical"
                                    style={{
                                        height: '100%',  // 缩短分割线高度
                                        margin: '0 -1px',  // 增加左右边距
                                        backgroundColor: '#E2E8F0',
                                    }}
                                />
                            </Col>




                            {/* 右侧切片展示 */}
                            <Col span={16}>
                                {/* 切片网格 */}
                                <div style={{
                                    display: 'grid',
                                    // 固定3列布局
                                    gridTemplateColumns: 'repeat(2, minmax(100px, 1fr))',
                                    gap: 30,
                                    // 自动填充高度
                                    height: 'auto',
                                    justifyContent: 'center',
                                    marginLeft: '30px',
                                    overflowY: 'auto',
                                    overflowX: 'auto',


                                }}>
                                    {currentTiles.map((tile, index) => (
                                        <div
                                            key={tile.tileId}
                                            style={{
                                                // 强制宽高比1:1
                                                aspectRatio: '1/1',
                                                position: 'relative',
                                                borderRadius: 5,
                                                overflow: 'hidden',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                transition: 'transform 0.2s',
                                                ':hover': {
                                                    transform: 'translateY(-3px)'
                                                }
                                            }}
                                        >
                                            {/* 图像区域 */}
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                position: 'relative'
                                            }}>
                                                <img
                                                    src={tile.tileUrl}
                                                    alt="病理切片"
                                                    onClick={() => ChangeTile(tile)}
                                                    onError={(e) => {
                                                        e.target.style.opacity = 0
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',       // 保持原图比例，不裁剪
                                                        objectPosition: 'center center', // 左上对齐
                                                        // objectFit: 'cover',
                                                        border: `3px solid ${getScoreColor(tile.cls)}`
                                                    }}
                                                />
                                            </div>

                                        </div>
                                    ))}
                                </div>

                                {/* 分页控制器 */}
                                <div style={{

                                    marginTop: 30,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>

                                    <Pagination
                                        current={currentPage}
                                        pageSize={pageSize}
                                        total={posTile.length}
                                        onChange={handlePageChange}
                                        simple
                                    />

                                </div>
                            </Col>
                        </Row>


                    </div>
                )}
            </div>
        </div>
    );
};

export default CLBCInferPanel;
