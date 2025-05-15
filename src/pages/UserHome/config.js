import { ClusterOutlined, DatabaseOutlined, UnorderedListOutlined } from '@ant-design/icons'
import React from 'react'
import styles from './index.module.scss'
// import {GrStarOutline} from "react-icons/gr";

export const getMenus = () => {
  return [
    {
      tag: 'datasets',
      pathName: '/userHome/upload',
      desc: '数据上传',
      icon: <DatabaseOutlined className={styles.icon} />,
    },
    {
      tag: 'diagnostic',
      pathName: '/userHome/diagnostic',
      desc: '诊断管理',
      icon: <UnorderedListOutlined className={styles.icon} />,
    },
    {
      tag: 'content',
      pathName: '/userHome/content',
      desc: 'KFB详情',
      icon: <ClusterOutlined className={styles.icon} />,
    },
  ]
}
