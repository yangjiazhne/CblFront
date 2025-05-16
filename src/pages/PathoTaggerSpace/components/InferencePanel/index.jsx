import React, {useState, useEffect, useRef} from 'react';
import {Tabs, Button, message, Col, Radio, Row, Divider, Checkbox, Space, Grid, Input, Tag, Select, InputNumber } from 'antd';
import {LeftOutlined, RightOutlined} from '@ant-design/icons';
import PanelHeader from './PanelHeader';
import { useSelector, useDispatch } from 'react-redux';
import { searchTile } from '@/request/actions/tile'
import { examSlide } from '@/request/actions/slide'
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect';
import { STATIC_URL } from '@/constants'
import { drawAll, MoveAndResize, Move} from './help'
import { use } from 'react';
const { TextArea } = Input;

const InferencePanel = ({ isVisible, toggleVisibility, onHeatClick, pathoId }) => {
    const { projectDetails } = useSelector(state => state.project);

    const [slideCategory, setSlideCategory] = useState(projectDetails.category)

    const order = ['ASC-US', 'ASC-H', 'LSIL', 'HSIL', 'AGC'];

    const category = projectDetails.subCls.split(',')

    const [isGlobalHM, setIsGlobalHM] = useState(true)
    const [currentTile, setCurrentTile] = useState({})

    const [lowThre, setLowThre] = useState(0.40)
    const [highThre, setHighThre] = useState(0.70)

    const ChangeTile = (tile) => {
        setCurrentTile(tile)
        MoveAndResize(tile)
        setIsGlobalHM(false)
    }

    const modelList = ['Prototype', 'Classifier']
    const showStrategy = ['权值共享', '权值独立']
    const [counts, setCounts] = useState([])
    const [areas, setAreas] = useState([])
    const [model, setModel] = useState(modelList[0])
    const [strategy, setStrategy] = useState(showStrategy[0])

    useEffect(() => {
        if(model === 'Prototype'){
            const _counts = [
                (projectDetails.threeCounts * 100).toFixed(2),
                (projectDetails.fourCounts * 100).toFixed(2),
                (projectDetails.fiveCounts * 100).toFixed(2)
            ];
            const _areas = [
                (projectDetails.threeAreas * 100).toFixed(2),
                (projectDetails.fourAreas * 100).toFixed(2),
                (projectDetails.fiveAreas * 100).toFixed(2)
            ];
            setCounts(_counts)
            setAreas(_areas)
        }else if(model === 'Classifier'){
            const _counts = [
                (projectDetails.threeCounts_cls * 100).toFixed(2),
                (projectDetails.fourCounts_cls * 100).toFixed(2),
                (projectDetails.fiveCounts_cls * 100).toFixed(2)
            ];
            const _areas = [
                (projectDetails.threeAreas_cls * 100).toFixed(2),
                (projectDetails.fourAreas_cls * 100).toFixed(2),
                (projectDetails.fiveAreas_cls * 100).toFixed(2)
            ];
            setCounts(_counts)
            setAreas(_areas)
        }

    }, [model])

    const pathoReport = projectDetails.supplementaryReport

    const [hmSize, setHmSize] = useState({ width: 0, height: 0 });
    const [heatmapUrl, setHeatmapUrl] = useState(STATIC_URL + projectDetails.heatMap.split("projects")[1]);    

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
    const [selectedScore, setSelectedScore] = useState('二分类');


    const [tiles, setTiles] = useState([])
    const [posTile, setPosTile] = useState([])
    const [negTile, setNegTile] = useState([])

    useEffect(() => {
        if(selectedScore === '3'){
            if(model === 'Prototype' && strategy === '权值共享'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap1.split("projects")[1])
            }else if(model === 'Prototype' && strategy === '权值独立'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap4.split("projects")[1])
            }else if(model === 'Classifier' && strategy === '权值共享'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap7.split("projects")[1])
            }else if(model === 'Classifier' && strategy === '权值独立'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap10.split("projects")[1])
            }
        }else if(selectedScore === '4'){
            if(model === 'Prototype' && strategy === '权值共享'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap2.split("projects")[1])
            }else if(model === 'Prototype' && strategy === '权值独立'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap5.split("projects")[1])
            }else if(model === 'Classifier' && strategy === '权值共享'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap8.split("projects")[1])
            }else if(model === 'Classifier' && strategy === '权值独立'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap11.split("projects")[1])
            }
        }else if(selectedScore === '5'){
            if(model === 'Prototype' && strategy === '权值共享'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap3.split("projects")[1])
            }else if(model === 'Prototype' && strategy === '权值独立'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap6.split("projects")[1])
            }else if(model === 'Classifier' && strategy === '权值共享'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap9.split("projects")[1])
            }else if(model === 'Classifier' && strategy === '权值独立'){
                setHeatmapUrl(STATIC_URL + projectDetails.heatMap12.split("projects")[1])
            }
        }else if(selectedScore === '二分类'){
            setHeatmapUrl(STATIC_URL + projectDetails.heatMap.split("projects")[1])
        }
    }, [selectedScore, model, strategy]);

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

        if(projectDetails.category === '阴性') {
            return
        }

        setTiles(updatedTileList)

        // 按 category 进行分类
        setPosTile(updatedTileList.filter(tile => 
            tile.category === '阳性' && tile.cls && selectCategory.includes(tile.cls)
        ));
        setNegTile(updatedTileList.filter(tile => tile.category === '阴性'));

    }

    // useEffect(() => {
    //     drawAll(posTile)
    // }, [posTile])

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

    // useEffect(() => {
    //     if(projectDetails.category === '阴性'){
    //         return
    //     }
    //
    //     const container = scrollContainerRef.current;
    //     container.addEventListener('scroll', checkScrollPosition);
    //     window.addEventListener('resize', checkScrollPosition);
    //
    //     return () => {
    //         container.removeEventListener('scroll', checkScrollPosition);
    //         window.removeEventListener('resize', checkScrollPosition);
    //     };
    // }, []);

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
                                        {/* hedear*/}
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
                        <div flex="auto" style={{ 
                                paddingLeft:20,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '5px 8px',}}>
                            <div style={{
                                fontSize: 16,
                                color: '#2D3748',
                                fontWeight: 500,
                                whiteSpace: 'nowrap'
                            }}>
                                阈值调整:
                            </div>
                            <Tag style={{fontSize: 15, padding: '5px 8px', marginLeft: 28}}>预测: 0.80</Tag>
                            <InputNumber
                                min={0}
                                max={1}
                                style={{
                                    marginLeft: 8,
                                    marginRight: 2,
                                    width: 70
                                }}
                                step={0.01}
                                value={lowThre}
                                onChange={(value) => setLowThre(value)}
                            />
                            <span>——</span>
                            <InputNumber
                                min={0}
                                max={1}
                                style={{
                                    marginRight: 16,
                                    marginLeft: 2,
                                    width: 70
                                }}
                                step={0.01}
                                value={highThre}
                                onChange={(value) => setHighThre(value)}
                            />
                            <Button
                                type="primary"
                                
                            >
                                修改
                            </Button>
                        </div>
                        <Col flex="auto" style={{ 
                                    paddingLeft:20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 8px',}}>
                            <Space size={8}>
                                <Col style={{
                                    fontSize: 16,
                                    color: '#2D3748',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap'
                                }}>
                                    模型型号:
                                </Col>
                                <Radio.Group
                                    value={model}  // 注意，这应是单个值
                                    onChange={(e) => setModel(e.target.value)}
                                    style={{ display: 'flex',
                                             paddingLeft:20,
                                             gap: 10, }}
                                >
                                    {modelList.map(item => (
                                        <Radio
                                            key={item}
                                            value={item}
                                            style={{
                                                padding: '5px 8px',
                                                backgroundColor: '#3B82F61a',
                                                borderRadius: 6,
                                                transition: 'all 0.2s',
                                                fontSize: 15,
                                            }}
                                        >
                                            <span style={{
                                                color: '#3B82F6',
                                                fontWeight: 600,
                                                position: 'relative',
                                                '::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    width: 16,
                                                    height: 16,
                                                    borderRadius: '50%',
                                                    border: '2px solid 3B82F61a',
                                                }
                                            }}>
                                                {item}
                                            </span>
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            </Space>
                        </Col>
                        <Col flex="auto" style={{ 
                                    paddingLeft:20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '5px 8px',}}>
                            <Space size={8}>
                                <Col style={{
                                    fontSize: 16,
                                    color: '#2D3748',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap'
                                }}>
                                    展示策略:
                                </Col>
                                <Radio.Group
                                    value={strategy}  // 注意，这应是单个值
                                    onChange={(e) => setStrategy(e.target.value)}
                                    style={{ display: 'flex',
                                             paddingLeft:20,
                                             gap: 10, }}
                                >
                                    {showStrategy.map(item => (
                                        <Radio
                                            key={item}
                                            value={item}
                                            style={{
                                                padding: '5px 8px',
                                                backgroundColor: '#3B82F61a',
                                                borderRadius: 6,
                                                transition: 'all 0.2s',
                                                fontSize: 15,
                                            }}
                                        >
                                            <span style={{
                                                color: '#3B82F6',
                                                fontWeight: 600,
                                                position: 'relative',
                                                '::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    width: 16,
                                                    height: 16,
                                                    borderRadius: '50%',
                                                    border: '2px solid 3B82F61a',
                                                }
                                            }}>
                                                {item}
                                            </span>
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            </Space>
                        </Col>
                        { projectDetails.category === '阳性' && (
                            <Col flex="auto" style={{ margin: '0px 0' }}>
                                <Space size={8}>
                                    <Col style={{
                                        fontSize: 16,
                                        color: '#2D3748',
                                        fontWeight: 500,
                                        letterSpacing: 0.2,
                                        marginRight: 5
                                    }}>
                                        Gleason评分
                                    </Col>
                                    <Radio.Group
                                        value={selectedScore}  // 注意，这应是单个值
                                        onChange={(e) => setSelectedScore(e.target.value)}
                                        style={{ display: 'flex' }}
                                    >
                                        {category.map(score => (
                                            <Radio
                                                key={score}
                                                value={score.toString()}
                                                style={{
                                                    padding: '5px 8px',
                                                    backgroundColor: `${getScoreColor(score)}1a`,
                                                    borderRadius: 6,
                                                    transition: 'all 0.2s',
                                                    fontSize: 15,
                                                }}
                                            >
                                                <span style={{
                                                    color: getScoreColor(score),
                                                    fontWeight: 600,
                                                    position: 'relative',
                                                    paddingLeft: 15,
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
                                                    }
                                                }}>
                                                    {score}
                                                </span>
                                            </Radio>
                                        ))}
                                        <Radio
                                            key={'Binary'}
                                            value={'二分类'}
                                            style={{
                                                padding: '5px 8px',
                                                backgroundColor: '#ed7d311a',
                                                borderRadius: 6,
                                                transition: 'all 0.2s',
                                                fontSize: 15,
                                            }}
                                        >
                                            <span style={{
                                                color: '#ed7d31',
                                                fontWeight: 600,
                                                position: 'relative',
                                                paddingLeft: 5,
                                                '::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    left: 0,
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    width: 16,
                                                    height: 16,
                                                    borderRadius: '50%',
                                                    border: `2px solid #ed7d31`,
                                                }
                                            }}>
                                                二分类
                                            </span>
                                        </Radio>
                                    </Radio.Group>
                                </Space>
                            </Col>
                        )}
                        
                        { projectDetails.category==='阳性' && (
                            <>
                            <Col span={50}>
                                <div style={{
                                    paddingLeft:20,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '5px 8px',
                                }}>
                                    <span style={{
                                        fontSize: 16,
                                        color: '#2D3748',
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap'
                                    }}>成分占比：</span>
                                    <div style={{
                                        display: 'flex',
                                        paddingLeft:17,
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
                                    padding: '0 8px',
                                }}>
                                <span style={{
                                    fontSize: 16,
                                    color: '#2D3748',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap'
                                }}>面积占比：</span>
                                    <div style={{
                                        display: 'flex',
                                        paddingLeft:17,
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 5, marginBottom: 5 }}>
                            <span style={{fontSize: '16px', fontWeight: 600}}>AI诊断结果:</span>
                            <TextArea
                                value={pathoReport}
                                placeholder="AI诊断结果"
                                autoSize={{ minRows: 1, maxRows: 5 }}
                                style={{ flex: 1 }}
                            />
                        </div>

                        
                        {/*<TextArea*/}
                        {/*    value={"AI诊断结果:   "+pathoReport}*/}
                        {/*    placeholder="AI诊断结果"*/}
                        {/*    autoSize={{*/}
                        {/*        minRows: 2,*/}
                        {/*        maxRows: 8,*/}
                        {/*    }}*/}
                        {/*    style={{ marginTop: 16, marginBottom: 16}}*/}
                        {/*/>*/}

                        {/*{projectDetails.category === '阳性' && (*/}
                        {/*    <>*/}
                        {/*        <Divider*/}
                        {/*            style={{*/}
                        {/*                margin: 0,*/}
                        {/*                border: '0.5px solid #E2E8F0',*/}
                        {/*                width: 'calc(100% + 32px)',*/}
                        {/*                marginLeft: '-16px',*/}
                        {/*            }}*/}
                        {/*        />*/}
                        {/*        <div style={{*/}
                        {/*            position: 'relative',*/}
                        {/*            '--hover-scale': 1.05,*/}
                        {/*            '--active-scale': 0.98*/}
                        {/*        }}>*/}
                        {/*            /!* 左侧箭头 *!/*/}
                        {/*            {showLeftArrow && (*/}
                        {/*                <div*/}
                        {/*                    style={{*/}
                        {/*                        position: 'absolute',*/}
                        {/*                        left: 16,*/}
                        {/*                        top: '50%',*/}
                        {/*                        transform: 'translateY(-50%)',*/}
                        {/*                        zIndex: 10,*/}
                        {/*                        cursor: 'pointer',*/}
                        {/*                        background: 'rgba(255,255,255,0.9)',*/}
                        {/*                        borderRadius: '50%',*/}
                        {/*                        width: 32,*/}
                        {/*                        height: 32,*/}
                        {/*                        display: 'flex',*/}
                        {/*                        alignItems: 'center',*/}
                        {/*                        justifyContent: 'center',*/}
                        {/*                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',*/}
                        {/*                        transition: 'opacity 0.3s',*/}
                        {/*                        ':hover': {*/}
                        {/*                            background: '#fff',*/}
                        {/*                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'*/}
                        {/*                        }*/}
                        {/*                    }}*/}
                        {/*                    onClick={() => scrollTo('left')}*/}
                        {/*                >*/}
                        {/*                    <LeftOutlined style={{ color: '#3B82F6', fontSize: 16 }} />*/}
                        {/*                </div>*/}
                        {/*            )}*/}

                        {/*            /!* 右侧箭头 *!/*/}
                        {/*            {showRightArrow && (*/}
                        {/*                <div*/}
                        {/*                    style={{*/}
                        {/*                        position: 'absolute',*/}
                        {/*                        right: 16,*/}
                        {/*                        top: '50%',*/}
                        {/*                        transform: 'translateY(-50%)',*/}
                        {/*                        zIndex: 10,*/}
                        {/*                        cursor: 'pointer',*/}
                        {/*                        background: 'rgba(255,255,255,0.9)',*/}
                        {/*                        borderRadius: '50%',*/}
                        {/*                        width: 32,*/}
                        {/*                        height: 32,*/}
                        {/*                        display: 'flex',*/}
                        {/*                        alignItems: 'center',*/}
                        {/*                        justifyContent: 'center',*/}
                        {/*                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',*/}
                        {/*                        transition: 'opacity 0.3s',*/}
                        {/*                        ':hover': {*/}
                        {/*                            background: '#fff',*/}
                        {/*                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'*/}
                        {/*                        }*/}
                        {/*                    }}*/}
                        {/*                    onClick={() => scrollTo('right')}*/}
                        {/*                >*/}
                        {/*                    <RightOutlined style={{ color: '#3B82F6', fontSize: 16 }} />*/}
                        {/*                </div>*/}
                        {/*            )}*/}

                        {/*            /!* 滚动容器（保持原有代码，添加ref） *!/*/}
                        {/*            <div*/}
                        {/*                ref={scrollContainerRef}*/}
                        {/*                style={{*/}
                        {/*                    width: '100%',*/}
                        {/*                    overflowX: 'auto',*/}
                        {/*                    padding: '16px 0',*/}
                        {/*                    WebkitOverflowScrolling: 'touch',*/}
                        {/*                    scrollbarWidth: 'none',*/}
                        {/*                    msOverflowStyle: 'none',*/}
                        {/*                    '&::-webkit-scrollbar': { display: 'none' }*/}
                        {/*                }}*/}
                        {/*                onWheel={(e) => {*/}
                        {/*                    // 横向滚轮控制*/}
                        {/*                    if (e.deltaY !== 0) {*/}
                        {/*                        e.currentTarget.scrollLeft += e.deltaY * 2*/}
                        {/*                    }*/}
                        {/*                }}*/}
                        {/*            >*/}
                        {/*                <div style={{*/}
                        {/*                    display: 'flex',*/}
                        {/*                    gap: '16px',*/}
                        {/*                    padding: '0 24px',*/}
                        {/*                    flexWrap: 'nowrap'*/}
                        {/*                }}>*/}
                        {/*                    {posTile.map((tile, index) => (*/}
                        {/*                        <div*/}
                        {/*                            key={tile.tileId}*/}
                        {/*                            style={{*/}
                        {/*                                width: 100,*/}
                        {/*                                height: 100,*/}
                        {/*                                flexShrink: 0,*/}
                        {/*                                borderRadius: 8,*/}
                        {/*                                overflow: 'hidden',*/}
                        {/*                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',*/}
                        {/*                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',*/}
                        {/*                                cursor: 'pointer',*/}
                        {/*                                position: 'relative',*/}
                        {/*                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',*/}
                        {/*                                ':hover': {*/}
                        {/*                                    transform: 'scale(var(--hover-scale))',*/}
                        {/*                                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'*/}
                        {/*                                },*/}
                        {/*                                ':active': {*/}
                        {/*                                    transform: 'scale(var(--active-scale))'*/}
                        {/*                                }*/}
                        {/*                            }}*/}
                        {/*                        >*/}
                        {/*                            <img*/}
                        {/*                                src={tile.tileUrl}*/}
                        {/*                                alt={`病理切片 ${index +1}`}*/}
                        {/*                                style={{*/}
                        {/*                                    width: '100%',*/}
                        {/*                                    height: '100%',*/}
                        {/*                                    objectFit: 'cover',*/}
                        {/*                                    borderRadius: 8,*/}
                        {/*                                    transition: 'opacity 0.3s ease',*/}
                        {/*                                    position: 'relative',*/}
                        {/*                                    zIndex: 1,*/}
                        {/*                                    border: `3px solid ${getScoreColor(tile.cls)}`*/}
                        {/*                                }}*/}
                        {/*                                onClick={() => ChangeTile(tile)}*/}
                        {/*                                onError={(e) => {*/}
                        {/*                                    e.target.style.opacity = 0*/}
                        {/*                                }}*/}
                        {/*                            />*/}
                        {/*                            /!* 序号标签 *!/*/}
                        {/*                            <div style={{*/}
                        {/*                                position: 'absolute',*/}
                        {/*                                bottom: 4,*/}
                        {/*                                right: 4,*/}
                        {/*                                background: 'rgba(0, 0, 0, 0.6)',*/}
                        {/*                                color: 'white',*/}
                        {/*                                fontSize: 10,*/}
                        {/*                                padding: '2px 6px',*/}
                        {/*                                borderRadius: 4,*/}
                        {/*                                zIndex: 2*/}
                        {/*                            }}>*/}
                        {/*                                #{index+1}*/}
                        {/*                            </div>*/}
                        {/*                        </div>*/}
                        {/*                    ))}*/}
                        {/*                </div>*/}
                        {/*            </div>*/}
                        {/*        </div>*/}
                        {/*    </>*/}

                        {/*)}*/}

                    

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

                        {isGlobalHM && (
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

                        {/* {!isGlobalHM && organ === '宫颈' && currentTile?.tileUrl && (
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
                        )} */}
                        

                    </div>
                )}
            </div>
        </div>
    );
};

export default InferencePanel;
