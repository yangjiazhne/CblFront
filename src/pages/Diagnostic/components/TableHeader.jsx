import styles from "@/pages/Diagnostic/index.module.scss";
import {Select} from "antd";
import React from "react";

const TableHeader = () => (
    <div className={styles.tableHeader}>
        <div className={styles.headerLeft}>
            <h2>病理报告列表</h2>
        </div>
        <div className={styles.headerRight}>
            <Select
                size={"large"}
                value={filters.timeRange}
                onChange={value => updateFilters('timeRange', value)}
            >
                <Select.Option value="threeDays">近三日</Select.Option>
                <Select.Option value="sevenDays">近七日</Select.Option>
                <Select.Option value="all">历史</Select.Option>
            </Select>
        </div>
    </div>
);

export default TableHeader;