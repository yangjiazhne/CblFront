/*
 * @Author: Azhou
 * @Date: 2021-11-12 16:39:08
 * @LastEditors: Azhou
 * @LastEditTime: 2022-03-01 15:23:53
 */
import {Button, message} from 'antd'
import React, { useState } from 'react'
import styles from './index.module.scss'
import { Link } from 'react-router-dom'
import { getStrWithLen } from '@/helpers/Utils'



const SingleProject = ({ projectDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  const pathologyImages = {
    '胃癌疾病库': '/pathology-images/gastric-cancer.jpg',
    '宫颈癌疾病库': '/pathology-images/cervical-cancer.jpg',
    '前列腺癌疾病库': '/pathology-images/prostate-cancer.jpg',
    'default': '/pathology-images/default-slide.jpg'
  }
  // 处理鼠标悬浮事件
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // 处理鼠标移出事件
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={styles.projectWrap}>
      <div className={styles.imageContainer}>
        {/* <img
            src={pathologyImages[projectDetails.name] || pathologyImages.default}
            alt="病理切片"
            className={styles.pathologyImage}
            onError={(e) => {
              e.target.src = pathologyImages.default
            }}
        /> */}
        <div className={styles.imageCaption}>{projectDetails.name}</div>
      </div>

      {isHovered && (
          <div className={styles.projectMask}>
            <div className={styles.title} style={{ color: '#fff', height: '100px'}}>{getStrWithLen(projectDetails.name, 16)}</div>
            <Button style={{width: '60%', margin: '15px auto', marginTop: '0' , borderRadius: '5px'}}>
              <Link
                  to={{
                    pathname: '/diagnostic',
                    search: `?organ=${encodeURIComponent(projectDetails.organ)}`
                  }}
                  onClick={(e) => {
                    if (projectDetails.organ === '胃') {
                      e.preventDefault();
                      message.warning('AI模型更新中，待开放');
                      return;
                    }
                    // 存储 projectDetails.organ 到 localStorage
                    localStorage.setItem('organ', projectDetails.organ);
                  }}
              >
                查看详情
              </Link>
            </Button>
          </div>
      )}
    </div>
  )
}

export default SingleProject
