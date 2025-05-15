import React from 'react';
import {Button, Tag, Spin, Select} from 'antd';
import Thumbnail from 'src/pages/Diagnostic/components/Thumbnail.jsx';
import styles from './index.module.scss';
import { List, Pagination } from 'antd';

const SliceList = ({ slides,pagination, onPageChange, onPageSizeChange,filters, onFilterChange, currentPathoId, onSwitch, onClose }) => {
    const categoryOptions = [
        { label: '阴性', value: '阴性' },
        { label: '阳性', value: '阳性' },
        { label: '疑似', value: '疑似' }
    ];

    const statusOptions = [
        { label: '未审核', value: 4 },
        { label: '阴性', value: 1 },
        { label: '阳性', value: 2 },
        { label: '疑似', value: 3 }
    ];

    return (
        <div className={styles.container}>
            {/*<div className={styles.header}>*/}
            {/*    <Tag color="geekblue" style={{ fontSize: 14 }}>*/}
            {/*        共 {slides.length} 张切片*/}
            {/*    </Tag>*/}
            {/*    <Button type="text" size="small" onClick={onClose}>*/}
            {/*        关闭*/}
            {/*    </Button>*/}
            {/*</div>*/}
            <div className={styles.filterBar}>
                <Select
                    placeholder="AI结果"
                    allowClear
                    options={categoryOptions}
                    value={filters.category}
                    onChange={val => onFilterChange({ category: val? [val] : [] })}
                    style={{ width: 120 }}
                />

                <Select
                    placeholder="审核状态"
                    allowClear
                    options={statusOptions}
                    value={filters.status}
                    onChange={val => onFilterChange({ status:  val? [val] : [] })}
                    style={{ width: 140, marginLeft: 8 }}
                />
            </div>


            <div className={styles.listContainer}>
                {slides.map((slide) => (
                    <div
                        key={slide.pathoId}
                        className={`${styles.listItem} ${
                            currentPathoId === slide.pathoId ? styles.active : ''
                        }`}
                        onClick={() => onSwitch(slide.pathoId)}
                    >
                        <div className={styles.thumbnail}>
                            <Thumbnail
                                url={slide.slideUrl}
                                status={slide.status}
                                slideId={slide.slideId}
                                size={80}
                            />
                        </div>
                        <div className={styles.info}>
                            <span className={styles.pathoId}>{slide.pathoId}</span>
                            <span className={styles.patient}>{slide.patientName}</span>
                            <div className={styles.meta}>
                                <div className={styles.tags}>
                                    <Tag style={{fontSize:14}} color={getCategoryColor(slide.category)}>
                                        AI:{slide.category}
                                    </Tag>
                                    <Tag style={{fontSize:14}} color={getStatusColor(slide.status)}>
                                        审核:{getStatusText(slide.status)}
                                    </Tag>
                                </div>
                            </div>
                        </div>
                    </div>

                ))}
            </div>

            {/* <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={onPageChange}
                showSizeChanger
                onShowSizeChange={(current, size) => {
                    onPageSizeChange(current, size);
                }}
                style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}
            /> */}
        </div>
    );
};

const getStatusColor = (status) => {
    const statusColors = {
        1: 'blue',    // 阴性
        2: 'red',     // 阳性
        3: 'orange',  // 疑似
        4: 'gray'     // 未审核
    };
    return statusColors[status] || 'gray';
};

const getStatusText = (status) => {
    const statusTexts = {
        1: '阴性',
        2: '阳性',
        3: '疑似',
        4: '未审核'
    };
    return statusTexts[status] || '未知';
};

const getCategoryColor = (category) => {
    const colors = {
        '阴性': 'blue',
        '阳性': 'red',
        '疑似': 'orange'
    };
    return colors[category] || 'gray';
};

export default SliceList;