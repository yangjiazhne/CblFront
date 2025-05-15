// UserHome.jsx

import React from 'react';
import { Switch } from 'react-router-dom';
import { Footer, Navbar } from '@/components';
import RouteWithSubRoutes from '@/router/routeWithSubRoutes';
import styles from './index.module.scss';
import { Layout } from 'antd';

const { Content } = Layout;

const UserHome = ({ routes }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content className={styles.contentWrapper}>
                <Switch>
                    {routes.map((route, i) => (
                        <RouteWithSubRoutes key={i} {...route} />
                    ))}
                </Switch>
            </Content>
            <Footer />
        </Layout>
    );
};

export default UserHome;
