import NoEventsComponentView from '../views/trip-no-events';
import PointPresenter from './points';
import FilterPresenter from '../presenter/filters';
import SortPresenter from '../presenter/sort';
import NavigationPresenter from '../presenter/navigation';
import InfoPresenter from '../presenter/info';

import { renderPosition } from '../const';
import { render } from '../utils/render';


export default class Main {
  constructor(tripContainer, navigationContainer, filtersContainer, tripMainContainer) {
    this._tripContainer = tripContainer;
    this._navigationContainer = navigationContainer;
    this._filtersContainer = filtersContainer;
    this._tripMainContainer = tripMainContainer;
  }

  init (wayPoints, cities, types, activeFilterParam, activeSortParam, activeNavParam) {
    this._points = wayPoints;
    this._cities = cities;
    this._types = types;
    this._activeFilterParam = activeFilterParam;
    this._activeSortParam = activeSortParam;
    this._activeNavParam = activeNavParam;

    this._renderElements();
  }

  _renderElements() {
    if(this._points.length > 0) {
      this._renderPoints();
      this._renderSort();
      this._renderNavigation();
      this._renderFilters();
      this._renderInfo();
    } else {
      this._renderNoPoins();
    }
  }

  _renderPoints () {
    const pointsPresenter = new PointPresenter(this._tripContainer);
    pointsPresenter.init(this._points, this._cities, this._types );
  }

  _renderSort () {
    const sortPresenter = new SortPresenter(this._tripContainer);
    sortPresenter.init(this._activeSortParam);
  }

  _renderNavigation () {
    const navigationPresenter = new NavigationPresenter(this._navigationContainer);
    navigationPresenter.init(this._activeNavParam);
  }

  _renderFilters () {
    const filtersPresenter = new FilterPresenter(this._filtersContainer);
    filtersPresenter.init(this._activeFilterParam);
  }

  _renderInfo () {
    const infoPresenter = new InfoPresenter(this._tripMainContainer);
    infoPresenter.init(this._points);
  }

  _renderNoPoins () {
    const noPoinsElement = new NoEventsComponentView();
    render(this._tripContainer, noPoinsElement, renderPosition.BEFOREEND);
  }
}

