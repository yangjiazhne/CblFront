import React, { useState, useMemo, useEffect } from 'react';
import { Footer, Navbar } from '@/components';
import {useCombinedSlides, useSlides} from '@/hooks/useSlides';
import useDidUpdateEffect from '@/hooks/useDidUpdateEffect';
import { useImageData } from '@/hooks/useImageData';
import { filterSlides } from '@/utils';
import DiagnosticFilters from './components/DiagnosticFilters';
import DiagnosticTable from './components/DiagnosticTable';
// import DiagnosticActions from './components/DiagnosticActions';
import styles from './index.module.scss';
import {Select, Modal, Spin, Button} from "antd";
import {useHistory, useLocation} from "react-router-dom";
import moment from "moment";
import { searchSlide, initSearchSlide } from '@/request/actions/slide';
import { useDispatch, useSelector } from 'react-redux'
import {HomeOutlined} from "@ant-design/icons";

/**
 * 
 * @returns Diagnostic
 */
const Diagnostic = () => {
    const dispatch = useDispatch()
    const location = useLocation();

    const getOrganParam = () => {
        const params = new URLSearchParams(location.search);
        return params.get('organ') || 'defaultOrgan';
    };

    const organ = getOrganParam();
    // const { slides, loading: slidesLoading, error: slidesError } = useCombinedSlides(organ);
    const slides= [
            {
                "slideId": 31,
                "status": 3,
                "pathoId": "P2024-0011",
                "category": "阴性",
                "slideName": "Lung Cancer Slide 1",
                "slideUrl": "/path/to/lung_cancer_1",
                "imageName": "lung_cancer_slide_001.jpg",
                "userId": 3,
                "duration": 60.5,
                "predictProgress": 1.0,
                "age": 62,
                "clinicalData": "长期吸烟史，持续咳嗽",
                "clinicalDiagnosis": "肺部恶性肿瘤",
                "correspondingPath": "/lung/cancer/path/1",
                "frozenReport": "冰冻切片显示恶性肿瘤",
                "gender": "男",
                "grossDescription": "肿块大小5x4cm，边缘不规则",
                "hospitalNumber": "H2024-0011",
                "inspectionDepartment": "病理科",
                "microscopicDescription": "癌细胞高度分化，浸润性生长",
                "pathologicalDiagnosis": "肺鳞状细胞癌",
                "patientCategory": "住院",
                "patientName": "刘明",
                "samplingDetails": "右肺上叶切除",
                "specialExamination": "免疫组化-p53阳性",
                "specimenType": "活检",
                "ward": "肺科",
                "waxBlockCount": 4,
                "specimenName": "肺组织",
                "supplementaryReport": "建议进一步化疗",
                "uploadTime": "2025-03-23 10:15",
                "receiveDate": "2024-03-15 09:00",
                "reportDate": "2024-03-17 14:30"
            },
            {
                "slideId": 32,
                "status": 4,
                "pathoId": "P2024-0012",
                "category": "阳性",
                "slideName": "Lung Cancer Slide 2",
                "slideUrl": "/path/to/lung_cancer_2",
                "imageName": "lung_cancer_slide_002.jpg",
                "userId": 3,
                "duration": 45.2,
                "predictProgress": 1.0,
                "age": 58,
                "clinicalData": "胸痛伴咳血",
                "clinicalDiagnosis": "肺部占位性病变",
                "correspondingPath": "/lung/cancer/path/2",
                "frozenReport": "冰冻切片显示腺癌特征",
                "gender": "女",
                "grossDescription": "肿块大小3.5x3cm，中央坏死",
                "hospitalNumber": "H2024-0012",
                "inspectionDepartment": "病理科",
                "microscopicDescription": "腺样结构明显，细胞异型性显著",
                "pathologicalDiagnosis": "肺腺癌",
                "patientCategory": "门诊",
                "patientName": "王芳",
                "samplingDetails": "CT引导下穿刺活检",
                "specialExamination": "免疫组化-TTF1阳性",
                "specimenType": "穿刺",
                "ward": "肿瘤科",
                "waxBlockCount": 3,
                "specimenName": "肺组织",
                "supplementaryReport": "建议基因检测",
                "uploadTime": "2025-03-22 11:20",
                "receiveDate": "2024-03-18 08:45",
                "reportDate": "2024-03-20 16:10"
            },
            {
                "slideId": 33,
                "status": 4,
                "pathoId": "P2024-0013",
                "category": "不确信",
                "slideName": "Lung Cancer Slide 3",
                "slideUrl": "/path/to/lung_cancer_3",
                "imageName": "lung_cancer_slide_003.jpg",
                "userId": 3,
                "duration": 72.8,
                "predictProgress": 0,
                "age": 71,
                "clinicalData": "呼吸困难，体重下降",
                "clinicalDiagnosis": "疑似小细胞肺癌",
                "correspondingPath": "/lung/cancer/path/3",
                "frozenReport": "冰冻切片显示小细胞癌",
                "gender": "男",
                "grossDescription": "肿块大小6x5cm，累及胸膜",
                "hospitalNumber": "H2024-0013",
                "inspectionDepartment": "病理科",
                "microscopicDescription": "细胞核深染，核分裂象多见",
                "pathologicalDiagnosis": "小细胞肺癌",
                "patientCategory": "急诊",
                "patientName": "李强",
                "samplingDetails": "支气管镜活检",
                "specialExamination": "免疫组化-Syn阳性",
                "specimenType": "活检",
                "ward": "呼吸科",
                "waxBlockCount": 5,
                "specimenName": "肺组织",
                "supplementaryReport": "建议放疗联合化疗",
                "uploadTime": "2024-04-02 15:40",
                "receiveDate": "2024-04-02 14:00",
                "reportDate": "2024-04-05 10:05"
            }
    ]
    // const { imageDataCache, loading: imageDataLoading, error: imageDataError } = useImageData();

    const [filters, setFilters] = useState({
        predictProgress: [],       // 推理进度
        pathoId: '',               // 病理号模糊查询  String
        status: [],                // 人工审核状态
        category: [],              // AI推理状态
        uploadStart: '',           // 上传时间 范围 排序规则 
        uploadEnd: '',
        uploadTime: '',
        receiveStart: '',          // 接收时间 范围 排序规则 
        receiveEnd: '',
        receiveTime: '',
        reportStart: '',           // 报告时间 范围 排序规则 
        reportEnd: '',
        reportTime: '',
        timeRange:'threeDays',     // 近三天/近七日/历史
        selectedDateType: 'upload',// 目前选择的时间     
        page: 1,
        pageSize: 10
    });

    const resetFilters = () => {
        setFilters({
            predictProgress: [],       // 推理进度
            pathoId: '',               // 病理号模糊查询
            status: [],                // 人工审核状态
            category: [],              // AI推理状态
            uploadStart: '',           // 上传时间 范围 排序规则 
            uploadEnd: '',
            uploadTime: '',
            receiveStart: '',          // 接收时间 范围 排序规则 
            receiveEnd: '',
            receiveTime: '',
            reportStart: '',           // 报告时间 范围 排序规则 
            reportEnd: '',
            reportTime: '',
            timeRange:'threeDays',     // 近三天/近七日/历史
            selectedDateType: 'upload',// 目前选择的时间   
            page: 1,
            pageSize: 5  
        });
    };

    const [filteredData, setFilteredData] = useState([])

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const [totalDataLength, setTotalDataLength] = useState(0)

    const [isLoading, setIsLoading] = useState(false)

    const [allSlides, setAllSlides] = useState([]);


    useEffect(() => {    
        fetchData(filters);
    }, [filters]);

    const fetchData = async (filters) => {
        setIsLoading(true)

        const predictProgress = filters.predictProgress?.length === 0 ? undefined : filters.predictProgress
        const pathoId = filters.pathoId === '' ? undefined : filters.pathoId
        const status = filters.status?.length === 0 ? undefined : filters.status
        const category = filters.category?.length === 0 ? undefined : filters.category
        const uploadStart = filters.uploadStart === '' ? undefined : filters.uploadStart
        const uploadEnd = filters.uploadEnd === '' ? undefined : filters.uploadEnd
        const uploadTime = filters.uploadTime === '' ? undefined : filters.uploadTime
        const timeRange = filters.timeRange
        // const receiveStart = filters.receiveStart === '' ? undefined : filters.receiveStart
        // const receiveEnd = filters.receiveEnd === '' ? undefined : filters.receiveEnd
        const receiveTime = filters.receiveTime === '' ? undefined : filters.receiveTime

        const receiveEnd = timeRange === 'all' ? undefined : new Date().toISOString().split('T')[0] 

        let receiveStart;
        if (timeRange === 'threeDays') {
            receiveStart = new Date();
            receiveStart.setDate(receiveStart.getDate() - 3);
            receiveStart = receiveStart.toISOString().split('T')[0];
        } else if (timeRange === 'sevenDays') {
            receiveStart = new Date();
            receiveStart.setDate(receiveStart.getDate() - 7);
            receiveStart = receiveStart.toISOString().split('T')[0];
        } else {
            receiveStart = undefined
        }

        const reportStart = filters.reportStart === '' ? undefined : filters.reportStart
        const reportEnd = filters.reportEnd === '' ? undefined : filters.reportEnd
        const reportTime = filters.reportTime === '' ? undefined : filters.reportTime
        
        const page = filters.page - 1
        const pageSize = filters.pageSize

        const pathoImgInfo = await searchSlide(pathoId,predictProgress,status,category,uploadStart,uploadEnd,uploadTime,receiveStart,receiveEnd,receiveTime,reportStart,reportEnd,reportTime,page,pageSize,organ);



        if(!pathoImgInfo.data){
            Modal.error({
              title: '提示',
              content: '您的登录已过期，请重新登陆',
              onOk: () => {
                dispatch({
                  type: 'UPDATE_USER_LOGIN',
                  payload: false,
                })
                window.location.href = "/#/entryPage";
                window.sessionStorage.clear()
              }
            })
            return
        }


        const tableData = pathoImgInfo.data.content
        setAllSlides(tableData);
        setFilteredData(tableData)
        const totalElements = pathoImgInfo.data.totalElements
        setTotalDataLength(totalElements)

        setIsLoading(false)
    }

    const updateFilters = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const history = useHistory();


    const handlePathoClick = (clickedSlide) => {
        history.push({
            pathname: `/patho-tagger-space`,
            search: `?pathoId=${clickedSlide.pathoId}&organ=${organ}`,
            state: {
                slides: allSlides,     // 传递全部数据
            }
        });
    };
    


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


    return (
        <>
            <Navbar />
            <Spin spinning={isLoading}>
                <div className={styles.pathologyTableContainer}>
                    <DiagnosticFilters
                        filters={filters}
                        updateFilters={updateFilters}
                        resetFilters={resetFilters}
                    />
                    <TableHeader/>
                    <DiagnosticTable
                        data={filteredData}
                        selectedRowKeys={selectedRowKeys}
                        setSelectedRowKeys={setSelectedRowKeys}
                        onPathoClick={handlePathoClick}
                        filters={filters}
                        setFilters={setFilters}
                        totalDataLength={totalDataLength}
                    />
                </div>
            </Spin>



            <Footer />
        </>
    );
};

export default Diagnostic;
