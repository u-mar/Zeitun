import React from 'react';
import Layout from '../_components/Layout';

const EmployeeLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Layout>
            {children}
        </Layout>
    );
};

export default EmployeeLayout;
