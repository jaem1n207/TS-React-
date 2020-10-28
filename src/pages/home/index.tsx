import React from 'react';
import { useLocation } from 'react-router-dom';
import ReactIcon from '@assets/images/React.png';
import WebpackIcon from '@assets/images/webpack.jpg';
import tenKB from '@assets/images/tenKB.png';

interface IHomeProps {}

const Home = ({}: IHomeProps) => {
  const { pathname } = useLocation();

  return (
    <div>
      <p>{pathname}</p>
      <img src={ReactIcon} alt="img" />
      <img src={WebpackIcon} alt="img" />
      <img src={tenKB} alt="img" />
    </div>
  );
};

export default Home;
