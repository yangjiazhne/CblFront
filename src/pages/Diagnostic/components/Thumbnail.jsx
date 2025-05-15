import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { STATIC_URL } from '@/constants';
import { resizeImage } from '@/utils';

const Thumbnail = ({ url, status, slideId,size=50 }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const urlParts = url.split('/');
    const projectId = urlParts[urlParts.length - 2];
    const imageName = urlParts[urlParts.length - 1];
    const history = useHistory();

    useEffect(() => {
        const generateThumbnail = async () => {
            try {
                const src = `${STATIC_URL}/${projectId}/${imageName}/deepzoom/imgs/10/0_0.jpeg`;

                resizeImage(src, 0.1, (resizedImage) => {
                    setThumbnailUrl(resizedImage);
                    setLoading(false);
                });
            } catch (err) {
                setError(err.message || '加载缩略图失败');
                setLoading(false);
            }
        };

        generateThumbnail();
    }, [url, projectId, imageName]);

    const handleClick = () => {
        const selectedSlide = { projectId, imageName, status, slideId };
        window.sessionStorage.setItem('selectedSlide', JSON.stringify(selectedSlide));
        history.push('/patho-tagger-space');
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50%',       // 继承父容器高度
                width: '100%',        // 继承父容器宽度
                minHeight: 80,       // 最小高度防止内容塌陷
                background: '#f5f5f5',// 浅灰色背景
                borderRadius: 4       // 可选圆角
            }}>
                <div style={{
                    textAlign: 'center',
                    fontSize: 16,
                    color: 'rgba(0, 0, 0, 0.45)',
                    lineHeight: 1.8
                }}>
                    <div>暂无</div>
                    <div>图片</div>
                </div>
            </div>
        );
    }

    if (error) {
        return <span style={{ color: 'red' }}>错误: {error}</span>;
    }

    return thumbnailUrl ? (
        <img
            src={thumbnailUrl}
            alt="缩略图"
            style={{
                width: size,
                height: size,
                objectFit: 'cover',
                borderRadius: '4px',
                cursor: 'pointer',
            }}
            onClick={handleClick}
        />
    ) : (
        <span>无法生成缩略图</span>
    );
};

export default Thumbnail;
