import React from 'react';
import { Dropdown, Menu, Button, message } from 'antd';
import { predictSlide, updateSlide } from '@/request/actions/slide';
import { getImageUrlBySlideName } from '@/utils';
import styles from '../index.module.scss'
import * as XLSX from "xlsx";
import {mutate} from "swr";

const DiagnosticActions = ({ selectedRowKeys, slides, imageDataCache, setSelectedRowKeys }) => {
    const handleBatchDiagnose = async () => {
        const requestData = selectedRowKeys.map((slideId) => {
            const slide = slides.find((s) => s.slideId === slideId);
            return {
                slideId,
                slideUrl: slide.slideUrl,
                imageUrl: getImageUrlBySlideName(slide.slideName, imageDataCache),
            };
        });

        const validData = requestData.filter((item) => item.imageUrl);
        if (!validData.length) {
            message.error('未找到匹配图像');
            return;
        }

        mutate(
            'slides',
            (currentSlides) =>
                currentSlides.map((slide) =>
                    selectedRowKeys.includes(slide.slideId)
                        ? { ...slide, status: 1 }
                        : slide
                ),
            false
        );

        try {
            const result = await predictSlide(validData);
            if (!result.err && result.data.code === 200) {
                message.success('批量诊断已开始');
            } else {
                message.error(`诊断失败: ${result.data.msg || '未知错误'}`);
            }
            mutate('slides');
        } catch (error) {
            message.error('批量诊断请求失败');
            mutate('slides');
        } finally {
            setSelectedRowKeys([]);
        }
    };


    const handleBatchDelete = async () => {
        const requestData = selectedRowKeys.map((slideId) => ({ slideId, status: -1 }));
        mutate(
            'slides',
            (currentSlides) =>
                currentSlides.filter((slide) => !selectedRowKeys.includes(slide.slideId)), // 从缓存中移除选中的数据
            false
        );
        try {
            const result = await updateSlide(requestData);
            if (!result.err && result.data.code === 200)
                message.success('批量删除成功');
            else
                message.error('批量删除失败');
            mutate('slides');
        } catch (error) {
            message.error('批量删除失败');
            mutate('slides');
        }
    };


    const handleExport = () => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选择至少一项进行导出');
            return;
        }

        const dataToExport = slides
            .filter((item) => selectedRowKeys.includes(item.slideId))
            .map((item) => ({
                病理号: item.slideName,
                上传时间: moment(item.uploadTime).format('YYYY-MM-DD HH:mm'),
                分析时间: item.duration ? `${Math.floor(item.duration / 60)}分钟` : '尚未分析',
                阴阳性: item.category || '无',
            }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '病理报告');
        XLSX.writeFile(workbook, '病理报告.xlsx');
    };

    const menu = (
        <Menu>
            <Menu.Item key="1" onClick={handleBatchDiagnose}>
                批量诊断
            </Menu.Item>
            <Menu.Item key="2" onClick={handleBatchDelete}>
                批量删除
            </Menu.Item>
            <Menu.Item key="3" onClick={handleExport}>
                导出 Excel
            </Menu.Item>
        </Menu>
    );

    return (
        <>
            {selectedRowKeys.length > 0 && (
                <Dropdown overlay={menu}>
                    <Button className={styles['operationsMenu']}>
                        更多操作
                    </Button>
                </Dropdown>
            )}
        </>
    );

};

export default DiagnosticActions;
