import React from 'react';
import { GithubFilled } from '@ant-design/icons';

import './styles.css';

const Footer = () => {
  return (
    <div className="footer">
      <p>Created by FlashBlaze</p>
      <p>
        View on{' '}
        <a
          href="https://github.com/FlashBlaze/image-manipulation"
          target="_blank"
          rel="noopener noreferrer">
          <GithubFilled />
        </a>
      </p>
    </div>
  );
};

export default Footer;
