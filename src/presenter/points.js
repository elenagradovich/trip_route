import PointPresenter from './point';
import TripPointsView from '../views/trip-points';
import NoEventsComponentView from '../views/trip-no-events';
import PointNewPresenter from './point-new';
import { render, remove } from '../utils/render';
import { filter } from '../utils/filter';
import { sortPointsByPrice, sortPointsByTime, sortPointsByDay } from '../utils/common';
import { RenderPosition, SortTypes, UpdateType, UserAction, FilterTypes } from '../const';
import LoadingComponentView from '../views/trip-loading';

export default class Points {
  constructor(container, pointsModel, sortModel, filterModel) {
    this._isLoading = true;
    this._container = container;
    this._pointsComponent = null;
    this._pointPresenterContainer = {};
    this._filterModel = filterModel;
    this._sortModel = sortModel;
    this._pointsModel = pointsModel;
    this._noPoinsComponent = new NoEventsComponentView();
    this._loadingComponent = new LoadingComponentView();


    this._handleModelEvent = this._handleModelEvent.bind(this);
    this._handleModeChange = this._handleModeChange.bind(this);
    this._handleViewAction = this._handleViewAction.bind(this);

    this._pointsModel.subscribe(this._handleModelEvent);
    this._filterModel.subscribe(this._handleModelEvent);
    this._sortModel.subscribe(this._handleModelEvent);
  }

  init() {
    this._pointsComponent = new TripPointsView();
    this._renderPointsContainer();
    this._renderPoints();
    this._addNewPointButtonElement = document.querySelector('.trip-main__event-add-btn');
    this._pointNewPresenter = new PointNewPresenter(this._pointsComponent,
      this._pointsModel,
      this._handleViewAction, this._handleModeChange);

    this._addNewPointButtonElement.addEventListener('click', (evt) => {
      evt.preventDefault();
      this.createNewPoint();
    });
  }

  _getPoints() {
    const filterType = this._filterModel.getActiveFilter();
    const points = this._pointsModel.getPoints();
    const filteredPoints = filter[filterType](points);
    return filteredPoints;
  }

  _renderPointsContainer() {
    render(this._container, this._pointsComponent, RenderPosition.BEFOREEND);
  }

  _renderPoint(point) {
    const pointPresenter = new PointPresenter(
      this._pointsComponent,
      this._pointsModel,
      this._handleViewAction, this._handleModeChange);
    pointPresenter.init(point);
    this._pointPresenterContainer[point.id] = pointPresenter;
  }

  _renderNoTasks() {
    render(this._container, this._noPoinsComponent, RenderPosition.BEFOREEND);
  }

  _renderLoading() {
    render(this._container, this._loadingComponent, RenderPosition.BEFOREEND);
  }

  _renderPoints() {
    if (this._isLoading) {
      this._renderLoading();
      return;
    }
    const points = this._getPoints();
    const pointsCount = points.length;

    if (pointsCount === 0) {
      this._renderNoTasks();
      return;
    }
    const sortType = this._sortModel.getActiveSortType();
    const sortedPoints = this._sortPoints(points, sortType);
    sortedPoints.forEach((point) => this._renderPoint(point));
  }

  _sortPoints(points, type) {
    switch (type) {
      case SortTypes.PRICE:
        return points.sort(sortPointsByPrice);
      case SortTypes.TIME:
        return points.sort(sortPointsByTime);
      case SortTypes.DAY:
        return points.sort(sortPointsByDay);
      default:
        return points.sort(sortPointsByDay);
    }
  }

  _handleViewAction(actionType, updateType, update) {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this._pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this._pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this._pointsModel.deletePoint(updateType, update);
        break;
    }
  }

  _handleModelEvent(updateType, data, rerender) {
    switch (updateType) {
      case UpdateType.PATCH:
        this._pointPresenterContainer[data.id].init(data);
        break;
      case UpdateType.MAJOR:
        if(!rerender) break;
        this._clearPoints();
        this._renderPoints();
        break;
      case UpdateType.INIT:
        if(!rerender) break;
        this._isLoading = false;
        remove(this._loadingComponent);
        this._renderPoints();
        break;
    }
  }

  _handleModeChange() {
    this._pointNewPresenter.resetView();
    Object.values(this._pointPresenterContainer).forEach((presenter) => {
      presenter.resetView();
    });
  }

  _clearPoints() {
    this._pointNewPresenter.destroy();
    Object
      .values(this._pointPresenterContainer)
      .forEach((pointPresenter) => pointPresenter.destroy());
    this._pointPresenterContainer = {};
    remove(this._noPoinsComponent);
    remove(this._loadingComponent);
  }

  createNewPoint() {
    this._filterModel.setActiveFilter(UpdateType.MAJOR, FilterTypes.EVERYTHING, false);
    this._sortModel.setActiveSortType(UpdateType.MAJOR, SortTypes.DAY, false);

    this._pointNewPresenter.init();
  }
}
