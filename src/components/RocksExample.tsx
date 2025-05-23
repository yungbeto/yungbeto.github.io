import React from 'react';
import RocksAnimation from './RocksAnimation';

const RocksExample: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <RocksAnimation
        className='rocks-example'
        maxBodies={50}
        colors={['#fc79bc', '#fcec79', '#fafafa']}
      />
    </div>
  );
};

export default RocksExample;
