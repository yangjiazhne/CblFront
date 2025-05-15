//提交说明 123
import moment from "moment";

export const getImageUrlBySlideName = (slideName, imageDataCache) => {
    const image = imageDataCache.find((img) => img.imageUrl.endsWith(slideName));
    return image?.imageUrl || null;
};

export const filterSlides = (slides, filters) => {
    let filtered = slides.filter((item) => item.status !== -1);

    // 状态过滤
    if (filters.selectedTab !== '全部') {
        const statusMap = { 未审核: [4],
            已审核: [1, 2, 3]};
        if (filters.selectedTab === '已审核') {
            filtered = filtered.filter(item => statusMap.已审核.includes(item.status));
        } else if (filters.selectedTab === '未审核') {
            filtered = filtered.filter(item => statusMap.未审核.includes(item.status));
        }
    }

    // 动态日期过滤
    const dateFieldMap = {
        upload: 'uploadTime',
        receive: 'receiveDate',
        report: 'reportDate'
    };
    const dateType = filters.selectedDateType;
    const startDate = filters[`${dateType}Start`];
    const endDate = filters[`${dateType}End`];


    if (dateType && (startDate || endDate)) {
        const field = dateFieldMap[dateType];
        if (startDate) {
            filtered = filtered.filter(item => item[field] >= startDate);
        }
        if (endDate) {
            filtered = filtered.filter(item => item[field] <= endDate);
        }
    }

    // 多字段模糊搜索
    if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(item =>
            ['pathoId', 'patientName', 'hospitalNumber'].some(field =>
                String(item[field] || '').toLowerCase().includes(searchTerm)
            )
        );
    }

    if (filters.timeRange !== 'all') {
        const days = {
            threeDays: 3,
            sevenDays: 7
        }[filters.timeRange];

        if (days) {
            const cutoffDate = moment().subtract(days, 'days').startOf('day');
            filtered = filtered.filter(item =>
                moment(item.uploadTime).isSameOrAfter(cutoffDate)
            );
        }
    }

    return filtered;
};

export const resizeImage = (src, scaleFactor, callback) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const resizedImage = canvas.toDataURL("image/png", 0.8);
        callback(resizedImage);
    };
    img.src = src;
};
