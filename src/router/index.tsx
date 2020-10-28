import React, { lazy, Suspense } from 'react';

import {
  // HashRouter as DefaultRouter,
  BrowserRouter as DefaultRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

const Home = lazy(() => import('@pages/home'));
const Header = lazy(() => import('@components/Header'));
// const Test = lazy(() => import('@components/test'));

interface IRouterProps {}

const Router = ({}: IRouterProps) => {
  console.log(process.env);

  return (
    <DefaultRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Header />{' '}
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/one" component={Home} />
          {/* <Route path="/two" component={Test} /> */}
          <Redirect to="/" />
        </Switch>
      </Suspense>
    </DefaultRouter>
  );
};

export default Router;
