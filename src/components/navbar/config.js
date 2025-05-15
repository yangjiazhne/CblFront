import { ClusterOutlined, DatabaseOutlined, UnorderedListOutlined } from '@ant-design/icons'
import styles from "@/pages/UserHome/index.module.scss";
import React from "react";

// 导航栏
export const pathItems = [
    {
      label: '数据上传',
      pathName: '/userHome/upload',
      key: 'datasets',
      icon: <DatabaseOutlined />
    },
    {
      label: '诊断管理',
      pathName: '/diagnostic',
      key: 'manage',
      icon: <UnorderedListOutlined />
    },
];

// 用户登出
export const userOperateItems = [
    {
      key: 'logout',
      label: '退出登录'
    },
  ]