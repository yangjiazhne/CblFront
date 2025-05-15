import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {Button, Dropdown, Menu, Modal} from 'antd';
import { logOut } from '@/helpers/Utils';
import {DownOutlined, HomeOutlined} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { pathItems as rawPathItems, userOperateItems } from './config';
import styles from './index.module.scss';

const Navbar = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { isLogin } = useSelector((state) => state.user);
  const userDetail = JSON.parse(sessionStorage.getItem('userDetail'));

  const [language, setLanguage] = useState('zh'); // 默认中文
  const { t, i18n } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const [currentPath, setCurrentPath] = useState('diagnostic'); // 默认路径

  const changePath = (e) => {
    const selectedItem = rawPathItems.find((item) => item.key === e.key);
    if (selectedItem) {
      setCurrentPath(selectedItem.key);
      history.push(selectedItem.pathName); // 使用 pathName 进行路由跳转
    }
  };

  useEffect(() => {
    const token = window.sessionStorage.getItem('token');
    if (token) {
      dispatch({ type: 'UPDATE_USER_LOGIN', payload: true });
    }
  }, [dispatch]);

  const userOperate = ({ key }) => {
    if (key === 'logout') {
      logout();
    }
  };

  const logout = () => {
    Modal.confirm({
      title: '提示',
      content: '确定要退出登录吗？',
      onOk: () => logOut(history),
    });
  };

  // 过滤掉 pathName 属性，仅保留支持的属性
  const filteredPathItems = rawPathItems.map(({ pathName, ...rest }) => rest);

  useEffect(() => {
    // 确保清理未完成的任务
    let isMounted = true;

    return () => {
      isMounted = false;
    };
  }, []);

  const backHome = () =>{
    history.replace('/mainPage')
  }

  return (
      <div className={styles.navbarWrap}>
        <div className={styles.navbar} onClick={backHome}>
          <div className={styles.navbarTitleWrap}>
            <span className={styles.navbarTitle}>{t('title')}</span>
          </div>
        </div>



        <div className={styles.navbarMenu}>
          <Button
              type="primary"
              icon={<HomeOutlined />}
              style={{
                height: 48,
                width: 120,
                fontSize: 16,
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'var(--navbar-bg-gradient)',
                border: 'none',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.3)'
                }
              }}
              onClick={() => history.push('/mainPage')}
          >
            主页
          </Button>
          <div className={styles.navbarMenuItem}>
            {isLogin && (
                <Dropdown
                    menu={{
                      items: userOperateItems,
                      onClick: userOperate,
                    }}
                >
              <span>
                {t('greeting')}, {userDetail?.username}
                <DownOutlined style={{ marginLeft: '5px' }} />
              </span>
                </Dropdown>
            )}
          </div>
        </div>
      </div>
  );
};

export default Navbar;
