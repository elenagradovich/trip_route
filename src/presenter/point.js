import TripPointView from '../views/trip-point';
import TripEditPointView from '../views/trip-edit-point';
import { remove, render, replace } from '../utils/render';
import { RenderPosition, Mode, UserAction, UpdateType, ActionState } from '../const';

export default class Point {
  constructor(container, pointsModel, changeData, changeMode) {
    this._container = container;
    this._tripPointComponent = null;
    this._tripEditPointComponent = null;
    this._changeData = changeData;
    this._changeMode = changeMode;
    this._mode = Mode.DEFAULT;
    this._pointsModel = pointsModel;

    this._handleEscKeyDown = this._handleEscKeyDown.bind(this);
    this._handlePointOpen = this._handlePointOpen.bind(this);
    this._handlePointClose = this._handlePointClose.bind(this);
    this._handleSubmitClick = this._handleSubmitClick.bind(this);
    this._handleFavoriteClick = this._handleFavoriteClick.bind(this);
    this._handleDeleteClick = this._handleDeleteClick.bind(this);
  }

  init(point) {
    this._destinations = this._pointsModel.getDestinations();
    this._cities = this._pointsModel.getCities();
    this._types = this._pointsModel.getTypes();
    this._offers = this._pointsModel.getOffers();

    this._point = point;
    this._prevPoint = this._tripPointComponent;
    this._prevEditPoint = this._tripEditPointComponent;
    this._tripPointComponent = new TripPointView(point);
    this._tripEditPointComponent = new TripEditPointView(this._cities, this._types, this._destinations, this._offers, point);

    this._tripPointComponent.setRollupButtonClickHandler(this._handlePointOpen);
    this._tripEditPointComponent.setRollupButtonClickHandler(this._handlePointClose);
    this._tripEditPointComponent.setSubmitClickHandler(this._handleSubmitClick);
    this._tripEditPointComponent.setDeleteClickHandler(this._handleDeleteClick);

    this._tripPointComponent.setFavouriteButtonClickHandler(this._handleFavoriteClick);

    if (this._prevPoint === null && this._prevEditPoint === null) {
      render(this._container, this._tripPointComponent, RenderPosition.BEFOREEND);
      return;
    }

    if (this._container.getElement().contains(this._prevPoint.getElement())) {
      replace(this._tripPointComponent, this._prevPoint);
    }

    if (this._container.getElement().contains(this._prevEditPoint.getElement())) {
      replace(this._tripEditPointComponent, this._prevEditPoint);
    }

    remove(this._prevPoint);
    remove(this._prevEditPoint);
  }

  _replacePointToEditPoint() {
    replace(this._tripEditPointComponent, this._tripPointComponent);
    this._changeMode();
    this._mode = Mode.EDITING;
  }

  _replaceEditPointToPoint() {
    replace(this._tripPointComponent, this._tripEditPointComponent);
    this._mode = Mode.DEFAULT;
  }

  _handleEscKeyDown(evt) {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this._tripEditPointComponent.reset();
      this._replaceEditPointToPoint();
      document.removeEventListener('keydown', this._handleEscKeyDown);
    }
  }

  _handlePointOpen() {
    this._replacePointToEditPoint();
    document.addEventListener('keydown', this._handleEscKeyDown);
  }

  _handlePointClose() {
    this._tripEditPointComponent.reset();
    this._replaceEditPointToPoint();
    document.removeEventListener('keydown', this._handleEscKeyDown);
  }

  _handleSubmitClick(point) {
    this._changeData(
      UserAction.UPDATE_POINT,
      UpdateType.MAJOR,
      point);
  }

  _handleDeleteClick(point) {
    this._changeData(
      UserAction.DELETE_POINT,
      UpdateType.MAJOR,
      point);
  }

  _handleFavoriteClick() {
    this._changeData(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      {...this._point,
        isFavorite: !this._point.isFavorite,
      },
    );
  }

  setViewState(state) {
    const resetFormState = () => {
      this._tripEditPointComponent.updateData({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    switch (state) {
      case ActionState.SAVING:
        this._tripEditPointComponent.updateData({
          isDisabled: true,
          isSaving: true,
        });
        break;
      case ActionState.DELETING:
        this._tripEditPointComponent.updateData({
          isDisabled: true,
          isDeleting: true,
        });
        break;
      case ActionState.ABORTING:
        this._tripPointComponent.shake(resetFormState);
        this._tripEditPointComponent.shake(resetFormState);
        break;
    }
  }

  resetView() {
    if(this._mode !== Mode.DEFAULT) {
      this._replaceEditPointToPoint();
    }
  }

  destroy() {
    remove(this._tripPointComponent);
    remove(this._tripEditPointComponent);
  }
}
