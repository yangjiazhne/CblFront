import React from 'react';
import {Table, Tag, Button, Tooltip, Popconfirm, Space, message} from 'antd';
import { getImageUrlBySlideName } from '@/utils';
import Thumbnail from './Thumbnail';
import { predictSlide, updateSlide } from '@/request/actions/slide';
import styles from '../index.module.scss';
import moment from "moment";
import { DeleteOutlined } from "@ant-design/icons";
import { mutate } from 'swr';

const DiagnosticTable = ({ data, selectedRowKeys, setSelectedRowKeys,onPathoClick, filters, setFilters, totalDataLength }) => {
    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
    };


    const handleDelete = async (slideId) => {
        mutate('slides', (currentSlides) => {
            return currentSlides.filter((slide) => slide.slideId !== slideId);
        }, false);

        try {
            const result = await updateSlide([{ slideId, status: -1 }]);
            if (!result.err && result.data.code === 200)
                message.success('删除成功');
            else
                message.error('删除失败');
            mutate('slides');
        } catch (error) {
            message.error('删除失败');
            mutate('slides');
        }
    };


    const renderOperation = (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '70%' }}>
            <Popconfirm
                title="确定删除吗？"
                onConfirm={() => handleDelete(record.slideId)}
                okText="是"
                cancelText="否"
            >
                <Tooltip title="删除">
                    <Button type="link" danger icon={<DeleteOutlined />} />
                </Tooltip>
            </Popconfirm>
        </div>
    );


    const columns = [
        {
            title: '病理号',
            dataIndex: 'pathoId',
            key: 'pathoId',
            render: (text, record) =>
                record.predictProgress === 1.0 ? (
                    <a onClick={() => onPathoClick(record)}>{text}</a>
                ) : (
                    <span style={{
                        color: '#bfbfbf',
                        cursor: 'not-allowed',
                        textDecoration: 'line-through'
                    }}>
                    {text}
                </span>
                ),
        },
        {
            title: '送检科室',
            dataIndex: 'inspectionDepartment',
            key: 'inspectionDepartment',
            render: (text) => <p>{text}</p>,
        },

        // {
        //     title: '缩略图',
        //     dataIndex: 'slideUrl',
        //     key: 'thumbnail',
        //     render: (url, record) => <Thumbnail url={url} status={record.status} slideId={record.slideId} />,
        // },
        {
            title: '姓名',
            dataIndex: 'patientName',
            key: 'patientName',
            render: (text) => <p>{text || '***'}</p>,
        },
        {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender',
            render: (text) => <p>{text || '*'}</p>,
        },
        {
            title: '年龄',
            dataIndex: 'age',
            key: 'age',
            render: (text) => <p>{text || '**'}</p>,
        },
        {
            title: '住院号',
            dataIndex: 'hospitalNumber',
            key: 'hospitalNumber',
            render: (text) => <p>{text || '*****-****'}</p>,
        },
        {
            title: '蜡块总数',
            dataIndex: 'waxBlockCount',
            key: 'waxBlockCount',
            render: (text) => <p>{text ?? '*'}</p>, // 使用空值合并运算符
        },
        {
            title: '推理进度',
            dataIndex: 'predictProgress',
            key: 'predictProgress',
            filters: [
                { text: '已完成', value: 1.0 },
                { text: '推理中', value: 0 },
            ],
            filteredValue: filters?.predictProgress ? filters.predictProgress : null,
            // onFilter: (value, record) => {
            //     if (value === 1.0) return record.predictProgress === 1.0;
            //     return record.predictProgress !== 1.0;
            // },
            render: (progress) => (
                progress === 1.0 ? (
                    <Tag color="green" style={{ fontSize: '16px', padding: '6px 8px' }}>已完成</Tag>
                ) : (
                    <Tag color="blue" style={{ fontSize: '16px', padding: '6px 8px' }}>推理中</Tag>
                )
            )
        },
        {
            title: 'AI结果',
            dataIndex: 'category',
            key: 'category',
            filters: [
                { text: '阴性', value: '阴性' },
                { text: '阳性', value: '阳性' },
                { text: '疑似', value: '疑似' },
            ],
            filteredValue: filters?.category ? filters.category : null,
            // onFilter: (value, record) => record.category === value,
            render: (category) => {
                if (!category) {
                    return <Tag style={{ fontSize: '16px', padding: '6px 8px' }} color="purple">{'无'}</Tag>;
                }

                if (category === '不确信') {
                    return <Tag style={{ fontSize: '16px', padding: '6px 8px' }} color="orange">疑似</Tag>;
                }

                const color = category === '阴性' ? 'blue' : 'red';
                return <Tag style={{ fontSize: '16px', padding: '6px 8px' }} color={color}>{category}</Tag>;
            },
        },
        {
            title: '审核状态',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: '未审核', value: 4 },
                { text: '阴性', value: 1 },
                { text: '阳性', value: 2 },
                { text: '疑似', value: 3 },
            ],
            filteredValue: filters?.status ? filters.status : null,
            // onFilter: (value, record) => {
            //     if (value === 'unreviewed') {
            //         return ![1, 2, 3].includes(record.status);
            //     }
            //     return record.status === value;
            // },
            render: (status) => {
                const statusConfig = {
                    1: { text: '阴性', color: 'blue' },
                    2: { text: '阳性', color: 'red' },
                    3: { text: '疑似', color: 'orange' },
                }[status] || { text: '未审核', color: 'purple' };

                return (
                    <Tag
                        style={{
                            fontSize: '16px',
                            padding: '6px 8px',
                            backgroundColor: `${statusConfig.color}1a`, // 添加透明度
                            borderColor: statusConfig.color,
                        }}
                        color={statusConfig.color}
                    >
                        {statusConfig.text}
                    </Tag>
                );
            },
        },
        {
            title: '上传时间',
            dataIndex: 'uploadTime',
            key: 'uploadTime',
            sorter: (a, b) => moment(a.uploadTime).unix() - moment(b.uploadTime).unix(),
            sortOrder: filters?.uploadTime === 'ascend' ? 'ascend'  : filters?.uploadTime === 'descend' ? 'descend' : null,
            sortDirections: ['ascend', 'descend'],
            render: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm') : '暂未上传',
        },
        {
            title: '收到日期',
            dataIndex: 'receiveTime',
            key: 'receiveTime',
            sorter: (a, b) => moment(a.receiveTime).unix() - moment(b.receiveTime).unix(),
            sortOrder: filters?.receiveTime ? filters.receiveTime : null,
            sortDirections: ['ascend', 'descend'],
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm'),
        },
        {
            title: '报告日期',
            dataIndex: 'reportTime',
            key: 'reportTime',
            sorter: (a, b) => moment(a.reportTime).unix() - moment(b.reportTime).unix(),
            sortOrder: filters?.reportTime ? filters.reportTime : null,
            sortDirections: ['ascend', 'descend'],
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm'),
        },
        // {
        //     title: '操作',
        //     key: 'operation',
        //     render: renderOperation,
        // },
    ];

    return (
        <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={data}
            rowKey="slideId"
            pagination={{
                pageSize: filters?.pageSize? filters.pageSize : 10,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20'],
                total: totalDataLength,
            }}
            className={styles.table}
            onChange={(pagination, tableFilters, sorter) => {
                console.log('当前筛选条件:', tableFilters);
                console.log('当前分页信息', pagination);
                console.log('当前排序筛选', sorter)
                // 可以在这里调用更新方法，比如更新 state 或请求新数据
                setFilters(prev => ({
                    ...prev,
                    predictProgress: tableFilters.predictProgress,
                    status: tableFilters.status??[],
                    category: tableFilters.category??[],
                    page: pagination.current,
                    pageSize: pagination.pageSize,
                    uploadTime: '',
                    receiveTime: '',
                    reportTime: '',
                    [sorter.columnKey]: sorter.order
                }));
            }}
        />
    );
};

export default DiagnosticTable;
