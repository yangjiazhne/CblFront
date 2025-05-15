import React, { useState } from 'react'
import styles from './index.module.scss'
import { Button, Empty, Spin, Input, ConfigProvider, Pagination } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import SingleProject from './SingleProject'
import zhCN from 'antd/lib/locale/zh_CN'
import Banner from '@/assets/banner2.jpg'
import { Navbar } from "@/components";

const MyProjects = () => {
    // 硬编码数据
    const hardcodedProjects = [
        { id: 1, name: '胃镜活检辅助诊断', organ: '胃' },
        { id: 2, name: '宫颈液基细胞学辅助筛查', organ: '宫颈' },
        { id: 3, name: '前列腺穿刺辅助诊断', organ: '前列腺' }
    ];

    // 状态管理
    const [loading] = useState(false)
    const [searchKey, setSearchKey] = useState('')
    const [displayProjects, setDisplayProjects] = useState(hardcodedProjects)

    // 搜索处理逻辑
    const handleSearch = () => {
        const filtered = hardcodedProjects.filter(project => {
            // 模糊搜索处理
            const projectName = project.name.toLowerCase().replace(/\s/g, '')
            const searchTerm = searchKey.toLowerCase().replace(/\s/g, '')
            return projectName.includes(searchTerm)
        })
        setDisplayProjects(filtered)
    }

    // 回车搜索
    const handleKeyPress = e => {
        if (e.key === 'Enter') handleSearch()
    }

    return (
        <Spin spinning={loading}>
            <Navbar />
            <div style={{ width: '100%' }}>
                <div className={styles.titleWrap} style={{
                    background: `transparent url(${Banner}) center center no-repeat`,
                    backgroundSize: 'cover'
                }}>
                    <p style={{ fontSize: '40px', fontWeight: 'bolder', color: '#fff', marginBottom: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                        <span style={{ color: '#7fffd4' }}>AI驱动</span>的病理诊断革命
                    </p>
                    <p style={{ fontSize: '34px', fontWeight: 'bolder', color: '#fff', marginBottom: '20px', lineHeight: 1.5 }}>
                        智能分析效率<span style={{ color: '#00ff00', fontSize: '1.2em' }}>提升10倍</span> | 精准率<span style={{ color: '#00ff00', fontSize: '1.2em' }}>高达98%</span>
                    </p>

                    {/* 搜索区域 */}
                    <div style={{ paddingTop: '6px', marginLeft: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Input
                            value={searchKey}
                            onChange={e => setSearchKey(e.target.value)}
                            onPressEnter={handleKeyPress}
                            style={{ width: '40%', height: '60px' }}
                            prefix={<SearchOutlined style={{ color: '#5cc1bb', fontSize: '20px' }} />}
                            placeholder="输入疾病名称搜索"
                            size="large"
                        />
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleSearch}
                            style={{
                                marginLeft: '10px',
                                height: '60px',
                                width: '120px',
                                backgroundColor: '#2cad2c',
                                borderColor: 'green',
                                fontSize: '20px'
                            }}>
                            搜索
                        </Button>
                    </div>
                </div>

                {/* 项目展示区域 */}
                <div style={{ padding: '30px 80px', flex: 1, minHeight: '88vh' }}>
                    {displayProjects.length > 0 ? (
                        <>
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                gap: '80px'
                            }}>
                                {displayProjects.map((project, index) => (
                                    <SingleProject
                                        key={index}
                                        projectDetails={project}
                                    />
                                ))}
                            </div>

                            {/* 分页组件（根据需求可隐藏） */}
                            <div style={{ display: 'flex' , justifyContent:'center'}}>
                                <ConfigProvider locale={zhCN}>
                                    <Pagination
                                        current={1}
                                        showQuickJumper
                                        showSizeChanger
                                        pageSizeOptions={['10', '20', '30', '40', '50']}
                                        defaultCurrent={1}
                                        defaultPageSize={10}
                                        total={displayProjects.length}
                                    />
                                </ConfigProvider>
                            </div>
                        </>
                    ) : (
                        <Empty
                            style={{ marginTop: '50px' }}
                            description={<h2 className={styles.noItems}>未找到匹配的疾病库</h2>}
                        >
                            <Button type="primary" onClick={() => setSearchKey('')}>
                                重置搜索
                            </Button>
                        </Empty>
                    )}
                </div>
            </div>
        </Spin>
    )
}

export default MyProjects