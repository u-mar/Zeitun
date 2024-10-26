import React from 'react';
import Layout from '../_components/Layout';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Layout>
            {children}
        </Layout>
    );
};

export default AdminLayout;
