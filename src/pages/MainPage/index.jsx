import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import { Button, Empty, message, Spin, Input, Pagination } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'
import { PaginationProps } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import { ConfigProvider } from 'antd'
import Banner from '@/assets/banner2.jpg'

// 硬编码的癌症项目数据
const presetCancerProjects = [
    {
        projectId: 1,
        projectName: "胃癌数据集",
        description: "包含胃部病变的CT影像标注数据",
        imageType: { imageTypeName: "医学影像" },
        totalImages: 1560,
        routePath: "/gastric-cancer"
    },
    {
        projectId: 2,
        projectName: "宫颈癌数据集",
        description: "宫颈细胞学抹片检测数据",
        imageType: { imageTypeName: "病理切片" },
        totalImages: 2345,
        routePath: "/cervical-cancer"
    },
    {
        projectId: 3,
        projectName: "前列腺癌数据集",
        description: "前列腺MRI影像诊断数据集",
        imageType: { imageTypeName: "DICOM影像" },
        totalImages: 1876,
        routePath: "/prostate-cancer"
    }
]

const SingleProject = ({ project }) => {
    const history = useHistory()
    const [isHovering, setIsHovering] = useState(false)

    return (
        <div
            className={styles.projectCard}
            style={{
                transform: isHovering ? 'translateY(-5px)' : 'none',
                boxShadow: isHovering ? '0 4px 12px rgba(24, 144, 255, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                border: isHovering ? '1px solid #1890ff' : '1px solid #e8e8e8'
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => history.push(project.routePath)}
        >
            <div className={styles.cardHeader}>
                <h3 className={styles.projectTitle}>{project.projectName}</h3>
                {isHovering && (
                    <div className={styles.hoverMask}>
                        <span className={styles.viewDetail}>查看详情 →</span>
                    </div>
                )}
            </div>
            <div className={styles.cardBody}>
                <p className={styles.projectType}>{project.imageType.imageTypeName}</p>
                <p className={styles.projectDesc}>{project.description}</p>
                <div className={styles.projectStats}>
                    <span>图像数量: {project.totalImages}</span>
                </div>
            </div>
        </div>
    )
}

const CancerProjects = () => {
    const history = useHistory()
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [currentPageSize] = useState(10)
    const [searchKey, setSearchKey] = useState('')
    const [filteredProjects, setFilteredProjects] = useState(presetCancerProjects)

    // 搜索处理
    const handleSearch = () => {
        setLoading(true)
        const filtered = presetCancerProjects.filter(project =>
            project.projectName.toLowerCase().includes(searchKey.toLowerCase())
        )
        setFilteredProjects(filtered)
        setLoading(false)
    }

    // 回车搜索
    const handleKeyPress = e => {
        if (e.key === 'Enter') handleSearch()
    }

    // 分页处理
    const onChangePage: PaginationProps['onChange'] = page => {
        setCurrentPage(page)
    }

    return (
        <Spin spinning={loading}>
            <div className={styles.cancerContainer}>
                {/* 顶部Banner */}
                <div
                    className={styles.topBanner}
                    style={{ backgroundImage: `url(${Banner})` }}
                >
                    <div className={styles.bannerContent}>
                        <h1>癌症影像标注数据库</h1>
                        <p>专业医学影像标注数据，助力癌症诊断研究</p>

                        <div className={styles.searchBar}>
                            <Input
                                placeholder="搜索癌症类型..."
                                prefix={<SearchOutlined />}
                                value={searchKey}
                                onChange={e => setSearchKey(e.target.value)}
                                onKeyPress={handleKeyPress}
                                style={{ width: 400 }}
                            />
                            <Button
                                type="primary"
                                onClick={handleSearch}
                                style={{ marginLeft: 16 }}
                            >
                                立即搜索
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 项目展示区 */}
                <div className={styles.projectGallery}>
                    {filteredProjects.length > 0 ? (
                        <>
                            <div className={styles.projectGrid}>
                                {filteredProjects.map((project, index) => (
                                    <SingleProject key={index} project={project} />
                                ))}
                            </div>

                            <ConfigProvider locale={zhCN}>
                                <Pagination
                                    current={currentPage}
                                    pageSize={currentPageSize}
                                    total={filteredProjects.length}
                                    onChange={onChangePage}
                                    className={styles.pagination}
                                    showLessItems
                                />
                            </ConfigProvider>
                        </>
                    ) : (
                        <Empty
                            description={<span className={styles.emptyText}>未找到相关癌症数据集</span>}
                            imageStyle={{ height: 80 }}
                        />
                    )}
                </div>
            </div>
        </Spin>
    )
}

export default CancerProjects