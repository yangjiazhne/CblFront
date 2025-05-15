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

const CLBCInferPanel = ({ isVisible, toggleVisibility, pathoId }) => {
    const organ = localStorage.getItem('organ');
    const { projectDetails } = useSelector(state => state.project);

    const [slideCategory, setSlideCategory] = useState(projectDetails.category)
    const heatmapUrl = STATIC_URL + projectDetails.heatMap.split("projects")[1];

    const [posTile, setPosTile] = useState([]);
    const [negTile, setNegTile] = useState([]);

    const order = ['ASC-US', 'ASC-H', 'LSIL', 'HSIL', 'AGC'];

    const category = ['全部', ...projectDetails.subCls.split(',')];
    if(organ === '宫颈'){
        category.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    }
    const [selectCategory, setSelectCategory] = useState(
        category.filter(c => c !== '全部')
    );

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
            if (selectCategory.length === category.length - 1) { // -1 排除"全部"本身
                return shouldInclude;
            }
            return shouldInclude && selectCategory.includes(tile.cls);
        });

        setPosTile(filteredTiles);
    }, [selectCategory]);


    const [isGlobalHM, setIsGlobalHM] = useState(true)
    const [currentTile, setCurrentTile] = useState({})

    const [categoryStats, setCategoryStats] = useState({});
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [maxCategory, setMaxCategory] = useState('无');
    const [hmSize, setHmSize] = useState({ width: 0, height: 0 });
    // 新增分页状态
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const [tiles, setTiles] = useState([]);









    const ChangeTile = (tile) => {
        setCurrentTile(tile)
        MoveAndResize(tile)
        setIsGlobalHM(false)
    }

    const handleCategoryClick = (cls) => {
        if (cls === '全部') {
            setSelectCategory(category.filter(c => c !== '全部'));
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



    const getStatusOptions = (category, currentStatus) => {
        // 已审核状态显示相反选项
        if ([1, 2].includes(currentStatus)) {
            if((category==='阳性'&& currentStatus===2)||(category==='阴性'&& currentStatus===1))
                return [{value: '不一致', label: '不一致'}]
            else return [{value: '一致',label: '一致'}];
        }
        // 未审核显示全部选项
        return [
            { value: '一致', label: '一致' },
            { value: '不一致', label: '不一致' }
        ];
    };

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
                }}
            >
                {/* hedear*/}
                <div style={{ display: "flex", justifyContent:"center", alignItems: "center", gap: 10,paddingTop: 12}}>
                    {/* 已有病理号标签 */}
                    <Tag style={{ fontSize: '14px', padding: '6px 8px' }} color="orange">{pathoId}</Tag>

                    {/* 已有slideCategory标签 */}
                    <Tag style={{ fontSize: '14px', padding: '6px 8px' }}
                         color={slideCategory?.includes('阴性') ? 'green' : slideCategory?.includes('阳性') ? 'red' : 'gray'}>
                        {slideCategory || '无'}
                    </Tag>

                    <Tag style={{ fontSize: '14px', padding: '6px 8px' }} color="purple">
                        {maxCategory}
                    </Tag>

                    <Select
                        style={{ width: 120 }}
                        placeholder={[1, 2].includes(projectDetails.status) ?
                            (((projectDetails.status === 1 && slideCategory === '阴性')
                                || (projectDetails.status===2 && slideCategory==='阳性'))
                                ? '一致' : '不一致') : '未审核'}
                        options={getStatusOptions(slideCategory, projectDetails.status)}
                        onChange={value => setSelectedStatus(value)}
                    />

                    {/* 操作按钮 */}
                    <Button
                        type="primary"
                        onClick={async () => {
                            try {
                                const statusMap = {
                                    '阴性': {
                                        '一致': 1,
                                        '不一致': 2
                                    },
                                    '阳性': {
                                        '一致': 2,
                                        '不一致': 1
                                    }
                                };

                                const finalStatus = statusMap[slideCategory]?.[selectedStatus] || projectDetails.status;

                                const res = await examSlide(
                                    projectDetails.slideId,
                                    slideCategory ,
                                    finalStatus
                                );

                                if (res.data.code === 200) {
                                    message.success([1, 2].includes(projectDetails.status) ? '修改成功' : '审核通过');
                                    fetchPosData();
                                }
                            } catch (error) {
                                message.error('操作失败');
                            }
                        }}
                    >
                        {[1, 2].includes(projectDetails.status) ? '修改' : '确定'}
                    </Button>
                </div>

                {isVisible && (
                    <div className="panel-content" style={{ padding: '8px' }}>

                        <TextArea
                            value={"AI诊断结果:   "+pathoReport}
                            placeholder="AI诊断结果"
                            autoSize={{
                                minRows: 3,
                                maxRows: 5,
                            }}
                            style={{ marginTop: 16, marginBottom: 16}}
                        />


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
                                                margin:'0 8px',
                                                backgroundColor: (cls === '全部' && selectCategory.length === category.length - 1) ||
                                                selectCategory.includes(cls)
                                                    ? `${getScoreColor(cls)}1a`
                                                    : 'transparent',
                                                border: `2px solid ${
                                                    cls === '全部' ? 'brown' : getScoreColor(cls)
                                                }`,
                                                position: 'relative',
                                                fontWeight: 600,
                                                color:  cls === '全部' ? 'brown' : getScoreColor(cls),
                                                transition: 'all 0.2s',
                                                ':hover': {
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                            onClick={() => handleCategoryClick(cls)}
                                        >
                                            {cls}

                                            <span style={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                backgroundColor: cls === '全部' ? 'brown' : getScoreColor(cls),
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
                                                {cls === '全部'
                                                    ? category
                                                        .filter(c => c !== '全部') // 排除"全部"自身
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
                                        height: '110%',  // 缩短分割线高度
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
                                                borderRadius: 8,
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
                                                height: '100%', // 留出标签高度
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
                                                        objectFit: 'cover',
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
