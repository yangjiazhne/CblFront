import { FaSearch } from 'react-icons/fa';
import styles from '../index.module.scss';
import { DatePicker, Select } from "antd";
import moment from "moment";
import React, { useState } from 'react';

const { Option } = Select;

const dateTypeOptions = [
    { value: 'upload', label: '上传日期' },
    // { value: 'receive', label: '收到日期' },
    { value: 'report', label: '报告日期' },
];

const DiagnosticFilters = ({ filters, updateFilters, resetFilters }) => {
    const [localSearchTerm, setLocalSearchTerm] = useState('');

    const getDatePickerProps = (type) => ({
        value: filters[`${filters.selectedDateType}${type}`] ?
            moment(filters[`${filters.selectedDateType}${type}`], 'YYYY-MM-DD') : null,
        onChange: (_, dateString) =>
            updateFilters(`${filters.selectedDateType}${type}`, dateString),
        format: "YYYY-MM-DD",
        size: "large",
        placeholder: `${dateTypeOptions.find(d => d.value === filters.selectedDateType).label}-${type}`
    });

    return (
        <div className={styles['search-bar']}>
            {/* <div className={styles.tabs}>
                {['全部', '未审核', '已审核'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => updateFilters('selectedTab', tab)}
                        className={filters.selectedTab === tab ? styles.active : ''}
                    >
                        {tab}
                    </button>
                ))}
            </div> */}

            <div className={styles.filters}>
                <div className={styles['date-group']}>
                    <DatePicker {...getDatePickerProps('Start')} />
                    <span className={styles['date-separator']}>-</span>
                    <DatePicker {...getDatePickerProps('End')} />

                    <Select
                        size={"large"}
                        style={{backgroundColor:'purple'}}
                        value={filters.selectedDateType}
                        onChange={value => updateFilters('selectedDateType', value)}
                    >
                        {dateTypeOptions.map(opt => (
                            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                        ))}
                    </Select>
                </div>

                <div className={styles['search-box']}>
                    <FaSearch className={styles['search-icon']}/>
                    <input
                        type="text"
                        value={filters.searchTerm}
                        // onChange={(e) => updateFilters('pathoId', e.target.value)}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}  // 先更新本地状态
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                updateFilters('pathoId', e.target.value); // 只有按下回车才调用
                            }
                        }}
                        placeholder="病理号"
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    className={styles['reset-button']}
                    onClick={resetFilters}
                    // disabled={
                    //     // filters.selectedTab === '全部' &&
                    //     !filters.pathoId &&
                    //     !filters.uploadStart && !filters.uploadEnd &&
                    //     !filters.receiveStart && !filters.receiveEnd &&
                    //     !filters.reportStart && !filters.reportEnd
                    // }
                >
                    重置
                </button>
                <button className={styles['query-button']}>查询</button>
            </div>
        </div>
    );
};

export default DiagnosticFilters;