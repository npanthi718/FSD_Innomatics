import React from 'react';
import Home from './pages/Home/Home';
import Layout from './components/Layout/Layout';
import './styles/global.css';

function App() {
    return (
        <Layout>
            <Home />
        </Layout>
    );
}

export default App;